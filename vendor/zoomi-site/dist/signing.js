// HMAC signatures for CMS → site calls (revalidate). Web Crypto, so it runs in Node and edge runtimes.
const enc = new TextEncoder();
async function key(secret) {
    return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}
function hex(buf) {
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function sign(secret, timestamp, body) {
    const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(`${timestamp}.${body}`));
    return hex(sig);
}
function safeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}
/** Verify a signed request. Rejects anything older than five minutes to stop replays. */
export async function verify(secret, timestamp, signature, body, now = Date.now()) {
    if (!timestamp || !signature)
        return false;
    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(now - ts) > 5 * 60 * 1000)
        return false;
    return safeEqual(await sign(secret, ts, body), signature);
}
export const SIGNATURE_HEADER = "x-zoomi-signature";
export const TIMESTAMP_HEADER = "x-zoomi-timestamp";
