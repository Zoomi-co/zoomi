"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { buildTagScripts } from "./tags.js";
const STORAGE_KEY = "zoomi-consent";
const EU_UK_CA = new Set([
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
    "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
]);
function readChoice() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function saveChoice(choice) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
    }
    catch {
        // Storage blocked: the choice lasts for this page view only.
    }
}
function setConsentMode(mode, choice) {
    window.dataLayer = window.dataLayer || [];
    // gtag must push the arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    const gtag = window.gtag ?? function () { window.dataLayer.push(arguments); };
    window.gtag = gtag;
    gtag("consent", mode, {
        analytics_storage: choice.analytics ? "granted" : "denied",
        ad_storage: choice.marketing ? "granted" : "denied",
        ad_user_data: choice.marketing ? "granted" : "denied",
        ad_personalization: choice.marketing ? "granted" : "denied",
    });
}
const injected = new Set();
function inject(script) {
    if (injected.has(script.id))
        return;
    injected.add(script.id);
    const parent = script.location === "head" ? document.head : document.body;
    if (script.html) {
        // createContextualFragment runs <script> tags inside the snippet.
        const fragment = document.createRange().createContextualFragment(script.html);
        if (script.location === "body-start")
            parent.prepend(fragment);
        else
            parent.appendChild(fragment);
        return;
    }
    const el = document.createElement("script");
    el.dataset.zoomiTag = script.id;
    if (script.src) {
        el.src = script.src;
        el.async = true;
    }
    else if (script.inline) {
        el.text = script.inline;
    }
    if (script.location === "body-start")
        parent.prepend(el);
    else
        parent.appendChild(el);
}
function allowed(category, choice) {
    return category === "necessary" || choice[category];
}
/**
 * Loads tracking tags after the page is interactive and shows the cookie banner when it is on.
 * Never rendered in the CMS preview, so editing doesn't pollute analytics.
 */
export function ZoomiTags({ tags, path: pathProp, geoEndpoint = "/api/zoomi/geo" }) {
    const pathname = usePathname();
    const path = pathProp ?? pathname ?? "/";
    const firstPath = useRef(path);
    const [showBanner, setShowBanner] = useState(false);
    const [choice, setChoice] = useState(null);
    // Decide consent once per page load.
    useEffect(() => {
        let cancelled = false;
        async function decide() {
            if (!tags.consent.enabled) {
                setChoice({ analytics: true, marketing: true });
                return;
            }
            const saved = readChoice();
            if (saved) {
                setConsentMode("default", saved);
                setChoice(saved);
                return;
            }
            let needsBanner = true;
            if (tags.consent.regions === "eu-uk-ca") {
                try {
                    const res = await fetch(geoEndpoint);
                    const { country, region } = (await res.json());
                    needsBanner = !country || EU_UK_CA.has(country) || (country === "US" && region === "CA");
                }
                catch {
                    needsBanner = true;
                }
            }
            if (cancelled)
                return;
            if (!needsBanner) {
                setChoice({ analytics: true, marketing: true });
                return;
            }
            setConsentMode("default", { analytics: false, marketing: false });
            setShowBanner(true);
            // Google tags load in denied mode so conversions can still be modeled.
            setChoice({ analytics: false, marketing: false });
        }
        decide();
        return () => {
            cancelled = true;
        };
    }, [tags, geoEndpoint]);
    // Inject whatever the current choice allows. Google tags always load when consent is on; Consent Mode gates them.
    useEffect(() => {
        if (!choice)
            return;
        const scripts = buildTagScripts(tags, path);
        const run = () => {
            for (const s of scripts) {
                const isGoogle = s.id.startsWith("gtag") || s.id === "gtm";
                if (allowed(s.category, choice) || (tags.consent.enabled && isGoogle))
                    inject(s);
            }
        };
        if ("requestIdleCallback" in window) {
            const id = window.requestIdleCallback(run, { timeout: 2500 });
            return () => window.cancelIdleCallback(id);
        }
        const t = setTimeout(run, 1);
        return () => clearTimeout(t);
    }, [choice, tags, path]);
    // GA4 tracks client-side navigation itself; Meta Pixel needs a PageView per route change.
    useEffect(() => {
        if (path === firstPath.current)
            return;
        firstPath.current = path;
        window.fbq?.("track", "PageView");
    }, [path]);
    if (!showBanner)
        return null;
    const decide = (analytics, marketing) => {
        const next = { analytics, marketing, at: Date.now() };
        saveChoice(next);
        setConsentMode("update", next);
        setChoice(next);
        setShowBanner(false);
    };
    const card = tags.consent.style === "card";
    return (_jsxs("div", { role: "dialog", "aria-live": "polite", "aria-label": "Cookie preferences", style: {
            position: "fixed",
            zIndex: 2147483000,
            bottom: card ? 16 : 0,
            left: card ? 16 : 0,
            right: card ? "auto" : 0,
            maxWidth: card ? 380 : "none",
            background: "var(--color-background, #fff)",
            color: "var(--color-text, #141414)",
            borderTop: card ? "none" : "1px solid rgba(0,0,0,.12)",
            border: card ? "1px solid rgba(0,0,0,.12)" : undefined,
            borderRadius: card ? 12 : 0,
            boxShadow: "0 8px 30px rgba(0,0,0,.12)",
            padding: 16,
            fontFamily: "var(--font-body, system-ui, sans-serif)",
            fontSize: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
        }, children: [_jsxs("p", { style: { margin: 0, flex: "1 1 260px", lineHeight: 1.45 }, children: [tags.consent.message, " ", tags.consent.privacyPath ? (_jsx("a", { href: tags.consent.privacyPath, style: { color: "inherit" }, children: "Privacy policy" })) : null] }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { type: "button", onClick: () => decide(false, false), style: { padding: "8px 14px", borderRadius: 8, border: "1px solid currentColor", background: "transparent", color: "inherit", cursor: "pointer" }, children: "Decline" }), _jsx("button", { type: "button", onClick: () => decide(true, true), style: { padding: "8px 14px", borderRadius: 8, border: "none", background: "var(--color-primary, #141414)", color: "var(--color-background, #fff)", cursor: "pointer" }, children: "Accept" })] })] }));
}
/** Fire a lead conversion on every connected platform. Call after a form submits successfully. */
export function trackLead(formName, googleAds) {
    if (typeof window === "undefined")
        return;
    window.gtag?.("event", "generate_lead", { form_name: formName });
    if (googleAds?.label)
        window.gtag?.("event", "conversion", { send_to: `${googleAds.id}/${googleAds.label}` });
    window.dataLayer?.push({ event: "zoomi_form_submit", form_name: formName });
    window.fbq?.("track", "Lead", { content_name: formName });
    window.lintrk?.("track", { conversion_id: formName });
    window.uetq?.push("event", "submit_lead_form", {});
    window.ttq?.track("SubmitForm", { content_name: formName });
}
