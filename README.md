# Zoomi — zoomi.co

The homepage for **Zoomi, LLC**. It leads with **Zoomi Marketing**, a
design-led marketing studio (brand identity, websites, strategy),
with Zoomi Audit positioned as the SEO software upsell. The other ventures sit
lower on the page:

| Venture | Domain | Focus |
| --- | --- | --- |
| Zoomi Audit | [audit.zoomi.co](https://audit.zoomi.co) | Digital strategy, SEO, and analytics |
| Zoomi Government | [gov.zoomi.co](https://gov.zoomi.co) | Government contracting and vendor fulfillment |
| Margin | [margin.zoomi.co](https://margin.zoomi.co) | A calm, thoughtful Bible-reading app |
| Zoomi Rentals | [rent.zoomi.co](https://rent.zoomi.co) | Delivered and serviced washer/dryer rentals |

## Experience

- Editorial, European talent-agency-inspired art direction
- Oversized typography, high-contrast color, and asymmetric layouts
- A venture "roster" with interactive identity cards for each business
- Studio manifesto, operating principles, and abstract venture artwork
- Responsive full-screen navigation and layouts designed specifically for mobile
- Lightweight entrance, ticker, scan, and pointer-parallax motion
- Reduced-motion accessibility support

## Tech

zoomi.co is a Next.js site whose content comes from the Zoomi CMS at
[my.zoomi.co](https://my.zoomi.co) (repo `dartydan/my`). Text, menus, brand
colors, business details and tracking tags are edited there; publishing
refreshes the live site within seconds. Layout, motion and illustrations stay
in this repo so the editorial design can't drift.

```text
src/zoomi/schema.ts    the editable sections and their fields (registered with the CMS on every build)
src/zoomi/blocks.tsx   how each section renders
src/components/        header, menu, footer, motion (was os.js)
public/os.css          the visual system; bump CSS_VERSION in src/app/layout.tsx with any change
public/                film, photos, share image, and the older static pages (/id/dan, /team, /marketing)
vendor/zoomi-site      the @zoomi/site core package from dartydan/my (replaced by update PRs)
```

## Run locally

```bash
cp .env.example .env.local   # keys from my.zoomi.co/admin
npm install
npm run dev                  # http://localhost:3001
```
