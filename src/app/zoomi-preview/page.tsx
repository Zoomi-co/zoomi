import type { Metadata } from "next";
import { PreviewClient } from "./preview-client";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

export default function PreviewPage() {
  return <PreviewClient cmsOrigin={new URL(process.env.ZOOMI_CMS_URL ?? "https://my.zoomi.co").origin} />;
}
