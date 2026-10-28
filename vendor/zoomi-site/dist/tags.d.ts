import type { IntegrationKey, Snippet, TagCategory, Tags } from "./schema.js";
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
export type IntegrationInfo = {
    key: IntegrationKey;
    name: string;
    field: string;
    placeholder: string;
    pattern: RegExp;
    category: TagCategory;
    help: string;
};
export declare const INTEGRATIONS: IntegrationInfo[];
export declare function validateIntegrationId(key: IntegrationKey, id: string): boolean;
export declare function snippetMatches(snippet: Snippet, path: string): boolean;
/** All scripts for a page, in load order. GTM and gtag are deduplicated. */
export declare function buildTagScripts(tags: Tags, path: string): TagScript[];
/** Warnings shown in the CMS, e.g. the same Google tag loaded twice. */
export declare function tagWarnings(tags: Tags): string[];
