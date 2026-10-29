import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment } from "react";
import { decodeEntities } from "./schema.js";
/**
 * Marks an element as the place a text field shows, so the CMS preview can edit it in place.
 * Spread it on the element that holds only that field's text: `<h2 {...field(block, "heading")}>`.
 * List items use their index: `field(block, `items.${i}.title`)`. A field shown as several elements
 * (one per line, or split on commas) goes on their parent, with `join` set to the separator.
 * Renders nothing outside the preview.
 */
export function field(block, path, opts = {}) {
    if (!block.preview)
        return {};
    return opts.join === undefined ? { "data-zoomi-field": path } : { "data-zoomi-field": path, "data-zoomi-join": opts.join };
}
/** Like field(), for a menu label from Navigation: pass the item's id, a footer column's id, or "cta" for the header button. */
export function navField(preview, id) {
    return preview ? { "data-zoomi-nav": id } : {};
}
/** Marks decoration inside an editable element (an arrow, a number) so in-place editing skips it. aria-hidden elements are skipped too. */
export function skip(preview) {
    return preview ? { "data-zoomi-skip": "" } : {};
}
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const INLINE_TAG = /<(\/?)(strong|b|em|i|a|br)\b([^>]*)>/gi;
/**
 * Text from a field with `inline: true`: bold, italic, links and line breaks, rendered as React elements
 * (never as raw HTML). With `asterisks`, *words* also render as italic, for sites that used that convention.
 */
export function Inline({ value, asterisks = false }) {
    if (typeof value !== "string" || !value)
        return null;
    return _jsx(_Fragment, { children: inlineNodes(asterisks ? value.replace(/\*([^*\n]+)\*/g, "<em>$1</em>") : value) });
}
function inlineNodes(html) {
    const root = { tag: null, children: [] };
    const stack = [root];
    let key = 0;
    const text = (t) => {
        if (!t)
            return;
        t.split("\n").forEach((part, i) => {
            if (i > 0)
                stack[stack.length - 1].children.push(_jsx("br", {}, key++));
            if (part)
                stack[stack.length - 1].children.push(decodeEntities(part));
        });
    };
    const close = () => {
        const frame = stack.pop();
        const parent = stack[stack.length - 1];
        if (frame.tag === "a")
            parent.children.push(_jsx("a", { href: frame.href, ...(/^https?:/i.test(frame.href ?? "") ? { target: "_blank", rel: "noopener noreferrer" } : {}), children: frame.children }, key++));
        else if (frame.tag === "strong")
            parent.children.push(_jsx("strong", { children: frame.children }, key++));
        else
            parent.children.push(_jsx("em", { children: frame.children }, key++));
    };
    let last = 0;
    for (const m of html.matchAll(INLINE_TAG)) {
        text(html.slice(last, m.index));
        last = m.index + m[0].length;
        const closing = m[1] === "/";
        const name = m[2].toLowerCase();
        if (name === "br") {
            stack[stack.length - 1].children.push(_jsx("br", {}, key++));
            continue;
        }
        const tag = name === "b" || name === "strong" ? "strong" : name === "a" ? "a" : "em";
        if (closing) {
            // Close back to the matching tag; a stray closing tag is ignored.
            if (stack.some((f, i) => i > 0 && f.tag === tag))
                while (stack[stack.length - 1].tag !== tag)
                    close();
            if (stack.length > 1 && stack[stack.length - 1].tag === tag)
                close();
            continue;
        }
        if (tag === "a") {
            const href = decodeEntities(/href\s*=\s*"([^"]*)"/i.exec(m[3])?.[1] ?? "");
            stack.push({ tag, href: SAFE_HREF.test(href) ? href : undefined, children: [] });
        }
        else
            stack.push({ tag, children: [] });
    }
    text(html.slice(last));
    while (stack.length > 1)
        close();
    return root.children;
}
/**
 * Renders a page's blocks with the site's own components. Block components must be synchronous and
 * free of server-only APIs so the CMS live preview can render them in the browser.
 */
export function Blocks({ blocks, registry, site, preview = false, }) {
    return (_jsx(_Fragment, { children: blocks.map((block, index) => {
            if (block.hidden)
                return null;
            const Component = registry[block.type];
            if (!Component) {
                return preview ? (_jsxs("div", { "data-zoomi-block": block.id, style: { padding: 24, border: "2px dashed #e4572e", fontFamily: "system-ui" }, children: ["Missing component for block \u201C", block.type, "\u201D. Deploy the site after adding it to the registry."] }, block.id)) : null;
            }
            const element = _jsx(Component, { ...block.props, block: { id: block.id, type: block.type, index, ...(preview ? { preview: true } : {}) }, site: site });
            return preview ? (_jsx("div", { "data-zoomi-block": block.id, style: { display: "contents" }, children: element }, block.id)) : (_jsx(Fragment, { children: element }, block.id));
        }) }));
}
/** Rich text from the CMS is sanitized on save; this renders it. */
export function RichText({ html, className, ...rest }) {
    // In the preview an empty field still renders, so it can be clicked and filled in.
    const editable = "data-zoomi-field" in rest;
    if (!editable && (typeof html !== "string" || !html))
        return null;
    return _jsx("div", { className: className, ...rest, dangerouslySetInnerHTML: { __html: typeof html === "string" ? html : "" } });
}
/** Props for next/image or <img> from a stored image, including the focal point. */
export function imageProps(img) {
    if (!img?.url)
        return null;
    return {
        src: img.url,
        alt: img.alt ?? "",
        width: img.width ?? 1600,
        height: img.height ?? 900,
        style: img.focal ? { objectPosition: `${img.focal.x * 100}% ${img.focal.y * 100}%` } : undefined,
    };
}
/** Embed URL for a YouTube or Vimeo link, or null if it isn't one. */
export function videoEmbedUrl(url) {
    if (typeof url !== "string")
        return null;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
    if (yt)
        return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo)
        return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`;
    return null;
}
/** A legal page from Settings: its title and plain text. Blank lines start paragraphs; single line breaks are kept. */
export function LegalPage({ page, className = "zoomi-legal" }) {
    const paragraphs = page.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return (_jsxs("article", { className: className, style: { maxWidth: 720, margin: "0 auto", padding: "64px 20px", lineHeight: 1.6 }, children: [_jsx("h1", { children: page.title }), paragraphs.map((p, i) => (_jsx("p", { style: { whiteSpace: "pre-line" }, children: p }, i)))] }));
}
