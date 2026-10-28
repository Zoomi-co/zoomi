import { defineSchema } from "@zoomi/site/schema";

const EMPHASIS = "Wrap words in *asterisks* for the italic serif. New lines break the heading.";

/**
 * The sections of zoomi.co and the text Dan can edit in each. Registered with the CMS on every build,
 * so adding a block here and deploying makes it appear in the editor. Layout, motion and the
 * illustrations stay in code so the editorial design can't drift.
 */
export const schema = defineSchema({
  blocks: {
    hero: {
      label: "Hero",
      category: "Sections",
      description: "Big headline, intro, the film and the sticker.",
      fields: {
        kicker: { type: "text", label: "Small text, top left", max: 60, default: "Zoomi / Design-led marketing" },
        kickerRight: { type: "text", label: "Small text, top right", max: 30, default: "Est. 2023" },
        headline: { type: "text", label: "Headline", multiline: true, required: true, max: 80, help: "One row per line (three rows fit best). Wrap a whole row in *asterisks* to set it in the coral serif.", default: "Design that\ngets you\n*noticed.*" },
        intro: { type: "text", label: "Intro", multiline: true, max: 320 },
        buttonLabel: { type: "text", label: "Button text", max: 30, default: "Get in touch" },
        button: { type: "link", label: "Button link" },
        filmCaption: { type: "text", label: "Film caption", max: 60, default: "What Zoomi does / 0:23" },
        filmDescription: { type: "text", label: "Film description", help: "Read aloud by screen readers.", multiline: true, max: 300 },
        sticker: { type: "text", label: "Sticker", multiline: true, max: 60, help: "Three short lines. The middle one is large.", default: "Built with\ncare\nin Indiana" },
        footerWords: { type: "text", label: "Words along the bottom", help: "Separate with commas.", max: 80, default: "Brand, Web, Strategy" },
        footerLinkLabel: { type: "text", label: "Bottom link text", max: 30, default: "What we do" },
        footerLink: { type: "link", label: "Bottom link" },
      },
    },
    ticker: {
      label: "Ticker",
      category: "Sections",
      description: "Scrolling band of words.",
      fields: {
        words: { type: "text", label: "Words", help: "Separate with commas.", required: true, max: 120, default: "Brand, Web, Strategy, Search" },
      },
    },
    services: {
      label: "Services",
      category: "Sections",
      description: "“What we do” list with the paper doodle.",
      fields: {
        heading: { type: "text", label: "Heading", help: EMPHASIS, required: true, max: 60, default: "What we *do.*" },
        items: {
          type: "list",
          label: "Services",
          itemLabel: "Service",
          min: 1,
          max: 8,
          fields: {
            title: { type: "text", label: "Name", required: true, max: 40 },
            body: { type: "text", label: "Description", multiline: true, max: 240 },
            tags: { type: "text", label: "Tags", multiline: true, help: "One per line.", max: 200 },
          },
        },
      },
    },
    audit: {
      label: "Audit band",
      category: "Sections",
      description: "Coral band about Zoomi Audit.",
      fields: {
        heading: { type: "text", label: "Heading", help: EMPHASIS, multiline: true, required: true, max: 80, default: "Launch it.\n*Keep it found.*" },
        body: { type: "text", label: "Text", multiline: true, max: 320 },
        points: { type: "text", label: "Points", multiline: true, help: "One per line.", max: 240 },
        buttonLabel: { type: "text", label: "Button text", max: 40, default: "Log in to Zoomi Audit" },
        button: { type: "link", label: "Button link" },
      },
    },
    studio: {
      label: "Company",
      category: "Sections",
      description: "Dark section with the big statement and numbers.",
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
        noteLabel: { type: "text", label: "Principle label", max: 40, default: "Our operating principle" },
        note: { type: "text", label: "Principle", multiline: true, max: 120 },
      },
    },
    faq: {
      label: "Questions",
      category: "Sections",
      description: "Numbered questions. Also tells Google these are FAQs.",
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
        },
      },
    },
    ventures: {
      label: "Companies",
      category: "Sections",
      description: "Rows linking to the other Zoomi companies.",
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
      },
    },
  },
  templates: {
    standard: { label: "Standard page", blocks: [{ type: "hero" }] },
  },
  brand: {
    // The editorial type system and venture colors are part of the design; these are the editable parts.
    use: ["favicon", "colors", "business"],
  },
});
