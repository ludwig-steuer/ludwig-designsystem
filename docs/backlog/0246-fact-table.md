# 0246 · FactTable: Fakten mit Wert, Sicherheit und Quelle, eine Form für Rückfrage und Abnahme

| | |
|---|---|
| Status | S1 fertig (fremde Abnahme 2026-11-18, unter Annahme H2); S2 offen, wartet auf L-380/F681 |
| Stufe | `patterns/` (Gruppe Prüfen), dazu Erweiterung von `ProvenanceSources` (`patterns/Provenance.tsx`) und Umzug in `entities/clarification/ClarificationCard.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, sobald dort geprüft wird: „Schadenort · Hamburg · belegt · Schadenmeldung S. 1“. Ein Prozesswort (Sicherheit, Quelle), keine Entität |
| Quelle | app-f0, F678-Brief (App `docs/backlog/F678-fact-view-design-brief.md`, Nachtrag 2026-11-18): „Eine Darstellung für die Faktenzeile (Bezeichnung, Wert, Sicherheit, Quellen)“. Konzept App `docs/concepts/booking-process.md` §7, Datenform F668 T668.2 |
| Ersetzt | im Set die lokale Funktion `Facts` in `ClarificationCard.tsx` (0238). In der App heute nichts, die Faktenansicht F678 ist noch nicht gebaut |
| Blockiert | die DS-Seite der Faktenansicht F678 (eigene Spec nach der Owner-Durchsicht des Ablaufs) |
| Wartet auf | Schritt 2: L-380 und L-381, beide mit App-Spec F681 (Achsen `fact_certainty`, `fact_source_kind`) auf `booking-v3`; app-f0 meldet den Commit zum Spiegeln |
| Spec von / am | Designer-Sitzung, 2026-11-18 |

## Ziel

Ludwig bucht künftig aus Fakten (F678). In der Abnahme will die Buchhalterin an
jeder Buchung sehen, worauf sie beruht: Bezeichnung, Wert, wie sicher der Wert
ist, und woher er stammt, mit Link. Dieselbe Frage stellt heute schon die
Rückfrage unter „Grundlage“ (0238/0241), dort als Tabelle Bezeichnung · Wert ·
Quelle. Ein offener Punkt der Faktenansicht wird zur Rückfrage. Sähe derselbe
Fakt in Rückfrage und Abnahme verschieden aus, müsste sie ihn zweimal lesen
lernen. Darum gibt es eine Form für beide, ein Pattern, das die Rückfrage als
erste Nutzerin übernimmt.

## Einordnung

- **Wiederverwenden:**
  - `Table`/`HeadRow`/`Row` (`density="compact"`): das Raster, das `Facts` heute nutzt.
  - `ProvenanceSources` (`@when` „The sources of a reason under a heading of
    their own“): eine Quelle mit Art (Icon und Wort), Name als Link oder als
    Button `onOpen` (öffnet daneben, 0186) und Zitat. Das ist genau der
    Quellen-Link, den der Brief will. Ihm fehlt nur die Fundstelle.
  - `StatusHeader` (R2): der Spaltenkopf „Sicherheit“ mit (i) und Legende aus der Achse.
  - `DateRange` (`primitives/Time`): Gültigkeit langlebiger Fakten.
- **Nicht passend:** `FieldList` (Bezeichnung/Wert untereinander, keine
  Spalten, hat keinen Platz für Sicherheit und Quelle in einer Reihe).
  `ProvenanceRows` (die Herleitung **eines** Werts, nicht viele Fakten).
  `DiffView` (zwei Stände eines Datensatzes). `Confidence` (Ampel mit Farbe;
  laut W-Entscheid entfällt sie an Buchungen mit Faktensatz, und die
  Sicherheit eines Fakts trägt keine Farbe).
- **Neu, weil:** §3 Regel 4. Die Faktentabelle ist heute Markup in einer
  Entität (`ClarificationCard`), die Faktenansicht F678 ist der zweite Screen.
  Das Vorbild ist `OpenPoints` (0153): Mit der zweiten Verwendung wird es ein
  Pattern. Für eine Entitätsform spricht nichts: Der Faktensatz ist keine
  Entität mit eigenen Formen, und die Rückfrage-Fakten gehören zu keiner
  Entität.
- **Erweitert:** `ProvenanceSource` bekommt **ein** Feld, `locator` (§3
  Regel 2). Es kehrt wieder (jede Quelle eines `explicit`-Fakts hat eine
  Fundstelle, F668) und passt als Halbsatz ins `@when`.
- **Zuschnitt:** eine neue Datei `patterns/FactTable.tsx` mit einem Export,
  Story daneben. `Provenance.tsx` bekommt ein Feld, `ClarificationCard.tsx`
  verliert `Facts`. Keine Familie: Die Zeile tritt nie allein auf, eine
  einzelne Faktzeile ist eine Tabelle mit einer Zeile.
- **Zwei Bauschritte**, beide in dieser Spec:
  - **S1 jetzt**, unabhängig vom Ablauf und vom Faktensatz: Pattern mit
    Bezeichnung · Wert · Quelle(n), `locator`, Umzug der Rückfrage.
  - **S2 mit L-380**: Spalte „Sicherheit“, Gültigkeit, neue Quellenarten. Bis
    die Typen und die Achse im Spiegel stehen, baut S2 nichts, denn eine
    lokale Wortliste der fünf Wörter wäre die zweite Quelle (A5).
- **Setzt auf:** `Table`, `HeadRow`, `Row`, `ProvenanceSources`,
  `StatusHeader` (S2), `DateRange` (S2).

## Schnittstelle

`FactTable({ facts })`, Server-Component (kein Zustand, die Buttons der
Quellen bringen ihren Handler mit).

```ts
export interface FactTableRow {
  key: string;
  label: string;
  value: string | null;
  sources?: readonly ProvenanceSource[];
  // S2:
  certainty?: Certainty | null;
  validFrom?: string | null;
  validTo?: string | null;
}
```

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `facts` | `readonly FactTableRow[]` | ja | Die Fakten in der Reihenfolge des Aufrufers. Das Pattern sortiert nicht und gruppiert nicht: Gruppen (Beleg · Rechnungsposition · …) setzt der Aufrufer als je eine Tabelle unter seinen Kopf. Leere Liste → `null` | `Filled`, `InUse` |
| `FactTableRow.key` | `string` | ja | Stabiler Schlüssel (Faktschlüssel, bei der Rückfrage der Index). Bezeichnungen dürfen sich wiederholen: Ein Widerspruch steht als zwei Zeilen mit derselben Bezeichnung (F678-Nachtrag) | `Edge` |
| `FactTableRow.label` | `string` | ja | Bezeichnung in Fachsprache aus der App („Land des Lieferanten“), nie der Schlüssel | `Filled` |
| `FactTableRow.value` | `string \| null` | ja | Der Wert, wie die App ihn formuliert, mit Ziffern in `tnum`. `null` → „—“ in `--color-text-muted` mit `title="kein Wert"` | `Edge` |
| `FactTableRow.sources` | `readonly ProvenanceSource[]` | nein | Die Quellen untereinander über `ProvenanceSources`. Die Spalte „Quelle“ gibt es nur, wenn mindestens ein Fakt eine Quelle hat (wie 0238) | `Filled`, `WithoutSources`, `OpenSource` |
| `ProvenanceSource.locator` | `string \| null` | nein | **Neu.** Die Fundstelle in der Quelle, vom Aufrufer formuliert: „S. 2“, „Position 3“, „Feld Rechtsform“. Steht hinter dem Namen, in `--color-text-muted`, ohne Trennzeichen: Bricht sie um, beginnt die Zeile mit der Fundstelle, nicht mit einem Punkt (ein Button lässt sich nicht an Folgetext kleben, gemessen im Bau). Das Pattern liest keine Koordinaten | `Filled`, `Edge` |
| `FactTableRow.certainty` (S2) | `Certainty \| null` aus `@/ludwig/modules/fact-records/domain/fact` (F668 `CERTAINTIES`) | nein | Wort aus `resolveStatus("fact_certainty", …)`. Grau, ohne Farbe, Punkt oder Prozent. Kopf „Sicherheit“ (`AXIS_LABEL.fact_certainty`) als `StatusHeader` mit Legende. Die Spalte gibt es nur, wenn ein Fakt eine Sicherheit hat | `Certainty` |
| `FactTableRow.validFrom` / `validTo` (S2) | ISO-Datum | nein | Unterzeile unter dem Wert: „gilt ab 01.01.2026“, „gilt bis 31.12.2026“, beide → „gilt 01.01.2026–31.12.2026“ (`DateRange`) | `Validity` |

Typen: `ProvenanceSource` aus `patterns/Provenance`. Der Typ heißt
`FactTableRow`, weil `FactRow` in der Belegfamilie vergeben ist
(`source-document-detail.ts`). `Certainty` aus dem
Spiegel (S2, L-380). GLOSSARY: `fact` = Fakt, `certainty` = Sicherheit,
`source` = Quelle.

**Kann bewusst nicht:**
- **Nicht bearbeiten.** Den Wert ändern (F678 Schritt 4, `editable`,
  `options`) hängt am Ablauf und an der Vorschau, siehe Ausbau.
- **Nicht hervorheben.** Den Rückverweis aus der Ergebniszeile („aus: …“)
  baut die Faktenansicht, siehe Ausbau.
- **Keine Gruppe und kein Einklappen.** Kopf je Gruppe, „weitere Angaben“ als
  `Disclosure` und „Grundlage“ setzt der Aufrufer, wie heute.
- **Keine Farbe.** Auch „angenommen“ und „unbekannt“ sind grau (F678: Annahmen
  sind neutral). Kritisch ist erst der offene Punkt, und der ist `OpenPoints`.
- **Kein Laden, kein Fehler.** Die Tabelle steht in einem Rahmen (Drawer,
  Karte), der beides trägt.

## Verhalten

- **Raster:** Bezeichnung `minmax(0, 1fr)` · Wert `minmax(0, 1fr)` · (S2)
  Sicherheit `max-content` · Quelle `minmax(0, 1.25fr)`. Ohne Quelle:
  Bezeichnung `1fr` · Wert `1.4fr` wie 0238. Text links, auch der Wert: Ein
  Fakt ist meist ein Wort, Beträge darin bleiben `tnum`, aber linksbündig wie
  heute.
- **Umbruch statt Kürzung:** Lange Werte, Namen und Zitate brechen um, die
  Zeile wächst nach unten. Das Zitat steht unter dem Namen in Anführung
  (`v3prov__quote`, wie in `ProvenanceSources`).
- **Ziel ist nur die Quelle** (0238): Die Zeile hat kein Hover und ist kein
  Ziel. Name der Quelle als `Link` (`href`) oder Button (`onOpen`, öffnet den
  vorhandenen Drawer daneben), sonst Text. Hover und Fokusring wie jeder
  `v2link`. Tab läuft von Quelle zu Quelle in Lesereihenfolge.
- **Trefferfläche:** Der Quellname als Button ist mindestens 24 × 24 px hoch
  (gemessen, 2.5.8). Er erbt die Zeilenhöhe von `density="compact"`. Reicht
  sie nicht, gibt `v3prov` dem Button die Mindesthöhe, nicht die Zeile.
- **Breite:** Die Tabelle scrollt nicht quer, weder im Drawer `md` noch in
  der Schritt-Form der Rückfrage bei 1280 px.
- **Rückfrage (S1, Umzug):** `ClarificationCard` ruft statt `Facts`
  `FactTable` auf. Jede `ClarificationFactSource` wird eine `ProvenanceSource`:
  `kind: null`, weil das Label der Rückfrage die Art schon nennt
  (Entschieden 1), `label`, `href`, `onOpen` = `select({ kind, id })`, wo
  Art, Kennung und `onSelect` da sind. Die Art steht in der Rückfrage nicht
  vor dem Namen, siehe Entschieden 1. Sonst
  ändert sich nichts: Ort, Einklappen (0241) und Reihenfolge bleiben.
- **S2 Sicherheit:** Das Wort steht in `--color-text-muted` (#5C5C5C, 6,7:1
  auf Weiß). Kein neuer Token. `unknown` mit `value: null` zeigt „—“ und
  „unbekannt“.

## Stories

`v3/Patterns/Prüfen/FactTable`. Pattern-Untergrenze 4, hier 5 eigene in S1
(dazu der Nachweis des Umzugs in den Rückfrage-Stories) und 7 nach S2. Daten fiktiv nach F678: eine Software-Rechnung aus Irland.

| Story | Beweist | Schritt |
|---|---|---|
| `Filled` | Rechnungsposition-Fakten (Leistung „Software-Abonnement“, Art „Leistung, kein Gegenstand“, Verwendung „eigener Verbrauch“, Nettobetrag „1.188,00 €“), Quellen mit Art, Fundstelle „S. 1“ und Zitat | S1 |
| `WithoutSources` | Nur Bezeichnung und Wert, die Spalte „Quelle“ fehlt | S1 |
| `OpenSource` | Rundlauf `onOpen` mit `useState`: Ein Klick auf „Rechnung INV-2026-0412“ zeigt „Geöffnet: Rechnung INV-2026-0412, S. 1, Fußzeile“ unter der Tabelle (Live-Region) | S1 |
| `Edge` | Lange Bezeichnung (rund 60 Zeichen), langer Wert, drei Quellen untereinander, langes Zitat, `value: null`, zwei Zeilen mit derselben Bezeichnung (Widerspruch: „Land des Lieferanten“ Irland laut Beleg, Deutschland laut Geschäftspartner) | S1 |
| `InUse` | Je Gruppe eine `Card` mit `CardHead` (`h3` unter dem Drawer-Titel): „Rechnungsposition“, „Geschäftspartner“, darunter `Disclosure` „Weitere Angaben 4“ mit der Karte „Beleg“, im `Drawer` `md` | S1 |
| `ClarificationCard`: `FactsWithSources`, `FactsSourcePick`, `FactsInDrawer`, `FactsWithoutSources` | Die Rückfrage-Karte mit offener „Grundlage“. Beweist den Umzug (ein Fakt sieht gleich aus). Die vorhandenen Stories der Rückfrage statt einer neuen: Eine Pattern-Story darf keine Entität importieren (R21, nur abwärts) | S1 |
| `Certainty` | Alle fünf Werte nebeneinander (bestätigt · belegt · erschlossen · angenommen · unbekannt), Kopf mit (i) und Legende | S2 |
| `Validity` | Ein Geschäftspartner-Fakt „gilt ab 01.01.2026“, ein Mandanten-Fakt „gilt 01.01.2026–31.12.2026“ | S2 |

Nicht anwendbar, mit Grund:
- **leer:** Eine Tabelle ohne Fakten rendert nichts. Eine leere Gruppe
  erscheint laut Brief gar nicht. „Kein Faktensatz“ ist ein Satz der
  Faktenansicht, nicht dieser Tabelle.
- **leer nach Filter:** Die Tabelle filtert nicht.
- **lädt, Fehler:** Die Tabelle lädt nichts, beides trägt der Rahmen (Drawer B, R15).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Rückverweis: Die Ergebniszeile nennt „aus: Land des Lieferanten“, ein Klick fokussiert und markiert die Fakten | `marked?: readonly string[]` (Hintergrund „ausgewählt“, Zeile `tabIndex={-1}` als Fokusziel) | DS-Spec der Faktenansicht F678 |
| Wert ändern mit Vorschau | `onEdit?: (key, value) => void`, je Zeile `editable`, `options` aus dem Kontrakt; Eingabe über `Select`/`RadioGroup`/`Input` | F678 nach der Owner-Durchsicht des Ablaufs (Schritt 4) |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel, S1:

- [ ] `FactTable` hat `@when` „Facts with their value and source — the basis of a clarification, of an entry“ und `@instead` auf `FieldList` (eine Sache, Bezeichnung/Wert), `ProvenanceRows` (Herleitung eines Werts), `DiffView` (zwei Stände). Die Nachbarn verweisen zurück (`ProvenanceSources`, `FieldList`)
- [ ] Die Spalte „Quelle“ erscheint nur, wenn ein Fakt eine Quelle hat (`Filled` gegen `WithoutSources`)
- [ ] `value: null` zeigt „—“ mit `title` (`Edge`)
- [ ] Zwei Zeilen mit gleicher Bezeichnung rendern ohne React-Warnung über doppelte Keys (`Edge`, Konsole)
- [ ] `locator` steht hinter dem Namen, grau, ohne Trennzeichen; umbrochen beginnt die Zeile mit der Fundstelle. Ohne `locator` steht nichts (`Filled`, `Edge`)
- [ ] `onOpen` ist ein Button, `href` ein Link, ohne beides Text. Tab erreicht jede Quelle in Lesereihenfolge, Fokusring sichtbar (`OpenSource`)
- [ ] Trefferfläche des Quell-Buttons ≥ 24 × 24 px, im Browser gemessen (`OpenSource`)
- [ ] Kein Querscroll im Drawer `md` und in der Rückfrage-Schritt-Form bei 1280 px Innenbreite, gemessen (`InUse`, `ClarificationCard--FactsInDrawer`)
- [ ] Die Zeile hat kein Hover, nur die Quelle (`Filled`)
- [ ] Ersetzt `Facts` in `ClarificationCard.tsx` ohne Funktionsverlust: Quelle mit Art und Kennung öffnet über `onSelect` wie bisher, Quelle mit `href` linkt, Freitext bleibt Text. Die Stories `FactsWithSources`, `FactsSourcePick` und `FactsInDrawer` der Rückfrage zeigen die Grundlage unverändert bis auf Schriftlage und Abstand der Quelle (eine Form mit der Faktenansicht); `InBatchReview`, `Step` und `ByHand` rendern ohne Fehler *(Nachtrag des Spec-Autors 2026-11-18 nach Spec-Mangel der Abnahme: die drei zuerst genannten Stories haben keine Quelle und konnten das Kriterium nicht tragen)*
- [ ] `docs/ui-repraesentationen.md` führt die Faktentabelle als gemeinsame Form von Rückfrage und Faktenansicht, mit Datum

Variabel, S2 (nach L-380):

- [ ] Die Sicherheit kommt aus `resolveStatus("fact_certainty", …)`, der Kopf aus `AXIS_LABEL` als `StatusHeader` mit Legende. Keine Wortliste im Set (`Certainty`)
- [ ] Alle fünf Wörter grau, keine Farbe, kein Punkt (`Certainty`, Blick)
- [ ] Gültigkeit als Unterzeile mit `DateRange`, drei Formen (`Validity`)
- [ ] Das Wort der Quellenart kommt aus der Achse `fact_source_kind` (F681), für die Faktentabelle **und** für `AiBookingNotes`/`BookingReview`: `SOURCE_KIND` behält nur das Icon je Art (`ENTITY_ICON`, wo es die Entität gibt), die lokale Wortliste entfällt (L-381)

## Entschieden (app-f0, 2026-11-18)

1. **Art der Quelle auch in der Rückfrage vor dem Namen:** ja, kein Einspruch.
   Ein Fakt sieht überall gleich aus. *Nachtrag des Spec-Autors nach der fremden
   Abnahme (2026-11-18):* In der Rückfrage steht **keine** Art vor dem Namen,
   bis ihre Fakten die Quellen des Faktensatzes tragen (S2). Ihr Label nennt
   die Art schon („Beleg RE-2026-4471“, „Buchung vom 18.07.2026“): Mit dem
   Wort davor stand „Beleg Beleg RE-2026-4471“, das Icon allein wäre eine
   Ausnahme zu T8 (Icon nie ohne Wort), die der Abnehmer zu Recht beanstandet
   hat. Die Faktenansicht zeigt Icon und Wort, weil ihr Label die Art nicht
   nennt („Nordlicht Software Ltd.“, „§ 13b UStG“). Das Pattern trägt beides:
   Die Art ist eine Angabe des Aufrufers (`kind: null` lässt sie weg).
2. **Wörter der Quellenarten:** kommen als Achse `fact_source_kind` mit App-Spec
   F681, nicht als Liste im Set. Die Wörter liegen dem Owner als Punkt 13 des
   Plans Booking v3 vor. Die Wörter des heutigen Sets bleiben (app-f0,
   2026-11-18): `bank_transaction` „Kontoauszug“, `vendor_history` „Bisherige
   Buchungen“; neu ist nur `web` „Webseite“ statt „Web“ (T4, Anglizismus).
   Bestehende Buchungsbegründungen ändern sich damit nicht.
3. **„angenommen“ ohne eigene Form:** ohne Einspruch wie vorgeschlagen. Das
   Wort genügt, die Zahl der Annahmen steht an der Zeile der Abnahme-Liste.

## Nachträge im Bau (Spec-Autor, 2026-11-18)

Der Abnehmer hat vermerkt, dass die Spec im Bau geändert wurde. Hier stehen
alle Änderungen gesammelt und begründet. Gemeldet an app-f0 (Auftraggeber),
Einspruch jederzeit:

1. **`FactRow` → `FactTableRow`:** Der Name ist in der Belegfamilie vergeben
   (`source-document-detail.ts`), der Typecheck meldete die Dopplung im Barrel.
2. **Fundstelle ohne „·“:** Der Quellname ist als Button ein atomares Element,
   an das sich kein Folgetext kleben lässt. Bricht die Fundstelle um, begann
   die Zeile mit „·“ (gesehen in `Edge` und `InUse`). Die graue Farbe trennt sie
   vom Namen.
3. **Story `InClarification` entfällt:** Eine Pattern-Story darf keine Entität
   importieren (R21, nur abwärts). Den Umzug belegen die vorhandenen
   Rückfrage-Stories `FactsWithSources`, `FactsSourcePick`, `FactsInDrawer`.
4. **Keine Art in der Rückfrage:** siehe Entschieden 1.
5. **Umzugs-Kriterium:** Es nennt jetzt Stories mit Quelle, siehe den
   Nachtrag am Kriterium (Spec-Mangel der Abnahme).

## Abnahme

Schlanke Abnahme (Schnittstelle) plus Messung der S1-Layoutkriterien. Stand:
Arbeitsbaum auf `1a4473a`, Bau uncommittet. Gemessen mit Playwright im
laufenden Storybook (Port 6107), Fenster 1280 × 900, `getBoundingClientRect`
und `getComputedStyle` auf der Wirkung; die „Grundlage“ zum Messen geöffnet.
Story-IDs ohne Präfix `v3-patterns-prüfen-facttable--` (`FT`) bzw.
`v3-entitäten-klärung-clarificationcard--` (`CC`). Screenshots
`.playwright-mcp/abn0246-*.png`. Gegen die Spec im Arbeitsbaum geprüft, also
mit den Kriterien, die der Bau selbst umformuliert hat (siehe Offene Punkte H2).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün | `pnpm -s typecheck` Exit 0 · statt `pnpm build` im Arbeitsbaum `pnpm exec storybook build -o /tmp/abn0246-sb --quiet` Exit 0 („Storybook build completed successfully“) · `pnpm -s check:type` Exit 0 („0 older findings“), `--test` „self-test ok“ | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/FactTable.tsx` mit einem Export, `FactTable.stories.tsx` daneben, Titel `v3/Patterns/Prüfen/FactTable` neben `Provenance`, `DiffView`, `Confidence`; Barrel `src/ui/v3/index.ts:304` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm -s check:language` Exit 0 („0 German comment lines“, Selbsttest 14 Fälle), `pnpm -s check:when` Exit 0 (Selbsttest 11 Fälle); `FactTable` trägt beide (`FactTable.tsx:34–40`), `ProvenanceSources` erweitert (`Provenance.tsx:187–190`). Klassen `v3fact__*`, `v3prov__name`, `v3prov__loc`, Story-Namen englisch. Nebenbefund M3 (JSDoc von `Facts` widerspricht dem Code) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `FactTable.tsx`, `Provenance.tsx` und die hinzugefügten Zeilen von `ClarificationCard.tsx` ohne Hex und px; Icongröße `size={14}` aus `IconSize`. px nur im Story-Rahmen (`maxWidth: 760`, `gap: 8/12/16`). `24px` der Trefferfläche steht in `v3.css:4570–4574` (umgezogen aus `.v2clc__factcell`). Kein Status berührt, keine Label-Map. `pnpm -s check:classes`: nur die vier Altfunde (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), kein `v3fact`/`v3prov`. `check:icons`, `check:contrast` Exit 0 | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `FT` `filled`, `without-sources`, `open-source`, `edge`, `in-use` (5) und `CC` `facts-with-sources`, `facts-source-pick`, `facts-in-drawer`, `facts-without-sources` vorhanden; leer, leer nach Filter, lädt, Fehler begründet. **Aber** `in-use` hat keine `Card`: Die Spec verlangt „Zwei Gruppen in einer `Card` mit Abschnittsköpfen … im `Drawer` `md`“, D14 „Tabelle immer in einer Karte“ (M2). Kleiner: `filled` zeigt „Nettobetrag“ statt „Land · Irland“; `open-source` meldet „Geöffnet: Rechnung INV-2026-0412, S. 1, Fußzeile“ statt „…, S. 1“ (H3) | ✗ |
| ↳ Nachprüfung 2026-11-18 | `FT in-use`: Drawer `md` 640 px, je Gruppe eine `Card` mit `CardHead` („Rechnungsposition“, „Geschäftspartner“, unter „Weitere Angaben“ „Beleg“), Rand 1 px, kein Schatten, Abstände `var(--space-4)`. D14 ist erfüllt. Die Story-Zeile der Spec sagt weiter „Zwei Gruppen in **einer** `Card` mit Abschnittsköpfen“, gebaut ist eine Karte je Gruppe (H5). Die Story-Zeilen `Filled`, `OpenSource` und `Edge` passen jetzt zu den Daten (H3 erledigt). Kopfebene der Karten: siehe Zeile §9 | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Schrift: Bezeichnung, Wert, Name, Fundstelle, Zitat, Art, Kopf je 12,5 px (`--fs-ui`), Name auf der Linie der Bezeichnung (Textoberkante 57,4 = 57,4, `FT filled`). Farbe nur Signal: Art, Fundstelle, Zitat, „—“ in `rgb(92, 92, 92)` = `--color-text-muted`, keine Ampel. Wert links mit `tnum` (`lining-nums tabular-nums`). Trefferfläche, Fokus, Hover: Zeilen unten. **V3 verletzt:** Quellnamen als Button stehen zentriert, sobald sie umbrechen: `CC facts-in-drawer` `text-align: center`, Zeilen „Beleg RE-2026-“ 1123,8–1219,9 und „4471“ 1157,3–1186,4 im Button 1109,7–1234 (Screenshot `abn0246-cc-facts-in-drawer-grundlage.png`). Dazu dieselbe Rolle in zwei Gewichten: Quelle als Button 600 (`.v2link`), als Link 400 (M1) | ✗ |
| ↳ Nachprüfung 2026-11-18 | M1 behoben: `.v3prov__name > button { font-weight: 400; text-align: start }` (`v3.css:4552`). `CC facts-in-drawer`: alle Quellnamen 400 und `text-align: start`. Jede Zeile beginnt an der linken Zellkante (Abstand 0 auf allen fünf Zeilen von „Zahlung vom 23.08.2026 · …“), Höhe 24–101,5 px. Link und Button sind gleich schwer (400). Screenshot `abn0246-n-cc-facts-in-drawer.png`. **Neu durch die Behebung von M2, gegen §2a Nr. 5 und A14 („Drawer und Dialog sind eigene Wurzeln: Titel `h2`, darin `h3`“):** In `FT in-use` sind die drei Kartenköpfe `h2` unter dem Drawer-Titel `h2`, weil `CardHead` ohne `headingLevel={3}` steht (`FactTable.stories.tsx:148, 152, 157`; vorher `h3`) (N1) | ✗ |
| ↳ Zweite Nachprüfung 2026-11-18 (N1, H4) | N1 behoben: `FT in-use` hat die Köpfe `h2` „Beruht auf“, darunter `h3` „Rechnungsposition“, „Geschäftspartner“ und „Beleg“ (`headingLevel={3}`, `FactTable.stories.tsx:148, 152, 157`), je 14 px und 600 wie der Kartenkopf. Querscroll in `.v2drawer__b` und im Dokument 0. H4: Link und Button unterstreichen beim Hover gleich (`v3.css:4553`), gemessen in `FT filled`, `FT open-source`, `CC facts-with-sources`, `CC facts-source-pick` und `v3-patterns-prüfen-provenance--rows`; Gewicht bleibt 400, die Zeile bekommt keinen Hintergrund. Rest (H4a): Der Link wechselt dazu die Farbe `rgb(43, 111, 156)` → `rgb(26, 58, 92)` über das globale `a:hover` (`tokens.css:431`), der Button nicht. `typecheck`, `check:type`, `check:when`, `check:language`, `check:icons` und `check:contrast` Exit 0, `check:classes` ohne `v3fact`/`v3prov`, Konsole leer. Screenshot `abn0246-n2-opensource-hover.png` | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | 5 `FT`- und 7 `CC`-Stories (dazu `in-batch-review`, `step`, `by-hand`) bei 1280 px: alle zeigen Inhalt, Konsole nur Vite-`debug` und der React-DevTools-Hinweis. Nachbarn mit geändertem `ProvenanceSources` ohne Fehler: `v3-patterns-prüfen-provenance--rows`, `--edges`, `--in-use`, `v3-entitäten-buchungssatz-bookingreview--in-use`, `--list-full`, `v3-entitäten-buchungssatz-aibookingnotes--sources`, `--source-kinds` | ✓ |
| `FactTable` hat `@when` „Facts with their value and source — the basis of a clarification, of an entry“ und `@instead` auf `FieldList`, `ProvenanceRows`, `DiffView`. Die Nachbarn verweisen zurück (`ProvenanceSources`, `FieldList`) | `FactTable.tsx:35–39`: `@when` „Facts with their value and source — the basis of a clarification, the facts an entry rests on.“ (Sinn gleich, Wortlaut am Ende anders); `@instead` → `FieldList`, `ProvenanceRows`, `DiffView`. Rückverweise `Provenance.tsx:190` („Many facts, each with its sources → FactTable“), `FieldList.tsx:26` („Facts with their source (and certainty) → FactTable“) | ✓ |
| Spalte „Quelle“ nur, wenn ein Fakt eine Quelle hat (`Filled` gegen `WithoutSources`) | `FT filled`: Kopf Bezeichnung · Wert · Quelle, Spuren 217 · 216 · 271 px (1 : 1 : 1,25); `FT without-sources`: Bezeichnung · Wert, Spuren 298 · 416 px (1 : 1,4) | ✓ |
| `value: null` zeigt „—“ mit `title` (`Edge`) | `FT edge`, Zeile „Verwendung“: `<span class="v2muted" title="kein Wert">—</span>`, Farbe `rgb(92, 92, 92)` = `--color-text-muted` | ✓ |
| Zwei Zeilen mit gleicher Bezeichnung ohne React-Warnung über doppelte Keys (`Edge`, Konsole) | `FT edge`: „Land des Lieferanten“ zweimal (Irland laut Beleg, Deutschland laut Geschäftspartner); Konsole ohne Key-Warnung, ohne Fehler | ✓ |
| `locator` hinter dem Namen, grau, ohne Trennzeichen; umbrochen beginnt die Zeile mit der Fundstelle; ohne `locator` nichts (`Filled`, `Edge`) | `FT filled`, `FT edge`: `.v3prov__loc` in `--color-text-muted`, auf der Zeile des Namens dahinter (Name endet x 701, Fundstelle beginnt x 704), kein „·“ im Text. Ohne `locator` („Kreditor 70418, 11 Buchungen, zuletzt 14.10.2026“, „§ 13b Abs. 1 UStG“) steht nur der Name. Umbruch: In `filled`/`edge` bricht bei 1280 px keine Fundstelle um; gemessen in `FT in-use` („S. 1, Fußzeile“: zweite Zeile beginnt bei x 1033 = linke Kante des Namens, mit „Fußzeile“) und `FT edge` bei 700 px („S. 1, Absender“, zwei Zeilen). Screenshots `abn0246-inuse.png`, `abn0246-edge-700.png` | ✓ |
| `onOpen` Button, `href` Link, ohne beides Text. Tab erreicht jede Quelle in Lesereihenfolge, Fokusring sichtbar (`OpenSource`) | `FT open-source`: drei `button.v2link`; `FT filled`/`edge`: `a`; „Kreditor 70418 …“ `span`. Tab: Nordlicht Software Ltd. → Rechnung INV-2026-0412 → Nordlicht Software Ltd. (= DOM- und Lesereihenfolge), dann aus der Story; je `:focus-visible`, Umriss 2 px solid `rgb(59, 143, 196)`, Abstand 2 px, Mittelpunkt nicht verdeckt. Link in `FT filled` ebenso. Klick → `role="status"` „Geöffnet: Rechnung INV-2026-0412, S. 1, Fußzeile“. Screenshots `abn0246-opensource-focus.png`, `abn0246-filled-linkfocus.png` | ✓ |
| Trefferfläche des Quell-Buttons ≥ 24 × 24 px, im Browser gemessen (`OpenSource`) | `FT open-source`: 139,1 × 24, 158,0 × 24, 139,1 × 24 px; Links in `filled`/`edge`/`in-use` je 24 px hoch, schmalster 103,9 px („§ 13b Abs. 1 UStG“); umbrochen im Drawer der Rückfrage 43,4–101,5 px hoch | ✓ |
| Kein Querscroll im Drawer `md` und in der Rückfrage-Schritt-Form bei 1280 px, gemessen (`InUse`, `ClarificationCard--FactsInDrawer`) | `FT in-use` (Drawer `md`, 640 px): kein Element mit `scrollWidth > clientWidth`, Tabellen 600 px, rechte Kante aller Nachfahren 1260 ≤ 1280; mit nachgestellter `Card` (M2) 1243 ≤ 1260. `CC facts-in-drawer` (Drawer `sm`, 435 px): `.v2drawer__b` 435/435, Tabelle bis 1252. Schritt-Form (`CC facts-source-pick` zweite Karte, `CC step`): Tabelle 758 px bis x 807 ≤ `.v2clc__main` 840. Dokument überall 0 px Querlauf, `FT edge` auch bei 700/1100/1400/1920 px | ✓ |
| Die Zeile hat kein Hover, nur die Quelle (`Filled`) | `FT filled`: Zeile `v2tbl__row` ohne `is-clickable`/`v2rowlink`; Hintergrund vor und nach Hover über der Bezeichnung `rgba(0, 0, 0, 0)`, `cursor: auto`. Quelle antwortet: Link `rgb(43, 111, 156)` → `rgb(26, 58, 92)`, Button unterstreicht | ✓ |
| Ersetzt `Facts` ohne Funktionsverlust: `onSelect` wie bisher, `href` linkt, Freitext bleibt Text. `InBatchReview`, `Step`, `ByHand` zeigen die Grundlage unverändert bis auf das Icon der Art vor dem Namen | Funktion ✓: `factSource` (`ClarificationCard.tsx:427–438`) setzt `onOpen` nur bei Art, Kennung und `onSelect`, wie vorher `select={f.source.kind && f.source.id ? select : undefined}`; `CC facts-source-pick` drei Buttons, `CC facts-with-sources` drei Links, „laut Hotelrechnung im Anhang“ Text. Darstellung ✗: `CC in-batch-review` und `CC step` haben keine Quellenspalte, `CC by-hand` keine Grundlage, dort ist nichts verändert, sie beweisen den Satz aber nicht (Spec-Mangel unten). In den Rückfrage-Stories mit Quellen ändert sich mehr als das Icon: Quellname als Button 600 statt 400 und bei Umbruch zentriert; vorher `v3cell-link v2clc__pick` mit `font: inherit; text-align: left` (`v3.css:5208`), siehe M1 | ✗ |
| ↳ Nachprüfung 2026-11-18, gegen das vom Spec-Autor nachgetragene Kriterium | `CC facts-with-sources`, `facts-source-pick` und `facts-in-drawer` zeigen keine Art vor dem Namen (`kind: null`, kein `.v3prov__kind`, kein Icon). Der Name steht in 400, links, 12,5 px wie die Bezeichnung, also wie vorher bei `v3cell-link v2clc__pick`. Buttons in `facts-source-pick` und `facts-in-drawer`, Links in `facts-with-sources`, „laut Hotelrechnung im Anhang“ bleibt Text. `CC in-batch-review`, `step` und `by-hand` rendern, die Konsole ist leer. JSDoc von `Facts` und `factSource` (`ClarificationCard.tsx:400–437`) stimmt mit dem Code (M3 behoben) | ✓ |
| `docs/ui-repraesentationen.md` führt die Faktentabelle als gemeinsame Form, mit Datum | §4.4, Absatz „Fakten über Entitäten hinweg (2026-11-18, 0246)“ (`docs/ui-repraesentationen.md:626`), mit Abgrenzung zu `<Entity>Facts` | ✓ |
| S2: Sicherheit aus `resolveStatus("fact_certainty", …)`, Kopf aus `AXIS_LABEL` als `StatusHeader` (`Certainty`) | nicht geprüft | offen, wartet auf L-380/F681 |
| S2: alle fünf Wörter grau, keine Farbe, kein Punkt (`Certainty`) | nicht geprüft | offen, wartet auf L-380/F681 |
| S2: Gültigkeit als Unterzeile mit `DateRange`, drei Formen (`Validity`) | nicht geprüft | offen, wartet auf L-380/F681 |
| S2: Wort der Quellenart aus der Achse `fact_source_kind`, `SOURCE_KIND` nur noch Icon (L-381) | nicht geprüft | offen, wartet auf L-380/F681 |
| Spec-Mangel (Abnehmer): Nachweis-Stories tragen zwei Kriterien nicht | Das Umzugs-Kriterium nennt `InBatchReview`, `Step`, `ByHand`; keine davon hat eine Quelle, das Icon vor dem Namen kann dort nicht erscheinen. Das `locator`-Kriterium nennt `Filled`, `Edge`; dort bricht bei 1280 px keine Fundstelle um. Gemessen wurde ersatzweise in `CC facts-*`, `FT in-use` und `FT edge` bei 700 px | — |
| ↳ Nachprüfung 2026-11-18 | Das Umzugs-Kriterium hat der Spec-Autor nachgetragen (Datum am Kriterium). Das `locator`-Kriterium nennt weiter `Filled`, `Edge`; dort ist der Umbruch bei 1280 px nicht zu sehen, gemessen bleibt `FT in-use` | — |
| Nachprüfung 2026-11-18: Gegenprobe der ✓-Zeilen nach den Änderungen | Wächter erneut: `typecheck`, `check:type`, `check:when`, `check:language`, `check:icons` und `check:contrast` Exit 0, `check:classes` nur die vier Altfunde, `pnpm exec storybook build -o /tmp/abn0246-sb2 --quiet` Exit 0. `FT open-source`: Buttons 135,8 × 24, 154,2 × 24 und 135,8 × 24 px, Tab in Lesereihenfolge, Ring 2 px `rgb(59, 143, 196)`, Hover unterstreicht. `FT in-use` mit Karten: `.v2drawer__b` 640/640, Tabellen 598 und 582 px, rechte Kante innerhalb der Karte (1259 ≤ 1260, 1251 ≤ 1252). Schritt-Form `CC facts-source-pick` 807 ≤ 840, `CC facts-in-drawer` 1252 ≤ 1280. Nachbarn `v3-patterns-prüfen-provenance--rows` und `--in-use`: Button 400, `start`; Konsole leer. Screenshots `abn0246-n-*.png` | ✓ |

Abgenommen von / am: fremde Abnahme (Agent), 2026-11-18 · Ergebnis: **S1 mit
Mängeln, zurück in Arbeit.** Offene Punkte:

- **M1 Quellname als Button zentriert und fett.** `ProvenanceSources` rendert
  `<button className="v2link">` (`Provenance.tsx:207`); `.v2link` setzt
  `font-weight: 600` und lässt die Vorgabe des Browsers `text-align: center`
  stehen, `.v3fact__src :is(a, button)` (`v3.css:4570`) setzt sie nicht zurück.
  Vorher in der Rückfrage `.v2clc__pick { font: inherit; text-align: left }`.
  Mindestens `text-align: start` an der Quelle; ob Button und Link der Quelle
  dasselbe Gewicht tragen (heute 600 gegen 400, auch im Kasten „Kontext“
  derselben Karte 400), ist ein Systementscheid für `ProvenanceSources`.
- **M2 `InUse` ohne `Card`** (`FactTable.stories.tsx:142–160`), gegen Spec und
  D14. Messung mit nachgestellter Karte: kein Querscroll.
- **M3 JSDoc von `Facts`** (`ClarificationCard.tsx:402–406`) sagt „the kind
  stands before the name, in the word of the entity“; `factSource` zeigt nur
  das Icon.
- **H1 Icon der Art ohne Wort in der Rückfrage:** Ausnahme zu „kein Icon ohne
  Wort“ (T8), im Bau gesetzt (Entschieden 1, Nachtrag). Das Label der App trägt
  das Wort, wie im Kasten „Kontext“. Im Drawer `sm` steht das Icon allein auf
  einer Zeile über dem Namen. Bestätigung durch app-f0 oder Owner offen
  (CLAUDE.md §7).
- **H2 Kriterien im Bau umformuliert:** Gegen `1a4473a` hat der Bau die
  Kriterien zu `locator` („mit `·`“, Nachweis `Provenance`-Story), Querscroll
  (`InClarification`) und Umzug („die Art“) sowie Entschieden 1 und 2 geändert.
  Gegen die Fassung von `1a4473a` fiele das `locator`-Kriterium durch. Die
  Änderungen braucht die Freigabe des Spec-Autors bzw. von app-f0.
- **H3 Story-Daten:** `Filled` ohne „Land · Irland“, `OpenSource` mit
  „S. 1, Fußzeile“, lange Bezeichnung in `Edge` 61 statt 60 Zeichen.
- **H4 Hover des Quell-Links** wechselt die Farbe statt zu unterstreichen; die
  Spec sagt „Hover und Fokusring wie jeder `v2link`“ (Teil von M1).

Nachprüfung von / am: fremde Abnahme (Agent), 2026-11-18, nur die ✗-Zeilen
und die betroffenen Hinweise, dazu eine Gegenprobe der ✓-Zeilen · Ergebnis:
**S1 weiter mit einem Mangel, zurück in Arbeit.** M1, M2 und M3 sind behoben.
H1 ist durch die Rücknahme erledigt (keine Art in der Rückfrage), H3 durch
die angepassten Story-Zeilen.

- **N1 Kopfebene in `InUse`** (`FactTable.stories.tsx:148, 152, 157`): Die
  Kartenköpfe sind `h2` im Drawer mit Titel `h2`. Nach §2a Nr. 5 gehört darin
  `h3`, also `CardHead … headingLevel={3}`. Die Story ist das Vorbild für die
  Faktenansicht F678.
- **H2 bleibt offen:** Die Nachträge stehen jetzt gesammelt im Abschnitt
  „Nachträge im Bau“ und sind an app-f0 gemeldet. Entschieden 1 weicht damit
  vom „ja“ von app-f0 ab (keine Art in der Rückfrage). Bis app-f0 das
  bestätigt, ist es eine Annahme. Das Umzugs-Kriterium hat der Spec-Autor nach
  der ersten Abnahme geändert. Nachgeprüft wurde gegen die neue Fassung.
- **H4 bleibt Hinweis:** Es ist kein S1-Kriterium, aber der Satz im Verhalten
  und der Code weichen ab. Satz oder `ProvenanceSources` angleichen.
- **H5 neu:** Die Story-Zeile `InUse` nennt eine Karte mit Abschnittsköpfen,
  gebaut ist eine Karte je Gruppe. Die Zeile angleichen.
- **H6 neu:** `.v3prov__name > button` gilt für jede `ProvenanceSources`-Liste.
  In `Provenance`, `BookingReview` und `AiBookingNotes` steht ein Quell-Button
  jetzt in 400 statt 600. Das ist ein Entscheid über das ganze Set und steht
  bisher nur im CSS-Kommentar. Er gehört mit Datum in die Guideline oder in
  `ui-repraesentationen.md` (CLAUDE.md §3).
- **`tnum` auf der ganzen Wertzelle** (breiter Bindestrich): Altlast aus 0238,
  Hinweis, kein Mangel.

Zweite Nachprüfung von / am: fremde Abnahme (Agent), 2026-11-18, N1 und H4 ·
Ergebnis: **S1 abgenommen.** Alle S1-Kriterien sind ✓, die vier S2-Kriterien
warten auf L-380/F681. N1 ist behoben. H5 ist angeglichen (Story-Zeile
`InUse`), H6 steht mit Datum in `docs/ui-repraesentationen.md:636`
(„Ein Quellname, eine Gestalt“). Offen und nicht blockierend:

- **H2:** Abgenommen unter der Annahme, dass app-f0 Entschieden 1 in der
  Fassung des Nachtrags bestätigt (keine Art in der Rückfrage). Widerspricht
  app-f0, ist das Umzugs-Kriterium neu zu prüfen.
- **H4a:** Beim Hover unterstreichen Link und Button gleich. Nur der Link
  wechselt zusätzlich in `--color-primary`, über das globale `a:hover`
  (`tokens.css:431`). Der Absatz „Ein Quellname, eine Gestalt“ nennt nur die
  Unterstreichung. Code oder Absatz angleichen.
