"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { brandCss, googleFontsHref } from "./brand.js";
import { caretAt, fieldKey, isSkipped, readField, setPath, snapshot } from "./inline-edit.js";
import { Blocks } from "./render.js";
import { plainText } from "./schema.js";
/** Selects an element's editable text, leaving out decoration (which the browser won't delete across). */
function selectText(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
            for (let p = n.parentElement; p && p !== el; p = p.parentElement)
                if (isSkipped(p))
                    return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        },
    });
    const texts = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode())
        texts.push(n);
    const sel = window.getSelection();
    if (!sel || !texts.length)
        return;
    const range = document.createRange();
    range.setStart(texts[0], 0);
    const last = texts[texts.length - 1];
    range.setEnd(last, last.data.replace(/\s+$/, "").length);
    sel.removeAllRanges();
    sel.addRange(range);
}
const NAV_FIELD = { label: "Menu label", mode: "plain", max: 40 };
const ACCENT = "#e4572e";
export { setPath };
function relabel(items, id, label) {
    return items.map((item) => (item.id === id ? { ...item, label } : item.children ? { ...item, children: relabel(item.children, id, label) } : item));
}
/** Sets the label of a menu item (by id), a footer column title ("col:<id>") or the header button ("cta"). */
export function relabelNav(nav, id, label) {
    if (id === "cta")
        return { ...nav, cta: nav.cta ? { ...nav.cta, label } : nav.cta };
    if (id.startsWith("col:"))
        return { ...nav, footer: nav.footer.map((col) => (col.id === id.slice(4) ? { ...col, title: label } : col)) };
    return { ...nav, header: relabel(nav.header, id, label), footer: nav.footer.map((col) => ({ ...col, items: relabel(col.items, id, label) })) };
}
/**
 * The CMS editor loads this page in an iframe and sends draft content by postMessage.
 * Rendering happens in the browser, so typing shows instantly and no cookies are needed.
 * Text marked with field() or navField() is edited in place: click it, type, and click away to save.
 */
export function ZoomiPreview({ cmsOrigin, registry, Shell, }) {
    const [state, setState] = useState(null);
    const [selected, setSelected] = useState(null);
    const [edit, setEdit] = useState(null);
    const [editing, setEditing] = useState(null);
    const root = useRef(null);
    const origin = cmsOrigin.replace(/\/$/, "");
    const stateRef = useRef(state);
    const editRef = useRef(edit);
    const editingRef = useRef(null);
    // Renders that arrive mid-edit wait, so React never touches nodes the browser is editing.
    const held = useRef(null);
    useLayoutEffect(() => {
        stateRef.current = state;
        editRef.current = edit;
    });
    const post = useCallback((msg) => window.parent.postMessage(msg, origin), [origin]);
    const applyRender = useCallback((msg) => {
        setState({ site: msg.site, page: msg.page });
        if (msg.selected !== undefined)
            setSelected(msg.selected);
        if (msg.edit !== undefined)
            setEdit(msg.edit ?? null);
    }, []);
    /** Ends in-place editing. With `save`, the text goes to the editor; either way React gets its nodes back first. */
    const finish = useCallback((save) => {
        const e = editingRef.current;
        if (!e)
            return;
        editingRef.current = null;
        const value = save ? readField(e.el, e.field.mode, e.join) : e.initial;
        e.el.removeAttribute("contenteditable");
        e.el.removeAttribute("data-zoomi-editing");
        for (const el of e.locked)
            el.removeAttribute("contenteditable");
        e.restore();
        window.getSelection()?.removeAllRanges();
        setEditing(null);
        const changed = save && value !== e.initial;
        const pending = held.current;
        held.current = null;
        if (changed) {
            // Show the new text now; the editor's next render (which includes it) replaces this one.
            setState((s) => {
                if (!s)
                    return s;
                if (e.target.target === "nav")
                    return { ...s, site: { ...s.site, nav: relabelNav(s.site.nav, e.target.id, value) } };
                const { blockId, path } = e.target;
                return s.page ? { ...s, page: { ...s.page, blocks: s.page.blocks.map((b) => (b.id === blockId ? { ...b, props: setPath(b.props, path, value) } : b)) } } : s;
            });
            post({ ...e.target, type: "zoomi:edit", value });
        }
        else if (pending)
            applyRender(pending);
    }, [post, applyRender]);
    const start = useCallback((el, at) => {
        const config = editRef.current;
        const s = stateRef.current;
        if (!config || !s)
            return false;
        let field;
        let target;
        const nav = el.getAttribute("data-zoomi-nav");
        if (nav !== null) {
            if (!config.nav)
                return false;
            field = NAV_FIELD;
            target = { target: "nav", id: nav };
        }
        else {
            const blockId = el.closest("[data-zoomi-block]")?.dataset.zoomiBlock;
            const path = el.getAttribute("data-zoomi-field");
            const block = s.page?.blocks.find((b) => b.id === blockId);
            if (!block || !path || !blockId)
                return false;
            field = config.fields[block.type]?.[fieldKey(path)];
            target = { target: "block", blockId, path };
        }
        if (!field)
            return false;
        const join = el.getAttribute("data-zoomi-join");
        const restore = snapshot(el);
        const locked = [...el.querySelectorAll("*")].filter(isSkipped);
        for (const l of locked)
            l.contentEditable = "false";
        el.contentEditable = "true";
        el.setAttribute("data-zoomi-editing", "");
        const e = { el, field, join, target, initial: readField(el, field.mode, join), restore, locked };
        editingRef.current = e;
        setEditing(e);
        el.focus({ preventScroll: true });
        if (field.mode === "rich")
            document.execCommand("defaultParagraphSeparator", false, "p");
        document.execCommand("styleWithCSS", false, "false");
        if (at)
            caretAt(document, at.x, at.y, el);
        if (target.target === "block") {
            setSelected(target.blockId);
            post({ type: "zoomi:select", blockId: target.blockId });
        }
        return true;
    }, [post]);
    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== origin)
                return;
            const msg = event.data;
            if (msg?.type === "zoomi:ping") {
                post({ type: "zoomi:ready" });
            }
            else if (msg?.type === "zoomi:render") {
                if (editingRef.current) {
                    held.current = msg;
                    // Read-only now (someone took over): stop editing without saving.
                    if (msg.edit === null)
                        finish(false);
                }
                else
                    applyRender(msg);
            }
            else if (msg?.type === "zoomi:focus") {
                setSelected(msg.blockId);
                root.current
                    ?.querySelector(`[data-zoomi-block="${CSS.escape(msg.blockId)}"]`)
                    ?.firstElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };
        window.addEventListener("message", onMessage);
        post({ type: "zoomi:ready" });
        return () => window.removeEventListener("message", onMessage);
    }, [origin, post, applyRender, finish]);
    // Clicking text edits it; clicking elsewhere in a block selects the block. Links don't navigate inside the preview.
    useEffect(() => {
        const el = root.current;
        if (!el)
            return;
        const onClick = (event) => {
            const target = event.target;
            if (target.closest("[data-zoomi-toolbar]"))
                return;
            if (target.closest("a, button, summary, label"))
                event.preventDefault();
            const current = editingRef.current;
            if (current?.el.contains(target))
                return;
            const text = target.closest("[data-zoomi-field], [data-zoomi-nav]");
            if (current)
                finish(true);
            if (text && !isSkipped(target) && start(text, { x: event.clientX, y: event.clientY }))
                return;
            const block = target.closest("[data-zoomi-block]");
            if (block) {
                const id = block.dataset.zoomiBlock;
                setSelected(id);
                post({ type: "zoomi:select", blockId: id });
            }
        };
        el.addEventListener("click", onClick, true);
        return () => el.removeEventListener("click", onClick, true);
    }, [post, start, finish, state]);
    // Keys while editing; undo and redo go to the editor otherwise.
    useEffect(() => {
        const onKey = (event) => {
            const e = editingRef.current;
            const mod = event.metaKey || event.ctrlKey;
            if (!e) {
                if (mod && event.key.toLowerCase() === "z" && !event.target.closest?.("input, textarea")) {
                    event.preventDefault();
                    post({ type: "zoomi:history", action: event.shiftKey ? "redo" : "undo" });
                }
                return;
            }
            if (!e.el.contains(event.target))
                return;
            if (event.key === "Escape") {
                event.preventDefault();
                finish(false);
            }
            else if (mod && event.key.toLowerCase() === "a") {
                // Select this text only, not the whole page.
                event.preventDefault();
                selectText(e.el);
            }
            else if (event.key === "Enter" && e.field.mode !== "rich") {
                event.preventDefault();
                if (e.field.multiline || e.join === "\n")
                    document.execCommand("insertLineBreak");
                else
                    finish(true);
            }
            else if (mod && e.field.mode === "plain" && ["b", "i", "u"].includes(event.key.toLowerCase())) {
                event.preventDefault();
            }
            else if (mod && event.key.toLowerCase() === "k" && e.field.mode !== "plain") {
                event.preventDefault();
                window.dispatchEvent(new CustomEvent("zoomi:link"));
            }
        };
        const onPaste = (event) => {
            const e = editingRef.current;
            if (!e || !e.el.contains(event.target))
                return;
            event.preventDefault();
            let text = event.clipboardData?.getData("text/plain") ?? "";
            if (e.field.mode !== "rich" && !e.field.multiline && e.join !== "\n")
                text = text.replace(/\s*\n\s*/g, " ");
            document.execCommand("insertText", false, text);
        };
        const onBlur = (event) => {
            const e = editingRef.current;
            if (!e || event.target !== e.el)
                return;
            if (event.relatedTarget?.closest?.("[data-zoomi-toolbar]"))
                return;
            finish(true);
        };
        document.addEventListener("keydown", onKey, true);
        document.addEventListener("paste", onPaste, true);
        document.addEventListener("focusout", onBlur, true);
        return () => {
            document.removeEventListener("keydown", onKey, true);
            document.removeEventListener("paste", onPaste, true);
            document.removeEventListener("focusout", onBlur, true);
        };
    }, [post, finish]);
    if (!state) {
        return (_jsx("div", { style: { display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "system-ui", color: "#888" }, children: "Waiting for the editor\u2026" }));
    }
    const fonts = googleFontsHref(state.site.brand);
    const sel = selected ? `[data-zoomi-block="${selected.replace(/["\\]/g, "")}"]>*{outline:2px solid ${ACCENT}!important;outline-offset:-2px}` : "";
    const editable = edit
        ? `[data-zoomi-field],[data-zoomi-nav]{cursor:text}[data-zoomi-field]:hover,[data-zoomi-nav]:hover{outline:1px dashed ${ACCENT};outline-offset:3px}[data-zoomi-editing]{outline:2px solid ${ACCENT}!important;outline-offset:3px;cursor:text;user-select:text;-webkit-user-select:text}[data-zoomi-editing] *{user-select:text;-webkit-user-select:text}`
        : "";
    return (_jsxs("div", { ref: root, children: [fonts ? _jsx("link", { rel: "stylesheet", href: fonts }) : null, _jsx("style", { children: brandCss(state.site.brand) }), _jsx("style", { children: `[data-zoomi-block]>*{cursor:pointer;transition:outline-color .15s}[data-zoomi-block]:hover>*{outline:2px solid rgba(228,87,46,.45);outline-offset:-2px}${sel}${editable}` }), _jsx(Shell, { site: state.site, page: state.page, preview: true, children: state.page ? _jsx(Blocks, { blocks: state.page.blocks, registry: registry, site: state.site, preview: true }) : null }), editing ? (_jsxs(_Fragment, { children: [_jsx("style", { children: TOOLBAR_CSS }), _jsx(Toolbar, { editing: editing, onDone: () => finish(true) })] })) : null] }));
}
// ---------- Toolbar ----------
const ICONS = {
    bold: _jsx("path", { d: "M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z" }),
    italic: _jsx("path", { d: "M14 5h-4m4 14h-4m3-14-2 14" }),
    link: _jsx("path", { d: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1m2 3.7a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" }),
    h2: _jsx("path", { d: "M4 6v12M12 6v12M4 12h8m4.5-3.5a2.5 2.5 0 1 1 3.5 3.5L16 18h5" }),
    h3: _jsx("path", { d: "M4 6v12M12 6v12M4 12h8m4-5.5h4.5L18 11a3.5 3.5 0 1 1-2 6" }),
    ul: _jsx("path", { d: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" }),
    ol: _jsx("path", { d: "M10 6h10M10 12h10M10 18h10M4 6h1v4M4 10h2M6 18H4l2-2.5a1.2 1.2 0 0 0-2-1" }),
    quote: _jsx("path", { d: "M7 7h4v4c0 3-2 5-4 6m8-10h4v4c0 3-2 5-4 6" }),
};
function Icon({ name }) {
    return (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: ICONS[name] }));
}
const TOOLBAR_CSS = `[data-zoomi-toolbar]{all:initial;position:fixed;z-index:2147483647;display:flex;align-items:center;gap:2px;padding:4px;border-radius:10px;background:#141414;color:#fff;font:500 12px/1 system-ui,-apple-system,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);white-space:nowrap}
[data-zoomi-toolbar] :where(button,span,input){all:unset;box-sizing:border-box;font:inherit}
[data-zoomi-toolbar] button{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 6px;border-radius:6px;cursor:pointer;color:#fff}
[data-zoomi-toolbar] button:hover{background:rgba(255,255,255,.12)}
[data-zoomi-toolbar] button[aria-pressed=true]{background:#fff;color:#141414}
[data-zoomi-toolbar] svg{display:block;width:16px;height:16px;fill:none;stroke:currentColor}
[data-zoomi-toolbar] .zt-label{padding:0 8px 0 6px;color:rgba(255,255,255,.6)}
[data-zoomi-toolbar] .zt-sep{width:1px;height:18px;margin:0 4px;background:rgba(255,255,255,.2)}
[data-zoomi-toolbar] .zt-count{padding:0 6px;color:rgba(255,255,255,.6)}
[data-zoomi-toolbar] .zt-over{color:#ff8a65}
[data-zoomi-toolbar] .zt-done{background:${ACCENT};font-weight:600;padding:0 10px}
[data-zoomi-toolbar] .zt-done:hover{background:${ACCENT};filter:brightness(1.1)}
[data-zoomi-toolbar] input{display:block;width:220px;height:28px;padding:0 8px;border-radius:6px;background:#fff;color:#141414;cursor:text}`;
function Toolbar({ editing, onDone }) {
    const { el, field } = editing;
    const bar = useRef(null);
    const [pos, setPos] = useState(null);
    const [active, setActive] = useState({});
    const [length, setLength] = useState(0);
    const [linking, setLinking] = useState(null);
    // Follows the element while the page scrolls or the text reflows.
    useEffect(() => {
        let frame = 0;
        const place = () => {
            const r = el.getBoundingClientRect();
            const h = bar.current?.offsetHeight ?? 36;
            const w = bar.current?.offsetWidth ?? 200;
            const top = r.top - h - 10 >= 4 ? r.top - h - 10 : Math.min(r.bottom + 10, window.innerHeight - h - 4);
            const left = Math.max(4, Math.min(r.left, window.innerWidth - w - 4));
            setPos((p) => (p && p.top === top && p.left === left ? p : { top, left }));
            frame = requestAnimationFrame(place);
        };
        place();
        return () => cancelAnimationFrame(frame);
    }, [el]);
    useEffect(() => {
        const update = () => {
            if (field.mode !== "plain")
                setActive({
                    bold: document.queryCommandState("bold"),
                    italic: document.queryCommandState("italic"),
                    ul: document.queryCommandState("insertUnorderedList"),
                    ol: document.queryCommandState("insertOrderedList"),
                });
            if (field.max)
                setLength(plainText(readField(el, field.mode, editing.join)).length);
        };
        update();
        document.addEventListener("selectionchange", update);
        el.addEventListener("input", update);
        return () => {
            document.removeEventListener("selectionchange", update);
            el.removeEventListener("input", update);
        };
    }, [el, field, editing.join]);
    const openLink = useCallback(() => {
        const sel = window.getSelection();
        const range = sel && sel.rangeCount && el.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
        const anchor = (range?.startContainer.parentElement ?? null)?.closest("a");
        setLinking({ range, url: anchor && el.contains(anchor) ? (anchor.getAttribute("href") ?? "") : "" });
    }, [el]);
    useEffect(() => {
        window.addEventListener("zoomi:link", openLink);
        return () => window.removeEventListener("zoomi:link", openLink);
    }, [openLink]);
    const run = (command, value) => {
        document.execCommand(command, false, value);
        el.dispatchEvent(new Event("input"));
    };
    const applyLink = (remove = false) => {
        const l = linking;
        setLinking(null);
        el.focus({ preventScroll: true });
        if (!l)
            return;
        const sel = window.getSelection();
        if (l.range && sel) {
            sel.removeAllRanges();
            sel.addRange(l.range);
        }
        const raw = l.url.trim();
        if (remove || !raw) {
            const anchor = l.range?.startContainer.parentElement?.closest("a");
            if (anchor && el.contains(anchor) && sel?.isCollapsed)
                sel.selectAllChildren(anchor);
            run("unlink");
            return;
        }
        const href = /^(https?:|mailto:|tel:|\/|#)/i.test(raw) ? raw : `https://${raw}`;
        if (sel?.isCollapsed)
            run("insertHTML", `<a href="${href.replace(/"/g, "&quot;")}">${href.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c])}</a>`);
        else
            run("createLink", href);
    };
    const tool = (name, label, onClick, pressed) => (_jsx("button", { type: "button", title: label, "aria-label": label, "aria-pressed": pressed, onMouseDown: (e) => e.preventDefault(), onClick: onClick, children: _jsx(Icon, { name: name }) }, name));
    return (_jsx("div", { ref: bar, "data-zoomi-toolbar": "", style: pos ? { top: pos.top, left: pos.left } : { visibility: "hidden" }, onMouseDown: (e) => e.target instanceof HTMLInputElement || e.preventDefault(), children: linking ? (_jsxs(_Fragment, { children: [_jsx("input", { autoFocus: true, value: linking.url, placeholder: "https://\u2026 or /page", "aria-label": "Link address", onChange: (e) => setLinking({ ...linking, url: e.target.value }), onKeyDown: (e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            applyLink();
                        }
                        else if (e.key === "Escape") {
                            e.preventDefault();
                            setLinking(null);
                            el.focus({ preventScroll: true });
                        }
                    }, onBlur: (e) => {
                        if (!e.relatedTarget?.closest?.("[data-zoomi-toolbar]")) {
                            setLinking(null);
                            if (e.relatedTarget !== el)
                                onDone();
                        }
                    } }), _jsx("button", { type: "button", onMouseDown: (e) => e.preventDefault(), onClick: () => applyLink(), children: "Apply" }), linking.url ? (_jsx("button", { type: "button", onMouseDown: (e) => e.preventDefault(), onClick: () => applyLink(true), children: "Remove" })) : null] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "zt-label", children: field.label }), field.mode !== "plain" ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "zt-sep" }), tool("bold", "Bold (⌘B)", () => run("bold"), !!active.bold), tool("italic", "Italic (⌘I)", () => run("italic"), !!active.italic), tool("link", "Link (⌘K)", openLink)] })) : null, field.mode === "rich" ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "zt-sep" }), tool("h2", "Heading", () => run("formatBlock", "<h2>")), tool("h3", "Subheading", () => run("formatBlock", "<h3>")), tool("ul", "Bulleted list", () => run("insertUnorderedList"), !!active.ul), tool("ol", "Numbered list", () => run("insertOrderedList"), !!active.ol), tool("quote", "Quote", () => run("formatBlock", "<blockquote>"))] })) : null, field.max ? _jsx("span", { className: length > field.max ? "zt-count zt-over" : "zt-count", children: `${length}/${field.max}` }) : null, _jsx("span", { className: "zt-sep" }), _jsx("button", { type: "button", className: "zt-done", onMouseDown: (e) => e.preventDefault(), onClick: onDone, children: "Done" })] })) }));
}
