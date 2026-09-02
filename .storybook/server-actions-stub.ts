import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

/**
 * Bildet die Server-Action-Grenze nach, die Next.js im Client-Bundle zieht.
 *
 * Eine Datei mit `"use server"` läuft **nie** im Browser: Next ersetzt sie im
 * Client-Bundle durch RPC-Stubs. Vite kennt diese Regel nicht und bündelt den
 * Rumpf mit — samt Drizzle und `postgres`, was im Browser an `Buffer is not
 * defined` scheitert.
 *
 * Betroffen ist nicht nur, wer eine Action aufruft: `@/ui/status` erreicht über
 * `FlowModal` das Modul `@/modules/invoices`, `@/ui/components` über
 * `AppShell`/`UserMenu` das Modul `@/modules/auth`. Damit hängt fast die ganze
 * geteilte Schicht am Server-Graphen (F111, Befund B1) — 28 von 41
 * Story-Dateien liefen darüber.
 *
 * Der Stub behält die Export-Namen und wirft beim Aufruf. Eine Story, die
 * tatsächlich eine Action bräuchte, fällt damit sichtbar durch — statt still
 * etwas Falsches zu zeigen.
 *
 * `load` statt `transform`: der SWC-Transform von `@storybook/nextjs-vite`
 * läuft ebenfalls als `pre` und schreibt die Exporte vorher um. Wir lesen
 * deshalb das Original von der Platte.
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
          // `export type { X }`-Listen tragen kein Laufzeit-Symbol.
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
