# 0246 · FactTable: Fakten mit Wert, Sicherheit und Quelle, eine Form für Rückfrage und Abnahme

| | |
|---|---|
| Status | spec |
| Stufe | `patterns/` (Gruppe Prüfen), dazu Erweiterung von `ProvenanceSources` (`patterns/Provenance.tsx`) und Umzug in `entities/clarification/ClarificationCard.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, sobald dort geprüft wird: „Schadenort · Hamburg · belegt · Schadenmeldung S. 1“. Ein Prozesswort (Sicherheit, Quelle), keine Entität |
| Quelle | app-f0, F678-Brief (App `docs/backlog/F678-fact-view-design-brief.md`, Nachtrag 2026-11-18): „Eine Darstellung für die Faktenzeile (Bezeichnung, Wert, Sicherheit, Quellen)“. Konzept App `docs/concepts/booking-process.md` §7, Datenform F668 T668.2 |
| Ersetzt | im Set die lokale Funktion `Facts` in `ClarificationCard.tsx` (0238). In der App heute nichts, die Faktenansicht F678 ist noch nicht gebaut |
| Blockiert | die DS-Seite der Faktenansicht F678 (eigene Spec nach der Owner-Durchsicht des Ablaufs) |
| Wartet auf | Schritt 2: L-380 (Typen und Achse `fact_certainty` im Spiegel) |
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
export interface FactRow {
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
| `facts` | `readonly FactRow[]` | ja | Die Fakten in der Reihenfolge des Aufrufers. Das Pattern sortiert nicht und gruppiert nicht: Gruppen (Beleg · Rechnungsposition · …) setzt der Aufrufer als je eine Tabelle unter seinen Kopf. Leere Liste → `null` | `Filled`, `InUse` |
| `FactRow.key` | `string` | ja | Stabiler Schlüssel (Faktschlüssel, bei der Rückfrage der Index). Bezeichnungen dürfen sich wiederholen: Ein Widerspruch steht als zwei Zeilen mit derselben Bezeichnung (F678-Nachtrag) | `Edge` |
| `FactRow.label` | `string` | ja | Bezeichnung in Fachsprache aus der App („Land des Lieferanten“), nie der Schlüssel | `Filled` |
| `FactRow.value` | `string \| null` | ja | Der Wert, wie die App ihn formuliert, mit Ziffern in `tnum`. `null` → „—“ in `--color-text-muted` mit `title="kein Wert"` | `Edge` |
| `FactRow.sources` | `readonly ProvenanceSource[]` | nein | Die Quellen untereinander über `ProvenanceSources`. Die Spalte „Quelle“ gibt es nur, wenn mindestens ein Fakt eine Quelle hat (wie 0238) | `Filled`, `WithoutSources`, `OpenSource` |
| `ProvenanceSource.locator` | `string \| null` | nein | **Neu.** Die Fundstelle in der Quelle, vom Aufrufer formuliert: „S. 2“, „Position 3“, „Feld Rechtsform“. Steht hinter dem Namen, in `--color-text-muted`, mit `·` getrennt. Das Pattern liest keine Koordinaten | `Filled`; in `Provenance.stories` eine Zeile |
| `FactRow.certainty` (S2) | `Certainty \| null` aus `@/ludwig/modules/fact-records/domain/fact` (F668 `CERTAINTIES`) | nein | Wort aus `resolveStatus("fact_certainty", …)`. Grau, ohne Farbe, Punkt oder Prozent. Kopf „Sicherheit“ (`AXIS_LABEL.fact_certainty`) als `StatusHeader` mit Legende. Die Spalte gibt es nur, wenn ein Fakt eine Sicherheit hat | `Certainty` |
| `FactRow.validFrom` / `validTo` (S2) | ISO-Datum | nein | Unterzeile unter dem Wert: „gilt ab 01.01.2026“, „gilt bis 31.12.2026“, beide → „gilt 01.01.2026–31.12.2026“ (`DateRange`) | `Validity` |

Typen: `ProvenanceSource` aus `patterns/Provenance`. `Certainty` aus dem
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
  `kind` = Icon und Wort aus `ENTITY_ICON` über `PANEL_ICON` (fehlt die Art,
  steht kein Zeichen), `label`, `href`, `onOpen` = `select({ kind, id })`, wo
  Art, Kennung und `onSelect` da sind. Damit steht an der Quelle neu die Art
  vor dem Namen („Beleg · Rechnung 93846778“), siehe Offene Frage 1. Sonst
  ändert sich nichts: Ort, Einklappen (0241) und Reihenfolge bleiben.
- **S2 Sicherheit:** Das Wort steht in `--color-text-muted` (#5C5C5C, 6,7:1
  auf Weiß). Kein neuer Token. `unknown` mit `value: null` zeigt „—“ und
  „unbekannt“.

## Stories

`v3/Patterns/Prüfen/FactTable`. Pattern-Untergrenze 4, hier 6 in S1 und 8
nach S2. Daten fiktiv nach F678: eine Software-Rechnung aus Irland.

| Story | Beweist | Schritt |
|---|---|---|
| `Filled` | Rechnungsposition-Fakten (Leistung „Software-Abonnement“, Art „Leistung, kein Gegenstand“, Verwendung „eigener Verbrauch“, Land „Irland“), Quellen mit Art, Fundstelle „S. 1“ und Zitat | S1 |
| `WithoutSources` | Nur Bezeichnung und Wert, die Spalte „Quelle“ fehlt | S1 |
| `OpenSource` | Rundlauf `onOpen` mit `useState`: Ein Klick auf „Rechnung INV-2026-0412“ zeigt „Geöffnet: Rechnung INV-2026-0412, S. 1“ unter der Tabelle (Live-Region) | S1 |
| `Edge` | Lange Bezeichnung (60 Zeichen), langer Wert, drei Quellen untereinander, langes Zitat, `value: null`, zwei Zeilen mit derselben Bezeichnung (Widerspruch: „Land des Lieferanten“ Irland laut Beleg, Deutschland laut Geschäftspartner) | S1 |
| `InUse` | Zwei Gruppen in einer `Card` mit Abschnittsköpfen „Rechnungsposition“ und „Geschäftspartner“, darunter `Disclosure` „Weitere Angaben 4“ mit einer dritten Tabelle, im `Drawer` `md` | S1 |
| `InClarification` | Die Rückfrage-Karte mit offener „Grundlage“, gleiche Daten wie in `Filled`. Beweist den Umzug (ein Fakt sieht gleich aus) | S1 |
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
| Die Art der Quelle aus einer Achse statt aus `SOURCE_KIND` | keine Prop, das Wort kommt aus der Registry | L-381 erledigt |

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
- [ ] `locator` steht hinter dem Namen, grau, mit `·`. Ohne `locator` steht nichts (`Filled`, `Provenance`-Story)
- [ ] `onOpen` ist ein Button, `href` ein Link, ohne beides Text. Tab erreicht jede Quelle in Lesereihenfolge, Fokusring sichtbar (`OpenSource`)
- [ ] Trefferfläche des Quell-Buttons ≥ 24 × 24 px, im Browser gemessen (`OpenSource`)
- [ ] Kein Querscroll im Drawer `md` und in der Rückfrage-Schritt-Form bei 1280 px Innenbreite, gemessen (`InUse`, `InClarification`)
- [ ] Die Zeile hat kein Hover, nur die Quelle (`Filled`)
- [ ] Ersetzt `Facts` in `ClarificationCard.tsx` ohne Funktionsverlust: Quelle mit Art und Kennung öffnet über `onSelect` wie bisher, Quelle mit `href` linkt, Freitext bleibt Text. Die Stories `InBatchReview`, `Step` und `ByHand` der Rückfrage zeigen die Grundlage unverändert bis auf die Art vor dem Namen
- [ ] `docs/ui-repraesentationen.md` führt die Faktentabelle als gemeinsame Form von Rückfrage und Faktenansicht, mit Datum

Variabel, S2 (nach L-380):

- [ ] Die Sicherheit kommt aus `resolveStatus("fact_certainty", …)`, der Kopf aus `AXIS_LABEL` als `StatusHeader` mit Legende. Keine Wortliste im Set (`Certainty`)
- [ ] Alle fünf Wörter grau, keine Farbe, kein Punkt (`Certainty`, Blick)
- [ ] Gültigkeit als Unterzeile mit `DateRange`, drei Formen (`Validity`)
- [ ] `SourceKind` kennt die neuen Arten aus F668 `FACT_SOURCE_KINDS` und `accounting_review` mit Wort und Icon (Offene Frage 2)

## Offene Fragen

1. **Steht die Art der Quelle auch in der Rückfrage vor dem Namen?** Heute
   zeigt die Grundlage nur „Rechnung 93846778“. *Ohne Antwort:* ja. Ein Fakt
   sieht überall gleich aus, und die Faktenansicht braucht die Art („Regel“,
   „Gesetz“, „Geschäftspartner“ sagen sonst nichts).
2. **Wörter der neuen Quellenarten (S2), Wortentscheid für den Owner über
   app-f0:** `business_partner` „Geschäftspartner“ · `client_profile`
   „Mandant“ · `contract` „Vertrag“ · `ledger_account` „Konto“ ·
   `external_service` „Externe Prüfung“ · `default` „Standardwert“ ·
   `accounting_review` „Kanzlei“. Name und Zeit stehen im `label`.
   *Ohne Antwort:* so, die Icons aus `ENTITY_ICON`, wo es die Entität gibt.
3. **Hebt sich „angenommen“ in der Form ab** (etwa kursiv), damit man es
   unter zwölf Fakten findet? *Ohne Antwort:* nein. Das Wort genügt, und die
   Zahl der Annahmen steht an der Zeile der Abnahme-Liste (F678 W4). Eine
   zweite Form für eine neutrale Stufe wäre ein Signal ohne Kritikalität.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …
