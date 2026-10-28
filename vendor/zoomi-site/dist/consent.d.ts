import type { Tags } from "./schema.js";
declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
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
/** Tell GTM a form was sent. Conversions (GA4, Google Ads, Meta and so on) are set up as GTM tags on this event. */
export declare function trackLead(formName: string): void;
