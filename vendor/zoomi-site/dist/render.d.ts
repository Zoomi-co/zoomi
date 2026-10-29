import { type ComponentType, type HTMLAttributes } from "react";
import { type BlockInstance, type ImageValue, type LegalPage as LegalPageData, type PublishedSite } from "./schema.js";
export type BlockMeta = {
    id: string;
    type: string;
    index: number;
    /** True inside the CMS live preview, where text marked with field() can be edited in place. */
    preview?: boolean;
};
export type BlockProps<P = Record<string, unknown>> = P & {
    block: BlockMeta;
    site: PublishedSite;
};
type EditAttrs = {
    "data-zoomi-field"?: string;
    "data-zoomi-join"?: string;
    "data-zoomi-nav"?: string;
};
/**
 * Marks an element as the place a text field shows, so the CMS preview can edit it in place.
 * Spread it on the element that holds only that field's text: `<h2 {...field(block, "heading")}>`.
 * List items use their index: `field(block, `items.${i}.title`)`. A field shown as several elements
 * (one per line, or split on commas) goes on their parent, with `join` set to the separator.
 * Renders nothing outside the preview.
 */
export declare function field(block: Pick<BlockMeta, "preview">, path: string, opts?: {
    join?: string;
}): EditAttrs;
/** Like field(), for a menu label from Navigation: pass the item's id, a footer column's id, or "cta" for the header button. */
export declare function navField(preview: boolean | undefined, id: string): EditAttrs;
/** Marks decoration inside an editable element (an arrow, a number) so in-place editing skips it. aria-hidden elements are skipped too. */
export declare function skip(preview: boolean | undefined): {
    "data-zoomi-skip"?: "";
};
/**
 * Text from a field with `inline: true`: bold, italic, links and line breaks, rendered as React elements
 * (never as raw HTML). With `asterisks`, *words* also render as italic, for sites that used that convention.
 */
export declare function Inline({ value, asterisks }: {
    value: unknown;
    asterisks?: boolean;
}): import("react").JSX.Element | null;
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
export declare function RichText({ html, className, ...rest }: {
    html: unknown;
    className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML">): import("react").JSX.Element | null;
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
/** A legal page from Settings: its title and plain text. Blank lines start paragraphs; single line breaks are kept. */
export declare function LegalPage({ page, className }: {
    page: LegalPageData;
    className?: string;
}): import("react").JSX.Element;
export {};
