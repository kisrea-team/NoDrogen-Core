import { NotionAPI } from "notion-client";
import { idToUuid, getPageContentBlockIds } from "notion-utils";
import getAllPageIds from "./getAllPageIds";
// import getPageProperties from "./getPageProperties";
interface Post {
  id: string;
  date: string;
  person: Object;
  type: Object;
  title: string;
  status: object;
  start_date: string;
  cover: string;
  tags: Object;
}
export class Nodrogen {
  response: any;
  pageIds: any;
  block: any;
  collection: any;
  schema: any;
  rawMetadata: any;

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
    const client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN });
    const id = idToUuid("aa045af321034b62ad9c962b42fe7f48");
    //视图号
    try {
      this.response = await client.getPage(id);

      // 处理结果
    } catch (error) {
      // 处理错误
    }
    const collectionQuery = this.response.collection_query;
    this.pageIds = getAllPageIds(collectionQuery);
    this.block = this.response.block;
    this.collection = Object.values(this.response.collection);
    // this.schema = this.collection.schema;
    this.rawMetadata = this.block[id].value;
  }
}

export class Wiki extends Nodrogen {
  get(): void {
    // const pageCover = obj.mapImgUrl(
    //   this.collection[0]["value"]["cover"],
    //   this.rawMetadata
    // );
    
    // const icon = this.mapImgUrl(this.collection[0]["value"], this.rawMetadata);
    // const rawProperties: any = Object.entries(
    //   this.collection[0]["value"]["schema"] || []
    // );
    // for (let i = 0; i < rawProperties.length; i++) {
    //   console.log(rawProperties[i]["name"]);
    // }
    console.log(this.block)
    // const wiki = {
    //   icon: icon,
    //   cover: pageCover,
    //   name: this.collection[0]["value"]["name"][0][0],
    //   description: this.collection[0]["value"]["description"][0][0],
    //   type: typeObj,
    //   mainUser: mainUser,
    //   user: notion_users,
    // };
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
