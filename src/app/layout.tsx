import type { ReactNode } from "react";
import type { Viewport } from "next";
import Script from "next/script";

// Bump with any change to public/os.css so browsers drop the cached stylesheet.
const CSS_VERSION = "202610282200";

export const viewport: Viewport = { themeColor: "#f2efe7", width: "device-width", initialScale: 1, viewportFit: "cover" };

// Brand colors from the CMS (--color-*) feed the design's palette, with the original values as fallbacks.
const palette = `:root{--paper:var(--color-background,#f2efe7);--paper-deep:var(--color-surface,#e8e3d8);--ink:var(--color-text,#11110f);--black:var(--color-primary,#11110f);--muted:var(--color-secondary,#6f6c65);--coral:var(--color-accent,#ff553e)}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@1,6..72,300;1,6..72,400&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href={`/os.css?v=${CSS_VERSION}`} />
        <style>{palette}</style>
        <Script id="js-class" strategy="beforeInteractive">{"document.documentElement.classList.add('js')"}</Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
