const RADIUS = { square: "0px", soft: "8px", round: "999px" };
function fontStack(font) {
    const generic = /mono/i.test(font.family) ? "ui-monospace, monospace" : "system-ui, sans-serif";
    return font.source === "system" ? font.family : `"${font.family.replace(/"/g, "")}", ${generic}`;
}
function safeColor(value) {
    return /^#[0-9a-f]{3,8}$/i.test(value) ? value : "#000000";
}
/** CSS custom properties for the whole site. Client designs read these instead of hard-coded values. */
export function brandVariables(brand) {
    const c = brand.colors;
    return {
        "--color-primary": safeColor(c.primary),
        "--color-secondary": safeColor(c.secondary),
        "--color-accent": safeColor(c.accent),
        "--color-text": safeColor(c.text),
        "--color-background": safeColor(c.background),
        "--color-surface": safeColor(c.surface),
        "--font-heading": fontStack(brand.fonts.heading),
        "--font-body": fontStack(brand.fonts.body),
        "--font-size-base": `${Math.min(Math.max(brand.fonts.baseSize || 16, 12), 22)}px`,
        "--radius": RADIUS[brand.radius] ?? RADIUS.soft,
    };
}
export function brandCss(brand, selector = ":root") {
    const vars = Object.entries(brandVariables(brand))
        .map(([k, v]) => `${k}:${v.replace(/[;{}<>]/g, "")}`)
        .join(";");
    return `${selector}{${vars}}${customFontFaces(brand)}`;
}
function customFontFaces(brand) {
    const faces = [];
    for (const font of [brand.fonts.heading, brand.fonts.body]) {
        if (font.source !== "custom" || !font.url || !/^https:\/\//.test(font.url))
            continue;
        const family = font.family.replace(/["';{}<>]/g, "");
        const url = font.url.replace(/["'()\s]/g, "");
        faces.push(`@font-face{font-family:"${family}";src:url("${url}") format("woff2");font-display:swap}`);
    }
    return faces.join("");
}
/** One Google Fonts stylesheet URL for all Google fonts the brand uses, or null. */
export function googleFontsHref(brand) {
    const families = new Map();
    for (const font of [brand.fonts.heading, brand.fonts.body]) {
        if (font.source !== "google" || !font.family)
            continue;
        const set = families.get(font.family) ?? new Set();
        (font.weights?.length ? font.weights : [400, 700]).forEach((w) => set.add(w));
        families.set(font.family, set);
    }
    if (!families.size)
        return null;
    const params = [...families.entries()]
        .map(([family, weights]) => {
        const list = [...weights].sort((a, b) => a - b).join(";");
        return `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${list}`;
    })
        .join("&");
    return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
