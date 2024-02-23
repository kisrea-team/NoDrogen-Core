/*
 * @Author: zitons
 * @Date: 2024-02-22 14:00:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-02-23 16:34:30
 * @Description: 简介
 */
import { getAllPosts } from "../../lib/notion/getData";

export async function GET() {
  let posts: any;
  posts = await getAllPosts(0, 0, 0);
  return Response.json({ posts })
}