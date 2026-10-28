import { type ComponentType, type ReactNode } from "react";
import { type BlockRegistry } from "./render.js";
import type { PublishedPage, PublishedSite } from "./schema.js";
export type PreviewMessage = {
    type: "zoomi:render";
    site: PublishedSite;
    page: PublishedPage | null;
    selected?: string | null;
} | {
    type: "zoomi:focus";
    blockId: string;
} | {
    type: "zoomi:ping";
};
export type ShellProps = {
    site: PublishedSite;
    page: PublishedPage | null;
    children: ReactNode;
};
/**
 * The CMS editor loads this page in an iframe and sends draft content by postMessage.
 * Rendering happens in the browser, so typing shows instantly and no cookies are needed.
 */
export declare function ZoomiPreview({ cmsOrigin, registry, Shell, }: {
    cmsOrigin: string;
    registry: BlockRegistry;
    Shell: ComponentType<ShellProps>;
}): import("react").JSX.Element;
