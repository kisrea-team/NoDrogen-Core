import { NotionAPI } from "notion-client";
import { idToUuid, getTextContent, getDateValue } from "notion-utils";
import getAllPageIds from "./getAllPageIds";
import getPageProperties from "./getPageProperties";

export class Nodrogen {
  response: any;
  pageIds: any;
  block: any;
  collection: any;
  schema: any;
  rawMetadata: any;
  client: any;
  typeObj: any = [];
  typeName: any;
  collectionQuery: any;
  posts: any;
  type: any;
  mapImgUrl(img: any, block: any): string {
    let ret = null;
    if (!img) {
      return "https://www.notion.so/images/page-cover/met_fitz_henry_lane.jpg";
    }
    if (img.startsWith("/")) {
      ret = "https://www.notion.so" + img;
    } else {
      ret = img;
    }

    if (ret.indexOf("amazonaws.com") > 0) {
      ret =
        "https://www.notion.so" +
        "/image/" +
        encodeURIComponent(ret) +
        "?table=" +
        "block" +
        "&id=" +
        block.id;
    }

    return ret;
  }
  //   constructor() {
  //     this.disp();
  //   }
  async disp(): Promise<void> {
    const { NOTION_ACCESS_TOKEN } = process.env;
    this.client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN });
    const id = idToUuid("aa045af321034b62ad9c962b42fe7f48");
    //视图号
    try {
      this.response = await this.client.getPage(id);

      // 处理结果
    } catch (error) {
      // 处理错误
    }
    this.collectionQuery = this.response.collection_query;

    this.block = this.response.block;
    this.collection = Object.values(this.response.collection);
    // this.schema = this.collection.schema;
    this.rawMetadata = this.block[id].value;

    //获取type地址
    const rawProperties: any = Object.entries(
      this.collection[0]["value"]["schema"] || []
    );
    for (let i = 0; i < rawProperties.length; i++) {
      if (rawProperties[i][1]["name"] == "type") {
        for (let j = 0; j < rawProperties[i][1]["options"].length; j++) {
          this.typeObj.push(rawProperties[i][1]["options"][j]["value"]);
        }
        this.typeName = rawProperties[i][0];
        break;
      }
    }
  }
}

export class Notion extends Nodrogen {
  getWiki(): void {
    const pageCover = this.mapImgUrl(
      this.collection[0]["value"]["cover"],
      this.rawMetadata
    );

    const icon = this.mapImgUrl(
      this.collection[0]["value"]["icon"],
      this.rawMetadata
    );

    const wiki = {
      icon: icon,
      cover: pageCover,
      name: this.collection[0]["value"]["name"][0][0],
      description: this.collection[0]["value"]["description"][0][0],
      type: this.typeObj,
      star: this.typeName,
      // main_user: mainUser,
      // user: notion_users,
    };
    console.log(wiki);
  }

  async getPost(id: any): Promise<void> {
    const rawProperties = Object.entries(
      this.block?.[id]?.value?.properties || []
    );
    const excludeProperties = ["date", "select", "multi_select", "person"];
    const properties: any = {};
    for (let i = 0; i < rawProperties.length; i++) {
      const [key, val]: any = rawProperties[i];
      properties["id"] = id;
      if (
        this.collection[0]["value"]["schema"][key]?.type &&
        !excludeProperties.includes(
          this.collection[0]["value"]["schema"][key].type
        )
      ) {
        properties[this.collection[0]["value"]["schema"][key].name] =
          getTextContent(val);
      } else {
        switch (this.collection[0]["value"]["schema"]?.type) {
          case "date": {
            let dateProperty: any = getDateValue(val);
            // delete dateProperty.type;
            properties[this.collection[0]["value"]["schema"][key].name] =
              dateProperty;
            break;
          }
          case "select":
          case "multi_select": {
            const selects = getTextContent(val);
            if (selects[0]?.length) {
              properties[this.collection[0]["value"]["schema"][key].name] =
                selects.split(",");
            }
            break;
          }
          case "person": {
            const rawUsers = val.flat();
            const users = [];
            for (let i = 0; i < rawUsers.length; i++) {
              if (rawUsers[i][0][1]) {
                const userId = rawUsers[i][0];
                const res: any = await this.client.getUsers(userId);
                const resValue =
                  res?.["recordMapWithRoles"]?.notion_user?.[userId[1]]?.value;
                const user = {
                  id: resValue?.id,
                  name: resValue?.name,
                  first_name: resValue?.given_name,
                  last_name: resValue?.family_name,
                  profile_photo: resValue?.profile_photo,
                };
                users.push(user);
              }
            }
            properties[this.collection[0]["value"]["schema"][key].name] = users;
            break;
          }
          default:
            break;
        }
      }
    }

    return properties;
  }

  paginate(items: any, pageNumber: any, pageSize: any) {
    const startIndex = (pageNumber - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }

  async getPosts(slug: string = "1", type?: string): Promise<any[]> {
    // this.pageIds = getAllPageIds(collectionQuery);

    //获取所有pageid
    const views = Object.values(this.collectionQuery)[0] as any;

    let pageIds = [];
    let postsT: any[] = [];
    let postsF: any[] = [];
    this.type = type;
    const pageSet = new Set();
    const posts = new Set();
    Object.values(views).forEach((view: any) => {
      view["collection_group_results"]?.["blockIds"]?.forEach((id: any) => {
        pageSet.add(id), posts.add(this.block[id]);
      });
    });
    pageIds = [...pageSet];
    postsT = [...posts];

    let filterPosts = postsT.sort(
      (objA, objB) =>
        objB?.["value"]["created_time"] - objA?.["value"]["created_time"]
    );
    const result = filterPosts.filter(
      (post: any) => post["value"]["properties"][this.typeName][0] == "精选"
    );
    this.posts = result.concat(filterPosts);
    if (this.type) {
      this.posts = this.posts.filter(
        (post: any) =>
          post["value"]["properties"][this.typeName][0] == this.type
      );
    }
    filterPosts = this.paginate(this.posts, Number(slug), 10);

    for (let i = 0; i < filterPosts.length; i++) {
      // console.log(await this.getPost(filterPosts[i]["value"]["id"]))
      postsF.push(await this.getPost(filterPosts[i]["value"]["id"]));
    }
    // console.log(await getPageProperties("5fe60377-b3c1-4ede-b3e2-8bc4d312a893",this.block,this.collection[0]["value"]["schema"]))

    return postsF;
  }

  getPage(): any {
    let pagesCount: any, pageNumber: any;
   
    pagesCount = Math.ceil(this.posts.length / 10); // 100/10
    const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);
    pageNumber = pages.map((post) => ({
      slug: String(post),
    }));

    return [pagesCount, pageNumber];
  }
}

// export async function getPostInfo<T extends Post>(Post: T) {
//   const { NOTION_ACCESS_TOKEN } = process.env;
//   const client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN });
//   const id = idToUuid(process.env.PAGE_ID);
//   //视图号
//   const response = await client.getPage(id);
//   const collectionQuery = response.collection_query;
//   const pageIds = getAllPageIds(collectionQuery);
//   const block = response.block;
//   const collection = Object.values(response.collection)[0]?.["value"];
//   const schema = collection?.schema;
//   //   const types = await getPageContentBlockIds(response, id);
//   //   for(const key in Post)
//   //   {
//   //     console.log(key,Post[key])
//   //   }
//   // for (let i = 0; i < pageIds.length; i++) {
//   //   const id = pageIds[i];
//   //   const properties: any =
//   //     (await getPageProperties(id, block, schema)) || null;
//   //   if (!properties?.["title"]) {
//   //     continue;
//   //   }
//   //   if (properties["Person"]) {
//   //     return properties["Person"][0]["name"];
//   //   }
//   // }
// }
