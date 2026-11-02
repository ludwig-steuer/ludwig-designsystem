# 0238 · ClarificationCard: Grundlage mit Spalte „Quelle“

| | |
|---|---|
| Status | spec |
| Stufe | `entities/clarification/` (Erweiterung von `ClarificationCard`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein, Fakten einer Rückfrage mit Verweis auf Beleg, Konto und Buchung |
| Quelle | llcto 2026-11-02, DS-Wunsch aus App-F619 („Rückfragen in Kanzlei-Sprache“, Owner 2026-11-02), App-Behelf P73 (`docs/topics/web-ui-offen.md`) |
| Ersetzt | App-Behelf U4 aus F619: `clarificationFactsMarkdown` schreibt die Fakten als Markdown-Tabelle in `text` und gibt der Karte `facts: []` (`modules/batch-review/domain/clarification-facts-markdown.ts`, Schritt-Form `Step2List.tsx`) |
| Blockiert | F619-Folge-Spec: verlinkte Quelle am Sachverhalt, in der Expertensicht (`Step2`, `variant="card"`) und im Drawer „Fragen dieses Stapels“ |
| Spec von / am | Designer-Sitzung, 2026-11-02 |

## Ziel

Ludwig nennt in einer Rückfrage seine Fakten („Betrag 1.234,56 €“, „Rechnungsdatum
14.08.2026“). Heute steht unter „Grundlage“ nur Bezeichnung · Wert. Woher ein Wert
kommt, sieht die Steuerfachangestellte nicht und kann es nicht mit einem Klick
prüfen. Künftig steht daneben die Quelle („Beleg RE-2026-0117“, „Konto 1200“,
„Buchung 4711“). Wo die App die Quelle auflösen kann, öffnet sie per Klick denselben
Drawer wie die Belege und Konten unter „Weitere Quellen“. Die Frage wird damit
prüfbar, ohne die Karte zu verlassen.

## Einordnung

- **Wiederverwenden:**
  - `FieldList`: `@when` „Master data and properties of an item“. Trägt zwei
    Spalten, keine dritte.
  - `EvidenceTable` und `Pick` (intern in `ClarificationCard.tsx`): zeichnen die
    Quellen der Frage schon als kompakte Tabelle. `Pick` verlinkt per `onSelect`
    oder `href`. Genau dieses Verhalten ist gewünscht.
- **Erweitert, weil:** §3 Regel 2. `ClarificationCard` deckt den Fall zu vier
  Fünfteln ab. Es fehlt eine Angabe am Fakt, und die ist eine wiederkehrende
  Designentscheidung: drei geplante Verwendungen laut F619 (Sachverhalt,
  Expertensicht, Drawer) und dazu die Schritt-Form.
- **Zuschnitt:**
  - Kein neuer Export. `facts[]` bekommt das optionale Feld `source`.
  - Der Block „Grundlage“ zeichnet die Fakten als kompakte Tabelle aus
    `EvidenceTable` statt als `FieldList`, siehe Offene Frage 1.
- **Setzt auf:** `Table` (`density="compact"`, `HeadRow`, `Row`) über
  `EvidenceTable`, `Pick` für die Quelle und `Block` für den Kopf „Grundlage“.

## Schnittstelle

Änderung an `ClarificationVM` (Prop `c` von `ClarificationCard`):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `facts[].source` | `ClarificationFactSource \| null` | nein | Woher der Wert kommt. Ohne `source` bleibt die Zelle leer. Hat **kein** Fakt eine Quelle, entfällt die Spalte | `FactsWithSources`, `FactsWithoutSources` |
| `ClarificationFactSource.label` | `string` | ja | der Text in der Zelle, im Wortlaut der App („Beleg RE-2026-0117“, „Konto 1200 · Bank“) | `FactsWithSources` |
| `ClarificationFactSource.kind` | `EvidenceKind` | nein | mit `id` wird die Quelle ein Verweis wie eine Zeile unter „Weitere Quellen“ | `FactsSourcePick` |
| `ClarificationFactSource.id` | `string` | nein | Schlüssel für `onSelect({ kind, id })`. Ohne `kind` und `id` ist die Quelle reiner Text | `FactsSourcePick` |
| `ClarificationFactSource.href` | `string` | nein | ohne `onSelect` an der Karte verlinkt die Quelle hierhin, wie `EvidenceRow.href` | `FactsWithSources` |

`onSelect` an der Karte bleibt unverändert, `(item: { kind: EvidenceKind; id: string }) => void`.
Die App öffnet damit schon heute den Drawer zu einer Quelle (F255).

**Typen aus `src/ludwig/`:**
- F619 legt `ClarificationFact = { label: string; value: string; source?: string }`
  an (`accounting-cases/domain/clarification-facts.ts`). Dort ist `source`
  **Freitext**, denn `facts_json.source` wird nicht geprüft (F619, „Nicht im
  Umfang“).
- Die App kann heute also nur `{ label: source }` übergeben: Die Spalte steht,
  aber nichts verlinkt.
- Einen Verweis gibt es erst, wenn der Fakt Art und Schlüssel seiner Quelle
  trägt → Befund **L-377**.

**Kann bewusst nicht:**
- Sie löst keinen Freitext auf. Ob „RE-2026-0117“ ein Beleg der Frage ist,
  weiß nur die App.
- Sie prüft nicht, ob die Quelle auch unter „Weitere Quellen“ steht.
- Sie gibt einem Fakt keine Farbe.

## Verhalten

- **Spalten:** Bezeichnung · Wert · Quelle.
  - Text links, auch der Wert. Er ist Freitext („1.234,56 €“,
    „14.08.2026“, „monatlich“) und hat deshalb keine Zahlenausrichtung, trägt
    aber `tnum`.
  - Die Quelle steht rechts außen und wird nicht gekürzt, sondern bricht um.
- **Verweis:** Eine Quelle mit `kind` und `id` ist ein `Pick` mit
  `inRow={false}`.
  - Nur die Zelle ist Ziel, nicht die ganze Zeile: Die Zeile ist der Fakt, die
    Quelle ist nur der Weg dorthin.
  - Hover und Fokus kommen von `Pick`.
  - Trefferfläche mindestens 24 px hoch. Gemessen wird in der Zeile `compact`.
  - Eine Quelle ohne `kind`/`id` und ohne `href` ist Text ohne Hover.
- **Tastatur:** Der Verweis ist ein gewöhnliches Fokusziel in der Lesefolge.
  `Enter` ruft `onSelect` auf, das öffnet den Drawer. `Esc` im Drawer führt
  zurück.
- **Beide Formen:**
  - Karte und Schritt-Form zeigen denselben Block; nur die Kopfebene unterscheidet
    sich wie heute (`level` 3 oder 4).
  - In der Schritt-Form öffnet `onSelect` denselben Drawer wie die Zeilen im
    Seitenpanel.
- **Zustände:** Die Karte hat ihre fünf Zustände schon (0214).
  - Für diesen Block gilt: Ohne Fakten fehlt er ganz, wie heute.
  - Laden und Fehler gibt es hier nicht, denn der Block lädt nichts.
  - Einen Filter gibt es nicht.
- **Server/Client:** unverändert. Die Karte ist Client-Komponente; `Pick` ruft
  `onSelect`.

## Stories

Titel `v3/Entitäten/Klärung/ClarificationCard`, dazu kommen vier Stories:

| Story | Beweist |
|---|---|
| `FactsWithSources` | drei Spalten, gemischt: Quelle als Verweis (`href`), als reiner Text und leer. Realistische Werte (Betrag, Datum, Kontonummer) |
| `FactsWithoutSources` | Altbestand ohne `source`: keine Spalte „Quelle“, kein leerer Platz |
| `FactsSourcePick` | Rundlauf `onSelect` mit `useState`: Ein Klick auf „Beleg RE-2026-0117“ zeigt die gewählte Quelle unter der Karte an. Dasselbe in der Schritt-Form |
| `FactsInDrawer` | im Einsatz: Drawer `sm` „Fragen dieses Stapels“. Langer Quelltext, ein Wert über zwei Zeilen, bei 1280 px |

Ausgeschlossen: lädt und Fehler, weil der Block nichts lädt. Leer nach Filter
entfällt, es gibt keinen Filter.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Quelle zugleich unter „Weitere Quellen“ markieren (gleiches Ziel, ein Zeichen) | `ClarificationFactSource.cited?` | Owner wünscht den Querverweis, oder Doppelungen fallen in der Abnahme auf |
| Wert als Betrag rechtsbündig | `facts[].amount?: number` mit `currency` | die App liefert Beträge strukturiert statt als Text (Folge von L-377) |

## Offene Fragen

1. **Eine Form für die Grundlage.** Default: immer die kompakte Tabelle, auch
   ohne Quelle (dann zwei Spalten mit Kopf „Bezeichnung · Wert“). Bisher war es
   eine `FieldList`. Grund: In der Liste „Fragen dieses Stapels“ stehen alte
   Fragen ohne und neue mit Quelle untereinander, und derselbe Block soll gleich
   aussehen.
   - Die Alternative: `FieldList` ohne Quelle, Tabelle mit Quelle.
   - Ohne Antwort gilt der Default.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `facts[].source` wie in der Schnittstelle: Text, Verweis per `href`, Verweis per `onSelect`, leer (`FactsWithSources`, `FactsSourcePick`)
- [ ] Ohne jede Quelle keine dritte Spalte und keine Lücke (`FactsWithoutSources`)
- [ ] Ein Klick auf eine Quelle mit `kind`/`id` ruft `onSelect({ kind, id })` auf, auch in der Schritt-Form (`FactsSourcePick`)
- [ ] Per Tastatur: `Tab` erreicht die Quelle in der Lesefolge, `Enter` löst sie aus, der Fokusring ist sichtbar (`FactsSourcePick`)
- [ ] Nur die Quell-Zelle reagiert auf Hover, nicht die Zeile; eine Quelle als reiner Text hat keinen Hover (`FactsWithSources`)
- [ ] Trefferfläche der Quelle ≥ 24 px hoch, gemessen (`FactsInDrawer`)
- [ ] Im Drawer `sm` bei 1280 px: nichts läuft über, lange Quelle und langer Wert brechen um (`FactsInDrawer`)
- [ ] Kontrast: Text ≥ 4,5:1, Verweis ≥ 4,5:1 auf der Karte, gemessen
- [ ] Ersetzt den App-Behelf U4 (Markdown-Tabelle in `text`) ohne Funktionsverlust: Bezeichnung, Wert, Quelle, Reihenfolge der Fakten, Nachfrage-Zeile aus `followUpPresentation` als erste Zeile

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
