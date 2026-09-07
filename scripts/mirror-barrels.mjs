/**
 * Erzeugt für jedes gespiegelte Modul einen `index.ts`, der genau die
 * mitgespiegelten Fachtypen re-exportiert — und entfernt anschließend
 * iterativ jede Datei, deren Importe im Spiegel nicht auflösen (sie hängen
 * an Infrastruktur, die hier bewusst fehlt).
 */
import fs from "node:fs";
import path from "node:path";

const DST = process.argv[2];
const ls = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []);

/**
 * Was eine Datei selbst deklariert, als `name -> "type" | "value"`.
 *
 * Eine Weiterleitung (`export { X } from "./y"`) zählt **nicht**: sie zeigt
 * auf dieselbe Deklaration, und zwei Wege zu einer Deklaration sind für
 * TypeScript keine Mehrdeutigkeit. Nur zwei echte Deklarationen sind eine.
 */
const declaredNames = (file) => {
  const src = fs.readFileSync(file, "utf8");
  const kinds = new Map();
  for (const m of src.matchAll(/^export\s+(?:declare\s+)?(type|interface|const|function|class|enum)\s+([A-Za-z0-9_$]+)/gm))
    kinds.set(m[2], m[1] === "type" || m[1] === "interface" ? "type" : "value");
  for (const m of src.matchAll(/^export\s+(type\s+)?\{([^}]*)\}(?!\s*from)/gm))
    for (const part of m[2].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) kinds.set(name, m[1] ? "type" : "value");
    }
  // Ein Name, den die Datei selbst importiert hat, ist auch dann nur
  // weitergereicht, wenn der Export ihn ohne `from` nennt (`export type { X }`
  // unter einem `import { X } from "./y"`).
  for (const m of src.matchAll(/^import\s[^;]*?\{([^}]*)\}[^;]*?from/gms))
    for (const part of m[1].split(","))
      kinds.delete(part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim());
  return kinds;
};

/** `writeBarrels` läuft mehrfach; jede Dublette wird trotzdem einmal gemeldet. */
const reported = new Set();

const writeBarrels = () => {
  for (const m of ls(path.join(DST, "modules")).filter((e) => e.isDirectory())) {
    const domain = path.join(DST, "modules", m.name, "domain");
    const files = ls(domain).filter((e) => e.isFile() && e.name.endsWith(".ts")).map((e) => e.name);
    if (!files.length) continue;

    // Zwei Dateien duerfen denselben Namen exportieren — `export *` macht ihn
    // dann mehrdeutig und der Barrel bricht (TS2308). Die App merkt das nie,
    // ihr eigener Barrel exportiert namentlich. Der Spiegel löst es zugunsten
    // der ersten Datei auf und **sagt es**: eine Dublette ist ein Befund für
    // ludwig/app, keine Eigenart dieses Skripts.
    const owner = new Map();
    const clashes = new Map();
    for (const f of files) {
      for (const [name, kind] of declaredNames(path.join(domain, f))) {
        if (owner.has(name)) clashes.set(name, [owner.get(name)[0], f, kind]);
        else owner.set(name, [f, kind]);
      }
    }

    const lines = files.map((f) => `export * from "./domain/${f.replace(/\.ts$/, "")}";`);
    for (const [name, [first, second, kind]] of clashes) {
      const asType = kind === "type" ? "type " : "";
      lines.push(`export ${asType}{ ${name} } from "./domain/${first.replace(/\.ts$/, "")}";`);
      const key = `${m.name}/${name}`;
      if (!reported.has(key)) {
        reported.add(key);
        console.log(`  doppelt: ${key} in ${first} und ${second} — Barrel nimmt ${first}`);
      }
    }
    fs.writeFileSync(path.join(DST, "modules", m.name, "index.ts"),
      `/* Generiert von scripts/sync-ludwig.sh — nicht von Hand bearbeiten. */\n${lines.join("\n")}\n`);
  }
};

const resolves = (spec, from) => {
  let base;
  if (spec.startsWith("@/ludwig/")) base = path.join(DST, spec.slice("@/ludwig/".length));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return true; // externe Pakete
  return [base + ".ts", path.join(base, "index.ts")].some((c) => fs.existsSync(c));
};

const walk = (d) => ls(d).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

writeBarrels();
let dropped;
do {
  dropped = [];
  for (const f of walk(DST).filter((f) => f.endsWith(".ts") && !f.endsWith("index.ts"))) {
    const src = fs.readFileSync(f, "utf8");
    const bad = [...src.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)]
      .map((m) => m[1]).filter((s) => !resolves(s, f));
    if (bad.length) { fs.rmSync(f); dropped.push([path.relative(DST, f), bad]); }
  }
  if (dropped.length) writeBarrels();
  for (const [f, bad] of dropped) console.log(`  ausgelassen: ${f} (braucht ${bad.join(", ")})`);
} while (dropped.length);

// Leere Modulordner aufräumen.
for (const m of ls(path.join(DST, "modules")).filter((e) => e.isDirectory())) {
  const dir = path.join(DST, "modules", m.name);
  if (!walk(dir).some((f) => !f.endsWith("index.ts"))) fs.rmSync(dir, { recursive: true });
}
