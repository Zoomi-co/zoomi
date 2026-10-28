import { Suspense } from "react";
import { brandCss } from "@zoomi/site/brand";
import { ZoomiTags } from "@zoomi/site/consent";
import { Shell } from "@/components/shell";
import { getSite } from "@/zoomi/data";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const site = await getSite();
  return (
    <>
      <style>{brandCss(site.brand)}</style>
      <Shell site={site} page={null}>
        {children}
      </Shell>
      <Suspense fallback={null}>
        <ZoomiTags tags={site.tags} />
      </Suspense>
    </>
  );
}
