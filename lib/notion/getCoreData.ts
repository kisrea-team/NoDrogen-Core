import { NotionAPI } from "notion-client";
import { idToUuid, getTextContent, getDateValue } from "notion-utils";

import { getPreviewImageMap } from './preview-images'

export class Nodrogen {
  response: any;
  pageIds: any;
  block: any;
  collection: any;
  schema: any;
  tagOptions: any;
  rawMetadata: any;
  client: any;
  typeObj: any = [];
  typeName: any;
  dateName: any;
  collectionQuery: any;
  posts: any;
  type: any;
  tagObj: any;
  mainUser: any = [];
  q: any;
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
  // getRepeatNum(arr: any) {
  //   var obj: any = {};
  //   for (var i = 0, l = 10; i < l; i++) {
  //     var item = arr[i]["value"]["properties"][this.dateName][0][1][0][1]["start_date"].getFullYear();
  //     obj[item] = obj[item] + 1 || 1;
  //   }
  //   return obj;
  // }

  async disp(): Promise<any> {
    const { NOTION_ACCESS_TOKEN } = process.env;
    this.client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN });
    // const id = idToUuid("98f7af9c0c8f403cab2e918b4aa630c0");
    const id = idToUuid(process.env.PAGE_ID);
    //视图号
    try {
      this.response = await this.client.getPage(id);
      // console.log(this.response)
      // 处理结果
    } catch (error) {
      // 处理错误
      console.log(error);
    }

    this.collectionQuery = this.response.collection_query;

    this.block = this.response.block;
    this.collection = Object.values(this.response.collection);
    // this.schema = this.collection.schema;
    this.rawMetadata = this.block[id].value;

    const tagSchema: any = Object.values(this.collection[0]["value"]["schema"]);
    this.tagOptions = tagSchema[3]?.["options"];
    //获取type地址
    const rawProperties: any = Object.entries(
      this.collection[0]["value"]["schema"]
    );
    this.q = 0;
    //console.log(rawProperties);
    for (let i = 0; i < rawProperties.length; i++) {
      switch (rawProperties[i][1]["name"]) {


        case "type": {
          // for (let j = 0; j < rawProperties[i][1]["options"].length; j++) {
          //   this.typeObj.push(rawProperties[i][1]["options"][j]["value"]);
          // }
          this.typeObj = Object.entries(rawProperties[i][1]["options"]).map((item) => item[1].value);

          this.typeName = rawProperties[i][0];
          // break;
        }
        case "date": {
          this.dateName = rawProperties[i][0];
        }
        case "tags": {
          this.tagObj = rawProperties[i][1]["options"];
        }


      }
    }
  }
}
export class Notion extends Nodrogen {
  getWiki(): any {
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
      date: this.dateName,
      // main_user: mainUser,
      // user: notion_users,
    };
    //console.log(Notion);
    return wiki;
  }

  async getPost(id: any): Promise<any[]> {
    const rawProperties = Object.entries(
      this.block?.[id]?.value?.properties || []
    );
    const excludeProperties = ["date", "select", "multi_select", "person"];
    const properties: any = {};
    const processProperty = async (key: string, val: any) => {
      const propertySchema = this.collection[0]["value"]["schema"][key];
      if (propertySchema?.type && !excludeProperties.includes(propertySchema.type)) {
        properties[propertySchema.name] = getTextContent(val);
      } else {
        switch (propertySchema?.type) {
          case "date": {
            let dateProperty: any = getDateValue(val);
            let batchDate = new Date(dateProperty["start_date"]).getFullYear() + '年' + (new Date(dateProperty["start_date"]).getMonth() + 1) + '月' + new Date(dateProperty["start_date"]).getDate() + '日';
            dateProperty["date"] = batchDate;
            properties[propertySchema.name] = dateProperty;
            break;
          }
          case "select":
          case "multi_select": {
            const selects = getTextContent(val);
            if (selects[0]?.length) {
              properties[propertySchema.name] = selects.split(",");
            }
            break;
          }
          case "person": {
            const rawUsers = val.flat();
            const users = [];
            // console.log(rawUsers)
            for (let i = 0; i < rawUsers.length; i++) {
              // console.log(this.mainUser.length)
              if (rawUsers[i][0][1] && this.mainUser.length == 0) {
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
                this.mainUser = users;
                break;

              }
            }
            // properties[this.collection[0]["value"]["schema"][key].name] = users;
            break;
          }
          default:
            break;
        }
      }
    };

    const processAllProperties = async () => {

      const propertyPromises = rawProperties.map(([key, val]: any) => {
        properties["id"] = id;
        return processProperty(key, val);
      });

      await Promise.all(propertyPromises);
    };

    // 执行并行处理
    await processAllProperties();

    properties["tags"] =
      properties["tags"]?.map((tag: any) => {
        return {
          name: tag,
          color:
            this.tagOptions?.find((t: any) => t.value === tag)?.color || "gray",
        };
      }) || [];
    if (this.block[id].value?.format?.page_icon) {
      properties["icon"] = this.mapImgUrl(
        this.block[id].value?.format?.page_icon,
        this.block[id].value
      );
    }

    if (this.block[id].value?.format?.page_cover) {
      properties["cover"] = this.mapImgUrl(
        this.block[id].value?.format?.page_cover,
        this.block[id].value
      );
    } else {
      properties["cover"] =
        "https://www.notion.so/images/page-cover/met_fitz_henry_lane.jpg";
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
    //console.log(views);
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
    // const mainUser = postsT.find((element) => element > 10);

    // let filterPosts = postsT.sort(
    //   (objA: any, objB: any) =>
    //     new Date(
    //       objB?.["value"]["properties"][this.dateName][0][1][0][1]["start_date"]
    //     ).getTime() -
    //     new Date(
    //       objA?.["value"]["properties"][this.dateName][0][1][0][1]["start_date"]
    //     ).getTime()
    // );
    let filterPosts = postsT
    const result = filterPosts.filter(
      (post: any) => post["value"]["properties"]?.[this.typeName]?.[0] == "精选"
    );
    this.posts = result.concat(filterPosts);
    if (this.type && this.type == "1") {
      this.posts = filterPosts;
      //去掉精选项目
    }
    if (this.type && this.type != "1") {
      this.posts = this.posts.filter(
        (post: any) =>
          post["value"]["properties"]?.[this.typeName]?.[0] == this.type
      );
    }

    filterPosts = this.paginate(this.posts, Number(slug), 10);
    var obj: any = {};
    var years: any = [];
    for (let i = 0; i < filterPosts.length; i++) {
      // console.log(await this.getPost(filterPosts[i]["value"]["id"]))

      if (this.type && this.type == "1") {
        var item = new Date(
          filterPosts[i]["value"]["properties"][this.dateName][0][1][0][1][
          "start_date"
          ]
        ).getFullYear();
        var year = item.toString();
        obj[item] = obj[item] + 1 || 1;
        years["2077"] = obj;
        if (obj[item] == 1) {
          years[year] = [];
        }

      }



      // let pageInfo: any = await this.getPost(filterPosts[i]["value"]["id"]);
      // postsF.push(pageInfo);

    }

    const postPromises = filterPosts.map((post: any) => this.getPost(post["value"]["id"]));

    postsF = await Promise.all(postPromises);

    if (this.type && this.type == "1") {
      console.log(years);
      return years;
    } else {
      // const found = postsF.find((element) => element["Person"]);

      // this.mainUser = found["Person"];

      // console.log(await getPageProperties("5fe60377-b3c1-4ede-b3e2-8bc4d312a893",this.block,this.collection[0]["value"]["schema"]))
      return postsF;
    }
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


  async getContent(slug: string): Promise<any[]> {
    const recordMap = await this.client.getPage(slug);
    const previewImageMap = await getPreviewImageMap(recordMap)
      ; (recordMap as any).preview_images = previewImageMap
    // const person=await this.client.getPageProperty("Person", this.block?.[slug], recordMap)
    // console.log(this.block?.[slug])
    // const recordMap = await this.client.getCollectionData(
    //   "5a58f56e-d7e8-4a06-b02d-1a2d3316b0ca",
    //   "170dae80-3357-4825-b44a-d4c8d0e6ad10"
    // )


    // console.log(recordMap)

    return recordMap;

  }
}
