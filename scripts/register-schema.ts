// Sends this site's block schema to the Zoomi CMS. Runs before every build.
import { createClient } from "@zoomi/site/client";
import { schema } from "../src/zoomi/schema.ts";

const token = process.env.ZOOMI_SITE_TOKEN;
if (!token) {
  console.warn("[zoomi] ZOOMI_SITE_TOKEN not set; skipping schema registration.");
} else {
  try {
    const client = createClient({ cmsUrl: (process.env.ZOOMI_CMS_URL ?? "https://my.zoomi.co").replace(/\/$/, ""), token });
    const { version } = await client.registerSchema(schema);
    console.log(`[zoomi] Schema registered (version ${version}).`);
  } catch (err) {
    // A CMS outage shouldn't block a deploy. The editor keeps the last schema it had.
    console.warn(`[zoomi] Schema registration failed: ${err instanceof Error ? err.message : err}`);
  }
}
