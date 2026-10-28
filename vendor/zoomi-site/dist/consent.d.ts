import type { Tags } from "./schema.js";
declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        fbq?: (...args: unknown[]) => void;
        lintrk?: (...args: unknown[]) => void;
        uetq?: unknown[];
        ttq?: {
            track: (...args: unknown[]) => void;
        };
    }
}
/**
 * Loads tracking tags after the page is interactive and shows the cookie banner when it is on.
 * Never rendered in the CMS preview, so editing doesn't pollute analytics.
 */
export declare function ZoomiTags({ tags, path: pathProp, geoEndpoint }: {
    tags: Tags;
    path?: string;
    geoEndpoint?: string;
}): import("react").JSX.Element | null;
/** Fire a lead conversion on every connected platform. Call after a form submits successfully. */
export declare function trackLead(formName: string, googleAds?: {
    id: string;
    label?: string;
}): void;
