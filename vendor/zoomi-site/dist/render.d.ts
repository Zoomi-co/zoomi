import { type ComponentType } from "react";
import type { BlockInstance, ImageValue, PublishedSite } from "./schema.js";
export type BlockProps<P = Record<string, unknown>> = P & {
    block: {
        id: string;
        type: string;
        index: number;
    };
    site: PublishedSite;
};
export type BlockRegistry = Record<string, ComponentType<any>>;
/**
 * Renders a page's blocks with the site's own components. Block components must be synchronous and
 * free of server-only APIs so the CMS live preview can render them in the browser.
 */
export declare function Blocks({ blocks, registry, site, preview, }: {
    blocks: BlockInstance[];
    registry: BlockRegistry;
    site: PublishedSite;
    preview?: boolean;
}): import("react").JSX.Element;
/** Rich text from the CMS is sanitized on save; this renders it. */
export declare function RichText({ html, className }: {
    html: unknown;
    className?: string;
}): import("react").JSX.Element | null;
/** Props for next/image or <img> from a stored image, including the focal point. */
export declare function imageProps(img: ImageValue | null | undefined): {
    src: string;
    alt: string;
    width: number;
    height: number;
    style: {
        objectPosition: string;
    } | undefined;
} | null;
/** Embed URL for a YouTube or Vimeo link, or null if it isn't one. */
export declare function videoEmbedUrl(url: unknown): string | null;
