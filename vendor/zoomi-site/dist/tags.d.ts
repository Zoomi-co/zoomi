import type { Snippet, TagCategory, Tags } from "./schema.js";
export type TagScript = {
    id: string;
    category: TagCategory;
    /** External script URL. */
    src?: string;
    /** Inline JavaScript. */
    inline?: string;
    /** Raw HTML from a custom snippet. */
    html?: string;
    location: "head" | "body-start" | "body-end";
};
export declare const GTM_PATTERN: RegExp;
export declare function validateGtmId(id: string): boolean;
/**
 * Events the site pushes to the dataLayer, so GTM triggers can use them. Shown in the CMS as a reference.
 * Keep in sync with trackLead and the consent banner in consent.tsx.
 */
export declare const DATALAYER_EVENTS: {
    event: string;
    when: string;
    fields: string[];
}[];
export declare function snippetMatches(snippet: Snippet, path: string): boolean;
/** All scripts for a page, in load order: GTM first, then custom code. */
export declare function buildTagScripts(tags: Tags, path: string): TagScript[];
/** Warnings shown in the CMS, e.g. a custom snippet loading a second copy of a Google tag. */
export declare function tagWarnings(tags: Tags): string[];
