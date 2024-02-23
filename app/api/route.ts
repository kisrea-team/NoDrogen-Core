/*
 * @Author: zitons
 * @Date: 2024-02-22 14:00:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-02-23 17:48:50
 * @Description: 简介
 */
import { getAllPosts } from "../../lib/notion/getData";

export async function GET() {
  let posts: any;
  posts = await getAllPosts(0, 0, 0);
  const pageNumber = posts['0']
  const pageId = posts['1']
  const wiki = posts['2']
  posts = posts.slice(3);
  return Response.json({ pageNumber , pageId , wiki , posts })
}