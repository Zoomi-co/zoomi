import type { ReactNode } from "react";
import { linkHref, type LinkValue } from "@zoomi/site/schema";

/**
 * Plain anchors: the site is one long page of #anchors and links out to the other Zoomi companies.
 * Links to other sites open in a new tab, like the original static site.
 */
export function SiteLink({ link, className, children, always }: { link: LinkValue | null | undefined; className?: string; children: ReactNode; always?: boolean }) {
  const href = link ? linkHref(link) : "#";
  if (href === "#" && !always) return null;
  const newTab = link?.newTab ?? /^https?:\/\//.test(href);
  return (
    <a href={href} className={className} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined}>
      {children}
    </a>
  );
}
