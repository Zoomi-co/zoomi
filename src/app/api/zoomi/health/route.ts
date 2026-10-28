import { CORE_VERSION } from "@zoomi/site/schema";
import { createHealthHandler } from "@zoomi/site/next";

export const GET = createHealthHandler(CORE_VERSION);
