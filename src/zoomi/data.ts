import { cacheLife, cacheTag } from "next/cache";
import { createClient, zoomiTags } from "@zoomi/site/client";

// Content is cached until the CMS says it changed (on publish), with an hourly safety refresh.

export async function getSite() {
  "use cache";
  cacheTag(zoomiTags.site);
  cacheLife("hours");
  return createClient().site();
}

export async function getPage(path: string) {
  "use cache";
  cacheTag(zoomiTags.path(path), zoomiTags.pages);
  cacheLife("hours");
  return createClient().page(path);
}

export async function getPages() {
  "use cache";
  cacheTag(zoomiTags.pages);
  cacheLife("hours");
  return createClient().pages();
}

export async function getRedirects() {
  "use cache";
  cacheTag(zoomiTags.redirects);
  cacheLife("hours");
  return createClient().redirects();
}
