import { Inline } from "@zoomi/site/render";
import { plainText } from "@zoomi/site/schema";

/** Non-empty trimmed lines of a multiline field. */
export function lines(text: string | null | undefined): string[] {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

/** Non-empty trimmed items of a separated field, e.g. "Brand, Web, Strategy". */
export function list(text: string | null | undefined, separator: string): string[] {
  return (text ?? "").split(separator).map((l) => l.trim()).filter(Boolean);
}

/** The text without formatting, for aria labels and structured data. */
export function plain(text: string | null | undefined): string {
  return plainText(text ?? "").replace(/\*/g, "");
}

const WHOLE_EM = /^(?:\*([^*]+)\*|<em>((?:(?!<\/?em>).)*)<\/em>)$/;

/** A row that is italic from end to end (the coral serif rows), and its text without the italic. */
export function wholeItalic(row: string): string | null {
  const m = WHOLE_EM.exec(row.trim());
  return m ? (m[1] ?? m[2]) : null;
}

/**
 * Text with bold, italic (the italic serif in the design) and links, and new lines as <br>.
 * Older content marks italic with *asterisks*; that still works.
 */
export function Emphasis({ text }: { text: string | null | undefined }) {
  return <Inline value={text ?? ""} asterisks />;
}
