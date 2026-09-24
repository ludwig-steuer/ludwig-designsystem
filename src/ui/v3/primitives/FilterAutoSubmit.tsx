"use client";

import { useEffect, useRef } from "react";

/** Typing pauses this long before a text filter sends the form (0200, F1). */
const TYPING_PAUSE = 400;

/**
 * The client island of `FilterBar autoSubmit` (0200): sends the surrounding
 * GET form on every change, so a server page filters on the click like a
 * client page does. Text waits for a pause; Enter still submits at once
 * (the browser does that).
 *
 * `MultiSelectFilter` and `PeriodField` report their hidden fields with a
 * bubbling `change` — without that this listener would never hear them.
 *
 * Internal to FilterBar; not exported from the barrel.
 */
export function FilterAutoSubmit() {
  const probe = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = probe.current?.closest("form");
    if (!form) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const send = () => form.requestSubmit();
    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement;
      // Text fields fire `change` on blur after typing — the input listener
      // below already sent it.
      if (t.type === "search" || t.type === "text") return;
      send();
    };
    const onInput = (e: Event) => {
      const t = e.target as HTMLInputElement;
      if (t.type !== "search" && t.type !== "text") return;
      clearTimeout(timer);
      timer = setTimeout(send, TYPING_PAUSE);
    };
    form.addEventListener("change", onChange);
    form.addEventListener("input", onInput);
    return () => {
      clearTimeout(timer);
      form.removeEventListener("change", onChange);
      form.removeEventListener("input", onInput);
    };
  }, []);
  return <span ref={probe} hidden />;
}
