import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Blocks } from "@zoomi/site/render";
import { buildMetadata, findRedirect } from "@zoomi/site/seo";
import { getPage, getPages, getRedirects, getSite } from "@/zoomi/data";
import { registry } from "@/zoomi/blocks";
import { SiteEffects } from "@/components/site-effects";
import { homeJsonLd } from "@/zoomi/structured-data";

function toPath(slug: string[] | undefined) {
  return "/" + (slug ?? []).map((s) => decodeURIComponent(s)).join("/");
}

export async function generateStaticParams() {
  const pages = await getPages();
  const params = pages.filter((p) => p.path !== "/404").map((p) => ({ slug: p.path === "/" ? [] : p.path.slice(1).split("/") }));
  return params.length ? params : [{ slug: [] }];
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const path = toPath((await params).slug);
  const [site, page] = await Promise.all([getSite(), getPage(path)]);
  if (!page) return {};
  const meta = buildMetadata(site, page);
  const image = page.seo.image ?? site.seo.defaultImage;
  // The original share card and favicon until replacements are uploaded in the CMS.
  const images = image
    ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }]
    : [{ url: "/og-image.png", width: 1200, height: 630, alt: "Zoomi — Design that gets you noticed." }];
  return {
    ...meta,
    metadataBase: new URL(site.url),
    robots: meta.robots ?? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: { ...meta.openGraph, siteName: site.name, locale: "en_US", images },
    twitter: { card: "summary_large_image", title: meta.openGraph?.title as string | undefined, description: meta.description ?? undefined, images: images.map((i) => i.url) },
    icons: meta.icons ?? { icon: { url: "/puzzle.png", type: "image/png" } },
    alternates: { ...meta.alternates, types: { "text/plain": [{ url: "/llms.txt", title: "LLM summary" }] } },
    other: { "geo.region": "US-IN" },
  };
}

export default async function ContentPage({ params }: PageProps<"/[[...slug]]">) {
  const path = toPath((await params).slug);
  const [site, page] = await Promise.all([getSite(), getPage(path)]);
  if (!page || path === "/404") {
    const match = findRedirect(await getRedirects(), path);
    if (match) (match.code === 301 ? permanentRedirect : redirect)(match.to);
    notFound();
  }
  return (
    <>
      {path === "/" ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(site, page)).replace(/</g, "\\u003c") }} /> : null}
      <Blocks blocks={page.blocks} registry={registry} site={site} />
      <SiteEffects />
    </>
  );
}
