/*
 * @Author: zitons
 * @Date: 2024-03-15 11:23:37
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-03-15 17:11:12
 * @Description: 简介
 */
import { Nodrogen, Wiki } from "../../../lib/notion/getCoreData";

export async function GET() {
  var obj = await new Wiki();
  await obj.disp();
  console.log(obj.response);
  await obj.get()
  return Response.json({});
}
