import { type ComponentType, type ReactNode } from "react";
import { setPath, type EditConfig } from "./inline-edit.js";
import { type BlockRegistry } from "./render.js";
import { type Navigation, type PublishedPage, type PublishedSite } from "./schema.js";
export type { EditConfig, EditableField, EditMode } from "./inline-edit.js";
export type PreviewMessage = {
    type: "zoomi:render";
    site: PublishedSite;
    page: PublishedPage | null;
    selected?: string | null;
    edit?: EditConfig | null;
} | {
    type: "zoomi:focus";
    blockId: string;
} | {
    type: "zoomi:ping";
};
/** What the preview sends back when text edited in place loses focus. */
export type PreviewEdit = {
    type: "zoomi:edit";
    target: "block";
    blockId: string;
    path: string;
    value: string;
} | {
    type: "zoomi:edit";
    target: "nav";
    id: string;
    value: string;
};
export type ShellProps = {
    site: PublishedSite;
    page: PublishedPage | null;
    children: ReactNode;
    preview?: boolean;
};
export { setPath };
/** Sets the label of a menu item (by id), a footer column title ("col:<id>") or the header button ("cta"). */
export declare function relabelNav(nav: Navigation, id: string, label: string): Navigation;
/**
 * The CMS editor loads this page in an iframe and sends draft content by postMessage.
 * Rendering happens in the browser, so typing shows instantly and no cookies are needed.
 * Text marked with field() or navField() is edited in place: click it, type, and click away to save.
 */
export declare function ZoomiPreview({ cmsOrigin, registry, Shell, }: {
    cmsOrigin: string;
    registry: BlockRegistry;
    Shell: ComponentType<ShellProps>;
}): import("react").JSX.Element;
