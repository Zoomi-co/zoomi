export function pageTitle(site, page) {
    const title = page.seo.title?.trim() || page.title;
    if (page.path === "/" && page.seo.title?.trim())
        return page.seo.title.trim();
    return site.seo.titleTemplate.replace("%page%", title).replace("%site%", site.brand.business.name || site.name);
}
export function buildMetadata(site, page) {
    const description = page.seo.description?.trim() || site.seo.defaultDescription || undefined;
    const image = page.seo.image ?? site.seo.defaultImage;
    const noindex = !site.seo.indexable || page.seo.noindex;
    const url = new URL(page.path, site.url).toString();
    return {
        title: pageTitle(site, page),
        description,
        alternates: { canonical: url },
        robots: noindex ? { index: false, follow: false } : undefined,
        openGraph: {
            title: page.seo.title?.trim() || page.title,
            description,
            url,
            siteName: site.brand.business.name || site.name,
            images: image ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] : undefined,
            type: "website",
        },
        icons: site.brand.favicon ? { icon: site.brand.favicon.url, apple: site.brand.favicon.url } : undefined,
        verification: site.tags.gscVerification ? { google: site.tags.gscVerification } : undefined,
    };
}
export function buildSitemap(site, pages) {
    if (!site.seo.indexable)
        return [];
    return pages
        .filter((p) => !p.noindex)
        .map((p) => ({ url: new URL(p.path, site.url).toString(), lastModified: p.updatedAt }));
}
export function buildRobots(site) {
    if (!site.seo.indexable)
        return { rules: { userAgent: "*", disallow: "/" } };
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/zoomi-preview"] },
        sitemap: new URL("/sitemap.xml", site.url).toString(),
    };
}
/** Exact match first, then wildcard rules like /old-blog/*. */
export function findRedirect(redirects, path) {
    const exact = redirects.find((r) => r.from === path);
    if (exact)
        return exact;
    for (const r of redirects) {
        if (r.from.endsWith("/*") && path.startsWith(r.from.slice(0, -1))) {
            const rest = path.slice(r.from.length - 1);
            return { ...r, to: r.to.endsWith("/*") ? r.to.slice(0, -1) + rest : r.to };
        }
    }
    return null;
}
/** schema.org Organization/LocalBusiness data for the homepage. */
export function organizationJsonLd(site) {
    const b = site.brand.business;
    return {
        "@context": "https://schema.org",
        "@type": b.address ? "LocalBusiness" : "Organization",
        name: b.name || site.name,
        url: site.url,
        logo: site.brand.logo?.url,
        telephone: b.phone || undefined,
        email: b.email || undefined,
        address: b.address || undefined,
        openingHours: b.hours || undefined,
        sameAs: b.social.map((s) => s.url).filter(Boolean),
    };
}
