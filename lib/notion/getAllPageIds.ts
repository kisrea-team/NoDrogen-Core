/*
 * @Author: zitons
 * @Date: 2024-02-23 16:04:28
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-02-23 16:19:09
 * @Description: 简介
 */
import { idToUuid } from "notion-utils";

export default function getAllPageIds(collectionQuery?:any, viewId?: any) {
  const views = Object.values(collectionQuery)[0] as any;

  let pageIds = [];
  if (viewId) {
    const vId = idToUuid(viewId);
    pageIds = views[vId]?.blockIds;
  } else {
    const pageSet = new Set();
    Object.values(views).forEach((view:any) => {
      view['collection_group_results']?.["blockIds"]?.forEach((id: any) =>
        pageSet.add(id)
      );
    });

    pageIds = [...pageSet];
  }
  return pageIds;
}
