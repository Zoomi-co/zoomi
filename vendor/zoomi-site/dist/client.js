import { CORE_VERSION } from "./schema.js";
export function configFromEnv(env = process.env) {
    const cmsUrl = env.ZOOMI_CMS_URL ?? "https://my.zoomi.co";
    const token = env.ZOOMI_SITE_TOKEN;
    if (!token)
        throw new Error("ZOOMI_SITE_TOKEN is not set. Copy it from the site's page in my.zoomi.co/admin.");
    return { cmsUrl: cmsUrl.replace(/\/$/, ""), token };
}
/** Cache tags used by client sites. The CMS revalidates these on publish. */
export const zoomiTags = {
    site: "zoomi:site",
    pages: "zoomi:pages",
    redirects: "zoomi:redirects",
    path: (path) => `zoomi:path:${path}`,
};
export class ZoomiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
async function request(config, path, init) {
    const res = await fetch(`${config.cmsUrl}/api/v1${path}`, {
        ...init,
        headers: {
            authorization: `Bearer ${config.token}`,
            "x-zoomi-core": CORE_VERSION,
            ...(init?.body ? { "content-type": "application/json" } : {}),
            ...init?.headers,
        },
        cache: "no-store",
    });
    if (res.status === 404)
        return null;
    if (!res.ok)
        throw new ZoomiError(`Zoomi CMS ${path} failed: ${res.status} ${await res.text()}`, res.status);
    return (await res.json());
}
/** Raw API calls. Client sites wrap these in their own 'use cache' functions with the tags above. */
export function createClient(config = configFromEnv()) {
    return {
        site: () => request(config, "/site"),
        page: (path) => request(config, `/page?path=${encodeURIComponent(path)}`),
        pages: () => request(config, "/pages"),
        redirects: () => request(config, "/redirects"),
        registerSchema: (schema) => request(config, "/schema", {
            method: "POST",
            body: JSON.stringify({ schema, coreVersion: CORE_VERSION }),
        }),
    };
}
