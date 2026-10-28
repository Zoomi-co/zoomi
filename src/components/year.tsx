"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Prerendered with the last-publish year, then read from the browser clock so it never shows last year. */
export function Year({ initial }: { initial: number }) {
  return <>{useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => initial)}</>;
}
