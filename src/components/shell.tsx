import type { ShellProps } from "@zoomi/site/preview";
import { navField, skip } from "@zoomi/site/render";
import { linkHref } from "@zoomi/site/schema";
import { SiteEffects } from "./site-effects";
import { SiteLink } from "./site-link";
import { Year } from "./year";

/** Header, mobile menu and footer from Brand and Navigation settings. Used by the live site and the CMS preview. */
export function Shell({ site, page, children, preview }: ShellProps) {
  const { brand, nav } = site;
  const legalName = brand.business.name || site.name;
  // "Zoomi, LLC" → ZOOMI for the wordmark.
  const mark = legalName.split(",")[0].trim().toUpperCase();
  const place = brand.business.address || "Indiana / USA";
  const email = brand.business.email;
  const footer = nav.footer[0];
  const home = !page || page.path === "/";
  return (
    <>
      <div className="cursor-glow" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>
      <div className="scroll-progress" aria-hidden="true">
        <span></span>
      </div>

      <header className="site-header">
        <a className="wordmark" href={home ? "#top" : "/"} aria-label={`${mark[0]}${mark.slice(1).toLowerCase()}, back to top`}>
          <span>{mark}</span>
          <b>.</b>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.header.map((item, i) => (
            <SiteLink key={item.id} link={item.link} {...navField(preview, item.id)}>
              <span {...skip(preview)}>{String(i + 1).padStart(2, "0")}</span> {item.label}
            </SiteLink>
          ))}
        </nav>

        <div className="header-meta">
          <span>{place}</span>
          <span className="live-dot">Marketing</span>
        </div>

        <button className="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
          <span className="menu-label">Menu</span>
          <span className="menu-icon" aria-hidden="true">
            <i></i>
            <i></i>
          </span>
        </button>
      </header>

      <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" aria-hidden="true">
        <div className="mobile-menu-inner">
          {nav.header.map((item, i) => (
            <SiteLink key={item.id} link={item.link} {...navField(preview, item.id)}>
              <small {...skip(preview)}>{String(i + 1).padStart(2, "0")}</small> {item.label}
            </SiteLink>
          ))}
        </div>
        <p>
          Marketing, designed.
          <br />
          {place}.
        </p>
      </nav>

      <main id="top">{children}</main>

      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <h2>
              Let&rsquo;s get you
              <br />
              <em>noticed.</em>
            </h2>
          </div>
          {email ? (
            <a className="footer-contact" href={`mailto:${email}`}>
              <small>Get in touch</small>
              <span>{email}</span>
              <b aria-hidden="true">↗</b>
            </a>
          ) : null}
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          {mark}
        </div>

        <div className="footer-bottom">
          <p>
            © <Year initial={Number(site.updatedAt.slice(0, 4)) || 2026} /> {legalName}
          </p>
          {footer?.items.length ? (
            <nav aria-label="Footer navigation">
              {footer.items.map((item) => (
                <a key={item.id} href={linkHref(item.link)} {...navField(preview, item.id)}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
          <p>{place}</p>
        </div>
      </footer>
      {/* The live site mounts these from the page instead, so they start after the page content hydrates. */}
      {page ? <SiteEffects /> : null}
    </>
  );
}
