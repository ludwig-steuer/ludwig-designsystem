import { useEffect, useMemo, useState } from "react";

/**
 * Page state in the hash (`#entry=…&origin=…`), the way the app keeps it in
 * the query: a story iframe reloads on `?`, not on `#`, and `DataTable` knows
 * rows only as links. First used by 0157, shared since 0128.
 */

export type Patch = Record<string, string | null>;

/**
 * `initial` is the hash a story opens with. `live={false}` keeps several pages
 * in one story apart — they share one window hash, so only a live page may
 * follow it.
 */
export function useHash(initial: string, live: boolean) {
  const [hash, setHash] = useState(initial);
  useEffect(() => {
    if (!live) return;
    // The iframe outlives the story; a hash left by the previous one must not leak in.
    window.history.replaceState(null, "", `#${initial}`);
    setHash(initial);
    const onChange = () => setHash(window.location.hash.slice(1));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, [initial, live]);

  const params = useMemo(() => new URLSearchParams(hash), [hash]);
  const href = (patch: Patch): string => {
    const next = new URLSearchParams(hash);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    return `#${next.toString()}`;
  };
  const go = (patch: Patch) => {
    if (live) window.location.hash = href(patch).slice(1);
  };
  return { params, href, go };
}

export type Hash = ReturnType<typeof useHash>;
