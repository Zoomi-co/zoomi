// Shared types and validation for Zoomi CMS. Imported by the CMS and by client sites.
export const CORE_VERSION = "0.1.0";
export function defineBlock(def) {
    return def;
}
export function defineSchema(schema) {
    return schema;
}
// ---------- Defaults ----------
export const defaultBrand = {
    logo: null,
    logoLight: null,
    favicon: null,
    colors: {
        primary: "#141414",
        secondary: "#3d3d3d",
        accent: "#e4572e",
        text: "#141414",
        background: "#ffffff",
        surface: "#f4f3ef",
    },
    fonts: {
        heading: { family: "Inter", source: "google", weights: [600, 700] },
        body: { family: "Inter", source: "google", weights: [400, 500] },
        baseSize: 16,
    },
    radius: "soft",
    business: { name: "", phone: "", email: "", address: "", hours: "", social: [] },
};
export const defaultNav = { header: [], footer: [], cta: null };
export const defaultTags = {
    integrations: {},
    snippets: [],
    consent: {
        enabled: false,
        style: "bar",
        message: "We use cookies to understand how visitors use this site.",
        privacyPath: "/privacy",
        regions: "all",
    },
    gscVerification: "",
};
export const defaultSeo = {
    titleTemplate: "%page% | %site%",
    defaultDescription: "",
    defaultImage: null,
    indexable: true,
    legal: {},
};
// ---------- Legal pages ----------
/** Standard legal pages. Each is served at its path as plain text once it has content, unless a CMS page uses the path. */
export const LEGAL_PAGES = [
    { key: "privacy", title: "Privacy policy", path: "/privacy" },
    { key: "terms", title: "Terms of use", path: "/terms" },
    { key: "cookies", title: "Cookie policy", path: "/cookies" },
    { key: "accessibility", title: "Accessibility statement", path: "/accessibility" },
];
/** Legal pages that have content. */
export function legalPages(site) {
    return LEGAL_PAGES.map((p) => ({ ...p, body: site.seo.legal?.[p.key]?.trim() ?? "" })).filter((p) => p.body);
}
export function legalPageFor(site, path) {
    return legalPages(site).find((p) => p.path === path) ?? null;
}
/** Merge stored brand over defaults, then apply the design's locked values. */
export function resolveBrand(stored, schema) {
    const s = stored ?? {};
    const merged = {
        ...defaultBrand,
        ...s,
        colors: { ...defaultBrand.colors, ...(s.colors ?? {}) },
        fonts: { ...defaultBrand.fonts, ...(s.fonts ?? {}) },
        business: { ...defaultBrand.business, ...(s.business ?? {}) },
    };
    const locked = schema?.brand?.locked;
    if (!locked)
        return merged;
    return {
        ...merged,
        ...locked,
        colors: { ...merged.colors, ...(locked.colors ?? {}) },
        fonts: { ...merged.fonts, ...(locked.fonts ?? {}) },
        business: { ...merged.business, ...(locked.business ?? {}) },
    };
}
// ---------- Default props ----------
function defaultForField(field) {
    switch (field.type) {
        case "text":
        case "richtext":
            return field.default ?? "";
        case "select":
            return field.default ?? field.options[0]?.value ?? "";
        case "toggle":
            return field.default ?? false;
        case "number":
            return field.default ?? null;
        case "list":
            return [];
        default:
            return null;
    }
}
export function defaultProps(def) {
    const props = {};
    for (const [key, field] of Object.entries(def.fields))
        props[key] = defaultForField(field);
    return props;
}
export function listItemDefaults(field) {
    const item = {};
    for (const [key, f] of Object.entries(field.fields))
        item[key] = defaultForField(f);
    return item;
}
/** How many blocks of this type one page may hold, or undefined for no limit. */
export function blockLimit(schema, type) {
    return type === "hero" ? 1 : schema.blocks[type]?.maxPerPage;
}
/** Block types a page already holds as many of as it may. Hidden blocks count too. */
export function blocksAtLimit(schema, blocks) {
    const counts = new Map();
    for (const b of blocks)
        counts.set(b.type, (counts.get(b.type) ?? 0) + 1);
    const full = new Set();
    for (const [type, n] of counts) {
        const max = blockLimit(schema, type);
        if (max !== undefined && n >= max)
            full.add(type);
    }
    return full;
}
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
function isEmpty(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value === "string")
        return stripTags(value).trim() === "";
    if (Array.isArray(value))
        return value.length === 0;
    return false;
}
export function stripTags(html) {
    return html.replace(/<[^>]*>/g, "");
}
function checkField(field, value, where, issues, pageIds) {
    if (field.required && isEmpty(value)) {
        issues.push({ ...where, message: `${field.label} is required.` });
        return;
    }
    // Lists still go through the switch so an empty list is checked against its minimum.
    if (isEmpty(value) && field.type !== "list")
        return;
    switch (field.type) {
        case "text":
            if (typeof value !== "string")
                issues.push({ ...where, message: `${field.label} must be text.` });
            else if (field.max && value.length > field.max)
                issues.push({ ...where, message: `${field.label} is ${value.length} characters; the limit is ${field.max}.` });
            break;
        case "image": {
            const img = value;
            if (!img.url)
                issues.push({ ...where, message: `${field.label} has no file.` });
            else if (!img.alt?.trim())
                issues.push({ ...where, message: `${field.label} needs alt text.` });
            break;
        }
        case "link": {
            const link = value;
            if (link.kind === "page" && pageIds && !pageIds.has(link.pageId))
                issues.push({ ...where, message: `${field.label} points to a page that no longer exists.` });
            if (link.kind === "url" && !/^(https?:\/\/|mailto:|tel:|\/|#)/.test(link.url))
                issues.push({ ...where, message: `${field.label} must start with https://, mailto:, tel: or /.` });
            break;
        }
        case "select":
            if (!field.options.some((o) => o.value === value))
                issues.push({ ...where, message: `${field.label} has an option that no longer exists.` });
            break;
        case "number":
            if (typeof value !== "number")
                issues.push({ ...where, message: `${field.label} must be a number.` });
            else if ((field.min !== undefined && value < field.min) || (field.max !== undefined && value > field.max))
                issues.push({ ...where, message: `${field.label} must be between ${field.min ?? "-∞"} and ${field.max ?? "∞"}.` });
            break;
        case "list": {
            const items = Array.isArray(value) ? value : [];
            if (field.min !== undefined && items.length < field.min)
                issues.push({ ...where, message: `${field.label} needs at least ${field.min} ${field.itemLabel.toLowerCase()}${field.min === 1 ? "" : "s"}.` });
            if (field.max !== undefined && items.length > field.max)
                issues.push({ ...where, message: `${field.label} allows at most ${field.max} items.` });
            items.forEach((item, i) => {
                for (const [key, sub] of Object.entries(field.fields))
                    checkField(sub, item?.[key], { ...where, field: `${where.field}.${i}.${key}` }, issues, pageIds);
            });
            break;
        }
    }
}
export function validateBlocks(schema, blocks, pageIds) {
    const issues = [];
    const seen = new Map();
    for (const block of blocks) {
        if (block.hidden)
            continue;
        const n = (seen.get(block.type) ?? 0) + 1;
        seen.set(block.type, n);
        const max = blockLimit(schema, block.type);
        if (max !== undefined && n > max) {
            const label = schema.blocks[block.type]?.label ?? block.type;
            issues.push({ blockId: block.id, blockLabel: label, message: `A page can have ${max === 1 ? "only one" : `at most ${max}`} ${label} block${max === 1 ? "" : "s"}. Delete this one.` });
        }
        const def = schema.blocks[block.type];
        if (!def) {
            issues.push({ blockId: block.id, message: `Block type "${block.type}" is no longer available on this site.` });
            continue;
        }
        for (const [key, field] of Object.entries(def.fields))
            checkField(field, block.props?.[key], { blockId: block.id, blockLabel: def.label, field: key }, issues, pageIds);
    }
    return issues;
}
export function validateBrand(brand) {
    const issues = [];
    for (const [name, value] of Object.entries(brand.colors))
        if (!HEX.test(value))
            issues.push({ field: `colors.${name}`, message: `${name} must be a hex color like #1a2b3c.` });
    for (const key of ["logo", "logoLight"]) {
        const img = brand[key];
        if (img && !img.alt?.trim())
            issues.push({ field: key, message: key === "logo" ? "Logo needs alt text." : "Logo on dark backgrounds needs alt text." });
    }
    return issues;
}
// ---------- Color contrast (WCAG) ----------
function channel(c) {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
export function luminance(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3)
        h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
export function contrastRatio(a, b) {
    if (!HEX.test(a) || !HEX.test(b))
        return 1;
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
}
// ---------- Paths ----------
export function slugify(input) {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}
export function normalizePath(path) {
    const clean = "/" + path.split("/").filter(Boolean).join("/");
    return clean.toLowerCase();
}
/** Every link value inside a tree of props: used to resolve page links to live paths. */
export function mapLinks(value, fn) {
    if (Array.isArray(value))
        return value.map((v) => mapLinks(v, fn));
    if (value && typeof value === "object") {
        const obj = value;
        if ((obj.kind === "page" && typeof obj.pageId === "string") || (obj.kind === "url" && typeof obj.url === "string"))
            return fn(obj);
        const out = {};
        for (const [k, v] of Object.entries(obj))
            out[k] = mapLinks(v, fn);
        return out;
    }
    return value;
}
/** Every media id referenced in a tree of props: used for "where is this file used". */
export function collectMediaIds(value, into = new Set()) {
    if (Array.isArray(value))
        value.forEach((v) => collectMediaIds(v, into));
    else if (value && typeof value === "object") {
        const obj = value;
        if (typeof obj.id === "string" && typeof obj.url === "string")
            into.add(obj.id);
        for (const v of Object.values(obj))
            collectMediaIds(v, into);
    }
    return into;
}
export function linkHref(link) {
    if (!link)
        return "#";
    if (link.href)
        return link.href;
    return link.kind === "url" ? link.url : "#";
}
