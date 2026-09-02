# design-sync — Notizen zu diesem Repo

Was ein späterer Lauf wissen muss, um heutiges Debugging zu überspringen.

## Aufbau

- Shape `storybook`. Kein `dist/` und kein Package-Build — der Konverter läuft
  direkt gegen die TS-Quelle: `--entry ./src/ui/v3/index.ts`. Das funktioniert,
  weil esbuild TSX direkt bundelt. `buildCmd` ist deshalb leer.
- `--node-modules ./node_modules` (kein Monorepo, kein Hoisting).
- CSS kommt über `[CSS_FROM_STORYBOOK]` aus dem Referenz-Storybook (99 KB).
  Das Repo baut kein CSS-Sidecar; der Scrape ist hier der richtige Weg, nicht
  ein Workaround — die kompilierte Ausgabe der Storybook-Kette IST das CSS.

## Fixes dieses Laufs (Symptom -> Ursache -> Fix)

- **[GENERAL] 6 Komponenten fehlten im Sync** (`[TITLE_UNMAPPED]`: Pagination,
  Banner, LongText, StatusBadge, StatusInfoButton, StatusInfoDialog) ->
  `src/ui/v3/index.ts` re-exportierte sie über den tsconfig-Alias `@/ui/...`,
  den der Konverter nicht auflöst -> auf relative Pfade umgestellt
  (`../status/...`, `../components/...`). **Keine `@/`-Pfade in `index.ts`.**
  19 -> 25 Komponenten.
- **[GENERAL] 0 von 25 Previews rendern** (`root empty`, teils
  `ReferenceError: process is not defined`) -> sechs Komponenten importierten
  `next/link`; Next zieht `process.env.__NEXT_*` ins Browser-Bundle, das dort
  nicht existiert -> `src/ui/v3/primitives/Link.tsx` eingeführt (schlichtes
  `<a>`, alle Verwendungen waren reine `<a>`-Semantik), die sechs Importe
  darauf umgestellt. 0/25 -> 25/25. **Kein `next/*`-Import im DS.**
- **9x `[GRID_OVERFLOW]`** -> `cfg.overrides`: `cardMode: "column"` für die
  acht zu breiten (Checkliste, MasterDetail, SchrittRail, TodoListe, FieldList,
  KpiTile, StatusCallout, Tabs), `single` + `primaryStory: "Sachverhalt"` für
  StatusInfoDialog (Portal/fixed).

- **Story `LongText/Kurz` ist `sb-error`** -> `LongText.tsx` gibt unterhalb der
  Kürzungsgrenze `<>{text}</>` zurück, also einen nackten Textknoten ohne
  Element; `#storybook-root` bleibt damit leer, im Storybook wie in der
  Preview -> `cfg.overrides.LongText.skip`. Ohne den Skip gilt die Komponente
  nie als vollständig bewertet und wird bei jedem Sync neu aufgenommen.
- **StatusInfoDialog rendert als Band statt als Panel** -> die Story besteht
  nur aus dem `position:fixed`-Overlay; der Einzelkarten-Wrapper `.ds-single`
  trägt `transform:translateZ(0)` und wird damit zum Bezugsrahmen — bei Höhe 0
  kollabiert das Scrim auf 32 px und das Panel landet oberhalb des sichtbaren
  Bereichs. Betraf auch die **ausgelieferte Karte**, nicht nur die Aufnahme.
  -> eigene Preview `.design-sync/previews/StatusInfoDialog.tsx` mit einem
  Wrapper im Textfluss (`minHeight:100vh`). `cardMode: "single"` allein reicht
  dafür nicht. Story-Args und `open: true` blieben unangetastet.

## Was KEIN Defekt ist (dreimal unabhängig gemeldet — nicht erneut diagnostizieren)

- **Storybook zeigt `#F4F6F8`, die Preview Weiß.** `.storybook/preview.ts` setzt
  den Hintergrund über das `backgrounds`-Addon; der Konverter stubbt
  Storybook-Addons, der Ton erreicht die Preview also nie. Das ist
  Canvas-Rahmung außerhalb der Komponente — die Karten tragen selbst
  `background:#fff` und laut L2 Rand oder Schatten. **Kein `cfg.provider`-Hack.**
  Die Sache gehört als Verwendungsregel in `conventions.md`: Ludwig-Flächen
  liegen auf `--color-bg-soft`, Karten sind weiß darauf.
  Nebenwirkung derselben Ursache: Flächen, die selbst `#F4F6F8` benutzen
  (`Callout tone="soft"`, das weiße Pill der aktuellen SchrittRail-Stufe),
  verschwinden auf der Storybook-Seite und sind nur in der Preview zu sehen.
  Die Preview zeigt dort **mehr** als die Referenz — das bleibt `match`.
- **Zuschnitt der Aufnahmen.** Storybook-Shots sind auf den Story-Root
  beschnitten, Preview-Shots zeigen den vollen 900x700-Viewport. Weißraum
  unter der Komponente ist erwartbar; auf dem Vergleichsbogen kann die
  Preview-Spalte dadurch rechts beschnitten *wirken* (KpiTile) — das Original
  unter `_screenshots/compare/raw/` zeigt den vollen Render. Nicht in einer
  Preview "korrigieren".
- **`[RENDER_THIN] StatusInfoButton`.** Die Komponente ist per Design ein
  12,5-px-Info-Icon ohne Text; Storybook rendert exakt dasselbe (Ink-Masken
  bitgleich, 61 Pixel je Seite). Bei icon-only-Komponenten ist RENDER_THIN
  kein Fix-Auftrag — eine eigene Preview, die "mehr" zeigt, würde genau die
  Treue zerstören, die geprüft wird.

## Storybook-Dev-Indexer scheitert an drei Legacy-Stories

`pnpm storybook` (Dev) liefert keinen Index: „Could not parse import/exports
with acorn" für `legacy/components/Pagination|Banner|LongText.stories.tsx`.
**`pnpm build` indiziert dieselben Dateien fehlerfrei** (139 Stories) — es ist
der Dev-Indexer von Storybook 10.6, nicht der Code. Geprüft und ausgeschlossen:
Encoding, BOM, Zeilenenden, Dateirechte, erweiterte Attribute, `satisfies`-
statt Annotations-Form, Vite- und Storybook-Cache. Kein Unterschied zu den
Legacy-Stories unter `status/`, die sauber indizieren.

Bis das geklärt ist, geht Ansehen über den Build:

```bash
pnpm build && npx serve -s storybook-static -l 6109
# http://localhost:6109/iframe.html?id=<story-id>&viewMode=story
```

## Offene Punkte

- `docs: 0/25 components matched` — es gibt keine Doku je Komponente, also
  bleiben die `.prompt.md` dünn (siehe nächster Abschnitt).

## Vom Owner angefragt, bewusst zurückgestellt (2026-09-02)

Beides nach dem Erstsync zu entscheiden, nicht mittendrin:

1. **Einsatz-Metadaten je Komponente**: wann welche Komponente genommen wird,
   welche Bedingungen an die Verwendung hängen. Technischer Anker ist genau der
   heute leere `docs`-Kanal: eine Datei je Komponente fließt in deren
   `.prompt.md` — die Nutzungsreferenz, die der Design-Agent liest.
2. **Benennungsnorm mit T-Shirt-Größen** für Entitäts-Darstellungen
   (Sachverhalt S/M/L …), samt erfasstem Platzbedarf. Das ist eine Erweiterung
   der Designsprache und gehört zuerst in `docs/design-guidelines.md`, bevor
   Code oder Sync-Config davon abhängen.

## Re-sync-Risiken

- **Der Konverter läuft gegen die TS-Quelle.** Bekommt das Repo später einen
  echten Package-Build, muss `--entry` auf den gebauten Entry zeigen.
- **`Link.tsx` ist bewusst framework-frei.** Übernimmt die App v3 und braucht
  clientseitige Navigation, wird NUR diese Datei auf `next/link` umgestellt —
  passiert das, bricht der nächste Sync wieder mit `process is not defined`.
  Dann gehört die Next-Variante hinter eine Injektion, nicht in den Import.
- **`.design-sync/previews/StatusInfoDialog.tsx` ist eine eigene Preview.**
  Sollte der Harness `.ds-single` eines Tages korrekt dimensionieren, bleibt
  sie bestehen und legt einen überflüssigen `minHeight:100vh`-Kasten darüber
  (harmlos, aber dann löschbar). Kommt eine weitere geöffnete Overlay-Story
  dazu, gilt dasselbe Muster.
- **Story-Titel tragen das Präfix `v3/`.** Eine Umbenennung der Titel ändert
  die Gruppen im Ziel und damit die Karten-Zuordnung.
- CSS hängt am Referenz-Storybook: Ändert sich die Style-Kette, muss
  `.design-sync/sb-reference` neu gebaut werden, sonst grading gegen alte Optik.
