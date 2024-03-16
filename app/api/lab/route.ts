/*
 * @Author: zitons
 * @Date: 2024-03-15 11:23:37
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-03-16 12:31:48
 * @Description: 简介
 */
import { Notion } from "../../../lib/notion/getCoreData";

export async function GET() {
  var obj = await new Notion();
  await obj.disp();
  await obj.getPosts("1","精选")
  console.log(obj.getPage())
  return Response.json({});
}
