import type { Metadata, MetadataRoute } from "next";
import { type LegalPage, type PageSummary, type PublishedPage, type PublishedSite, type Redirect } from "./schema.js";
export declare function pageTitle(site: PublishedSite, page: PublishedPage): string;
export declare function buildMetadata(site: PublishedSite, page: PublishedPage): Metadata;
/** Metadata for a plain-text legal page. */
export declare function buildLegalMetadata(site: PublishedSite, page: LegalPage): Metadata;
/** CMS pages plus filled-in legal pages (a CMS page at the same path wins). */
export declare function buildSitemap(site: PublishedSite, pages: PageSummary[]): MetadataRoute.Sitemap;
export declare function buildRobots(site: PublishedSite): MetadataRoute.Robots;
/** Exact match first, then wildcard rules like /old-blog/*. */
export declare function findRedirect(redirects: Redirect[], path: string): Redirect | null;
/** schema.org Organization/LocalBusiness data for the homepage. */
export declare function organizationJsonLd(site: PublishedSite): {
    "@context": string;
    "@type": string;
    name: string;
    url: string;
    logo: string | undefined;
    telephone: string | undefined;
    email: string | undefined;
    address: string | undefined;
    openingHours: string | undefined;
    sameAs: string[];
};
