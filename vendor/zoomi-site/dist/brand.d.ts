import type { Brand } from "./schema.js";
/** CSS custom properties for the whole site. Client designs read these instead of hard-coded values. */
export declare function brandVariables(brand: Brand): Record<string, string>;
export declare function brandCss(brand: Brand, selector?: string): string;
/** One Google Fonts stylesheet URL for all Google fonts the brand uses, or null. */
export declare function googleFontsHref(brand: Brand): string | null;
