export declare function sign(secret: string, timestamp: number, body: string): Promise<string>;
/** Verify a signed request. Rejects anything older than five minutes to stop replays. */
export declare function verify(secret: string, timestamp: string | null, signature: string | null, body: string, now?: number): Promise<boolean>;
export declare const SIGNATURE_HEADER = "x-zoomi-signature";
export declare const TIMESTAMP_HEADER = "x-zoomi-timestamp";
