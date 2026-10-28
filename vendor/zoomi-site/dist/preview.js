"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { brandCss, googleFontsHref } from "./brand.js";
import { Blocks } from "./render.js";
/**
 * The CMS editor loads this page in an iframe and sends draft content by postMessage.
 * Rendering happens in the browser, so typing shows instantly and no cookies are needed.
 */
export function ZoomiPreview({ cmsOrigin, registry, Shell, }) {
    const [state, setState] = useState(null);
    const [selected, setSelected] = useState(null);
    const root = useRef(null);
    const origin = cmsOrigin.replace(/\/$/, "");
    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== origin)
                return;
            const msg = event.data;
            if (msg?.type === "zoomi:ping") {
                window.parent.postMessage({ type: "zoomi:ready" }, origin);
            }
            else if (msg?.type === "zoomi:render") {
                setState({ site: msg.site, page: msg.page });
                if (msg.selected !== undefined)
                    setSelected(msg.selected);
            }
            else if (msg?.type === "zoomi:focus") {
                setSelected(msg.blockId);
                root.current
                    ?.querySelector(`[data-zoomi-block="${CSS.escape(msg.blockId)}"]`)
                    ?.firstElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };
        window.addEventListener("message", onMessage);
        window.parent.postMessage({ type: "zoomi:ready" }, origin);
        return () => window.removeEventListener("message", onMessage);
    }, [origin]);
    // Clicking a block selects it in the editor. Links don't navigate inside the preview.
    useEffect(() => {
        const el = root.current;
        if (!el)
            return;
        const onClick = (event) => {
            const target = event.target;
            if (target.closest("a, button"))
                event.preventDefault();
            const block = target.closest("[data-zoomi-block]");
            if (block) {
                const id = block.dataset.zoomiBlock;
                setSelected(id);
                window.parent.postMessage({ type: "zoomi:select", blockId: id }, origin);
            }
        };
        el.addEventListener("click", onClick, true);
        return () => el.removeEventListener("click", onClick, true);
    }, [origin, state]);
    if (!state) {
        return (_jsx("div", { style: { display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "system-ui", color: "#888" }, children: "Waiting for the editor\u2026" }));
    }
    const fonts = googleFontsHref(state.site.brand);
    return (_jsxs("div", { ref: root, children: [fonts ? _jsx("link", { rel: "stylesheet", href: fonts }) : null, _jsx("style", { children: brandCss(state.site.brand) }), _jsx("style", { children: `[data-zoomi-block]>*{cursor:pointer;transition:outline-color .15s}[data-zoomi-block]:hover>*{outline:2px solid rgba(228,87,46,.45);outline-offset:-2px}${selected ? `[data-zoomi-block="${selected.replace(/["\\]/g, "")}"]>*{outline:2px solid #e4572e!important;outline-offset:-2px}` : ""}` }), _jsx(Shell, { site: state.site, page: state.page, children: state.page ? _jsx(Blocks, { blocks: state.page.blocks, registry: registry, site: state.site, preview: true }) : null })] }));
}
