/*
 * @Author: zitons
 * @Date: 2024-02-23 16:04:28
 * @LastEditors: 
 * @LastEditTime: 2024-02-23 16:55:13
 * @Description: 简介
 */
import { NotionAPI } from "notion-client";

const { NOTION_ACCESS_TOKEN } = process.env;

const client = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN });

export async function getPostBlocks(id:any) {
  const pageBlock = await client.getPage(id);
  return pageBlock;
}
