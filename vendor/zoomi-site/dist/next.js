import { revalidateTag } from "next/cache";
import { verify, SIGNATURE_HEADER, TIMESTAMP_HEADER } from "./signing.js";
/** POST /api/zoomi/revalidate: the CMS calls this after every publish. */
export function createRevalidateHandler(secret = process.env.ZOOMI_REVALIDATE_SECRET) {
    return async function POST(request) {
        if (!secret)
            return Response.json({ ok: false, error: "ZOOMI_REVALIDATE_SECRET is not set" }, { status: 500 });
        const body = await request.text();
        const ok = await verify(secret, request.headers.get(TIMESTAMP_HEADER), request.headers.get(SIGNATURE_HEADER), body);
        if (!ok)
            return Response.json({ ok: false, error: "bad signature" }, { status: 401 });
        const { tags } = JSON.parse(body);
        const valid = tags.filter((t) => typeof t === "string" && t.startsWith("zoomi:"));
        // The CMS sends a broad tag instead of long lists, so refusing beats silently dropping some.
        if (valid.length > 200)
            return Response.json({ ok: false, error: "too many tags" }, { status: 413 });
        for (const tag of valid)
            revalidateTag(tag, { expire: 0 });
        return Response.json({ ok: true, revalidated: valid.length, at: Date.now() });
    };
}
/** GET /api/zoomi/geo: tells the cookie banner where the visitor is (Vercel geo headers). */
export function createGeoHandler() {
    return async function GET(request) {
        return Response.json({
            country: request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? null,
            region: request.headers.get("x-vercel-ip-country-region") ?? null,
        }, { headers: { "cache-control": "private, no-store" } });
    };
}
/** GET /api/zoomi/health: lets the CMS check the site is up and which core it runs. */
export function createHealthHandler(coreVersion) {
    return async function GET() {
        return Response.json({ ok: true, core: coreVersion, at: Date.now() }, { headers: { "cache-control": "no-store" } });
    };
}
export * from "./seo.js";
