export type EditMode = "plain" | "inline" | "rich";
/** What the editor tells the preview about one editable field. */
export type EditableField = {
    label: string;
    mode: EditMode;
    multiline?: boolean;
    max?: number;
};
/**
 * Sent by the editor with each render. `fields` is keyed by block type, then by field path, with list
 * indexes written as `*` (e.g. "items.*.title"). Omitted when the page is read-only.
 */
export type EditConfig = {
    fields: Record<string, Record<string, EditableField>>;
    nav: boolean;
};
/** The key an element's field path looks up in EditConfig.fields: list indexes become "*". */
export declare function fieldKey(path: string): string;
/** Decoration inside an editable element: never edited, never read back. */
export declare function isSkipped(node: Node): boolean;
/** Reads an element back into a field value. With `join`, each child element is one item. */
export declare function readField(el: Element, mode: EditMode, join?: string | null): string;
/**
 * Records an element's subtree so it can be put back node for node. React keeps references to the
 * nodes it rendered; typing and formatting move and split them, so they go back before React renders again.
 */
export declare function snapshot(root: Element): () => void;
/** Puts the caret where the pointer is, if the browser can tell. */
export declare function caretAt(doc: Document, x: number, y: number, within: Element): void;
/** Sets a value at a dotted path ("items.2.title") in a copy of props. */
export declare function setPath(props: Record<string, unknown>, path: string, value: unknown): Record<string, unknown>;
