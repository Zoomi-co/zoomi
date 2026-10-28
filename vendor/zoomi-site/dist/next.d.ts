/** POST /api/zoomi/revalidate: the CMS calls this after every publish. */
export declare function createRevalidateHandler(secret?: string | undefined): (request: Request) => Promise<Response>;
/** GET /api/zoomi/geo: tells the cookie banner where the visitor is (Vercel geo headers). */
export declare function createGeoHandler(): (request: Request) => Promise<Response>;
/** GET /api/zoomi/health: lets the CMS check the site is up and which core it runs. */
export declare function createHealthHandler(coreVersion: string): () => Promise<Response>;
export * from "./seo.js";
