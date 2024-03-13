/*
 * @Author: zitons
 * @Date: 2024-02-22 14:00:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-03-13 13:43:19
 * @Description: 简介
 */
import { getAllPosts } from "../../../../lib/notion/getData";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const type = params.type; // 'a', 'b', or 'c'
  let posts: any;
  posts = await getAllPosts(2, 0, type);
  const pageNumber = posts["0"];
  const pageId = posts["1"];
  const wiki = posts["2"];
  const typeNumer = posts["3"];
  posts = posts.slice(4);
  return Response.json({ pageNumber, pageId, typeNumer, wiki, posts });
}
