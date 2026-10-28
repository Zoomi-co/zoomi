import { Blocks } from "@zoomi/site/render";
import { getPage, getSite } from "@/zoomi/data";
import { registry } from "@/zoomi/blocks";
import { SiteEffects } from "@/components/site-effects";

/** Editable in the CMS like any other page; falls back to a plain message. */
export default async function NotFound() {
  const [site, page] = await Promise.all([getSite(), getPage("/404")]);
  if (page?.blocks.length)
    return (
      <>
        <Blocks blocks={page.blocks} registry={registry} site={site} />
        <SiteEffects />
      </>
    );
  return (
    <section className="faq section-pad">
      <div className="section-head section-head--wide">
        <h2 className="one-line">
          Page not <em>found.</em>
        </h2>
        <p>
          That page moved or never existed. <a href="/">Back to zoomi.co ↗</a>
        </p>
      </div>
      <SiteEffects />
    </section>
  );
}
