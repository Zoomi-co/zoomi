import { stripTags, type PublishedPage, type PublishedSite } from "@zoomi/site/schema";

type Item = Record<string, string>;

/** schema.org graph for the homepage: the company, Zoomi Audit, the website, and the FAQ from the Questions block. */
export function homeJsonLd(site: PublishedSite, page: PublishedPage) {
  const url = new URL("/", site.url).toString();
  const b = site.brand.business;
  const blocks = (type: string) => page.blocks.filter((x) => x.type === type).map((x) => x.props as Record<string, unknown>);
  const services = blocks("services").flatMap((x) => (x.items as Item[] | undefined) ?? []);
  const ventures = blocks("ventures").flatMap((x) => (x.items as (Item & { link?: { href?: string; url?: string } })[] | undefined) ?? []);
  const faqs = blocks("faq").flatMap((x) => (x.items as Item[] | undefined) ?? []);
  const text = (html: string) => stripTags(html).replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${url}#org`,
        name: site.name,
        legalName: b.name || undefined,
        url,
        logo: new URL("/puzzle.png", url).toString(),
        image: new URL("/og-image.png", url).toString(),
        email: b.email || undefined,
        foundingDate: "2023",
        description: page.seo.description || site.seo.defaultDescription || undefined,
        address: { "@type": "PostalAddress", addressRegion: "IN", addressCountry: "US" },
        areaServed: { "@type": "Country", name: "United States" },
        knowsAbout: ["Brand identity", "Web design", "Search engine optimization", "Digital marketing", "Marketing strategy", "Marketing analytics"],
        hasOfferCatalog: services.length
          ? {
              "@type": "OfferCatalog",
              name: "Marketing services",
              itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.body || undefined } })),
            }
          : undefined,
        subOrganization: ventures
          .filter((v) => v.link?.href || v.link?.url)
          .map((v) => ({ "@type": "Organization", name: v.name, url: v.link?.href || v.link?.url })),
        sameAs: b.social.map((s) => s.url).filter(Boolean),
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://audit.zoomi.co/#app",
        name: "Zoomi Audit",
        url: "https://audit.zoomi.co",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "SEO software that monitors site health, tracks keywords and rankings, and produces a prioritized list of fixes.",
        publisher: { "@id": `${url}#org` },
      },
      { "@type": "WebSite", "@id": `${url}#website`, url, name: site.name, inLanguage: "en-US", publisher: { "@id": `${url}#org` } },
      faqs.length
        ? {
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: text(f.answer ?? "") } })),
          }
        : null,
    ].filter(Boolean),
  };
}
