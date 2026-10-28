export declare const CORE_VERSION = "0.1.0";
export type ImageValue = {
    id: string;
    url: string;
    alt: string;
    width?: number;
    height?: number;
    focal?: {
        x: number;
        y: number;
    };
};
export type LinkValue = {
    kind: "page";
    pageId: string;
    href?: string;
    newTab?: boolean;
} | {
    kind: "url";
    url: string;
    href?: string;
    newTab?: boolean;
};
export type FileValue = {
    id: string;
    url: string;
    name: string;
    size?: number;
};
type FieldBase = {
    label: string;
    help?: string;
    required?: boolean;
};
export type TextField = FieldBase & {
    type: "text";
    multiline?: boolean;
    max?: number;
    placeholder?: string;
    default?: string;
};
export type RichTextField = FieldBase & {
    type: "richtext";
    default?: string;
};
export type ImageField = FieldBase & {
    type: "image";
};
export type FileField = FieldBase & {
    type: "file";
    accept?: string[];
};
export type LinkField = FieldBase & {
    type: "link";
};
export type SelectField = FieldBase & {
    type: "select";
    options: {
        label: string;
        value: string;
    }[];
    default?: string;
};
export type ToggleField = FieldBase & {
    type: "toggle";
    default?: boolean;
};
export type NumberField = FieldBase & {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    default?: number;
};
export type VideoField = FieldBase & {
    type: "video";
};
export type ListField = FieldBase & {
    type: "list";
    itemLabel: string;
    fields: Record<string, ScalarField>;
    min?: number;
    max?: number;
};
export type ScalarField = TextField | RichTextField | ImageField | FileField | LinkField | SelectField | ToggleField | NumberField | VideoField;
export type Field = ScalarField | ListField;
export type BlockDef = {
    label: string;
    description?: string;
    category?: string;
    /** Path (relative to the site) of a thumbnail shown in the block picker. */
    thumbnail?: string;
    fields: Record<string, Field>;
};
export type TemplateDef = {
    label: string;
    description?: string;
    /** Blocks a new page starts with. */
    blocks?: {
        type: string;
        props?: Record<string, unknown>;
    }[];
    /** Restrict which blocks can be added. Omit to allow all. */
    allowedBlocks?: string[];
};
export type BrandKey = "logo" | "logoLight" | "favicon" | "colors" | "fonts" | "radius" | "business";
export type SiteSchema = {
    blocks: Record<string, BlockDef>;
    templates: Record<string, TemplateDef>;
    brand?: {
        /** Brand settings this site uses. Omit to use all. */
        use?: BrandKey[];
        /** Values fixed by the design that clients can't change. */
        locked?: Partial<Brand>;
    };
};
export declare function defineBlock<T extends BlockDef>(def: T): T;
export declare function defineSchema<T extends SiteSchema>(schema: T): T;
export type BlockInstance = {
    id: string;
    type: string;
    props: Record<string, unknown>;
    hidden?: boolean;
};
export type PageSeo = {
    title?: string;
    description?: string;
    image?: ImageValue | null;
    noindex?: boolean;
};
export type PageContent = {
    title: string;
    blocks: BlockInstance[];
    seo: PageSeo;
};
export type PublishedPage = PageContent & {
    id: string;
    path: string;
    template: string;
    updatedAt: string;
};
export type PageSummary = {
    id: string;
    path: string;
    title: string;
    updatedAt: string;
    noindex: boolean;
};
export type FontChoice = {
    family: string;
    source: "google" | "custom" | "system";
    /** For custom fonts: URL of the font file (woff2). */
    url?: string;
    /** For custom fonts: the media item, so the CMS tracks usage and keeps the URL current. */
    id?: string;
    weights?: number[];
};
export type Brand = {
    logo: ImageValue | null;
    logoLight: ImageValue | null;
    favicon: ImageValue | null;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
        surface: string;
    };
    fonts: {
        heading: FontChoice;
        body: FontChoice;
        baseSize: number;
    };
    radius: "square" | "soft" | "round";
    business: {
        name: string;
        phone: string;
        email: string;
        address: string;
        hours: string;
        social: {
            platform: string;
            url: string;
        }[];
    };
};
export type NavItem = {
    id: string;
    label: string;
    link: LinkValue;
    children?: NavItem[];
};
export type Navigation = {
    header: NavItem[];
    footer: {
        id: string;
        title: string;
        items: NavItem[];
    }[];
    cta: {
        label: string;
        link: LinkValue;
    } | null;
};
export type IntegrationKey = "ga4" | "gtm" | "googleAds" | "metaPixel" | "linkedin" | "clarity" | "uet" | "tiktok";
export type Integration = {
    enabled: boolean;
    id: string;
};
export type TagCategory = "necessary" | "analytics" | "marketing";
export type Snippet = {
    id: string;
    name: string;
    location: "head" | "body-start" | "body-end";
    code: string;
    category: TagCategory;
    targeting: {
        mode: "all" | "only" | "except";
        paths: string[];
    };
    enabled: boolean;
    /** Set by a Zoomi admin to switch off a snippet that breaks a site. */
    disabledByAdmin?: boolean;
};
export type Tags = {
    integrations: Partial<Record<IntegrationKey, Integration>> & {
        googleAds?: Integration & {
            conversionLabel?: string;
        };
    };
    snippets: Snippet[];
    consent: {
        enabled: boolean;
        style: "bar" | "card";
        message: string;
        privacyPath: string;
        regions: "all" | "eu-uk-ca";
    };
    gscVerification: string;
};
export type Seo = {
    titleTemplate: string;
    defaultDescription: string;
    defaultImage: ImageValue | null;
    indexable: boolean;
};
export type PublishedSite = {
    id: string;
    name: string;
    url: string;
    brand: Brand;
    nav: Navigation;
    tags: Tags;
    seo: Seo;
    updatedAt: string;
};
export type Redirect = {
    from: string;
    to: string;
    code: 301 | 302;
};
export declare const defaultBrand: Brand;
export declare const defaultNav: Navigation;
export declare const defaultTags: Tags;
export declare const defaultSeo: Seo;
/** Merge stored brand over defaults, then apply the design's locked values. */
export declare function resolveBrand(stored: Partial<Brand> | null | undefined, schema?: SiteSchema | null): Brand;
export declare function defaultProps(def: BlockDef): Record<string, unknown>;
export declare function listItemDefaults(field: ListField): Record<string, unknown>;
export type ValidationIssue = {
    blockId?: string;
    blockLabel?: string;
    field?: string;
    message: string;
};
export declare function stripTags(html: string): string;
export declare function validateBlocks(schema: SiteSchema, blocks: BlockInstance[], pageIds?: Set<string>): ValidationIssue[];
export declare function validateBrand(brand: Brand): ValidationIssue[];
export declare function luminance(hex: string): number;
export declare function contrastRatio(a: string, b: string): number;
export declare function slugify(input: string): string;
export declare function normalizePath(path: string): string;
/** Every link value inside a tree of props: used to resolve page links to live paths. */
export declare function mapLinks<T>(value: T, fn: (link: LinkValue) => LinkValue): T;
/** Every media id referenced in a tree of props: used for "where is this file used". */
export declare function collectMediaIds(value: unknown, into?: Set<string>): Set<string>;
export declare function linkHref(link: LinkValue | null | undefined): string;
export {};
