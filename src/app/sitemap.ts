import type { MetadataRoute } from "next";
import { buildSitemap } from "@zoomi/site/seo";
import { getPages, getSite } from "@/zoomi/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, pages] = await Promise.all([getSite(), getPages()]);
  // /id/dan is a static page outside the CMS.
  return [...buildSitemap(site, pages.filter((p) => p.path !== "/404")), { url: new URL("/id/dan", site.url).toString(), lastModified: "2024-08-29" }];
}
