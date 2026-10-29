import { defineSchema, type SelectField, type TextField } from "@zoomi/site/schema";

const EMPHASIS = "Wrap words in *asterisks* for the italic serif. New lines break the heading.";

/** Background of a section. The accent (italic serif, rules, button) follows it. */
const tone = (fallback: string): SelectField => ({
  type: "select",
  label: "Background",
  options: [
    { label: "Paper", value: "paper" },
    { label: "Deep paper", value: "deep" },
    { label: "Ink", value: "ink" },
    { label: "Coral", value: "coral" },
    { label: "Blue", value: "blue" },
    { label: "Yellow", value: "yellow" },
    { label: "Pink", value: "pink" },
    { label: "Green", value: "green" },
  ],
  default: fallback,
});

const anchor: TextField = { type: "text", label: "Anchor", help: "Lets a menu link jump here, e.g. #pricing. Letters, numbers and dashes.", max: 40 };

const heading = (fallback: string, max = 80): TextField => ({ type: "text", label: "Heading", help: EMPHASIS, multiline: true, max, default: fallback });

/**
 * The sections of zoomi.co and the text Dan can edit in each. Registered with the CMS on every build,
 * so adding a block here and deploying makes it appear in the editor. Layout, motion and the
 * illustrations stay in code so the editorial design can't drift.
 *
 * Block keys are stored in page content, so they never change even when a block's label does.
 */
export const schema = defineSchema({
  blocks: {
    // ---------- Page headers ----------
    hero: {
      label: "Big header",
      category: "Page headers",
      thumbnail: "/blocks/hero.png",
      description: "The homepage header: huge three-row headline, the film or an image, and the sticker.",
      fields: {
        kicker: { type: "text", label: "Small text, top left", max: 60, default: "Zoomi / Design-led marketing" },
        kickerRight: { type: "text", label: "Small text, top right", max: 30, default: "Est. 2023" },
        headline: { type: "text", label: "Headline", multiline: true, required: true, max: 80, help: "One row per line (three rows fit best). Wrap a whole row in *asterisks* to set it in the coral serif.", default: "Design that\ngets you\n*noticed.*" },
        intro: { type: "text", label: "Intro", multiline: true, max: 320 },
        buttonLabel: { type: "text", label: "Button text", max: 30, default: "Get in touch" },
        button: { type: "link", label: "Button link" },
        art: {
          type: "select",
          label: "Beside the headline",
          options: [
            { label: "The Zoomi film", value: "film" },
            { label: "An image", value: "image" },
          ],
          default: "film",
        },
        image: { type: "image", label: "Image", help: "Shown when “An image” is picked. Tall images fit best." },
        filmCaption: { type: "text", label: "Caption", max: 60, default: "What Zoomi does / 0:23" },
        filmDescription: { type: "text", label: "Film description", help: "Read aloud by screen readers.", multiline: true, max: 300 },
        sticker: { type: "text", label: "Sticker", multiline: true, max: 60, help: "Three short lines. The middle one is large. Leave empty for no sticker.", default: "Built with\ncare\nin Indiana" },
        footerWords: { type: "text", label: "Words along the bottom", help: "Separate with commas.", max: 80, default: "Brand, Web, Strategy" },
        footerLinkLabel: { type: "text", label: "Bottom link text", max: 30, default: "What we do" },
        footerLink: { type: "link", label: "Bottom link" },
      },
    },
    pageHeader: {
      label: "Page header",
      category: "Page headers",
      thumbnail: "/blocks/pageHeader.png",
      maxPerPage: 1,
      description: "Headline and intro for an inside page, with an optional image beside or below.",
      fields: {
        kicker: { type: "text", label: "Small text above", max: 60, default: "Zoomi / Services" },
        headline: { type: "text", label: "Headline", help: EMPHASIS, multiline: true, required: true, max: 90, default: "A page that\n*earns* attention." },
        intro: { type: "text", label: "Intro", multiline: true, max: 360, default: "One or two sentences on what this page is about and who it's for. Keep it plain and specific." },
        buttonLabel: { type: "text", label: "Button text", max: 30, default: "Get in touch" },
        button: { type: "link", label: "Button link" },
        image: { type: "image", label: "Image" },
        layout: {
          type: "select",
          label: "Image position",
          options: [
            { label: "Beside the headline", value: "side" },
            { label: "Wide, below the headline", value: "below" },
          ],
          default: "side",
        },
        tone: tone("paper"),
      },
    },

    // ---------- Text ----------
    text: {
      label: "Text",
      category: "Text",
      thumbnail: "/blocks/text.png",
      description: "A heading and paragraphs, side by side or in one column.",
      fields: {
        kicker: { type: "text", label: "Small text above", max: 60 },
        heading: heading("Why it *matters.*"),
        body: { type: "richtext", label: "Text", default: "<p>Write the substance here. Short paragraphs read best on this site: two to four sentences each, one idea per paragraph.</p><p>Links, bold text and lists all work.</p>" },
        layout: {
          type: "select",
          label: "Layout",
          options: [
            { label: "Heading left, text right", value: "split" },
            { label: "One column", value: "column" },
          ],
          default: "split",
        },
        tone: tone("paper"),
        anchor,
      },
    },
    statement: {
      label: "Statement",
      category: "Text",
      thumbnail: "/blocks/statement.png",
      description: "One big sentence across the page.",
      fields: {
        text: { type: "text", label: "Statement", help: EMPHASIS, multiline: true, required: true, max: 200, default: "Good design is the *fastest* way to be taken seriously." },
        note: { type: "text", label: "Small text below", max: 80 },
        tone: tone("deep"),
        anchor,
      },
    },
    quote: {
      label: "Quote",
      category: "Text",
      thumbnail: "/blocks/quote.png",
      description: "A testimonial with the person's name, role and photo.",
      fields: {
        quote: { type: "text", label: "Quote", help: EMPHASIS, multiline: true, required: true, max: 400, default: "They made us look like the company we *already were.*" },
        name: { type: "text", label: "Name", max: 60, default: "Full name" },
        role: { type: "text", label: "Role and company", max: 80, default: "Title, Company" },
        photo: { type: "image", label: "Photo" },
        tone: tone("pink"),
        anchor,
      },
    },

    // ---------- Media ----------
    image: {
      label: "Image",
      category: "Media",
      thumbnail: "/blocks/image.png",
      description: "One image at full width, wide or inset, with a caption.",
      fields: {
        image: { type: "image", label: "Image", required: true },
        caption: { type: "text", label: "Caption", max: 160 },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Wide", value: "wide" },
            { label: "Edge to edge", value: "full" },
            { label: "Inset", value: "inset" },
          ],
          default: "wide",
        },
        tone: tone("paper"),
        anchor,
      },
    },
    split: {
      label: "Image and text",
      category: "Media",
      thumbnail: "/blocks/split.png",
      description: "An image on one side, heading, text and a button on the other.",
      fields: {
        image: { type: "image", label: "Image" },
        side: {
          type: "select",
          label: "Image side",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
          default: "left",
        },
        kicker: { type: "text", label: "Small text above", max: 60, default: "01 / Approach" },
        heading: heading("Made for the\nway you *sell.*"),
        body: { type: "richtext", label: "Text", default: "<p>Explain the idea in a few sentences. Say what you do, how it works and what the reader gets from it.</p>" },
        buttonLabel: { type: "text", label: "Button text", max: 30 },
        button: { type: "link", label: "Button link" },
        tone: tone("paper"),
        anchor,
      },
    },
    video: {
      label: "Video",
      category: "Media",
      thumbnail: "/blocks/video.png",
      description: "A YouTube or Vimeo video with a heading and caption.",
      fields: {
        heading: { ...heading("", 60), label: "Heading (optional)" },
        video: { type: "video", label: "Video", required: true },
        caption: { type: "text", label: "Caption", max: 160 },
        tone: tone("paper"),
        anchor,
      },
    },

    // ---------- Lists ----------
    services: {
      label: "List rows",
      category: "Lists",
      thumbnail: "/blocks/services.png",
      description: "Ruled rows with a name, description and tags, like “What we do.”",
      fields: {
        heading: { type: "text", label: "Heading", help: EMPHASIS, required: true, max: 60, default: "What we *do.*" },
        doodle: { type: "toggle", label: "Paper doodle beside the heading", default: true },
        items: {
          type: "list",
          label: "Rows",
          itemLabel: "Row",
          min: 1,
          max: 12,
          fields: {
            title: { type: "text", label: "Name", required: true, max: 40 },
            body: { type: "text", label: "Description", multiline: true, max: 240 },
            tags: { type: "text", label: "Tags", multiline: true, help: "One per line.", max: 200 },
          },
          default: [
            { title: "First thing", body: "A sentence or two on what this is and why someone would want it.", tags: "Detail\nDetail" },
            { title: "Second thing", body: "A sentence or two on what this is and why someone would want it.", tags: "Detail\nDetail" },
            { title: "Third thing", body: "A sentence or two on what this is and why someone would want it.", tags: "Detail\nDetail" },
          ],
        },
        anchor,
      },
    },
    cards: {
      label: "Cards",
      category: "Lists",
      thumbnail: "/blocks/cards.png",
      description: "A grid of cards, each with an optional image, title, text and link.",
      fields: {
        heading: heading("Three ways\nto *start.*"),
        intro: { type: "text", label: "Intro", multiline: true, max: 240 },
        columns: {
          type: "select",
          label: "Cards per row",
          options: [
            { label: "Two", value: "2" },
            { label: "Three", value: "3" },
            { label: "Four", value: "4" },
          ],
          default: "3",
        },
        items: {
          type: "list",
          label: "Cards",
          itemLabel: "Card",
          max: 12,
          fields: {
            image: { type: "image", label: "Image" },
            title: { type: "text", label: "Title", required: true, max: 60 },
            body: { type: "text", label: "Text", multiline: true, max: 280 },
            linkLabel: { type: "text", label: "Link text", max: 30 },
            link: { type: "link", label: "Link" },
            color: {
              type: "select",
              label: "Hover color",
              options: [
                { label: "Coral", value: "coral" },
                { label: "Blue", value: "blue" },
                { label: "Yellow", value: "yellow" },
                { label: "Pink", value: "pink" },
                { label: "Green", value: "green" },
              ],
              default: "coral",
            },
          },
          default: [
            { title: "Small", body: "Who it's for and what's included, in a sentence or two.", color: "yellow" },
            { title: "Medium", body: "Who it's for and what's included, in a sentence or two.", color: "pink" },
            { title: "Large", body: "Who it's for and what's included, in a sentence or two.", color: "green" },
          ],
        },
        tone: tone("paper"),
        anchor,
      },
    },
    steps: {
      label: "Steps",
      category: "Lists",
      thumbnail: "/blocks/steps.png",
      description: "Numbered steps across the page, for a process or timeline.",
      fields: {
        heading: heading("How it *works.*"),
        intro: { type: "text", label: "Intro", multiline: true, max: 240 },
        items: {
          type: "list",
          label: "Steps",
          itemLabel: "Step",
          max: 8,
          fields: {
            title: { type: "text", label: "Title", required: true, max: 50 },
            body: { type: "text", label: "Text", multiline: true, max: 240 },
          },
          default: [
            { title: "Talk", body: "What happens first, and what the client brings to it." },
            { title: "Design", body: "What happens next, and how long it usually takes." },
            { title: "Launch", body: "What the client ends up with, and what happens after." },
          ],
        },
        tone: tone("paper"),
        anchor,
      },
    },
    team: {
      label: "People",
      category: "Lists",
      thumbnail: "/blocks/team.png",
      description: "Photos, names and roles of the people behind the work.",
      fields: {
        heading: heading("The *people.*"),
        intro: { type: "text", label: "Intro", multiline: true, max: 240 },
        items: {
          type: "list",
          label: "People",
          itemLabel: "Person",
          max: 16,
          fields: {
            photo: { type: "image", label: "Photo" },
            name: { type: "text", label: "Name", required: true, max: 60 },
            role: { type: "text", label: "Role", max: 60 },
            bio: { type: "text", label: "Short bio", multiline: true, max: 240 },
            link: { type: "link", label: "Link" },
          },
          default: [
            { name: "Full name", role: "Role" },
            { name: "Full name", role: "Role" },
            { name: "Full name", role: "Role" },
          ],
        },
        tone: tone("paper"),
        anchor,
      },
    },
    stats: {
      label: "Numbers",
      category: "Lists",
      thumbnail: "/blocks/stats.png",
      description: "Big numbers with short labels.",
      fields: {
        heading: { ...heading("", 80), label: "Heading (optional)" },
        items: {
          type: "list",
          label: "Numbers",
          itemLabel: "Number",
          max: 4,
          fields: {
            value: { type: "text", label: "Value", required: true, max: 8 },
            label: { type: "text", label: "Label", required: true, max: 50 },
          },
          default: [
            { value: "12", label: "What this counts" },
            { value: "48h", label: "What this counts" },
            { value: "3×", label: "What this counts" },
          ],
        },
        tone: tone("ink"),
        anchor,
      },
    },
    logos: {
      label: "Logos",
      category: "Lists",
      thumbnail: "/blocks/logos.png",
      description: "A row of client or partner logos.",
      fields: {
        label: { type: "text", label: "Small text beside the logos", max: 60, default: "Trusted by" },
        items: {
          type: "list",
          label: "Logos",
          itemLabel: "Logo",
          max: 12,
          fields: {
            image: { type: "image", label: "Logo", help: "A transparent PNG or SVG works best." },
            name: { type: "text", label: "Name", required: true, max: 40, help: "Shown when there's no logo, and read by screen readers." },
            link: { type: "link", label: "Link" },
          },
          default: [{ name: "Company" }, { name: "Company" }, { name: "Company" }, { name: "Company" }],
        },
        tone: tone("paper"),
        anchor,
      },
    },
    faq: {
      label: "Questions",
      category: "Lists",
      thumbnail: "/blocks/faq.png",
      description: "Numbered questions that open and close. Also tells Google these are FAQs.",
      fields: {
        heading: { type: "text", label: "Heading", help: EMPHASIS, required: true, max: 60, default: "Good *questions.*" },
        intro: { type: "text", label: "Intro", multiline: true, max: 200 },
        items: {
          type: "list",
          label: "Questions",
          itemLabel: "Question",
          max: 20,
          fields: {
            question: { type: "text", label: "Question", required: true, max: 160 },
            answer: { type: "richtext", label: "Answer", required: true },
          },
          default: [
            { question: "A question people ask before they buy?", answer: "<p>A direct answer in two or three sentences.</p>" },
            { question: "Another question people ask?", answer: "<p>A direct answer in two or three sentences.</p>" },
          ],
        },
        anchor,
      },
    },
    ventures: {
      label: "Companies",
      category: "Lists",
      thumbnail: "/blocks/ventures.png",
      description: "Rows linking to the other Zoomi companies, each with a colored badge.",
      fields: {
        heading: { type: "text", label: "Heading", help: EMPHASIS, required: true, max: 60, default: "Other Zoomi *companies.*" },
        intro: { type: "text", label: "Intro", multiline: true, max: 320 },
        items: {
          type: "list",
          label: "Companies",
          itemLabel: "Company",
          max: 8,
          fields: {
            name: { type: "text", label: "Name", required: true, max: 40 },
            tagline: { type: "text", label: "Tagline", max: 60 },
            description: { type: "text", label: "Description", multiline: true, max: 240 },
            tags: { type: "text", label: "Tags", help: "Separate with commas.", max: 60 },
            link: { type: "link", label: "Link" },
            color: {
              type: "select",
              label: "Color",
              options: [
                { label: "Blue", value: "blue" },
                { label: "Yellow", value: "yellow" },
                { label: "Pink", value: "pink" },
                { label: "Green", value: "green" },
              ],
              default: "blue",
            },
            mark: {
              type: "select",
              label: "Badge style",
              options: [
                { label: "Scan line", value: "audit" },
                { label: "Star", value: "gov" },
                { label: "Ruled lines", value: "margin" },
                { label: "Ring", value: "rent" },
              ],
              default: "audit",
            },
            markText: { type: "text", label: "Badge letters", max: 4 },
          },
        },
        anchor,
      },
    },

    // ---------- Bands ----------
    audit: {
      label: "Call to action",
      category: "Bands",
      thumbnail: "/blocks/audit.png",
      description: "A colored band with a big heading, points and a button.",
      fields: {
        heading: { type: "text", label: "Heading", help: EMPHASIS, multiline: true, required: true, max: 80, default: "Ready when\n*you are.*" },
        body: { type: "text", label: "Text", multiline: true, max: 320, default: "A sentence on what happens when someone gets in touch." },
        points: { type: "text", label: "Points", multiline: true, help: "One per line.", max: 240 },
        buttonLabel: { type: "text", label: "Button text", max: 40, default: "Get in touch" },
        button: { type: "link", label: "Button link" },
        tone: tone("blue"),
        anchor,
      },
    },
    studio: {
      label: "Statement and numbers",
      category: "Bands",
      thumbnail: "/blocks/studio.png",
      description: "Dark section with a big three-row statement, numbers and a coral note.",
      fields: {
        heading: { type: "text", label: "Statement", help: `One row per line. ${EMPHASIS.split(".")[0]}.`, multiline: true, required: true, max: 120, default: "We design it.\nWe get it *seen.*\nWe measure it." },
        body: { type: "text", label: "Text", multiline: true, help: "Leave a blank line between paragraphs.", max: 600 },
        stats: {
          type: "list",
          label: "Numbers",
          itemLabel: "Number",
          max: 4,
          fields: {
            value: { type: "text", label: "Value", required: true, max: 6 },
            label: { type: "text", label: "Label", required: true, max: 40 },
          },
        },
        noteLabel: { type: "text", label: "Note label", max: 40, default: "Our operating principle" },
        note: { type: "text", label: "Note", multiline: true, max: 120 },
        anchor,
      },
    },
    contact: {
      label: "Contact",
      category: "Bands",
      thumbnail: "/blocks/contact.png",
      description: "A heading with big email and phone links. Uses Brand settings when left empty.",
      fields: {
        heading: heading("Let's talk\nabout *yours.*"),
        body: { type: "text", label: "Text", multiline: true, max: 280 },
        email: { type: "text", label: "Email", help: "Leave empty to use the email in Brand.", max: 120 },
        phone: { type: "text", label: "Phone", help: "Leave empty to use the phone in Brand.", max: 40 },
        tone: tone("coral"),
        anchor,
      },
    },
    ticker: {
      label: "Ticker",
      category: "Bands",
      thumbnail: "/blocks/ticker.png",
      description: "Scrolling band of words.",
      fields: {
        words: { type: "text", label: "Words", help: "Separate with commas.", required: true, max: 120, default: "Brand, Web, Strategy, Search" },
      },
    },
  },
  templates: {
    standard: { label: "Blank page", description: "Starts with a page header.", blocks: [{ type: "pageHeader" }] },
    service: {
      label: "Service",
      description: "Header, image and text, steps, questions and a call to action.",
      blocks: [{ type: "pageHeader" }, { type: "split" }, { type: "services", props: { heading: "What's *included.*", doodle: false } }, { type: "steps" }, { type: "faq" }, { type: "audit" }],
    },
    landing: {
      label: "Landing page",
      description: "Big header, ticker, cards, a quote, numbers and a call to action.",
      blocks: [{ type: "hero" }, { type: "ticker" }, { type: "cards" }, { type: "quote" }, { type: "stats" }, { type: "audit", props: { tone: "coral" } }],
    },
    about: {
      label: "About",
      description: "Header, statement, text, people and contact.",
      blocks: [{ type: "pageHeader", props: { kicker: "Zoomi / About", headline: "Who we *are.*" } }, { type: "statement" }, { type: "text" }, { type: "team" }, { type: "contact" }],
    },
    article: {
      label: "Article",
      description: "Header with a wide image and one column of text.",
      blocks: [{ type: "pageHeader", props: { kicker: "Zoomi / Notes", headline: "A headline that\nsays the *point.*", buttonLabel: "", layout: "below" } }, { type: "text", props: { heading: "", layout: "column" } }, { type: "quote", props: { tone: "deep" } }, { type: "text", props: { heading: "", layout: "column" } }],
    },
  },
  brand: {
    // The editorial type system and venture colors are part of the design; these are the editable parts.
    use: ["favicon", "colors", "business"],
  },
});
