"use client";

import { ZoomiPreview } from "@zoomi/site/preview";
import { Shell } from "@/components/shell";
import { registry } from "@/zoomi/blocks";

export function PreviewClient({ cmsOrigin }: { cmsOrigin: string }) {
  return <ZoomiPreview cmsOrigin={cmsOrigin} registry={registry} Shell={Shell} />;
}
