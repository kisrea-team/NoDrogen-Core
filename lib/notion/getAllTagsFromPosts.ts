/*
 * @Author: zitons
 * @Date: 2024-02-23 16:04:28
 * @LastEditors: 
 * @LastEditTime: 2024-02-23 16:51:10
 * @Description: 简介
 */
export function getAllTagsFromPosts(posts: any) {
  const taggedPosts = posts.filter((post: any) => post?.tags);
  const tags = [...taggedPosts.map((p: any) => p.tags).flat()];
  const tagObj: any = [];
  tags.forEach((tag) => {
    let filtered = tagObj.filter((item: any) => item.name !== tag.name);
    if (filtered.length === tagObj.length) {
      tagObj.push(tag);
    }
  });

  return tagObj;
}
