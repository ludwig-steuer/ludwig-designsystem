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

## Re-Sync 2026-09-11 (Stand a86d99e)

- **Umfang bewusst auf die 25 bestehenden Komponenten begrenzt** (Owner
  2026-09-11). Das Set ist auf rund 138 v3-Komponenten gewachsen; der Rest
  folgt in einem eigenen Lauf. Mechanik: `titleMap` setzt jeden anderen
  Story-Titel auf `null`; `"Zellen": "AmountCell"` hält die AmountCell-Karte
  (ihre Story heißt jetzt `v3/Primitives/Tabelle/Zellen`). **Nächster Lauf:
  nur die `null`-Einträge der aufzunehmenden Komponenten löschen** — Seiten,
  Referenz und Grundlagen bleiben `null`.
- **[GENERAL] `next/link` war wieder im DS** (`JournalEntryGrid.tsx`) -> auf
  `primitives/Link` umgestellt. Vor jedem Sync:
  `grep -rn 'from "next/' src --include='*.tsx'`.
- **[GENERAL] Checklist `root empty` — `rowCells is not a function`** -> die
  Import-Regel erkennt ein Komponentenmodul am Dateinamen. `Review.tsx` heißt
  wie keiner seiner Exporte, wird deshalb aus der Quelle in die Vorschau
  gebündelt, und sein Import aus `./Table` landet auf dem globalen Objekt, dem
  der interne Helfer `rowCells` fehlt -> `cfg.storyImports.shim:
  ["src/ui/v3/patterns/Review.tsx"]`. Gleiches Symptom bei einer weiteren
  Sammeldatei: Datei dort ergänzen.
- **StatusInfoDialog: eigene Vorschau rief die alten Story-Exporte** (`Buchung`,
  `Sachverhalt` …; seit 0001 `Entry`, `Case`, `Document`, `LegendOnly`) ->
  Exporte umbenannt, `primaryStory: "Case"`. Eigene Vorschauen folgen
  Umbenennungen in der Story nicht von selbst.
- **`[GRID_OVERFLOW]` JournalEntryEditor, Pagination** -> `cardMode: "column"`.
- **Gruppen verlieren Umlaute.** Der Konverter bildet die Gruppe aus dem
  Titelsegment über `[^a-z0-9]` -> `-`: „Fläche" wird `fl-che`, „Prüfen"
  `pr-fen`, „Arbeitsfläche" `arbeitsfl-che` — als Ordner und als Label im
  Picker. Kein Config-Schalter; ein Fork von `common.mjs` verschöbe jeden
  Prüfvertrag. Kosmetisch, bewusst hingenommen.
- **conventions.md nannte alte Status-Achsen** (`beleg`, `sachverhalt`,
  `buchung`; heute `document_processing`, `accounting_case`, `journal_entry`,
  Status-Schlüssel unverändert) -> Regel und Beispiel korrigiert (Owner
  2026-09-11). Bei jedem Sync die Achsen im Leitfaden gegen `STATUS_REGISTRY`
  prüfen.
- **StatusBadge-JSDoc nannte dieselben alten Achsen** (`stage`: „Only
  `beleg`", `@when`: „beleg, sachverhalt, buchung") — das fließt in
  `StatusBadge.d.ts` und `.prompt.md`, also in den API-Vertrag des
  Design-Agents -> in `src/ui/v3/patterns/StatusBadge.tsx` auf
  `document_processing` usw. korrigiert (nur Kommentare).
- **Hohe Stories (MasterDetail/Detail Wide, StatusBadge/All Axes)** wirken auf
  dem Bogen falsch skaliert: die Storybook-Aufnahme ist der ganze Root, die
  Preview endet am 700-px-Viewport. Die Rohbilder in `compare/raw/` sind
  gleich, wo sie sich überdecken — `match`, kein Fix.

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

## Storybook-Dev-Indexer (erledigt)

`pnpm storybook` lieferte keinen Index: „Could not parse import/exports with
acorn" für `legacy/components/Pagination|Banner|LongText.stories.tsx` — am
Code lag es nie (`pnpm build` indizierte dieselben Dateien fehlerfrei). Mit
dem Umzug nach `src/ui/v3/primitives/` (0043, 2026-09-03) ist es weg: der
Dev-Server auf 6107 liefert wieder einen vollständigen Index (346 Stories).
Ansehen geht damit wieder direkt über `pnpm storybook`.

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
- **Die Gruppe ist das Titelsegment vor dem Namen** (`v3/Primitives/Fläche/Banner`
  -> `fl-che`). Werden Story-Titel umsortiert, wandern alle Karten in neue
  Ordner (so 2026-09-11: alle 25) — der Diff löscht die alten Pfade, das ist
  gewollt.
- **Der Umfang hängt an der `titleMap`-Sperrliste.** Ein Story-Titel, der nach
  2026-09-11 dazukommt, hat keinen `null`-Eintrag und wird beim nächsten Sync
  automatisch mitgenommen — dann bewusst entscheiden (aufnehmen oder `null`).
- **`storyImports.shim` für `Review.tsx` hängt am Dateipfad.** Wird die Datei
  umbenannt oder zerlegt, kommt `rowCells is not a function` zurück.
- CSS hängt am Referenz-Storybook: Ändert sich die Style-Kette, muss
  `.design-sync/sb-reference` neu gebaut werden, sonst grading gegen alte Optik.
