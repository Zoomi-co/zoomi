import type { PageSummary, PublishedPage, PublishedSite, Redirect, SiteSchema } from "./schema.js";
export type ZoomiConfig = {
    /** Base URL of the CMS, e.g. https://my.zoomi.co */
    cmsUrl: string;
    /** Read token for this site, from the CMS admin. */
    token: string;
};
export declare function configFromEnv(env?: Record<string, string | undefined>): ZoomiConfig;
/** Cache tags used by client sites. The CMS revalidates these on publish. */
export declare const zoomiTags: {
    site: string;
    pages: string;
    redirects: string;
    path: (path: string) => string;
};
export declare class ZoomiError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
/** Raw API calls. Client sites wrap these in their own 'use cache' functions with the tags above. */
export declare function createClient(config?: ZoomiConfig): {
    site: () => Promise<PublishedSite>;
    page: (path: string) => Promise<PublishedPage | null>;
    pages: () => Promise<PageSummary[]>;
    redirects: () => Promise<Redirect[]>;
    registerSchema: (schema: SiteSchema) => Promise<{
        version: number;
    }>;
};
export type ZoomiClient = ReturnType<typeof createClient>;
