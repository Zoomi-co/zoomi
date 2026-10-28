import { Fragment, type ReactNode } from "react";
import { RichText, type BlockProps, type BlockRegistry } from "@zoomi/site/render";
import type { LinkValue } from "@zoomi/site/schema";
import { Doodle } from "@/components/doodle";
import { Emphasis, lines, list, plain } from "@/components/emphasis";
import { SiteLink } from "@/components/site-link";

// Block components must stay synchronous and browser-safe: the CMS preview renders them client-side.

type Hero = {
  kicker?: string;
  kickerRight?: string;
  headline: string;
  intro?: string;
  buttonLabel?: string;
  button?: LinkValue | null;
  filmCaption?: string;
  filmDescription?: string;
  sticker?: string;
  footerWords?: string;
  footerLinkLabel?: string;
  footerLink?: LinkValue | null;
};
function HeroBlock({ kicker, kickerRight, headline, intro, buttonLabel, button, filmCaption, filmDescription, sticker, footerWords, footerLinkLabel, footerLink, block }: BlockProps<Hero>) {
  const rows = lines(headline);
  const [stickerTop, stickerMain, stickerBottom] = lines(sticker);
  const Heading = block.index === 0 ? "h1" : "h2";
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-kicker reveal">
        <span>{kicker}</span>
        <span>{kickerRight}</span>
      </div>

      <div className="hero-grid hero-grid--film">
        <div className="hero-copy">
          <Heading id="hero-title" aria-label={rows.map(plain).join(" ")}>
            {rows.map((row, i) => {
              const serif = /^\*.*\*$/.test(row);
              return (
                <span key={i} className={serif ? "line serif" : "line"}>
                  <span>{serif ? row.slice(1, -1) : row}</span>
                </span>
              );
            })}
          </Heading>
          {intro ? <p className="hero-intro reveal">{intro}</p> : null}
          <div className="hero-actions reveal">
            <SiteLink link={button} className="button-primary">
              {buttonLabel || "Get in touch"} <span aria-hidden="true">↗</span>
            </SiteLink>
          </div>
        </div>

        <div className="hero-art hero-art--film reveal">
          <div className="art-board art-board--video art-board--film">
            <video className="art-video" muted loop playsInline preload="metadata" poster="/motion/hero-explainer-poster.jpg" aria-label={filmDescription || undefined}>
              <source src="/motion/hero-explainer.webm" type="video/webm" />
              <source src="/motion/hero-explainer.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="art-caption art-caption--film">
            <span>{filmCaption}</span>
            <span className="film-controls">
              <button className="film-play" type="button">
                Pause
              </button>
              <button className="film-sound" type="button" aria-pressed="false">
                Sound: off
              </button>
            </span>
          </div>
          {stickerMain ? (
            <div className="hero-sticker" aria-hidden="true">
              <span>{stickerTop}</span>
              <strong>{stickerMain}</strong>
              <span>{stickerBottom}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="hero-footer">
        {list(footerWords, ",").map((word, i) => (
          <span key={i}>{word}</span>
        ))}
        <SiteLink link={footerLink}>
          {footerLinkLabel || "What we do"} <b aria-hidden="true">↓</b>
        </SiteLink>
      </div>
    </section>
  );
}

function TickerBlock({ words }: BlockProps<{ words: string }>) {
  const items = list(words, ",");
  const run = (
    <span>
      {items.map((word, i) => (
        <Fragment key={i}>
          {word} <i>✳</i>{" "}
        </Fragment>
      ))}
    </span>
  );
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {run}
        {run}
      </div>
    </div>
  );
}

type Services = { heading: string; items?: { _key: string; title: string; body?: string; tags?: string }[] };
function ServicesBlock({ heading, items = [] }: BlockProps<Services>) {
  return (
    <section className="services section-pad" id="services" aria-labelledby="services-title">
      <div className="section-head section-head--right reveal">
        <Doodle />
        <h2 id="services-title">
          <Emphasis text={heading} />
        </h2>
      </div>

      <div className="service-list">
        {items.map((item) => (
          <article key={item._key} className="service-row reveal">
            <h3 className="service-title">{item.title}</h3>
            <div className="service-body">
              {item.body ? <p>{item.body}</p> : null}
              {lines(item.tags).length ? (
                <ul className="service-tags">
                  {lines(item.tags).map((tag, i) => (
                    <li key={i}>{tag}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type Audit = { heading: string; body?: string; points?: string; buttonLabel?: string; button?: LinkValue | null };
function AuditBlock({ heading, body, points, buttonLabel, button }: BlockProps<Audit>) {
  return (
    <section className="audit-band section-pad" id="audit" aria-labelledby="audit-title">
      <div className="audit-band-inner reveal">
        <div>
          <h2 id="audit-title">
            <Emphasis text={heading} />
          </h2>
          {body ? <p>{body}</p> : null}
        </div>
        <div className="audit-band-actions">
          {lines(points).length ? (
            <ul>
              {lines(points).map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          ) : null}
          <SiteLink link={button} className="button-primary button-primary--ink">
            {buttonLabel || "Learn more"} <span aria-hidden="true">↗</span>
          </SiteLink>
        </div>
      </div>
    </section>
  );
}

type Studio = { heading: string; body?: string; stats?: { _key: string; value: string; label: string }[]; noteLabel?: string; note?: string };
function StudioBlock({ heading, body, stats = [], noteLabel, note }: BlockProps<Studio>) {
  const paragraphs = (body ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <section className="studio" id="company" aria-labelledby="studio-title">
      <div className="studio-top section-pad">
        <h2 id="studio-title">
          {lines(heading).map((row, i) => (
            <span key={i} className="reveal">
              <Emphasis text={row} />
            </span>
          ))}
        </h2>
        {paragraphs.length ? (
          <div className="studio-copy reveal">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="studio-stats">
        {stats.map((stat) => (
          <div key={stat._key} className={/\d/.test(stat.value) ? "stat reveal" : "stat stat--word reveal"}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
        {note ? (
          <div className="stat-note reveal">
            <span>{noteLabel}</span>
            <p aria-label={lines(note).join(" ")}>
              <Emphasis text={note} />
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

type Faq = { heading: string; intro?: string; items?: { _key: string; question: string; answer: string }[] };
function FaqBlock({ heading, intro, items = [] }: BlockProps<Faq>) {
  return (
    <section className="faq section-pad" id="faq" aria-labelledby="faq-title">
      <div className="section-head section-head--wide reveal">
        <h2 id="faq-title" className="one-line">
          <Emphasis text={heading} />
        </h2>
        {intro ? <p>{intro}</p> : null}
      </div>

      <div className="faq-list">
        {items.map((item, i) => (
          <details key={item._key} className="faq-item reveal" open={i === 0}>
            <summary>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.question}</h3>
            </summary>
            <RichText html={item.answer} />
          </details>
        ))}
      </div>
    </section>
  );
}

type Venture = { _key: string; name: string; tagline?: string; description?: string; tags?: string; link?: LinkValue | null; color?: string; mark?: string; markText?: string };
const MARK_ART: Record<string, { className: string; art: ReactNode }> = {
  audit: { className: "venture-mark--audit", art: <span className="scan-line" /> },
  gov: { className: "venture-mark--gov", art: <span className="gov-star">✦</span> },
  margin: { className: "venture-mark--margin", art: <span className="margin-lines" /> },
  rent: { className: "venture-mark--rent", art: <span className="rent-ring" /> },
};
function VenturesBlock({ heading, intro, items = [] }: BlockProps<{ heading: string; intro?: string; items?: Venture[] }>) {
  return (
    <section className="ventures ventures--compact section-pad" id="ventures" aria-labelledby="ventures-title">
      <div className="section-head section-head--wide reveal">
        <h2 id="ventures-title" className="one-line">
          <Emphasis text={heading} />
        </h2>
        {intro ? <p>{intro}</p> : null}
      </div>

      <div className="venture-list">
        {items.map((v, i) => {
          const mark = MARK_ART[v.mark ?? "audit"] ?? MARK_ART.audit;
          return (
            <SiteLink key={v._key} link={v.link} className={`venture-row venture-row--${v.color || "blue"} reveal`} always>
              <span className="venture-number">{String(i + 1).padStart(2, "0")}</span>
              <div className={`venture-mark ${mark.className}`} aria-hidden="true">
                {mark.art}
                <b>{v.markText}</b>
              </div>
              <div className="venture-name">
                <h3>{v.name}</h3>
                {v.tagline ? <p>{v.tagline}</p> : null}
              </div>
              {v.description ? <p className="venture-desc">{v.description}</p> : null}
              <div className="venture-tags">
                {list(v.tags, ",").map((tag, j) => (
                  <span key={j}>{tag}</span>
                ))}
              </div>
              <span className="venture-arrow" aria-hidden="true">
                ↗
              </span>
            </SiteLink>
          );
        })}
      </div>
    </section>
  );
}

export const registry: BlockRegistry = {
  hero: HeroBlock,
  ticker: TickerBlock,
  services: ServicesBlock,
  audit: AuditBlock,
  studio: StudioBlock,
  faq: FaqBlock,
  ventures: VenturesBlock,
};
