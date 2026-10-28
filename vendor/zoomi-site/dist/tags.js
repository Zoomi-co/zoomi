export const INTEGRATIONS = [
    { key: "ga4", name: "Google Analytics 4", field: "Measurement ID", placeholder: "G-XXXXXXXXXX", pattern: /^G-[A-Z0-9]{6,12}$/, category: "analytics", help: "Admin → Data streams → your web stream." },
    { key: "gtm", name: "Google Tag Manager", field: "Container ID", placeholder: "GTM-XXXXXXX", pattern: /^GTM-[A-Z0-9]{4,10}$/, category: "analytics", help: "Shown at the top of your GTM workspace." },
    { key: "googleAds", name: "Google Ads", field: "Conversion ID", placeholder: "AW-123456789", pattern: /^AW-\d{6,12}$/, category: "marketing", help: "Tools → Conversions → Tag setup." },
    { key: "metaPixel", name: "Meta Pixel", field: "Pixel ID", placeholder: "123456789012345", pattern: /^\d{15,16}$/, category: "marketing", help: "Events Manager → Data sources." },
    { key: "linkedin", name: "LinkedIn Insight Tag", field: "Partner ID", placeholder: "1234567", pattern: /^\d{5,10}$/, category: "marketing", help: "Campaign Manager → Analyze → Insight Tag." },
    { key: "clarity", name: "Microsoft Clarity", field: "Project ID", placeholder: "abcd1234ef", pattern: /^[a-z0-9]{8,12}$/, category: "analytics", help: "Settings → Overview in your Clarity project." },
    { key: "uet", name: "Microsoft Advertising (UET)", field: "Tag ID", placeholder: "12345678", pattern: /^\d{6,10}$/, category: "marketing", help: "Tools → UET tag." },
    { key: "tiktok", name: "TikTok Pixel", field: "Pixel ID", placeholder: "C1234567890ABCDEFGHI", pattern: /^[A-Z0-9]{18,22}$/, category: "marketing", help: "Events Manager → Web events." },
];
export function validateIntegrationId(key, id) {
    const info = INTEGRATIONS.find((i) => i.key === key);
    return !!info && info.pattern.test(id.trim());
}
const js = (s) => JSON.stringify(s);
/** Scripts for one integration. IDs are validated first, so they are safe to embed. */
function integrationScripts(key, id) {
    if (!validateIntegrationId(key, id))
        return [];
    const category = INTEGRATIONS.find((i) => i.key === key).category;
    switch (key) {
        case "ga4":
        case "googleAds":
            return [
                { id: `gtag-src-${id}`, category, location: "head", src: `https://www.googletagmanager.com/gtag/js?id=${id}` },
                {
                    id: `gtag-${id}`,
                    category,
                    location: "head",
                    inline: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config',${js(id)});`,
                },
            ];
        case "gtm":
            return [
                {
                    id: "gtm",
                    category,
                    location: "head",
                    inline: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${js(id)});`,
                },
            ];
        case "metaPixel":
            return [
                {
                    id: "meta-pixel",
                    category,
                    location: "head",
                    inline: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${js(id)});fbq('track','PageView');`,
                },
            ];
        case "linkedin":
            return [
                {
                    id: "linkedin",
                    category,
                    location: "body-end",
                    inline: `window._linkedin_partner_id=${js(id)};window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(window._linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');b.type='text/javascript';b.async=true;b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';s.parentNode.insertBefore(b,s);})(window.lintrk);`,
                },
            ];
        case "clarity":
            return [
                {
                    id: "clarity",
                    category,
                    location: "head",
                    inline: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script',${js(id)});`,
                },
            ];
        case "uet":
            return [
                {
                    id: "uet",
                    category,
                    location: "head",
                    inline: `(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:${js(id)},enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push('pageLoad')},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=='loaded'&&s!=='complete'||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,'script','https://bat.bing.com/bat.js','uetq');`,
                },
            ];
        case "tiktok":
            return [
                {
                    id: "tiktok",
                    category,
                    location: "head",
                    inline: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._u=i;var o=d.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load(${js(id)});ttq.page();}(window,document,'ttq');`,
                },
            ];
    }
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
/** All scripts for a page, in load order. GTM and gtag are deduplicated. */
export function buildTagScripts(tags, path) {
    const out = [];
    const seen = new Set();
    for (const info of INTEGRATIONS) {
        const integration = tags.integrations[info.key];
        if (!integration?.enabled || !integration.id)
            continue;
        for (const script of integrationScripts(info.key, integration.id.trim())) {
            if (seen.has(script.id))
                continue;
            seen.add(script.id);
            out.push(script);
        }
    }
    for (const snippet of tags.snippets) {
        if (!snippetMatches(snippet, path))
            continue;
        out.push({ id: `snippet-${snippet.id}`, category: snippet.category, location: snippet.location, html: snippet.code });
    }
    return out;
}
/** Warnings shown in the CMS, e.g. the same Google tag loaded twice. */
export function tagWarnings(tags) {
    const warnings = [];
    const gtmOn = tags.integrations.gtm?.enabled;
    if (gtmOn && tags.integrations.ga4?.enabled)
        warnings.push("Google Analytics is on here and may also be inside your Tag Manager container. If GTM already loads GA4, turn GA4 off here to avoid counting visits twice.");
    for (const s of tags.snippets) {
        if (!s.enabled)
            continue;
        if (/googletagmanager\.com\/gtag\/js/.test(s.code) && tags.integrations.ga4?.enabled)
            warnings.push(`Snippet "${s.name}" loads a Google tag that is also set up under integrations.`);
        if (/fbevents\.js/.test(s.code) && tags.integrations.metaPixel?.enabled)
            warnings.push(`Snippet "${s.name}" loads the Meta Pixel, which is also set up under integrations.`);
    }
    return warnings;
}
