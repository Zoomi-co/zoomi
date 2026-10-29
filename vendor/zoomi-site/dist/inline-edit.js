// In-place text editing for the CMS preview: turning a marked element into an editor, reading its
// text back as a field value, and handing the element back to React exactly as React left it.
/** The key an element's field path looks up in EditConfig.fields: list indexes become "*". */
export function fieldKey(path) {
    return path.replace(/\.\d+(?=\.|$)/g, ".*");
}
/** Decoration inside an editable element: never edited, never read back. */
export function isSkipped(node) {
    return node instanceof Element && (node.hasAttribute("data-zoomi-skip") || node.getAttribute("aria-hidden") === "true");
}
const BLOCK_TAGS = new Set(["P", "DIV", "LI", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "SECTION", "ARTICLE", "FIGURE", "FIGCAPTION", "DL", "DT", "DD", "TR"]);
function isBlockish(el) {
    if (BLOCK_TAGS.has(el.tagName))
        return true;
    const display = el.ownerDocument.defaultView?.getComputedStyle(el).display ?? "";
    return /^(block|flex|grid|list-item|table)/.test(display);
}
function escapeText(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(text) {
    return escapeText(text).replace(/"/g, "&quot;");
}
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
/** Plain or inline text: one string, lines joined with "\n", and for inline, <strong>, <em> and <a> kept. */
function readText(root, mode) {
    let out = "";
    let pendingBreak = false;
    const push = (s) => {
        if (!s)
            return;
        if (pendingBreak && out && !out.endsWith("\n"))
            out += "\n";
        pendingBreak = false;
        out += s;
    };
    const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            push(mode === "inline" ? escapeText(node.textContent ?? "") : (node.textContent ?? ""));
            return;
        }
        if (!(node instanceof Element) || isSkipped(node))
            return;
        if (node.tagName === "BR") {
            out += "\n";
            pendingBreak = false;
            return;
        }
        const block = node !== root && isBlockish(node);
        if (block)
            pendingBreak = true;
        let open = "";
        let close = "";
        if (mode === "inline") {
            const tag = node.tagName;
            if (tag === "STRONG" || tag === "B")
                [open, close] = ["<strong>", "</strong>"];
            else if (tag === "EM" || tag === "I" || node.getAttribute("data-zoomi-as") === "em")
                [open, close] = ["<em>", "</em>"];
            else if (tag === "A") {
                const href = node.getAttribute("href") ?? "";
                if (SAFE_HREF.test(href))
                    [open, close] = [`<a href="${escapeAttr(href)}">`, "</a>"];
            }
        }
        const before = out.length;
        if (open)
            push(open);
        const inner = out.length;
        node.childNodes.forEach(walk);
        // Formatting around nothing is dropped.
        if (open && out.length === inner)
            out = out.slice(0, before);
        else if (close)
            out += close;
        if (block)
            pendingBreak = true;
    };
    root.childNodes.forEach(walk);
    return out
        .replace(/ /g, " ")
        .split("\n")
        .map((line) => line.replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .replace(/^\n+|\n+$/g, "");
}
const RICH_BLOCK = { P: "p", DIV: "p", H1: "h2", H2: "h2", H3: "h3", H4: "h4", H5: "h4", H6: "h4", BLOCKQUOTE: "blockquote", UL: "ul", OL: "ol", LI: "li" };
const RICH_INLINE = { STRONG: "strong", B: "strong", EM: "em", I: "em", U: "u", S: "s" };
/** Rich text: the HTML subset the CMS keeps (paragraphs, H2–H4, lists, quotes, bold, italic, links). */
function readRich(root) {
    const isBlock = (n) => n instanceof Element && !isSkipped(n) && n.tagName in RICH_BLOCK;
    const isEmpty = (html) => !html.replace(/<[^>]+>/g, "").trim();
    const trimBreaks = (html) => html.replace(/^(\s|<br>)+|(\s|<br>)+$/g, "");
    const inline = (node) => {
        if (node.nodeType === Node.TEXT_NODE)
            return escapeText((node.textContent ?? "").replace(/\u00a0/g, " "));
        if (!(node instanceof Element) || isSkipped(node))
            return "";
        if (node.tagName === "BR")
            return "<br>";
        const inner = [...node.childNodes].map(inline).join("");
        const tag = RICH_INLINE[node.tagName];
        if (tag)
            return isEmpty(inner) ? inner : `<${tag}>${inner}</${tag}>`;
        if (node.tagName === "A") {
            const href = node.getAttribute("href") ?? "";
            if (!SAFE_HREF.test(href) || isEmpty(inner))
                return inner;
            return node.getAttribute("target") === "_blank" ? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : `<a href="${escapeAttr(href)}">${inner}</a>`;
        }
        return inner;
    };
    // A container (the field itself, a quote, or a div wrapping blocks): loose text becomes paragraphs.
    const container = (parent) => {
        let html = "";
        let run = "";
        const flush = () => {
            const p = trimBreaks(run);
            if (!isEmpty(p))
                html += `<p>${p}</p>`;
            run = "";
        };
        parent.childNodes.forEach((child) => {
            if (isBlock(child)) {
                flush();
                html += block(child);
            }
            else
                run += inline(child);
        });
        flush();
        return html;
    };
    const listItem = (li) => {
        let text = "";
        let nested = "";
        li.childNodes.forEach((child) => {
            if (isBlock(child) && (child.tagName === "UL" || child.tagName === "OL"))
                nested += block(child);
            else
                text += inline(child);
        });
        const t = trimBreaks(text);
        return isEmpty(t) && !nested ? "" : `<li>${t}${nested}</li>`;
    };
    const block = (el) => {
        const tag = RICH_BLOCK[el.tagName];
        if (tag === "blockquote") {
            const inner = container(el);
            return inner ? `<blockquote>${inner}</blockquote>` : "";
        }
        if (tag === "ul" || tag === "ol") {
            const items = [...el.childNodes].map((c) => (c instanceof Element && c.tagName === "LI" ? listItem(c) : isEmpty(inline(c)) ? "" : `<li>${trimBreaks(inline(c))}</li>`)).join("");
            return items ? `<${tag}>${items}</${tag}>` : "";
        }
        if (tag === "li")
            return listItem(el);
        // A paragraph or div that holds other blocks (browsers nest them on Enter) is read as a container.
        if ([...el.childNodes].some(isBlock))
            return container(el);
        const inner = trimBreaks([...el.childNodes].map(inline).join(""));
        return isEmpty(inner) ? "" : `<${tag}>${inner}</${tag}>`;
    };
    return container(root);
}
/** Reads an element back into a field value. With `join`, each child element is one item. */
export function readField(el, mode, join) {
    if (mode === "rich")
        return readRich(el);
    if (join !== null && join !== undefined) {
        const items = [...el.children].filter((c) => !isSkipped(c));
        if (items.length)
            return items.map((c) => readText(c, mode)).filter(Boolean).join(join);
    }
    return readText(el, mode);
}
/**
 * Records an element's subtree so it can be put back node for node. React keeps references to the
 * nodes it rendered; typing and formatting move and split them, so they go back before React renders again.
 */
export function snapshot(root) {
    const children = [];
    const texts = [];
    const styles = [];
    const visit = (node) => {
        if (node instanceof Element) {
            children.push([node, [...node.childNodes]]);
            if (node instanceof HTMLElement)
                styles.push([node, node.getAttribute("style")]);
            node.childNodes.forEach(visit);
        }
        else if (node instanceof CharacterData)
            texts.push([node, node.data]);
    };
    visit(root);
    return () => {
        for (const [el, kids] of children)
            el.replaceChildren(...kids);
        for (const [node, data] of texts)
            if (node.data !== data)
                node.data = data;
        for (const [el, style] of styles) {
            if (el.getAttribute("style") === style)
                continue;
            if (style === null)
                el.removeAttribute("style");
            else
                el.setAttribute("style", style);
        }
    };
}
/** Puts the caret where the pointer is, if the browser can tell. */
export function caretAt(doc, x, y, within) {
    const d = doc;
    let range = null;
    const pos = d.caretPositionFromPoint?.(x, y);
    if (pos) {
        range = doc.createRange();
        range.setStart(pos.offsetNode, pos.offset);
    }
    else
        range = d.caretRangeFromPoint?.(x, y) ?? null;
    const sel = doc.getSelection();
    if (!sel)
        return;
    if (range && within.contains(range.startContainer)) {
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    else {
        sel.selectAllChildren(within);
        sel.collapseToEnd();
    }
}
/** Sets a value at a dotted path ("items.2.title") in a copy of props. */
export function setPath(props, path, value) {
    const [head, ...rest] = path.split(".");
    if (!rest.length)
        return { ...props, [head]: value };
    const child = props[head];
    if (Array.isArray(child)) {
        const i = Number(rest[0]);
        const next = [...child];
        next[i] = rest.length === 1 ? value : setPath((child[i] ?? {}), rest.slice(1).join("."), value);
        return { ...props, [head]: next };
    }
    return { ...props, [head]: setPath((child ?? {}), rest.join("."), value) };
}
