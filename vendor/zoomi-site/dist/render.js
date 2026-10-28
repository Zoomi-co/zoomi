import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Fragment } from "react";
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
            const element = _jsx(Component, { ...block.props, block: { id: block.id, type: block.type, index }, site: site });
            return preview ? (_jsx("div", { "data-zoomi-block": block.id, style: { display: "contents" }, children: element }, block.id)) : (_jsx(Fragment, { children: element }, block.id));
        }) }));
}
/** Rich text from the CMS is sanitized on save; this renders it. */
export function RichText({ html, className }) {
    if (typeof html !== "string" || !html)
        return null;
    return _jsx("div", { className: className, dangerouslySetInnerHTML: { __html: html } });
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
