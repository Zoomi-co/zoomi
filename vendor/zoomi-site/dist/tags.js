export const GTM_PATTERN = /^GTM-[A-Z0-9]{4,10}$/;
export function validateGtmId(id) {
    return GTM_PATTERN.test(id.trim());
}
/**
 * Events the site pushes to the dataLayer, so GTM triggers can use them. Shown in the CMS as a reference.
 * Keep in sync with trackLead and the consent banner in consent.tsx.
 */
export const DATALAYER_EVENTS = [
    { event: "zoomi_form_submit", when: "A visitor sends a form on the site.", fields: ["form_name"] },
    { event: "zoomi_consent_update", when: "A visitor accepts or declines cookies in the banner.", fields: ["analytics_consent", "marketing_consent"] },
];
const js = (s) => JSON.stringify(s);
/** The GTM loader. The ID is validated first, so it is safe to embed. */
function gtmScript(id) {
    if (!validateGtmId(id))
        return [];
    return [
        {
            id: "gtm",
            category: "analytics",
            location: "head",
            inline: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${js(id)});`,
        },
    ];
}
export function snippetMatches(snippet, path) {
    if (!snippet.enabled || snippet.disabledByAdmin)
        return false;
    const { mode, paths } = snippet.targeting;
    if (mode === "all")
        return true;
    const hit = paths.some((p) => (p.endsWith("*") ? path.startsWith(p.slice(0, -1)) : p === path));
    return mode === "only" ? hit : !hit;
}
/** All scripts for a page, in load order: GTM first, then custom code. */
export function buildTagScripts(tags, path) {
    const gtm = tags.integrations.gtm;
    const out = gtm?.enabled && gtm.id ? gtmScript(gtm.id) : [];
    for (const snippet of tags.snippets) {
        if (!snippetMatches(snippet, path))
            continue;
        out.push({ id: `snippet-${snippet.id}`, category: snippet.category, location: snippet.location, html: snippet.code });
    }
    return out;
}
/** Warnings shown in the CMS, e.g. a custom snippet loading a second copy of a Google tag. */
export function tagWarnings(tags) {
    const warnings = [];
    for (const s of tags.snippets) {
        if (!s.enabled)
            continue;
        if (/googletagmanager\.com\/gtm\.js/.test(s.code) && tags.integrations.gtm?.enabled)
            warnings.push(`Custom code "${s.name}" loads Tag Manager, which is already on. Remove one so tags don't fire twice.`);
    }
    return warnings;
}
