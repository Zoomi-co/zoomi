import { Fragment } from "react";

/** Non-empty trimmed lines of a multiline field. */
export function lines(text: string | null | undefined): string[] {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

/** Non-empty trimmed items of a separated field, e.g. "Brand, Web, Strategy". */
export function list(text: string | null | undefined, separator: string): string[] {
  return (text ?? "").split(separator).map((l) => l.trim()).filter(Boolean);
}

/** The text without emphasis markers, for aria labels and structured data. */
export function plain(text: string): string {
  return text.replace(/\*/g, "");
}

/** Renders *words* as <em> (the italic serif in the design) and new lines as <br>. */
export function Emphasis({ text }: { text: string | null | undefined }) {
  const rows = (text ?? "").split("\n");
  return (
    <>
      {rows.map((row, r) => (
        <Fragment key={r}>
          {r > 0 ? <br /> : null}
          {row.split(/(\*[^*]+\*)/).map((part, i) => (part.startsWith("*") && part.endsWith("*") && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : part))}
        </Fragment>
      ))}
    </>
  );
}
