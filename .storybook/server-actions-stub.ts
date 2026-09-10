import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

/**
 * Recreates the server-action boundary Next.js draws in the client bundle.
 *
 * A `"use server"` file **never** runs in the browser: Next replaces it with RPC
 * stubs. Vite does not know that rule and bundles the body — with Drizzle and
 * `postgres`, which fails in the browser with `Buffer is not defined`. Almost the
 * whole shared layer hangs on the server graph through `FlowModal` and
 * `AppShell` (F111, finding B1).
 *
 * The stub keeps the export names and throws when called: a story that really
 * needs an action fails visibly instead of quietly showing something wrong.
 *
 * `load` instead of `transform`: `@storybook/nextjs-vite`'s SWC transform also
 * runs as `pre` and rewrites the exports first, so the original is read from disk.
 */
export function serverActionsStub(): Plugin {
  const USE_SERVER = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use server["']/;
  const EXPORT_DECL = /^export\s+(?:async\s+)?(?:function|const|let|var|class)\s+(\w+)/gm;
  const EXPORT_LIST = /^export\s*\{([^}]*)\}/gm;

  return {
    name: "ludwig:server-actions-stub",
    enforce: "pre",
    load(id) {
      const file = id.split("?")[0]!;
      if (!file.includes("/src/") || !/\.tsx?$/.test(file)) return null;

      let source: string;
      try {
        source = readFileSync(file, "utf8");
      } catch {
        return null;
      }
      if (!USE_SERVER.test(source)) return null;

      const names = new Set([...source.matchAll(EXPORT_DECL)].map((m) => m[1]!));
      for (const m of source.matchAll(EXPORT_LIST)) {
        for (const part of m[1]!.split(",")) {
          const name = part.trim().split(/\s+as\s+/).pop()?.trim();
          // `export type { X }` lists carry no runtime symbol.
          if (name && !name.startsWith("type ")) names.add(name);
        }
      }

      const rel = file.slice(file.indexOf("/src/") + 1);
      const body = [...names]
        .map(
          (n) =>
            `export const ${n} = () => { throw new Error(` +
            `"Server Action '${n}' (${rel}) läuft nicht in Storybook. " +` +
            `"Diese Komponente lädt selbst und gehört in /dev/gallery, nicht hierher."); };`,
        )
        .join("\n");
      return body || "export {};";
    },
  };
}
