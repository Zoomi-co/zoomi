import { Fragment, type CSSProperties, type ReactNode } from "react";
import { RichText, imageProps, videoEmbedUrl, type BlockProps, type BlockRegistry } from "@zoomi/site/render";
import type { ImageValue, LinkValue } from "@zoomi/site/schema";
import { Doodle } from "@/components/doodle";
import { Emphasis, lines, list, plain } from "@/components/emphasis";
import { SiteLink } from "@/components/site-link";

// Block components must stay synchronous and browser-safe: the CMS preview renders them client-side.

type Img = ImageValue | null | undefined;

/** The id a menu link can jump to: the block's anchor, or the id the original page used. */
function anchorId(anchor: string | null | undefined, fallback?: string) {
  const id = (anchor ?? "").replace(/^#/, "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return id || fallback;
}

/** Section background and the accent that goes with it (see .tone-- in os.css). */
function toneClass(tone: string | null | undefined, fallback: string) {
  return `tone tone--${tone || fallback}`;
}

/** A stable id for aria-labelledby, unique per block on the page. */
function titleId(block: { id: string }) {
  return `t-${block.id.slice(0, 8)}`;
}

/** A stored image, or an empty frame that only the CMS preview shows. */
function paragraphsOf(text: string | null | undefined) {
  return (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function Picture({ image, className, sizes = "100vw", eager }: { image: Img; className?: string; sizes?: string; eager?: boolean }) {
  const props = imageProps(image);
  if (!props) {
    return (
      <div className={`media-empty ${className ?? ""}`} aria-hidden="true">
        <span>Add an image</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} className={className} sizes={sizes} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

/** Heading with optional small text above and intro beside, in the site's section rhythm. */
function Head({ id, kicker, heading, intro, level = "h2" }: { id: string; kicker?: string | null; heading?: string | null; intro?: string | null; level?: "h1" | "h2" }) {
  if (!heading && !intro && !kicker) return null;
  const H = level;
  return (
    <div className="section-head section-head--wide block-head reveal">
      <div>
        {kicker ? <p className="block-kicker">{kicker}</p> : null}
        {heading ? (
          <H id={id}>
            <Emphasis text={heading} />
          </H>
        ) : null}
      </div>
      {intro ? <p>{intro}</p> : null}
    </div>
  );
}

type Hero = {
  kicker?: string;
  kickerRight?: string;
  headline: string;
  intro?: string;
  buttonLabel?: string;
  button?: LinkValue | null;
  art?: string;
  image?: Img;
  filmCaption?: string;
  filmDescription?: string;
  sticker?: string;
  footerWords?: string;
  footerLinkLabel?: string;
  footerLink?: LinkValue | null;
};
function HeroBlock({ kicker, kickerRight, headline, intro, buttonLabel, button, art, image, filmCaption, filmDescription, sticker, footerWords, footerLinkLabel, footerLink, block }: BlockProps<Hero>) {
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
            {art === "image" ? (
              <Picture image={image} className="art-video" sizes="(max-width: 720px) 85vw, 40vw" eager />
            ) : (
              <video className="art-video" muted loop playsInline preload="metadata" poster="/motion/hero-explainer-poster.jpg" aria-label={filmDescription || undefined}>
                <source src="/motion/hero-explainer.webm" type="video/webm" />
                <source src="/motion/hero-explainer.mp4" type="video/mp4" />
              </video>
            )}
          </div>
          <div className="art-caption art-caption--film">
            <span>{filmCaption}</span>
            {art === "image" ? null : (
              <span className="film-controls">
                <button className="film-play" type="button">
                  Pause
                </button>
                <button className="film-sound" type="button" aria-pressed="false">
                  Sound: off
                </button>
              </span>
            )}
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

type Services = { heading: string; doodle?: boolean | null; anchor?: string; items?: { _key: string; title: string; body?: string; tags?: string }[] };
function ServicesBlock({ heading, doodle, anchor, items, block }: BlockProps<Services>) {
  return (
    <section className="services section-pad" id={anchorId(anchor, "services")} aria-labelledby={titleId(block)}>
      <div className="section-head section-head--right reveal">
        {doodle === false ? null : <Doodle />}
        <h2 id={titleId(block)}>
          <Emphasis text={heading} />
        </h2>
      </div>

      <div className="service-list">
        {(items ?? []).map((item) => (
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

type Audit = { heading: string; body?: string; points?: string; buttonLabel?: string; button?: LinkValue | null; tone?: string; anchor?: string };
function AuditBlock({ heading, body, points, buttonLabel, button, tone, anchor, block }: BlockProps<Audit>) {
  return (
    <section className={`audit-band section-pad ${toneClass(tone, "blue")}`} id={anchorId(anchor, "audit")} aria-labelledby={titleId(block)}>
      <div className="audit-band-inner reveal">
        <div>
          <h2 id={titleId(block)}>
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
          {buttonLabel ? (
            <SiteLink link={button} className="button-primary button-primary--ink" always>
              {buttonLabel} <span aria-hidden="true">↗</span>
            </SiteLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type Studio = { heading: string; body?: string; stats?: { _key: string; value: string; label: string }[]; noteLabel?: string; note?: string; anchor?: string };
function StudioBlock({ heading, body, stats, noteLabel, note, anchor, block }: BlockProps<Studio>) {
  const paragraphs = paragraphsOf(body);
  return (
    <section className="studio" id={anchorId(anchor, "company")} aria-labelledby={titleId(block)}>
      <div className="studio-top section-pad">
        <h2 id={titleId(block)}>
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
        {(stats ?? []).map((stat) => (
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

type Faq = { heading: string; intro?: string; anchor?: string; items?: { _key: string; question: string; answer: string }[] };
function FaqBlock({ heading, intro, anchor, items, block }: BlockProps<Faq>) {
  return (
    <section className="faq section-pad" id={anchorId(anchor, "faq")} aria-labelledby={titleId(block)}>
      <div className="section-head section-head--wide reveal">
        <h2 id={titleId(block)} className="one-line">
          <Emphasis text={heading} />
        </h2>
        {intro ? <p>{intro}</p> : null}
      </div>

      <div className="faq-list">
        {(items ?? []).map((item, i) => (
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
function VenturesBlock({ heading, intro, anchor, items, block }: BlockProps<{ heading: string; intro?: string; anchor?: string; items?: Venture[] }>) {
  return (
    <section className="ventures ventures--compact section-pad" id={anchorId(anchor, "ventures")} aria-labelledby={titleId(block)}>
      <div className="section-head section-head--wide reveal">
        <h2 id={titleId(block)} className="one-line">
          <Emphasis text={heading} />
        </h2>
        {intro ? <p>{intro}</p> : null}
      </div>

      <div className="venture-list">
        {(items ?? []).map((v, i) => {
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

// ---------- General sections ----------

type PageHeader = { kicker?: string; headline: string; intro?: string; buttonLabel?: string; button?: LinkValue | null; image?: Img; layout?: string; tone?: string };
function PageHeaderBlock({ kicker, headline, intro, buttonLabel, button, image, layout, tone, block }: BlockProps<PageHeader>) {
  const below = layout === "below";
  const Heading = block.index === 0 ? "h1" : "h2";
  return (
    <section className={`page-header section-pad ${toneClass(tone, "paper")} ${below ? "page-header--below" : "page-header--side"}`} aria-labelledby={titleId(block)}>
      {kicker ? <p className="page-header-kicker reveal">{kicker}</p> : null}
      <div className="page-header-grid">
        <div className="page-header-copy">
          <Heading id={titleId(block)} className="page-header-title">
            {lines(headline).map((row, i) => (
              <span key={i} className="line">
                <span>
                  <Emphasis text={row} />
                </span>
              </span>
            ))}
          </Heading>
          {intro || buttonLabel ? (
            <div className="page-header-intro reveal">
              {intro ? <p>{intro}</p> : null}
              {buttonLabel ? (
                <SiteLink link={button} className="button-primary" always>
                  {buttonLabel} <span aria-hidden="true">↗</span>
                </SiteLink>
              ) : null}
            </div>
          ) : null}
        </div>
        {below ? null : <Picture image={image} className="page-header-art reveal" sizes="(max-width: 720px) 100vw, 40vw" eager />}
      </div>
      {below ? <Picture image={image} className="page-header-wide reveal" sizes="100vw" eager /> : null}
    </section>
  );
}

type Text = { kicker?: string; heading?: string; body?: string; layout?: string; tone?: string; anchor?: string };
function TextBlock({ kicker, heading, body, layout, tone, anchor, block }: BlockProps<Text>) {
  const column = layout === "column";
  return (
    <section className={`text-block section-pad ${toneClass(tone, "paper")} ${column ? "text-block--column" : "text-block--split"}`} id={anchorId(anchor)} aria-labelledby={heading ? titleId(block) : undefined}>
      {kicker || heading ? (
        <div className="text-block-head reveal">
          {kicker ? <p className="block-kicker">{kicker}</p> : null}
          {heading ? (
            <h2 id={titleId(block)}>
              <Emphasis text={heading} />
            </h2>
          ) : null}
        </div>
      ) : null}
      <RichText html={body} className="prose reveal" />
    </section>
  );
}

type Statement = { text: string; note?: string; tone?: string; anchor?: string };
function StatementBlock({ text, note, tone, anchor }: BlockProps<Statement>) {
  return (
    <section className={`statement section-pad ${toneClass(tone, "deep")}`} id={anchorId(anchor)}>
      <p className="statement-text reveal">
        <Emphasis text={text} />
      </p>
      {note ? <p className="statement-note reveal">{note}</p> : null}
    </section>
  );
}

type Quote = { quote: string; name?: string; role?: string; photo?: Img; tone?: string; anchor?: string };
function QuoteBlock({ quote, name, role, photo, tone, anchor }: BlockProps<Quote>) {
  return (
    <section className={`quote-block section-pad ${toneClass(tone, "pink")}`} id={anchorId(anchor)}>
      <figure className="reveal">
        <span className="quote-mark" aria-hidden="true">
          “
        </span>
        <blockquote>
          <p>
            <Emphasis text={quote} />
          </p>
        </blockquote>
        {name || role ? (
          <figcaption>
            {imageProps(photo) ? <Picture image={photo} className="quote-photo" sizes="4rem" /> : null}
            <span>
              {name ? <b>{name}</b> : null}
              {role ? <small>{role}</small> : null}
            </span>
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

type ImageBlockProps = { image: Img; caption?: string; size?: string; tone?: string; anchor?: string };
function ImageBlock({ image, caption, size, tone, anchor }: BlockProps<ImageBlockProps>) {
  const s = size || "wide";
  return (
    <section className={`image-block image-block--${s} ${s === "full" ? "" : "section-pad"} ${toneClass(tone, "paper")}`} id={anchorId(anchor)}>
      <figure className="reveal">
        <Picture image={image} sizes={s === "inset" ? "(max-width: 720px) 100vw, 60vw" : "100vw"} />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    </section>
  );
}

type Split = { image?: Img; side?: string; kicker?: string; heading?: string; body?: string; buttonLabel?: string; button?: LinkValue | null; tone?: string; anchor?: string };
function SplitBlock({ image, side, kicker, heading, body, buttonLabel, button, tone, anchor, block }: BlockProps<Split>) {
  return (
    <section className={`split section-pad ${toneClass(tone, "paper")} ${side === "right" ? "split--right" : "split--left"}`} id={anchorId(anchor)} aria-labelledby={heading ? titleId(block) : undefined}>
      <Picture image={image} className="split-art reveal" sizes="(max-width: 720px) 100vw, 50vw" />
      <div className="split-copy reveal">
        {kicker ? <p className="block-kicker">{kicker}</p> : null}
        {heading ? (
          <h2 id={titleId(block)}>
            <Emphasis text={heading} />
          </h2>
        ) : null}
        <RichText html={body} className="prose" />
        {buttonLabel ? (
          <SiteLink link={button} className="button-primary" always>
            {buttonLabel} <span aria-hidden="true">↗</span>
          </SiteLink>
        ) : null}
      </div>
    </section>
  );
}

type Video = { heading?: string; video?: string; caption?: string; tone?: string; anchor?: string };
function VideoBlock({ heading, video, caption, tone, anchor, block }: BlockProps<Video>) {
  const src = videoEmbedUrl(video);
  return (
    <section className={`video-block section-pad ${toneClass(tone, "paper")}`} id={anchorId(anchor)} aria-labelledby={heading ? titleId(block) : undefined}>
      <Head id={titleId(block)} heading={heading} />
      <figure className="reveal">
        {src ? (
          <div className="video-frame">
            <iframe src={src} title={plain(heading || caption || "Video")} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          </div>
        ) : (
          <div className="media-empty video-frame" aria-hidden="true">
            <span>Paste a YouTube or Vimeo link</span>
          </div>
        )}
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    </section>
  );
}

type Card = { _key: string; image?: Img; title: string; body?: string; linkLabel?: string; link?: LinkValue | null; color?: string };
type Cards = { heading?: string; intro?: string; columns?: string; items?: Card[]; tone?: string; anchor?: string };
function CardsBlock({ heading, intro, columns, items, tone, anchor, block }: BlockProps<Cards>) {
  const cards = items ?? [];
  const withImages = cards.some((c) => imageProps(c.image));
  return (
    <section className={`cards section-pad ${toneClass(tone, "paper")}`} id={anchorId(anchor)} aria-labelledby={heading ? titleId(block) : undefined}>
      <Head id={titleId(block)} heading={heading} intro={intro} />
      <div className={`card-grid card-grid--${columns || "3"}`}>
        {cards.map((card, i) => {
          const inner = (
            <>
              {withImages ? <Picture image={card.image} className="card-art" sizes="(max-width: 720px) 100vw, 33vw" /> : null}
              <span className="card-number">{String(i + 1).padStart(2, "0")}</span>
              <h3>{card.title}</h3>
              {card.body ? <p>{card.body}</p> : null}
              {card.linkLabel ? (
                <span className="card-link">
                  {card.linkLabel} <b aria-hidden="true">↗</b>
                </span>
              ) : null}
            </>
          );
          const className = `card card--${card.color || "coral"} reveal`;
          return card.link ? (
            <SiteLink key={card._key} link={card.link} className={className} always>
              {inner}
            </SiteLink>
          ) : (
            <article key={card._key} className={className}>
              {inner}
            </article>
          );
        })}
      </div>
    </section>
  );
}

type Steps = { heading?: string; intro?: string; items?: { _key: string; title: string; body?: string }[]; tone?: string; anchor?: string };
function StepsBlock({ heading, intro, items, tone, anchor, block }: BlockProps<Steps>) {
  const steps = items ?? [];
  return (
    <section className={`steps section-pad ${toneClass(tone, "paper")}`} id={anchorId(anchor)} aria-labelledby={heading ? titleId(block) : undefined}>
      <Head id={titleId(block)} heading={heading} intro={intro} />
      <ol className="step-list" style={{ "--steps": Math.min(Math.max(steps.length, 1), 4) } as CSSProperties}>
        {steps.map((step, i) => (
          <li key={step._key} className="step reveal">
            <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            {step.body ? <p>{step.body}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

type Person = { _key: string; photo?: Img; name: string; role?: string; bio?: string; link?: LinkValue | null };
function TeamBlock({ heading, intro, items, tone, anchor, block }: BlockProps<{ heading?: string; intro?: string; items?: Person[]; tone?: string; anchor?: string }>) {
  return (
    <section className={`team section-pad ${toneClass(tone, "paper")}`} id={anchorId(anchor)} aria-labelledby={heading ? titleId(block) : undefined}>
      <Head id={titleId(block)} heading={heading} intro={intro} />
      <ul className="team-grid">
        {(items ?? []).map((p) => {
          const inner = (
            <>
              <Picture image={p.photo} className="team-photo" sizes="(max-width: 720px) 50vw, 25vw" />
              <span className="team-name">{p.name}</span>
              {p.role ? <span className="team-role">{p.role}</span> : null}
              {p.bio ? <span className="team-bio">{p.bio}</span> : null}
            </>
          );
          return (
            <li key={p._key} className="team-person reveal">
              {p.link ? (
                <SiteLink link={p.link} always>
                  {inner}
                </SiteLink>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type Stats = { heading?: string; items?: { _key: string; value: string; label: string }[]; tone?: string; anchor?: string };
function StatsBlock({ heading, items, tone, anchor, block }: BlockProps<Stats>) {
  const stats = items ?? [];
  return (
    <section className={`stats-block ${toneClass(tone, "ink")}`} id={anchorId(anchor)} aria-labelledby={heading ? titleId(block) : undefined}>
      {heading ? (
        <div className="section-pad">
          <Head id={titleId(block)} heading={heading} />
        </div>
      ) : null}
      <div className="stats-grid" style={{ "--stats": Math.max(stats.length, 1) } as CSSProperties}>
        {stats.map((stat) => (
          <div key={stat._key} className={/\d/.test(stat.value) ? "stat reveal" : "stat stat--word reveal"}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

type Logo = { _key: string; image?: Img; name: string; link?: LinkValue | null };
function LogosBlock({ label, items, tone, anchor }: BlockProps<{ label?: string; items?: Logo[]; tone?: string; anchor?: string }>) {
  return (
    <section className={`logos section-pad ${toneClass(tone, "paper")}`} id={anchorId(anchor)}>
      <div className="logos-inner reveal">
        {label ? <p className="block-kicker">{label}</p> : null}
        <ul>
          {(items ?? []).map((logo) => {
            const img = imageProps(logo.image);
            // eslint-disable-next-line @next/next/no-img-element
            const mark = img ? <img {...img} alt={logo.name} loading="lazy" decoding="async" /> : <span>{logo.name}</span>;
            return (
              <li key={logo._key}>
                {logo.link ? (
                  <SiteLink link={logo.link} always>
                    {mark}
                  </SiteLink>
                ) : (
                  mark
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

type Contact = { heading?: string; body?: string; email?: string; phone?: string; tone?: string; anchor?: string };
function ContactBlock({ heading, body, email, phone, tone, anchor, block, site }: BlockProps<Contact>) {
  const mail = email || site.brand.business.email;
  const tel = phone || site.brand.business.phone;
  return (
    <section className={`contact-block section-pad ${toneClass(tone, "coral")}`} id={anchorId(anchor, "contact")} aria-labelledby={heading ? titleId(block) : undefined}>
      <div className="contact-inner">
        <div className="reveal">
          {heading ? (
            <h2 id={titleId(block)}>
              <Emphasis text={heading} />
            </h2>
          ) : null}
          {body ? <p>{body}</p> : null}
        </div>
        <div className="contact-links reveal">
          {mail ? (
            <a className="footer-contact" href={`mailto:${mail}`}>
              <small>Email</small>
              <span>{mail}</span>
              <b aria-hidden="true">↗</b>
            </a>
          ) : null}
          {tel ? (
            <a className="footer-contact" href={`tel:${tel.replace(/[^\d+]/g, "")}`}>
              <small>Phone</small>
              <span>{tel}</span>
              <b aria-hidden="true">↗</b>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const registry: BlockRegistry = {
  hero: HeroBlock,
  pageHeader: PageHeaderBlock,
  text: TextBlock,
  statement: StatementBlock,
  quote: QuoteBlock,
  image: ImageBlock,
  split: SplitBlock,
  video: VideoBlock,
  ticker: TickerBlock,
  services: ServicesBlock,
  cards: CardsBlock,
  steps: StepsBlock,
  team: TeamBlock,
  stats: StatsBlock,
  logos: LogosBlock,
  audit: AuditBlock,
  studio: StudioBlock,
  contact: ContactBlock,
  faq: FaqBlock,
  ventures: VenturesBlock,
};
