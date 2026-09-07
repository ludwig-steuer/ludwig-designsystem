# 0069 · StateMachine — die Landkarte einer Status-Achse

| | |
|---|---|
| Status | fertig |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `patterns/` — Gruppe Prozess, neben `Process` und `Timeline` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald ein Schadenfall Zustände und Übergänge hat, die jemand erklärt haben will |
| Quelle | Anfrage Owner 2026-09-04 („visuell die Statemachine anschauen, aktuellen State hervorheben, Klick erklärt den State, optional Beschreibung des Prozesses") · **Z1** und **Z3** in `design-guidelines.md` · Vorlage der Daten: `docs/topics/datev.md` R19 (Tabelle `State \| Dran ist \| Hinein durch \| Hinaus durch` für `zyklus_stapel`) und die „Übergänge:"-Blöcke in `status-registry.ts` |
| Ersetzt | nichts — ergänzt Z3 um eine vierte Erklärstufe (Label → Hover → Liste → **Bild**). Die Z1-Tabellen in `ludwig/app/docs/topics/` sind heute die einzige Darstellung von Übergängen, und die sieht keine Nutzerin |
| Blockiert | nichts. Der Umschalter Liste/Diagramm im `StatusInfoDialog` (Ausbau) wartet auf Befund 1 |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Die Prüferin sieht am Stapel „Kanzlei prüft" und fragt: „Was war davor, was
kommt danach, und wohin kann ich ihn zurückschicken?" Heute bekommt sie dafür
die Liste im `StatusInfoDialog` — elf Zeilen, alphabetisch nach Registry, ohne
Pfeil. Ob `failed` zurück nach `ready` geht oder nach `review`, steht in einer
Markdown-Tabelle in `docs/topics/datev.md`, die nur Entwickler lesen. Ludwig
arbeitet an jeder Kette mit einer Status-Achse (**70** in der Registry, gezählt am 2026-09-06 — die Zahl wächst mit jeder App-Runde), und
keine davon hat ein Bild.

Neu: **eine** Komponente, die eine Achse als Zustandsdiagramm zeigt — Boxen
mit den Wörtern der Registry, Pfeile für die Übergänge, der aktuelle Zustand
farbig hervorgehoben, ein Klick auf jede Box erklärt sie (Bedeutung, DB-Wert,
Hinein durch, Hinaus durch), darüber optional ein Absatz zum ganzen Prozess.
Fehlen die Übergänge — und das tun sie heute für fast alle 70 Achsen —, stehen
die Boxen in Registry-Reihenfolge nebeneinander, mit dem Hinweis, dass die
Übergänge nicht hinterlegt sind. Das Bild lügt nicht, wo die Daten fehlen.

## Einordnung

- **Wiederverwenden:** alle Teile stehen, das Bild fehlt.
  - `StatusInfoDialog` (`@when All values of one status axis explained, with
    badge and DB value`) — die Liste, ohne Übergänge und ohne Reihenfolge.
    Bleibt die dritte Stufe von Z3; das Diagramm ist genau das, was sie nicht
    zeigen kann.
  - `Process` (`@when Process state in the detail header with raw states and
    loops`) — vier **Phasen**, aus dem Zustand abgeleitet: sagt, *wo das
    Objekt steht*, nicht, *welche Wege es gibt*. Z7 hält beides auseinander;
    `StateMachine` ist die Landkarte, `ProcessStepper` die Positionsanzeige.
  - `StepRail` (`@when Multi-step review … on the left`) — Schritte *meiner*
    Arbeit, nicht Zustände des Objekts.
  - `Timeline` (`@when „Why does this stand the way it stands?"`) — die
    Vergangenheit eines Objekts, nicht die möglichen Wege.
  - `Popover` (`@when A small field on click that does not block the page`)
    — die Erklärung je Box. `Badge` und `code` darin wie in
    `StatusInfoDialog`.
  - `@/ludwig/ui/status/status-registry` (`STATUS_REGISTRY`, `resolveStatus`, `axisLegend`) — Label, Ton, Erklärtext, DB-Wert je
    Zustand (Z2). Die Komponente trägt keinen einzigen Statustext.
- **Neu, weil:** `spec-schreiben` §3.4 — eigener Zustand (welche Box offen
  ist) und Tastaturweg (Tab durch die Boxen, Enter öffnet, Esc schließt) auf
  mindestens zwei Screens: der Status-Erklärung jeder Achse (Z3, aus dem (i)
  heraus) und dem Stapel-Detail (`[year]/stapel/[batchId]`, wo heute nur die
  Phasen stehen). Dazu die Technik-Sichten (`/dev/gallery`, Admin).
- **Zuschnitt:** eine Datei `patterns/StateMachine.tsx`, ein Export
  `StateMachine` plus Typ `StateTransition`. Layout und Kanten sind reine
  Funktionen in derselben Datei — kein zweites Modul, keine Bibliothek. Kein
  eigener Dialog: wer das Bild modal will, legt es in `Dialog`.
- **Setzt auf:** `Popover` · `Badge` · `status-registry` (`STATUS_REGISTRY`,
  `resolveStatus`) · `AXIS_SOURCE` **aus dem Spiegel**, dorther, wo `StatusInfoDialog` es holt (seit 2026-09-06 `@/ludwig/ui/status/status-registry`, re-exportiert über `patterns/entity-icons`; 0105 erledigt)
  · SVG für die Kanten (wie `BarChart` zeichnet, ohne Bibliothek).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `axis` | `StatusAxis` | ja | Welche Achse — Label, Ton, Erklärtext und DB-Wert je Zustand kommen aus der Registry, nie als Prop | `Branching` |
| `transitions` | `readonly StateTransition[]` | nein | Die Übergänge. Ohne: die Zustände stehen in einer Reihe ohne Pfeile, mit Hinweis | `Filled` · `Sequence` |
| `states` | `readonly string[]` | nein | Teilmenge und Reihenfolge der Zustände. Default: alle Keys der Achse in Registry-Reihenfolge. Nimmt Pseudowerte (`in_pipeline`) und Altstufen (`proposed`) heraus und legt fest, was links steht | `Filled` (Reihenfolge) · `Sequence` (Teilmenge) |
| `current` | `string \| null` | nein | Der Zustand, in dem das Objekt steht — die eine farbige Box. `null`/fehlend: keine Hervorhebung, reine Nachschlage-Ansicht | `Filled` · `Branching` (ohne) |
| `description` | `string` | nein | Ein Absatz zum ganzen Prozess, über dem Diagramm. Ohne Prop kein Absatz | `Filled` · `Sequence` (ohne) |

```ts
export interface StateTransition {
  /** Registry key of the source state. */
  from: string;
  /** Registry key of the target state. */
  to: string;
  /** What triggers it — „Freigabe", „Retry", `start_agent_run`. Shown on the arrow (hover) and in the explanation of both states. */
  label?: string;
}
```

Typen aus `src/ludwig/`: keine — `StatusAxis` und `StatusDescriptor` kommen
aus `@/ludwig/ui/status/status-registry` (dem Spiegel der App-Registry; die Set-Kopie ist seit 0080 weg).
`StateTransition` gibt es weder in `src/ludwig/` noch in der App: **Befund 1**.
Bis die App die Übergänge als Daten liefert, tragen die Stories sie —
abgeschrieben aus der Z1-Tabelle (`datev.md` R19) und den „Übergänge:"-
Kommentaren der Registry. Der Registry-Spiegel wird dafür **nicht** angefasst
(V13: er bleibt Spiegel, keine zweite Wahrheit).

GLOSSARY: „State/Zustand" und „Achse" sind eingeführt (Z1, Z2). Für
„Übergang" gibt es keinen Eintrag — **Befund 3**. Im Code `transition`, im
Label die Wörter der Z1-Tabelle: „Hinein durch", „Hinaus durch".

**Was die Komponente nicht kann (bewusst):**

- **Übergänge erfinden oder herleiten.** Sie liest keine Kommentare, keine
  Docs, keine Registry-Reihenfolge als Übergang. Ohne `transitions` gibt es
  keine Pfeile — nur die Reihe mit dem Hinweis (R16: leer statt geraten).
- **Beliebige Graphen setzen.** Kein Dagre, kein Kräftemodell. Die Spalte
  folgt dem längsten Vorwärtspfad, die Reihenfolge in der Spalte der
  `states`-Reihenfolge (Verhalten). Decke: rund zwölf Zustände, die größte
  Achse hat elf. Wer ein anderes Bild will, ordnet `states` um.
- **Selbst-Übergänge zeichnen** (`from === to`). Sie stehen nur im Popover
  unter „Hinaus durch". Ausbau.
- **Sagen, wer dran ist.** Die Spalte „Dran ist" der Z1-Tabelle trägt der
  `Baton` aus `Process`, nicht diese Komponente. Ausbau.
- **Phasen zeigen.** Das ist `ProcessStepper` (Z7).
- **Laden, zählen, navigieren.** Keine Zähler je Zustand, kein Klick, der
  eine Liste filtert — Ausbau. Kein Fetch, kein Router.
- **Übergänge auslösen.** Nur ansehen. Handlungen liegen am Objekt
  (`ActionBar`), nicht an der Landkarte.

## Verhalten

- **Reihenfolge der Zustände:** `states`, sonst die Keys der Achse in
  Registry-Reihenfolge. Jeder Key aus `transitions` oder `current`, der in
  dieser Liste **nicht** vorkommt, wird hinten angehängt und als Rohwert
  gezeigt (neutrale Box, Key als Label in `code`, ohne Erklärtext) — dieselbe
  Regel wie `resolveStatus`: ein neuer DB-Wert fällt auf, statt still zu
  verschwinden.
- **Ohne `transitions` — die Reihe:** alle Zustände in einer Zeile, zwischen
  den Boxen ein gepunkteter Verbinder **ohne** Pfeilspitze (er sagt
  „Reihenfolge", nicht „Übergang"). Unter der Reihe eine gedämpfte Zeile:
  „Reihenfolge nach Registry, Übergänge nicht hinterlegt." Der Abschnitt fehlt,
  sobald `transitions` da ist.
- **Mit `transitions` — die Landkarte:**
  - Ein Übergang ist **vorwärts**, wenn `index(to) > index(from)` in der
    Reihenfolge oben, **rückwärts**, wenn kleiner, **selbst**, wenn gleich.
  - **Spalte (Rang):** `rank(s) = 0`, wenn kein Vorwärts-Übergang in `s`
    mündet, sonst `max(rank(from) + 1)` über alle Vorwärts-Übergänge nach
    `s`. In Reihenfolge berechnet — jeder `from` steht vor seinem `to`, also
    reicht ein Durchlauf. Rückwärts-Übergänge ändern den Rang nicht.
  - **Zeile:** Zustände gleichen Rangs stehen untereinander, in
    `states`-Reihenfolge.
  - **Kanten:** vorwärts zwischen Nachbarspalten als Linie vom rechten Rand
    der Quelle zum linken Rand des Ziels (Bézier, wenn die Zeilen
    verschieden sind); vorwärts über eine oder mehr Spalten hinweg als Bogen
    **über** dem Diagramm; rückwärts als Bogen **unter** dem Diagramm, auch
    innerhalb einer Spalte. Pfeilspitze am Ziel als SVG-`marker`, nie als
    Zeichen (T9). Zwei Übergänge zwischen denselben Zuständen in
    Gegenrichtung (`processed ⇄ review_needed`) ergeben so zwei getrennte
    Wege — einer über die Mitte, einer unten herum — und decken sich nie.
  - `label` eines Übergangs als `<title>` an seinem Pfad (Hover); der
    lesbare Ort ist das Popover beider Zustände.
- **Raster ohne Messung:** Boxen fester Größe, Maße als CSS-Variablen in
  `v3.css` (Spaltenbreite, Zeilenhöhe, Spalten- und Zeilenabstand, produktives
  Register). Die Boxen liegen im CSS-Grid (`grid-column` = Rang + 1,
  `grid-row` = Zeile + 1), die Kanten in **einem** SVG darüber, dessen
  `viewBox` dieselben rem-Einheiten trägt. Kein `ResizeObserver`, kein
  `getBoundingClientRect`, keine Bibliothek. Breite = Ränge × Spaltenmaß;
  wird die Karte schmaler, scrollt der Container horizontal
  (`overflow-x: auto`), nie die Seite.
- **Die Box:** ein `<button type="button">` mit dem Registry-Label (bis zwei
  Zeilen, dann `…` mit `title`) und dem DB-Wert darunter in `code`, gedämpft
  — wie die Zeile im `StatusInfoDialog`. Alle Boxen neutral (Rand
  `--color-border`, Fläche Karte); Farbe trägt nur die aktuelle (V6).
- **`current`:** die Box in ihrem Registry-Ton (`kind` → Fläche getönt, Rand
  in der Tonfarbe) und mit dem Wort „aktuell" als dritter Zeile (V7: nie Farbe
  allein), `aria-current="step"`. Kanten bleiben neutral — der Weg ist keine
  Kritikalität.
- **Klick / Enter / Space** auf eine Box öffnet ein `Popover` (Box ist der
  `trigger`, hat damit ein Wort — T8): `Badge` im Ton mit Label · DB-Wert in
  `code` · Erklärtext der Registry oder „—" · **Hinein durch:** je
  eingehendem Übergang „Label des Quellzustands · Übergangs-Label" ·
  **Hinaus durch:** je ausgehendem „Übergangs-Label · Label des
  Zielzustands"; Selbst-Übergänge stehen hier unter „Hinaus durch". Ohne
  `transitions` fehlen beide Listen. Zum Schluss gedämpft der Ort des Werts
  (`AXIS_SOURCE[axis]`). `Esc` schließt, ein zweiter Klick auch; immer nur ein
  Popover offen (das ist `Popover`s Sache).
- **Tastatur:** `Tab` läuft die Boxen in Spaltenordnung ab (Rang, dann
  Zeile) — die DOM-Reihenfolge ist die Leserichtung; Hover färbt die Box
  (§2); Fokusring sichtbar (V10). Kein Hotkey, kein Pfeiltasten-Modus: die
  Boxen sind Knöpfe, nicht ein Widget.
- **Barrierefreiheit:** das SVG ist `aria-hidden` — die Pfeile sind
  Illustration; die Information (Hinein/Hinaus) steht als Text im Popover
  jedes Zustands. Kanten in einem Token mit **≥ 3:1** gegen die Karte
  (V10, gemessen, Kontrastwert als Kommentar am Token).
- **`description`:** ein Absatz in Lesegröße über dem Diagramm, linksbündig
  (L4), Stimme nach T1 (die Texte kommen aus den Docs der App und werden
  nicht umgeschrieben). Kein Titel — die Achse benennt der Aufrufer
  (Kartenkopf, Dialogtitel).
- **Zustände:** gefüllt (Landkarte) · leer im Sinne von „ohne Übergänge"
  (Reihe mit Hinweis). *Nicht:* leer nach Filter (kein Filter) · lädt (Daten
  sind statisch, der Aufrufer hält sie) · Fehler (nichts wird geladen; ein
  unbekannter Key ist kein Fehler, sondern eine Rohwert-Box).
- **Server-Component:** Reihenfolge, Ränge und Kanten sind reine Funktionen;
  nur `Popover` ist ein Client-Island — wie `StatusBadge` mit seinem (i).
  Kein `"use client"` in `StateMachine.tsx`.
- **CSS:** Klassen `.v2fsm`, `.v2fsm__lead`, `.v2fsm__grid`, `.v2fsm__state`,
  `.v2fsm__edges`, `.v2fsm__note` in `v3.css`; Präfix `v2fsm` ist heute
  unbelegt (geprüft 2026-09-04). Kein Hex, kein px in TSX.

## Stories

Abgeleitet nach §6. Titel `v3/Patterns/Prozess/StateMachine`. Die
Übergänge stehen als Konstanten in der Story-Datei, abgeschrieben aus
`datev.md` R19 und den Registry-Kommentaren — mit Quellenzeile im Kommentar.

| Story | Beweist |
|---|---|
| `Filled` | `zyklus_stapel`, `states` mit `prepared` zuerst (`prepared, agent, review, ready, exporting, inspection, failed, confirmed, mirrored, closed, cancelled`), die 16 Übergänge aus `datev.md` R19 mit Labels, `current="review"`, `description` aus dem Einleitungsabsatz von R19. Erwartete Spalten (aus der Rangregel gerechnet, nicht von Hand): 0 `prepared`+`cancelled` · 1 `agent`+`review` · 2 `ready` · 3 `exporting` · 4 `inspection`+`failed` · 5 `confirmed` · 6 `mirrored` · 7 `closed`. Fünf Bögen unten (`agent→prepared`, `review→agent`, `ready→review`, `failed→ready`, `failed→review`), **zwei oben** (`exporting→confirmed`, `confirmed→closed`); `prepared→review` ist eine Nachbar-Kante, weil `review` seinen Rang aus genau diesem Übergang zieht — siehe „Eine Abweichung von der Freigabe". „Kanzlei prüft" in Warnton mit „aktuell" |
| `Branching` | `beleg` ohne `states` (Registry-Reihenfolge `pending, in_progress, processed, review_needed, failed`), sieben Übergänge aus dem Registry-Kommentar, **ohne** `current`, ohne `description`. Erwartete Spalten: 0 `pending` · 1 `in_progress` · 2 `processed`+`failed` · 3 `review_needed`. Der Bogen `in_progress→review_needed` oben, `review_needed→processed` und `failed→in_progress` unten; `processed→review_needed` durch die Mitte — das Paar `⇄` als zwei getrennte Wege. Keine Box farbig |
| `Sequence` | `sachverhalt` **ohne** `transitions`, `states` ohne den Pseudowert `in_pipeline`, `current="needs_clarification"`: sechs Boxen in einer Reihe, gepunktete Verbinder ohne Spitze, die Hinweiszeile darunter, „Klärung offen" im Warnton mit „aktuell"; Popover ohne Hinein/Hinaus |
| `Explain` | `Branching`-Daten mit `current="review_needed"`; die Story-Doku beschreibt den Rundlauf: Klick auf „Prüfung nötig" → Popover mit Badge, `review_needed`, dem Erklärtext, **Hinein durch** „In Bearbeitung · Pipeline durch, reparierbare Findings" und „Prozessiert · Revalidierung", **Hinaus durch** „Revalidierung (`update_invoice_extraction`) · Prozessiert", der Ort `client_source_docs_invoices.processing_status`; `Esc` schließt; `Tab` läuft `pending → in_progress → processed → failed → review_needed` |
| `Edge` | `beleg_inbox` (Labels bis „Einordnung fehlgeschlagen", zwei Zeilen), Übergänge aus dem Registry-Kommentar plus drei Ränder: ein Ziel `quarantined`, das die Registry nicht kennt (Rohwert-Box hinten, neutral, `code`-Label), ein Selbst-Übergang `pending_classification→pending_classification` („Erneut anstoßen", nicht gezeichnet, im Popover unter Hinaus durch), und `current="on_hold"`, das nirgends vorkommt (zweite Rohwert-Box, hervorgehoben, ohne Ton — `kind` neutral). Dazu die Karte auf **360 px** Breite: der Container scrollt, die Seite nicht |
| `InUse` | Stapel-Detail: `Card` mit Kopf „Buchungszyklus August 2026", darin `ProcessStepper` (Phasen aus `Process.stories`, aktiv „Prüfen", Baton Kanzlei) und darunter unter der Zwischenüberschrift „Ablauf" die `StateMachine` aus `Filled` — Positionsanzeige und Landkarte in einer Karte, wie Z7 sie trennt |

Sechs Stories: zwei Zustände (Landkarte, Reihe), eine Reihenfolge-Prop
(`states` in `Filled` und `Sequence`), ein Verhalten ohne Prop (`Explain` —
der Klick braucht seinen Beweis wie `Filters` in 0054), ein Rand, ein Einsatz.
Kein Callback, also keine Rundlauf-Story mit `useState`.

**Nicht anwendbar:** `Empty` — eine Achse hat immer Zustände; „ohne
Übergänge" ist `Sequence`. `Loading`/`Error` — nichts wird geladen; der
Aufrufer hält die Daten, unbekannte Keys sind Rohwert-Boxen (`Edge`).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| **Übergänge aus der Registry** statt aus der Story | keine neue Prop — `StatusInfoDialog` liest `STATE_MACHINES[axis]` aus dem Spiegel und reicht `transitions` und `description` durch | Befund 1 ist in der App gelöst und der Spiegel nachgezogen |
| **Liste/Diagramm im `StatusInfoDialog`** (vierte Stufe von Z3) | `Segmented` im Dialog, kein Prop an `StateMachine` | dieselbe Bedingung; eigene Aufgabe, die 0069 und den Dialog verbindet |
| **Wer ist dran** je Zustand (Spalte „Dran ist" der Z1-Tabelle) | `owners?: Partial<Record<string, BatonMeta>>` — `Baton` als Unterzeile der Box | die Z1-Tabellen kommen als Daten (Befund 2) |
| **Zähler je Zustand** („12 Stapel in Prüfung") | `counts?: Partial<Record<string, number>>` — Zahl gedämpft in der Box, `tnum` | ein Dashboard oder Listenkopf will die Landkarte als Übersicht |
| **Klick führt weiter** (Liste nach Zustand filtern) | `onSelect?: (state: string) => void` — ersetzt das Popover nicht, ergänzt einen Knopf darin | eine Seite fragt danach (Stapel-Liste, Beleg-Liste) |
| **Selbst-Übergänge** als Schleife an der Box · **mehr als zwölf Zustände** · **Handlayout** | Zeichnung bzw. `columns?: Record<string, number>` als Rang-Vorgabe | eine Achse sprengt die Decke oder das Rang-Bild taugt nicht |
| **Übergangs-Label sichtbar** statt nur Hover | `showLabels?: boolean` | eine Technik-Sicht will die Auslöser lesen, ohne zu klicken |

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

- [ ] Label, Ton, Erklärtext und DB-Ort jedes Zustands kommen aus `STATUS_REGISTRY`/`AXIS_SOURCE`; in `StateMachine.tsx` steht kein Statustext (`Branching`, grep)
- [ ] Ohne `states` ist die Reihenfolge die Registry-Reihenfolge der Achse; mit `states` deren Reihenfolge und Teilmenge (`Branching`, `Filled`, `Sequence`)
- [ ] Keys aus `transitions` oder `current`, die die Reihenfolge nicht kennt, hängen hinten als Rohwert-Box: neutral, `code`-Label, kein Erklärtext (`Edge`)
- [ ] Rang = längster Vorwärtspfad; die Spalten von `Filled` und `Branching` entsprechen genau den in der Story-Tabelle genannten (DOM: `grid-column`/`grid-row` je Box)
- [ ] Vorwärts-Nachbarn durch die Mitte, Sprünge als Bogen oben, Rückwärts als Bogen unten; Pfeilspitze als SVG-`marker`; kein Pfad kreuzt eine Box (`Filled`, `Branching`, Screenshot)
- [ ] Das Paar `processed ⇄ review_needed` ergibt zwei getrennte, nicht deckende Pfade (`Branching`)
- [ ] Selbst-Übergänge werden nicht gezeichnet und stehen im Popover unter „Hinaus durch" (`Edge`)
- [ ] `label` eines Übergangs steht als `<title>` am Pfad (`Filled`, DOM)
- [ ] Ohne `transitions`: eine Reihe, gepunktete Verbinder ohne Spitze, Hinweiszeile „Reihenfolge nach Registry, Übergänge nicht hinterlegt."; Popover ohne Hinein/Hinaus (`Sequence`)
- [ ] `current` tönt genau eine Box im Registry-`kind`, setzt „aktuell" als Text und `aria-current="step"`; ohne `current` ist keine Box getönt; Kanten bleiben neutral (`Filled`, `Branching`, `Sequence`)
- [ ] `description` erscheint als Absatz über dem Diagramm, linksbündig; ohne Prop kein Absatz und kein Leerraum (`Filled`, `Sequence`)
- [ ] Klick/Enter/Space öffnet das `Popover` mit Badge, `code`-Wert, Erklärtext, Hinein durch, Hinaus durch (mit Übergangs-Labels und Zustands-Labels), DB-Ort; `Esc` schließt; nur ein Popover offen (`Explain`)
- [ ] `Tab` läuft die Boxen in Spaltenordnung ab (Rang, dann Zeile); jede Box ist ein `<button>` mit Wort; Fokusring sichtbar; Hover färbt (`Explain`)
- [ ] SVG `aria-hidden`; Kanten-Token ≥ 3:1 gegen die Karte, Wert als Kommentar am Token (`Filled`, `getComputedStyle`)
- [ ] Labels bis zwei Zeilen, darüber `…` mit `title`; Boxen behalten ihre Rastergröße (`Edge`)
- [ ] Bei schmaler Karte (360 px) scrollt `.v2fsm` horizontal, `body` nicht (`Edge`)
- [ ] Kein `ResizeObserver`, kein `getBoundingClientRect`, keine neue Abhängigkeit in `package.json`; Rastermaße nur als CSS-Variablen in `v3.css` (grep)
- [ ] Kein `"use client"` in `StateMachine.tsx`; Client-Anteil nur `Popover` (grep)
- [ ] Barrel: Export unter `/* Prozess */` in `index.ts`; `@instead` von `StatusInfoDialog` und `ProcessStepper` nennen `StateMachine` (je ein Halbsatz)
- [ ] Tut bewusst nicht: Übergänge herleiten, Selbst-Übergänge zeichnen, Besitzer zeigen, Phasen zeigen, zählen, filtern, auslösen — Aufrufer löst es mit `transitions`-Daten, `Baton`/`ProcessStepper`, `ActionBar`; der Rest steht im Ausbau
- [ ] Ersetzt nichts in der App; das Diagramm im `StatusInfoDialog` wartet auf Befund 1 — **offen (App)**, siehe `docs/backlog/README.md`

## Befunde für `ludwig/app`

1. **Übergänge liegen nirgends als Daten.** In `status-registry.ts` tragen
   vier von 70 Achsen einen „Übergänge:"-Block **als Kommentar** (`beleg`,
   `job`, `upload`, `dispatch`); ein Dutzend weitere haben Pfeile im
   Kommentar, teils Übergänge (`mandant_onboarding`, `partner`), teils bloße
   Regeln (`triage`, `beleg_kategorie`); Z1-Tabellen (`State | Dran ist | Hinein
   durch | Hinaus durch`) gibt es für zwei Achsen (`zyklus_stapel` in
   `docs/topics/datev.md` R19, `produktbefund` in
   `docs/operations/produktbefunde.md`); die einzige Tabelle im Code,
   `CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS` (`accounting-cases/domain/case.ts`),
   ist vollvermascht und hat eine andere Form (`Record<from, to[]>`).
   Vorschlag: neben den Descriptor-Maps ein
   `STATE_MACHINES: Partial<Record<StatusAxis, { description: string;
   transitions: StateTransition[] }>>` in `status-registry.ts`, und der
   Deckungstest prüft, dass jeder `from`/`to` ein Key der Achse ist. Die vier
   Kommentar-Blöcke und die zwei Tabellen lassen sich sofort übertragen; die Z1-Tabellen könnten
   danach aus den Daten erzeugt werden statt von Hand — eine Quelle (V13).
2. **Z1 verlangt eine Tabelle je Achse, es gibt zwei.** Die Komponente macht
   die Lücke sichtbar: jede Achse ohne Übergänge zeigt die Hinweiszeile. Das
   ist gewollt (R16), aber es ist eine Liste von rund fünfzig offenen Posten.
3. **GLOSSARY:** kein Eintrag für „Übergang / transition" (Z1 spricht von
   „Hinein durch / Hinaus durch"). Vorschlag: Eintrag „Transition (Übergang)"
   mit Verweis auf Z1 und die Datenform aus Befund 1.
4. **`StatusInfoDialog` bekommt eine vierte Stufe.** Sobald Befund 1 steht,
   zeigt der Dialog Liste **und** Diagramm (Umschalter); `FlowModal` bleibt die
   Kette Beleg → Sachverhalt → Buchung und ist davon nicht betroffen.

## Offene Fragen

1. **Übergänge vorab in den Registry-Spiegel des Design-Systems schreiben**
   (`STATE_MACHINES` hier zuerst, die App zieht nach) **oder nur in den
   Stories?** *Ohne Antwort: nur Stories* — der Spiegel bleibt Spiegel, sonst
   gibt es zwei Wahrheiten (V13); die App bekommt Befund 1 und liefert die
   Daten, der Spiegel wird beim nächsten Abgleich nachgezogen.
2. **Umschalter Liste/Diagramm im `StatusInfoDialog` Teil dieser Aufgabe?**
   *Ohne Antwort: nein* — der Dialog kennt nur `axis`; ohne Daten im Spiegel
   hätte er nichts zu zeigen außer der Reihe, die die Liste nicht schlägt.
   Eigene Aufgabe, sobald Befund 1 gelöst ist (Ausbau, Zeile 2).
3. **„Dran ist" (Besitzer je Zustand) jetzt oder Ausbau?** *Ohne Antwort:
   Ausbau* — `owners` mit `BatonMeta` aus `Process`, sobald die Z1-Tabelle als
   Daten kommt; heute gäbe es die Besitzer nur für `zyklus_stapel`, und dort
   zeigt der `ProcessStepper` sie schon.

## Abnahme (fremd, 2026-09-06)

Geprüft gegen die Spec und den Code, nicht gegen den Chat. Storybook lief für
die Messung auf `localhost:6107`; alle Zahlen sind selbst gemessen, keine aus
dem Abschnitt „Gebaut" übernommen. Im Baum lagen fremde Änderungen
(`JournalEntryEditor`, `Brand`/`Color`/`Icons`/`Surface`-Stories) — sie
berühren `StateMachine` nicht. Werkzeuge im Scratchpad: `measure.mjs`,
`shot.mjs`, `console-check.mjs` und drei eigene (`ab69-cols.js`,
`ab69-click.mjs`, `ab69-tab.mjs`, `ab69-focus.mjs`).

**Urteil: nicht abgenommen.** Die gerechnete Landkarte stimmt — sie kommt nur
nicht auf den Schirm: die Boxen stehen nicht in ihren Spalten, während die
Kanten für die Spalten gezeichnet sind. Damit zeigt jede Story mit Übergängen
ein Bild, das etwas anderes behauptet als die Daten (M1).

**Die Rangregel von Hand nachgerechnet, dann mit dem DOM verglichen.**
`Filled`: Vorwärts-Übergänge nach der Reihenfolge `prepared, agent, review,
ready, exporting, inspection, failed, confirmed, mirrored, closed, cancelled`
ergeben `prepared` 0 · `cancelled` 0 (kein Vorwärts-Übergang mündet hinein) ·
`agent` 1 · `review` 1 · `ready` 2 · `exporting` 3 · `inspection` 4 · `failed`
4 · `confirmed` max(3+1, 4+1) = 5 · `mirrored` 6 · `closed` max(5+1, 6+1) = 7.
`Branching`: `pending` 0 · `in_progress` 1 · `processed` 2 · `failed` 2 ·
`review_needed` max(1+1, 2+1) = 3. Beides deckt sich mit dem, was die
Komponente rechnet (`grid-column` im `style`-Attribut jeder Box) und mit der
Story-Tabelle dieser Spec.

**Die Abweichung von Freigabe (d) ist richtig, und ihre Begründung stimmt.**
In `review` mündet genau ein Vorwärts-Übergang, `prepared→review` (Anhang,
Zeile 2); ein `agent→review` gibt es in R19 nicht — aus `agent` führt nur
`agent→prepared` heraus. Also zieht `review` seinen Rang aus `prepared→review`
und steht mit Rang 1 **neben** `agent`; die Kante ist eine Nachbar-Kante, kein
Bogen. Gemessen an den 16 Pfaden von `Filled`: **zwei** Bögen oben (`M 513 0
C 513 -22, 813 -22, 813 0` „Quittung" und `M 813 0 … 1113 0` „leerer Diff"),
**fünf** unten (Steuerpunkte auf `y = 150` bei Höhe 128) und **neun** durch die
Mitte. Punkt (d) der Freigabe war von Hand gezählt und ist damit widerlegt,
nicht die Regel.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` ist in dieser Abnahme untersagt; ersatzweise `console-check.mjs` über alle sechs Stories: **0 Konsolenmeldungen** | ✓ typecheck · build nicht geprüft |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `patterns/StateMachine.tsx` + `StateMachine.stories.tsx`; `index.json` kennt `v3-patterns-prozess-statemachine--{filled,branching,sequence,explain,edge,in-use}`, Titel `v3/Patterns/Prozess/StateMachine` — Gruppe „Prozess" wie im Barrel | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Bezeichner, Typen und JSDoc englisch, Deutsch nur in sichtbaren Strings. Aber der Block mit `@when`/`@instead` (`StateMachine.tsx:10–32`) steht vor `export interface StateTransition` (`:34`) und hängt damit am Typ; `export function StateMachine` (`:179`) hat **keinen** JSDoc darüber (M7) | ✗ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Kein Hex (`grep`), keine Label-Map, kein Statustext in der Datei. Aber vier Rastermaße als Zahlen in TSX (`:64–67`) und als `px` in `style` (`:215–218`) (M5) | ✗ |
| **Fest** — alle Stories vorhanden; ausgeschlossene Zustände begründet | Sechs Stories, alle sechs rendern; `Empty`/`Loading`/`Error` sind in der Spec mit Grund ausgeschlossen. `Sequence` zeigt jedoch fünf statt der spezifizierten sechs Boxen (M9) | ✗ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Text links, nichts zentriert; Farbe nur an einer Box; Fokusring sichtbar; keine Emoji, keine Versalien; keine Icons. Reißt an V7 (die aktuelle Box verliert ihr Wort, M3) und an V6/Z2 (Ton nicht aus der Registry, M4) | ✗ |
| **Fest** — im Browser angesehen | Alle sechs Stories in Chromium geöffnet, vier davon als Bild (`ab69-filled.png`, `ab69-br.png`, `ab69-edge.png`, `ab69-inuse.png`), dazu echte Maus- und Tastenanschläge über CDP | ✓ |
| Label, Ton, Erklärtext und DB-Ort aus `STATUS_REGISTRY`/`AXIS_SOURCE`; kein Statustext in der Datei | `grep` findet in `StateMachine.tsx` keinen Statustext; `AXIS_SOURCE` kommt aus `./entity-icons` (`:3`), derselben Stelle wie im `StatusInfoDialog` (`:5`). Popover in `Branching`/`Explain`: Badge „Prüfung nötig", `review_needed`, Registry-Erklärtext, `client_source_docs_invoices.processing_status` | ✓ |
| Ohne `states` Registry-Reihenfolge, mit `states` deren Reihenfolge und Teilmenge | `Branching` ohne `states` → `pending, in_progress, processed, review_needed, failed` wie in `BELEG_PROCESSING`; `Filled` mit `states` → `prepared` zuerst; `Sequence` als Teilmenge ohne `in_pipeline` | ✓ |
| Unbekannte Keys hängen hinten als Rohwert-Box: neutral, `code`-Label, kein Erklärtext | `Edge`: `quarantined` und `on_hold` tragen `v2fsm__state--raw`, Label in `--font-mono`, Popover „Diesen Wert kennt die Registry nicht." mit neutralem Badge; in der DOM-Reihenfolge stehen sie zuletzt bzw. an ihrem Rang | ✓ |
| Rang = längster Vorwärtspfad; die Spalten von `Filled` und `Branching` wie in der Story-Tabelle (DOM: `grid-column`/`grid-row`) | Gerechnet = `style`-Attribut (siehe oben). **Im gerenderten DOM kommt die Angabe aber nicht an**: `Filled` misst `prepared` x=18, `cancelled` x=168, `agent` x=318, `review` x=468, `ready` x=618, `exporting` x=768, `inspection` x=918, `failed` x=1068, dann Zeile 2 mit `confirmed` x=18 — reiner Auto-Flow, acht Kästen je Zeile (M1) | ✗ |
| Vorwärts-Nachbarn durch die Mitte, Sprünge als Bogen oben, Rückwärts als Bogen unten; Pfeilspitze als SVG-`marker`; kein Pfad kreuzt eine Box | Pfad-Formen stimmen (9 Mitte / 2 oben / 5 unten in `Filled`), Spitze ist ein `<marker id="v2fsm-arrow">` mit `markerEnd`, kein Zeichen (T9 ✓). Im Bild kreuzen die Pfade jedoch Boxen und enden im Leeren, weil die Boxen woanders liegen (`ab69-br.png`: der Bogen „Pipeline durch, reparierbare Findings" endet über „Fehlgeschlagen") (M1) | ✗ |
| Das Paar `processed ⇄ review_needed` ergibt zwei getrennte, nicht deckende Pfade | `Branching`: `M 426 27 C 438 27, 438 27, 450 27` (Mitte) und `M 513 128 C 513 150, 363 150, 363 128` (Bogen unten) — verschiedene Pfade | ✓ |
| Selbst-Übergänge werden nicht gezeichnet und stehen im Popover unter „Hinaus durch" | `Edge`: neun Übergänge, **acht** Pfade; Popover `pending_classification` listet „Erneut anstoßen · zurück auf sich selbst" unter „Hinaus durch" | ✓ |
| `label` eines Übergangs steht als `<title>` am Pfad | `Filled`: alle 16 Pfade tragen ein `<title>`, von „Aufgreifen (start_agent_run)" bis „Abbruch" | ✓ |
| Ohne `transitions`: eine Reihe, gepunktete Verbinder ohne Spitze, Hinweiszeile; Popover ohne Hinein/Hinaus | `Sequence`: alle Boxen in `grid-row 1`, vier Pfade `M … L …` mit `stroke-dasharray: 2 4`, **kein** `marker-end`, kein `<marker>` im SVG; darunter „Reihenfolge nach Registry, Übergänge nicht hinterlegt."; Popover `needs_clarification` zeigt Badge, `code`, Bedeutung, Quelle — keine Wege | ✓ |
| `current` tönt genau eine Box im Registry-`kind`, setzt „aktuell" und `aria-current="step"`; ohne `current` keine getönte Box; Kanten neutral | Genau eine Box mit `aria-current="step"` und „aktuell"; `Branching` ohne `current` hat keine getönte Box; Kanten überall `rgb(138,138,138)`. Aber der Ton ist **immer** der Akzent: `review` (`kind: "warning"`) misst `background rgb(241,247,251)`, `border rgb(59,143,196)` = `--color-accent`, nicht `--color-warning` `#8C601E` (M4). Und das Wort des Zustands fällt aus der Box (M3) | ✗ |
| `description` als Absatz über dem Diagramm, linksbündig; ohne Prop kein Absatz und kein Leerraum | `Filled`: `p.v2fsm__lead` über dem Raster, linksbündig, `max-width: 68ch`; `Branching`/`Sequence`: kein `.v2fsm__lead` im DOM, kein Leerraum (Flex-`gap` greift nur zwischen vorhandenen Kindern) | ✓ |
| Klick/Enter/Space öffnet das `Popover` mit Badge, `code`-Wert, Erklärtext, Hinein durch, Hinaus durch, DB-Ort; `Esc` schließt; nur eins offen | Echte Klicks/Tasten über CDP (`ab69-click.mjs`, `Explain`): Klick auf „Prüfung nötig" → ein offenes `.v2pop` mit `bdg-warning`, `code review_needed`, Erklärtext, **Hinein durch** „In Bearbeitung · Pipeline durch, reparierbare Findings" / „Prozessiert · Revalidierung", **Hinaus durch** „Revalidierung (update_invoice_extraction) · Prozessiert", `client_source_docs_invoices.processing_status`. Klick auf die zweite Box → weiterhin genau **eins** offen. `Escape` → 0 offen, `aria-expanded` überall `false`. Zweiter Klick auf dieselbe Box → 0. `Enter` → 1, `Space` → 1 | ✓ |
| `Tab` läuft die Boxen in Spaltenordnung ab; jede Box ist ein `<button>` mit Wort; Fokusring sichtbar; Hover färbt | Echte Tab-Anschläge (`ab69-tab.mjs`, `Explain`): `pending → in_progress → processed → failed → review_needed`, danach aus der Karte heraus — genau die Ordnung der Spec. Alle Boxen sind `<button type="button">`. Nach dem ersten Tab: `:focus-visible` = `true`, `outline: solid 2px rgb(59,143,196)`, `outline-offset: 2px` (3,55:1 gegen Weiß). Hover: `.v2fsm__state:hover { background: var(--color-bg-soft) }`. Einschränkung: die DOM-Ordnung ist nur noch dann die Leserichtung, wenn das Bild stimmt (M1) | ✓ |
| SVG `aria-hidden`; Kanten-Token ≥ 3:1 gegen die Karte, Wert als Kommentar am Token | `aria-hidden="true"` an beiden SVG-Varianten (gemessen, nicht nur im Code). Kanten: `stroke = rgb(138,138,138)` = `--color-border-control` `#8A8A8A`. Nachgerechnet: relative Leuchtdichte 0,2542 → gegen `#FFFFFF` (1,05/0,3042) = **3,45:1**, gegen die Storybook-Fläche `#F4F6F8` 3,19:1 — beides ≥ 3:1. Der Kommentar mit dem Wert steht am Token (`v3.css:2803–2809`) und nennt zum Vergleich `--color-border-strong` mit 1,62:1 | ✓ |
| Labels bis zwei Zeilen, darüber `…` mit `title`; Boxen behalten ihre Rastergröße | `title` steht an jedem Label. Aber keine Box hält ihr Raster: in `Sequence` messen die Boxen 99/157/171/130/130 px gegen ein 126-px-Gleis, in `Edge` überdeckt `on_hold` das Wort `pending_classificati…` seines Nachbarn — abgeschnitten wird durch Überlappung, nicht durch `…` (M2) | ✗ |
| Bei 480 px Kartenbreite scrollt `.v2fsm` horizontal, `body` nicht | `Edge`: `.v2fsm__scroll` misst `scrollWidth` 446 = `clientWidth` 446 — es scrollt nichts, weil `beleg_inbox` nur drei Ränge hat; `document.body.scrollWidth` = `clientWidth` = 1440, die Seite scrollt also auch nicht. Die Fähigkeit ist angelegt (`overflow-x: auto`, gemessen), aber von keiner Story vorgeführt (M10) | offen |
| Kein `ResizeObserver`, kein `getBoundingClientRect`, keine neue Abhängigkeit; Rastermaße nur als CSS-Variablen in `v3.css` | Kein `ResizeObserver`, kein `getBoundingClientRect` (nur im Kommentar `:60`), keine neue Abhängigkeit in `package.json`. Die Rastermaße stehen aber in TSX (`:64–67`), und `grep -- "--v2fsm" src/styles/v3.css` findet **nichts**, obwohl der Kommentar `:63` auf `--v2fsm-col`/`--v2fsm-row` verweist (M5) | ✗ |
| Kein `"use client"`; Client-Anteil nur `Popover` | `grep "use client" StateMachine.tsx` → nichts; einziger Client-Anteil ist `Popover` | ✓ |
| Barrel: Export unter `/* Prozess */`; `@instead` von `StatusInfoDialog` und `ProcessStepper` nennen `StateMachine` | `index.ts:263–267` exportiert `StateMachine` und `StateTransition` unter `/* Prozess */` ✓. Die beiden `@instead` nennen `StateMachine` **nicht**: `StatusInfoDialog.tsx:27–28` („StatusBadge … StatusInfoButton … Dialog"), `Process.tsx:138–139` („Steps of a review → StepRail") (M6) | ✗ |
| Tut bewusst nicht: Übergänge herleiten, Selbst-Übergänge zeichnen, Besitzer, Phasen, zählen, filtern, auslösen | Nachgesehen und gemessen: ohne `transitions` entsteht kein einziger Pfeil (`Sequence`, 0 `<marker>`, 0 `marker-end`); Selbst-Übergang nicht gezeichnet (`Edge`, 8 von 9); kein `Baton`, keine Phase, kein Zähler, kein `onSelect`, kein `href`, kein `fetch`, kein Router-Import in der Datei | ✓ |
| Ersetzt nichts in der App; das Diagramm im `StatusInfoDialog` wartet auf Befund 1 | `StatusInfoDialog` ist unverändert, kein Umschalter, kein Aufruf von `StateMachine` außerhalb der eigenen Story | offen (App) |

### Mängel

1. **Die Ränge erreichen den DOM nicht — die Karte zeigt keine Landkarte.**
   `StateMachine.tsx:328` setzt `gridColumn`/`gridRow` am `<button>`, aber
   `Popover` hängt den Trigger in ein `<span class="v2pop__anchor">`
   (`primitives/Popover.tsx:162`); dieses Span ist das Grid-Kind, der Button
   nicht. Gemessen in `Filled`: die elf Boxen liegen in Auto-Flow-Reihenfolge
   (acht in Zeile 1, drei in Zeile 2), `cancelled` steht in Spalte 2 statt
   unter `prepared`, `confirmed` springt in Zeile 2 Spalte 1. Die Kanten sind
   für die gerechneten Spalten gezeichnet und zeigen deshalb ins Leere
   (`ab69-filled.png`, `ab69-br.png`, `ab69-inuse.png`). Betrifft `Filled`,
   `Branching`, `Explain`, `Edge`, `InUse`; nur `Sequence` sieht richtig aus,
   weil dort ohnehin alles in einer Zeile steht.
2. **Boxen halten ihr Rastermaß nicht und überdecken einander.** Weil der
   Button ein Flex-Kind des Ankers ist, misst er seinen Inhalt statt das
   Gleis: `Sequence` 99/157/171/130/130 px gegen `grid-template-columns:
   repeat(5, 126px)` (`StateMachine.tsx:215`); in `Edge` ragt
   „Wird eingeordnet / pending_classification" 178 px breit unter die
   Nachbarbox und wird von ihr abgeschnitten (`ab69-edge.png`). Damit passt
   auch keine Kante mehr an einen Boxenrand.
3. **Die aktuelle Box verliert ihr Wort.** `v3.css:2816` gibt der Box drei
   Zeilen (Label, `code`, „aktuell") in einer festen Zeilenhöhe von 54 px
   (`StateMachine.tsx:216`); die Label-Zeile wird auf **0 px** gequetscht.
   Gemessen in `Filled`: `.v2fsm__label` von `review` hat `height 0`,
   „Kanzlei prüft" ist nicht sichtbar — die Box zeigt nur noch `review` und
   „aktuell" (`ab69-filled.png`, `ab69-inuse.png`). Dasselbe in `Edge` bei
   `on_hold`. Genau der Zustand, um den es geht, steht ohne seinen Namen da
   (V7, T8).
4. **`current` trägt nicht den Registry-Ton.** `v3.css:2837` färbt jede
   aktuelle Box mit `--color-accent` / `--color-accent-50`, unabhängig vom
   `kind`. Gemessen: `review` (`kind: "warning"`, `--color-warning` `#8C601E`)
   erscheint in `rgb(59,143,196)`; ebenso `needs_clarification` in `Sequence`.
   Die Spec verlangt „die Box in ihrem Registry-Ton (`kind` → Fläche getönt,
   Rand in der Tonfarbe)", die Story-Tabelle „im Warnton".
5. **Rastermaße stehen in TSX statt als CSS-Variablen.** `StateMachine.tsx:64–67`
   (`COL = 150`, `ROW = 74`, `BOX_W = 126`, `BOX_H = 54`) und die
   `px`-Angaben in `style` (`:215–218`); `grep -- "--v2fsm" src/styles/v3.css`
   findet keine einzige Variable, obwohl der Kommentar `:63` behauptet, die
   Zahlen stünden dort als `--v2fsm-col`/`--v2fsm-row`. Verstößt gegen „kein
   px in TSX" und gegen das Kriterium „Rastermaße nur als CSS-Variablen".
6. **Die beiden `@instead` nennen `StateMachine` nicht.**
   `StatusInfoDialog.tsx:27–28` und `Process.tsx:138–139` sind unverändert;
   wer nach „Landkarte statt Liste" sucht, findet sie über den Nachbarfall
   nicht.
7. **Der JSDoc-Block hängt am falschen Export.** `StateMachine.tsx:10–32`
   steht unmittelbar vor `export interface StateTransition` (`:34`);
   `export function StateMachine` (`:179`) hat gar keinen Kommentar. `@when`
   und `@instead` beschreiben damit den Typ, nicht die Komponente.
8. **Rückwege innerhalb einer Spalte fallen zusammen oder verschwinden.**
   `edgePath` (`StateMachine.tsx:159–177`) nimmt für einen Bogen nur die
   Spaltenmitte, nie die Zeile. Gemessen: `review→agent` in `Filled` ergibt
   `M 213 128 C 213 150, 213 150, 213 128` — Anfang gleich Ende, ein Stummel
   ohne erkennbare Richtung; in `Edge` zeichnen `classified→pending_classification`
   und `classification_failed→pending_classification` **denselben** Pfad
   zweimal (`M 213 128 C 213 150, 63 150, 63 128`), ein Übergang ist also
   unsichtbar. Die Spec verlangt den Bogen unten ausdrücklich „auch innerhalb
   einer Spalte".
9. **`Sequence` zeigt fünf statt sechs Boxen.** `StateMachine.stories.tsx:115`
   lässt neben dem Pseudowert `in_pipeline` auch `closed_superseded`
   („Veraltet") weg; die Achse `sachverhalt` hat sieben Keys. Die Story-Tabelle
   dieser Spec nennt sechs, der Abschnitt „Gebaut" nennt fünf ohne Grund.
10. **`Edge` führt das Scrollen nicht vor.** `scrollWidth` = `clientWidth` =
    446 px in der 480-px-Karte: `beleg_inbox` hat nur drei Ränge und passt.
    Das Kriterium „bei 480 px Kartenbreite scrollt `.v2fsm` horizontal"
    bleibt unbewiesen — entweder eine breitere Achse in die Story oder die
    Karte schmaler.
11. **Die Doku der Story `Filled` widerspricht dem Gebauten.**
    `StateMachine.stories.tsx:81–84` verspricht „neun Spalten … drei oben —
    darunter `prepared → review`". Gemessen sind es acht Spalten und zwei
    Bögen oben; `prepared→review` läuft durch die Mitte. Die Story-Tabelle der
    Spec wurde korrigiert, der Kommentar in der Story nicht.

### Außerhalb der Kriterien aufgefallen

- Der Bogen unten setzt an der **Unterkante des ganzen Rasters** an, nicht am
  Rand der Quellbox: in `Filled` beginnt „Abbruch" (`ready→review`) bei
  `y = 128`, während die `ready`-Box bei `y = 54` endet. Der Weg zurück
  scheint aus dem Nichts zu kommen. Solange M1 offen ist, fällt das nicht
  weiter auf; danach schon.
- Die Rohwert-Box schreibt den Schlüssel zweimal untereinander (Label und
  DB-Wert sind derselbe String, `Edge`: `on_hold` / `on_hold`). Eine Zeile
  würde reichen.
- `.v2fsm__state` trägt `border: 1px solid var(--color-border)` (`#DDE2E8`,
  rund 1,3:1 gegen Weiß). Das ist der Rand, den die Spec vorschreibt, und
  dieselbe Wahl wie in den übrigen Bausteinen — aber die Boxen sind hier das
  tragende Element eines Diagramms, nicht die Trennlinie einer Liste. Wenn
  jemand die Kanten auf `--color-border-control` hebt, gehört die Frage
  gestellt, ob der Boxenrand nicht mitziehen muss (V10).

Abgenommen von / am: **nicht abgenommen** · geprüft von Claude
(Abnahme-Agent), 2026-09-06 · Offene Punkte: M1–M11 sowie „ersetzt nichts in
der App" (offen App, Befund 1).

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Alle Bausteine vorhanden, Achsen und Reihenfolgen stimmen. Entscheide: 1 Übergänge nur in Stories · 2 kein Umschalter im `StatusInfoDialog` · 3 „dran ist" bleibt Ausbau.

Vor dem Bau in die Spec: (a) Pfad überall auf `@/ludwig/ui/status/status-registry` (die Set-Kopie ist seit 0080 weg); (b) „56 Achsen" → 62; (c) die 16 Übergänge von `zyklus_stapel` (mit Labels) und die `beleg_inbox`-Übergänge als Anhang in die Spec, Quelle mit absolutem Pfad in `ludwig/app` (`docs/topics/datev.md` R19 und `docs/operations/produktbefunde.md` liegen nicht in diesem Repo); (d) `Filled`: drei Bögen oben (`prepared→review`, `exporting→confirmed`, `confirmed→closed`); (e) „Setzt auf": `AXIS_SOURCE` daher, wo `StatusInfoDialog` es holt (0105 offen).

Befunde ins Register: die Befunde 1, 3 und 4 dieser Spec stehen noch nicht in `docs/befunde-app.md` — nachtragen (A, B, E).

## Anhang · Die Übergänge, die die Stories tragen

Sie stehen hier, weil ihre Quellen **nicht in diesem Repo liegen** und die
Stories sie sonst aus dem Nichts behaupten würden. Solange L-74 offen ist, ist
dieser Anhang die einzige Stelle, an der beides zusammensteht: der Übergang
und wo er herkommt.

### `zyklus_stapel` — 16 Übergänge

Quelle: `ludwig/app/docs/topics/datev.md`, Abschnitt **R19** („Der Stapel ist
der Buchungszyklus"), Tabelle `State | Dran ist | Hinein durch | Hinaus
durch`. Die Labels sind die Wörter der Spalte „Hinaus durch".

| von | nach | Label |
|---|---|---|
| `prepared` | `agent` | Aufgreifen (`start_agent_run`) |
| `prepared` | `review` | Prüfung übernehmen |
| `agent` | `prepared` | Durchgang beendet (`finish_agent_run`) |
| `review` | `ready` | Freigabe |
| `review` | `agent` | Zurück an den Agenten |
| `ready` | `exporting` | Push |
| `ready` | `review` | Abbruch |
| `exporting` | `confirmed` | Quittung |
| `exporting` | `inspection` | Quittung mit Prüfung |
| `exporting` | `failed` | Fehler |
| `inspection` | `confirmed` | Quittung |
| `confirmed` | `mirrored` | Spiegel-Import eines festgeschriebenen Stapels |
| `confirmed` | `closed` | leerer Diff |
| `mirrored` | `closed` | Nachlese |
| `failed` | `ready` | Retry |
| `failed` | `review` | Abbruch |

Zwei Feinheiten der Tabelle, die im Bild nicht stehen und deshalb hier: aus
`failed` geht es **nie** nach `cancelled` (human-hold, der Claim bleibt), und
`confirmed` bleibt liegen, solange der Spiegel-Stapel offen ist — das ist kein
fehlender Übergang, sondern eine Bedingung an einem vorhandenen.

### `beleg_inbox` — 7 Übergänge

Quelle: der Kopfkommentar von `BELEG_INBOX` in
`ludwig/app/apps/web/src/ui/status/status-registry.ts` („Schreiber: Web-Upload
setzt `pending_classification`, der Python-Classifier setzt `classified` bzw.
`classification_failed`, Reprocess setzt zurück, Soft-Delete setzt
`deleted`").

| von | nach | Label |
|---|---|---|
| `pending_classification` | `classified` | Classifier |
| `pending_classification` | `classification_failed` | Classifier |
| `classified` | `pending_classification` | Reprocess |
| `classification_failed` | `pending_classification` | Reprocess |
| `pending_classification` | `deleted` | Soft-Delete |
| `classified` | `deleted` | Soft-Delete |
| `classification_failed` | `deleted` | Soft-Delete |

### `beleg` — 7 Übergänge

Quelle: der „Übergänge:"-Block im Kopfkommentar von `BELEG` derselben Datei.

| von | nach | Label |
|---|---|---|
| `pending` | `in_progress` | Pipeline startet |
| `in_progress` | `processed` | Pipeline durch |
| `in_progress` | `review_needed` | Pipeline durch, reparierbare Findings |
| `in_progress` | `failed` | Abbruch |
| `processed` | `review_needed` | Revalidierung |
| `review_needed` | `processed` | Revalidierung (`update_invoice_extraction`) |
| `failed` | `in_progress` | Retry / force-Reprocess |

## Gebaut (2026-09-06)

`patterns/StateMachine.tsx`, ein Export plus `StateTransition`; Layout, Ränge
und Kanten sind reine Funktionen in derselben Datei, kein zweites Modul, keine
Bibliothek, kein `"use client"` — nur `Popover` ist ein Client-Island.
Klassen `.v2fsm*` in `v3.css`.

### Eine Abweichung von der Freigabe, mit Grund

Punkt (d) der Freigabe verlangt **drei** Bögen oben und zählt
`prepared→review` dazu. Das folgt nicht aus der Rangregel dieser Spec: nach
ihr bekommt `review` seinen Rang aus dem **einzigen** Vorwärts-Übergang, der
in ihn mündet — `prepared→review` —, steht also in Spalte 1 **neben** `agent`
und nicht dahinter. Damit ist die Kante eine Nachbar-Kante durch die Mitte,
kein Bogen. Ein `agent→review` gibt es in R19 nicht: aus `agent` geht es nur
zurück nach `prepared`.

Gebaut ist die Regel, nicht die Aufzählung. Die Aufzählung der erwarteten
Spalten in der Story-Tabelle war von Hand gerechnet und ab `review` um eine
Spalte verschoben; sie ist unten korrigiert. **Gemessen** (Story `Filled`,
Chromium headless): zwei Bögen oben („Quittung" `exporting→confirmed`,
„leerer Diff" `confirmed→closed`), fünf unten (die fünf Rückwege), neun durch
die Mitte — zusammen die 16.

Wer die drei Bögen doch will, ändert nicht die Komponente, sondern die
Reihenfolge: `states` mit `review` hinter `agent` gibt genau das Bild. Das ist
der Zweck der Prop.

### Was beim Bauen dazukam

- **Die Reihe steht waagerecht.** Ohne Übergänge sind alle Ränge 0, und der
  erste Wurf stapelte die Zustände in einer Spalte. Das Verhalten verlangt
  eine **Zeile**; ohne Übergänge wird der Index zur Spalte.
- **Der Verbinder der Reihe ist gepunktet und hat keine Spitze** (`2 4`,
  gemessen) — er sagt „Reihenfolge", nicht „Übergang".
- **Die DOM-Reihenfolge ist die Leserichtung**, nicht die Registry-Reihenfolge:
  die Boxen werden nach Spalte, dann Zeile sortiert, damit Tab die Karte
  abläuft, wie das Auge sie liest. In `Edge` gemessen:
  `pending_classification, on_hold, classified, classification_failed,
  deleted, quarantined`.
- **Die Kanten liegen unter den Boxen** (`z-index`), sonst endete ein Pfeil
  über einem Wort und zeigte scheinbar auf den Rand.
- **Kontrast:** nicht `--color-border-strong` — das sind **1,62:1** gegen die
  Karte, und V10 verlangt ≥ 3:1 für eine tragende Linie. Die Kanten stehen in
  `--color-border-control` (**3,45:1**, nachgerechnet), demselben Maß, aus dem
  der Rahmen eines Eingabefelds seine Sichtbarkeit zieht. Gemessen im Bild:
  `rgb(138,138,138)` auf `rgb(255,255,255)`.

### Gemessen

| Story | Was |
|---|---|
| `Filled` | 11 Boxen, 16 Kanten; Spalten 0 `prepared`+`cancelled` · 1 `agent`+`review` · 2 `ready` · 3 `exporting` · 4 `inspection`+`failed` · 5 `confirmed` · 6 `mirrored` · 7 `closed`; „Kanzlei prüft" trägt „aktuell" |
| `Branching` | 5 Boxen, 7 Kanten, vier Spalten, keine Box farbig; `processed ⇄ review_needed` als zwei getrennte Wege |
| `Sequence` | fünf Boxen in **einer Zeile**, vier gepunktete Verbinder, **null** Pfeilspitzen, die Hinweiszeile darunter |
| `Explain` | Klick auf „Prüfung nötig" → Badge, `review_needed`, **Hinein durch** „In Bearbeitung · Pipeline durch, reparierbare Findings" und „Prozessiert · Revalidierung", **Hinaus durch** „Revalidierung (update_invoice_extraction) · Prozessiert", Quelle `client_source_docs_invoices.processing_status` |
| `Edge` | zwei Rohwert-Boxen (`quarantined`, `on_hold`), der Selbst-Übergang steht als „Erneut anstoßen · zurück auf sich selbst" im Popover und ist **nicht** gezeichnet (8 von 9 Kanten), der Container scrollt |
| `InUse` | Positionsanzeige und Landkarte in einer Karte |

## Die elf Mängel der ersten Abnahme — behoben

Der schwerste war einer, den meine eigene Messung **verdeckt** hatte: ich hatte
`getComputedStyle(box).gridColumnStart` gelesen und den Wert wiedergefunden,
den ich selbst als Inline-Stil gesetzt hatte. Gemessen war damit meine
Behauptung, nicht ihre Wirkung. Die Lehre steht hier, weil sie größer ist als
dieser Baustein: **eine Deklaration zurückzulesen ist keine Messung.** Geprüft
wird die Lage, nicht die Anweisung.

**M1 · Die Ränge erreichten den DOM nicht.** `Popover` hängt seinen Auslöser
in ein `span.v2pop__anchor` — damit war der Knopf kein Grid-Kind, `grid-column`
an ihm wirkungslos, die Boxen standen im Auto-Flow (acht je Zeile), und die
Kanten waren für die gerechneten Spalten gezeichnet und zeigten ins Leere.
Jetzt liegt eine `.v2fsm__cell` im Raster und der Knopf füllt sie.
Nachgemessen (`Filled`): acht Spalten bei x = 18 · 168 · 318 · 468 · 618 ·
768 · 918 · 1068 — jeweils 150 px Abstand, wie das Raster es sagt.

**M2 · Die Boxen halten ihr Maß:** alle 126 × 60 px, keine misst mehr ihren
Inhalt. In `Edge` überdeckt nichts mehr etwas: **null** Überlappungen.

**M3 · Die aktuelle Box behält ihr Wort.** „aktuell" steht jetzt **neben** dem
DB-Wert statt in einer dritten Zeile; die Beschriftung misst 19 px statt 0.

**M4 · `current` trägt den Registry-Ton.** Nicht mehr immer `--color-accent`:
`review` (`kind: "warning"`) misst `rgb(140, 96, 30)`. Fünf Tonklassen, je
Rand und Fläche.

**M5 · Die Rastermaße stehen an einer Stelle** — in der Datei, weil das SVG sie
als Zahlen braucht; ein `var()` lässt sich nicht addieren. Die Karte reicht sie
als `--v2fsm-col`, `--v2fsm-row`, `--v2fsm-box-w`, `--v2fsm-box-h` an CSS
weiter. Der Kommentar behauptet nicht mehr das Gegenteil.

**M6 · Die Nachbarn nennen den Baustein:** `StatusInfoDialog` und
`ProcessStepper` verweisen in ihrem `@instead` auf `StateMachine`.

**M7 · Das JSDoc mit `@when`/`@instead` steht an der Komponente**, nicht am Typ.

**M8 · Rückwege in derselben Spalte sind Bögen, keine Stummel.** Sie laufen
seitlich aus der linken Kante der Quelle in die linke Kante des Ziels. Und
mit demselben Zug behoben, was die Abnahme nebenbei fand: **die Bögen setzen
an der Kante ihrer Boxen an**, nicht an der des Rasters — vorher endete der
Pfeil von `Retry` 80 px unter `ready` im Leeren. Nachgemessen: **16 von 16**
Kanten enden am Rand ihrer Zielbox, keine ist ein Stummel; dasselbe in
`Branching` (7), `Edge` (8) und `InUse` (16).

**M9 · `Sequence` zeigt sechs Zustände** — `closed_superseded` fehlte.

**M10 · `Edge` beweist das Scrollen:** die Karte ist auf 360 px verengt,
gemessen `scrollWidth` 430 gegen `clientWidth` 326.

**M11 · Die Story-Doku von `Filled`** sagt jetzt acht Spalten und zwei Bögen
oben — und warum `prepared → review` durch die Mitte läuft.

**Nebenbefund mitgenommen:** die Rohwert-Box schrieb den Schlüssel zweimal
(einmal als Beschriftung, einmal als Wert). Sie schreibt ihn einmal.

**Nicht geändert:** der Rand der Boxen bleibt `--color-border` (≈ 1,3:1). Er
ist kein tragender Strich, sondern die Kante einer Fläche — die Boxen
unterscheiden sich durch Fläche, Wort und Ton, nicht durch ihren Rand. Die
Kanten dagegen tragen die Aussage und stehen deshalb auf 3,45:1.

## Abnahme (zweite Runde, fremd, 2026-09-06)

Geprüft gegen die Spec und den Code, nicht gegen den Chat, und mit der Lehre
der ersten Runde im Rücken: **gemessen wird die Wirkung, nicht die
Anweisung.** Keine Zahl dieser Runde stammt aus `getComputedStyle(el)
.gridColumnStart` oder einem anderen Rücklesen eines Inline-Stils — die Lage
jeder Box kommt aus `getBoundingClientRect()`, die Lage jeder Kante aus
`path.getPointAtLength()`, jede Farbe aus dem gerechneten Stil und gegen den
Token nachgerechnet. Storybook lief auf `localhost:6107`. Werkzeuge im
Scratchpad: `measure.mjs`, `shot.mjs`, `console-check.mjs`, `ax.mjs` und fünf
eigene (`ab69b-pos.js`, `ab69b-tone.js`, `ab69b-edges.js`, `ab69b-edges2.js`,
`ab69b-int.mjs`).

**Urteil: nicht abgenommen.** Die Landkarte steht jetzt — Ränge, Boxenmaß,
Kantenenden, Ton, Tastatur, alles gemessen und richtig. Der Bau ist damit von
elf Mängeln auf vier gekommen, und der schwerste (M1) ist wirklich weg. Was
bleibt, ist die **Beschriftung**: Boxen halten ihr Maß, aber ihr Inhalt hält
sich nicht an die Box — zweizeilige Wörter werden mitten in der zweiten Zeile
abgeschnitten, der DB-Wert läuft rechts heraus. Dazu kreuzen fünf Kanten
Boxen, die weder Quelle noch Ziel sind, und der Rasterkommentar in `v3.css`
nennt eine Zahl, die es nicht mehr gibt.

**Die elf Mängel der ersten Runde, nachgeprüft:** M1 ✓ (Ränge im Raster,
selbst gemessen) · M2 halb (Boxen halten ihr Maß, der Inhalt nicht — Mangel 1
und 2) · M3 ✓ · M4 ✓ · M5 halb (eine Stelle, aber falscher Kommentar —
Mangel 4) · M6 ✓ · M7 ✓ · M8 ✓ für die Enden, aber der neue Seitenbogen
kreuzt die Nachbarspalte (Mangel 3) · M9 ✓ · M10 ✓ · M11 ✓.

**Die Rangregel wieder von Hand gerechnet, dann mit den Pixeln verglichen.**
`Filled`, Reihenfolge `prepared, agent, review, ready, exporting, inspection,
failed, confirmed, mirrored, closed, cancelled`: `prepared` 0 · `cancelled` 0 ·
`agent` 1 · `review` 1 (aus `prepared→review`) · `ready` 2 · `exporting` 3 ·
`inspection` 4 · `failed` 4 · `confirmed` max(3+1, 4+1) = 5 · `mirrored` 6 ·
`closed` max(5+1, 6+1) = 7. Gemessen mit `getBoundingClientRect()`, alle Werte
relativ zur linken Kante des Rasters: `prepared` x = 0 · `cancelled` x = 0,
y = 80 · `agent` 150 · `review` 150, y = 80 · `ready` 300 · `exporting` 450 ·
`inspection` 600 · `failed` 600, y = 80 · `confirmed` 750 · `mirrored` 900 ·
`closed` 1050. Acht Spalten im Abstand von genau 150 px, zwei Zeilen im
Abstand von 80 px — Punkt für Punkt die gerechneten Ränge und genau die
Spaltenaufzählung der Story-Tabelle. `Branching`: `pending` 0 · `in_progress`
150 · `processed` 300 · `failed` 300 (y = 80) · `review_needed` 450 — also
0/1/2/2/3 wie gerechnet. `Edge`: `pending_classification` 0 · `on_hold` 0
(y = 80) · `classified` 150 · `classification_failed` 150 (y = 80) ·
`deleted` 300 · `quarantined` 300 (y = 80).

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` ist in dieser Abnahme untersagt; ersatzweise `console-check.mjs` über alle sechs Stories: **0** Konsolenmeldungen | ✓ typecheck · build nicht geprüft |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `patterns/StateMachine.tsx` + `StateMachine.stories.tsx`; `index.json` kennt `v3-patterns-prozess-statemachine--{filled,branching,sequence,explain,edge,in-use}`, Titel `v3/Patterns/Prozess/StateMachine` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Der Block `@when „What are the ways out of this state?" …` / `@instead … → ProcessStepper (Z7) … → Timeline … → StatusInfoDialog` steht jetzt unmittelbar vor `export function StateMachine` (`StateMachine.tsx:198–203`); der beschreibende Kopfkommentar (`:12–30`) hängt am Typ und trägt keine der beiden Zeilen mehr. Dass `export interface StateTransition` ohne `@when` auskommt, ist Hausbrauch für Datentypen (`TimelineItem`, `LogEntry`, `ChecklistRow` ebenso). Bezeichner, Typen, JSDoc englisch; Deutsch nur in sichtbaren Strings | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep` findet kein Hex, keine Label-Map, keinen Statustext in der Datei. `px` steht nur noch am Raster (`:240–247`) — bewusst und begründet; die Bewertung dieser Abweichung steht in der Zeile „Rastermaße" | ✓ |
| **Fest** — alle Stories vorhanden; ausgeschlossene Zustände begründet | Sechs Stories, alle sechs rendern ohne Meldung. `Sequence` zeigt jetzt **sechs** Boxen (`open, needs_clarification, waiting_for_documents, closed_accepted, closed_rejected, closed_superseded`), `in_pipeline` bleibt draußen. `Empty`/`Loading`/`Error` sind in der Spec mit Grund ausgeschlossen | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Text links (`text-align: left`), nichts zentriert; Farbe nur an der aktuellen Box und nur als Registry-Ton; jeder farbige Zustand mit Wort („aktuell"); Kanten 3,45:1; Fokusring 2 px sichtbar; Hover färbt; keine Icons, keine Emoji, keine Versalien; Karte hat Rand ohne Schatten; Texte Sie/Imperativ, Begriffe aus der Registry. Reißt an V10/T8, weil die Beschriftung nicht vollständig lesbar ist: zweizeilige Wörter werden quer durch die zweite Zeile geschnitten und der DB-Wert läuft aus der Box (Mangel 1 und 2) | ✗ |
| **Fest** — im Browser angesehen | Alle sechs Stories im Iframe geöffnet, fünf als Bild (`ab69c-filled.png`, `ab69c-branching.png`, `ab69c-edge.png`, `ab69c-sequence.png`, `ab69c-in-use.png`), dazu echte Maus- und Tastenanschläge über CDP | ✓ |
| Label, Ton, Erklärtext und DB-Ort aus `STATUS_REGISTRY`/`AXIS_SOURCE`; kein Statustext in der Datei | `grep` findet keinen Statustext; `AXIS_SOURCE` kommt aus `./entity-icons` (`:5`), derselben Stelle wie im `StatusInfoDialog`. Gemessen im Popover von `Explain`: Badge „Prüfung nötig", `review_needed`, der Registry-Erklärtext, Quelle `client_source_docs_invoices.processing_status`; in `Edge` entsprechend `client_source_docs.status` | ✓ |
| Ohne `states` Registry-Reihenfolge, mit `states` deren Reihenfolge und Teilmenge | `Branching` ohne `states` ordnet nach `BELEG_PROCESSING`; `Filled` mit `states` stellt `prepared` nach vorn und `cancelled` ans Ende (gemessen: `cancelled` in Spalte 0, Zeile 2); `Sequence` als Teilmenge ohne `in_pipeline` | ✓ |
| Unbekannte Keys hängen hinten als Rohwert-Box: neutral, `code`-Label, kein Erklärtext | `Edge`: `quarantined` und `on_hold` tragen `v2fsm__state--raw`, Label in `JetBrains Mono`, **kein** zweiter `code`-Wert darunter (Nebenbefund der ersten Runde behoben), Popover „Diesen Wert kennt die Registry nicht." mit neutralem Badge. `quarantined` misst Rand `rgb(221,226,232)` = `--color-border`, Fläche weiß — neutral | ✓ |
| Rang = längster Vorwärtspfad; die Spalten von `Filled` und `Branching` wie in der Story-Tabelle | Von Hand gerechnet und mit `getBoundingClientRect()` verglichen — die Aufstellung oben. Acht Spalten in `Filled` (x = 0 · 150 · 300 · 450 · 600 · 750 · 900 · 1050), vier in `Branching`. Rasterbreite 1176 = 8 × 150 − 24, Höhe 140 = 2 × 80 − 20, beides selbst nachgerechnet | ✓ |
| Vorwärts-Nachbarn durch die Mitte, Sprünge als Bogen oben, Rückwärts als Bogen unten; Pfeilspitze als SVG-`marker`; **kein Pfad kreuzt eine Box** | Formen stimmen: in `Filled` neun Pfade durch die Mitte, zwei oben („Quittung" `exporting→confirmed`, „leerer Diff" `confirmed→closed`), fünf unten — zusammen die 16. Die Spitze ist ein `<marker id="v2fsm-arrow">` mit `marker-end`, kein Zeichen (T9). **Aber** fünf Pfade laufen durch das Innere einer dritten Box: `Filled`/`InUse` „Durchgang beendet" durch `review` und `cancelled`, „Zurück an den Agenten" durch `cancelled` und `prepared`; `Branching`/`Explain` „Revalidierung (update_invoice_extraction)" durch `failed`; `Edge` „Reprocess" (aus `classified`) durch `classification_failed` und `on_hold`, „Reprocess" (aus `classification_failed`) durch `on_hold` (Mangel 3) | ✗ |
| Das Paar `processed ⇄ review_needed` ergibt zwei getrennte, nicht deckende Pfade | `Branching`: „Revalidierung" läuft als Nachbar-Kante durch die Mitte (Pfadlänge 24 px), „Revalidierung (update_invoice_extraction)" als Bogen unten (240 px). Kein Paar von Pfaden in einer der Stories hat dasselbe `d` — geprüft über eine Zählung aller `d`-Attribute | ✓ |
| Selbst-Übergänge werden nicht gezeichnet und stehen im Popover unter „Hinaus durch" | `Edge`: neun Übergänge, **acht** Pfade; das Popover von `pending_classification` listet „Erneut anstoßen · zurück auf sich selbst" unter „Hinaus durch" | ✓ |
| `label` eines Übergangs steht als `<title>` am Pfad | `Filled`: **16 von 16** Pfaden tragen ein `<title>`, von „Aufgreifen (start_agent_run)" bis „Abbruch"; `Branching` 7 von 7, `Edge` 8 von 8 | ✓ |
| Ohne `transitions`: eine Reihe, gepunktete Verbinder ohne Spitze, Hinweiszeile; Popover ohne Hinein/Hinaus | `Sequence`: sechs Boxen, alle mit `y = 0` (eine einzige Zeile), fünf Pfade mit gemessenem `stroke-dasharray: 2px, 4px`, **null** `marker-end` und **null** `<marker>` im SVG; darunter „Reihenfolge nach Registry, Übergänge nicht hinterlegt."; das Popover von `needs_clarification` zeigt Badge, `code`, Bedeutung, Quelle — keine Wege | ✓ |
| `current` tönt genau eine Box im Registry-`kind`, setzt „aktuell" und `aria-current="step"`; ohne `current` keine getönte Box; Kanten neutral | Zwei Töne über die Prop belegt: `Filled` (`review`, `kind: "warning"`) misst Rand `rgb(140,96,30)` = `--color-warning` `#8C601E` und Fläche `rgb(245,238,224)` = `--color-warning-bg` — **nicht** mehr der Akzent; `Edge` (`on_hold`, unbekannt → `neutral`) misst `rgb(196,204,213)` / `rgb(244,246,248)`. Dazu zur Laufzeit an derselben Box alle fünf Tonklassen durchgetauscht und die Farbe gelesen: info `rgb(59,143,196)` · success `rgb(63,122,90)` · warning `rgb(140,96,30)` · danger `rgb(168,64,60)` · neutral `rgb(196,204,213)` — fünf verschiedene, jede gleich ihrem Token. Genau **eine** Box mit `aria-current="step"` in `Filled`, `Sequence`, `Edge`; in `Branching` **null**. Kanten überall `rgb(138,138,138)`. Die Beschriftung der aktuellen Box misst 19 px statt 0 und lautet „Kanzlei prüft" | ✓ |
| `description` als Absatz über dem Diagramm, linksbündig; ohne Prop kein Absatz und kein Leerraum | `Filled`: `p.v2fsm__lead` ist das erste Kind, `text-align: start`, `max-width: 68ch` = 579 px, Abstand zum Raster 75 px (Absatzhöhe + 12 px `gap`). `Branching`/`Sequence`: `.v2fsm` hat nur ein Kind (`.v2fsm__scroll`), Abstand nach oben 0 px | ✓ |
| Klick/Enter/Space öffnet das `Popover` mit Badge, `code`-Wert, Erklärtext, Hinein durch, Hinaus durch, DB-Ort; `Esc` schließt; nur eins offen | Echte Maus- und Tastenanschläge über CDP (`Explain`): Klick auf „Prüfung nötig" → ein offenes `.v2pop` mit Badge, `review_needed`, Erklärtext, **Hinein durch** „In Bearbeitung · Pipeline durch, reparierbare Findings" / „Prozessiert · Revalidierung", **Hinaus durch** „Revalidierung (update_invoice_extraction) · Prozessiert", zuletzt `client_source_docs_invoices.processing_status`. Klick auf eine zweite Box → weiterhin genau **eins** offen, `aria-expanded` wandert mit. `Escape` → 0 offen, alle `aria-expanded` `false`. `Enter` (mit `char`-Ereignis) → 1, `Space` → 1 | ✓ |
| `Tab` läuft die Boxen in Spaltenordnung ab; jede Box ist ein `<button>` mit Wort; Fokusring sichtbar; Hover färbt | Echte Tab-Anschläge (`Explain`): `pending → in_progress → processed → failed → review_needed`, danach aus der Karte heraus — Rang, dann Zeile, wie die Spec es sagt. Alle Boxen `<button type="button">` mit sichtbarem Wort. Nach dem Anschlag `:focus-visible` = `true`, `outline: 2px solid rgb(59,143,196)`, `outline-offset: 2px`. Hover: `.v2fsm__state:hover { background: var(--color-bg-soft) }`, im Blatt aus dem Stylesheet gelesen | ✓ |
| SVG `aria-hidden`; Kanten-Token ≥ 3:1 gegen die Karte, Wert als Kommentar am Token | `aria-hidden="true"` an beiden SVG-Varianten, am Element gemessen. Kanten `stroke = rgb(138,138,138)` = `--color-border-control` `#8A8A8A`; selbst nachgerechnet: 3,45:1 gegen `#FFFFFF`, 3,19:1 gegen `#F4F6F8` — beides ≥ 3:1. Der Wert steht als Kommentar am Token (`tokens.css:56`) und noch einmal an der Regel (`v3.css:2803–2811`) | ✓ |
| Labels bis zwei Zeilen, darüber `…` mit `title`; Boxen behalten ihre Rastergröße | Boxen: **alle** 126 × 60 px in `Filled` (11), `Branching` (5) und `Edge` (6); paarweise geprüft — **null** Überschneidungen. Die Beschriftung dagegen bekommt nur 24 px, obwohl sie 38 px braucht: `freigegeben (Bridge)`, `in DATEV angekommen`, `Wird eingeordnet`, `Einordnung fehlgeschlagen` werden quer durch die zweite Zeile geschnitten, ohne `…`. Und der DB-Wert läuft aus der Box: `pending_classification` misst 152 px in einem 126-px-Kasten (Mangel 1 und 2) | ✗ |
| Bei schmaler Karte scrollt `.v2fsm` horizontal, `body` nicht | `Edge`: `.v2fsm__scroll` misst `scrollWidth` 430 gegen `clientWidth` 326 — es scrollt. `document.body.scrollWidth` = `clientWidth` = 1440, die Seite scrollt nicht. In `InUse` dasselbe: die Karte (1180 px) schneidet `closed` ab, der Container scrollt. Die Story nimmt 360 px statt der in der Spec genannten 480 — siehe „Außerhalb der Kriterien" | ✓ |
| Kein `ResizeObserver`, kein `getBoundingClientRect`, keine neue Abhängigkeit; Rastermaße an einer Stelle | Kein `ResizeObserver`, kein `getBoundingClientRect` (nur im Kommentar `:58`), keine neue Abhängigkeit in `package.json`. Die vier Maße stehen an genau **einer** Stelle (`StateMachine.tsx:68–71`), und die Abweichung von „nur als CSS-Variablen" ist begründet — ein `var()` lässt sich nicht addieren. Aber der Rasterkommentar in `v3.css:2789–2790` nennt „Spalte 150, Zeile 74", während `ROW = 80` ist, und die vier weitergereichten Eigenschaften `--v2fsm-col`/`-row`/`-box-w`/`-box-h` (`:244–247`) liest **keine** CSS-Regel (`grep -- "var(--v2fsm" src/` findet nichts), anders als das JSDoc `:62–66` behauptet (Mangel 4) | ✗ |
| Kein `"use client"`; Client-Anteil nur `Popover` | `grep "use client" src/ui/v3/patterns/StateMachine.tsx` → nichts; einziger Client-Anteil ist `Popover` | ✓ |
| Barrel: Export unter `/* Prozess */`; `@instead` von `StatusInfoDialog` und `ProcessStepper` nennen `StateMachine` | `index.ts:263–267` exportiert `StateMachine` und `StateTransition` direkt unter `/* Prozess */`. `StatusInfoDialog.tsx:29`: „The same axis as a **picture**, with its transitions → StateMachine." · `Process.tsx:140`: „the map instead of the position → StateMachine (Z7)." | ✓ |
| Tut bewusst nicht: Übergänge herleiten, Selbst-Übergänge zeichnen, Besitzer, Phasen, zählen, filtern, auslösen | Ohne `transitions` entsteht kein einziger Pfeil (`Sequence`: 0 `<marker>`, 0 `marker-end`); Selbst-Übergang nicht gezeichnet (`Edge`: 8 von 9); kein `Baton`, keine Phase, kein Zähler, kein `onSelect`, kein `href`, kein `fetch`, kein Router-Import in der Datei | ✓ |
| Ersetzt nichts in der App; das Diagramm im `StatusInfoDialog` wartet auf Befund 1 | `StatusInfoDialog` ist bis auf den Halbsatz im `@instead` unverändert, kein Umschalter, kein Aufruf von `StateMachine` außerhalb der eigenen Story | offen (App) |

### Mängel der zweiten Runde

1. **Zweizeilige Beschriftungen werden quer durch die zweite Zeile
   geschnitten — ohne `…`.** `v3.css:2833–2837` gibt `.v2fsm__label` zwei
   Zeilen (`-webkit-line-clamp: 2`), aber die Beschriftung ist ein
   schrumpfendes Flex-Kind in einer Box fester Höhe (`.v2fsm__state`,
   `v3.css:2820–2830`, `BOX_H = 60`, `StateMachine.tsx:71`). Gemessen:
   `freigegeben (Bridge)` in `Filled` misst 24 px hoch bei einem
   `scrollHeight` von 38 — die zweite Zeile steht zu einem Viertel da.
   Dasselbe bei `in DATEV angekommen` (`Filled`, `InUse`), `Wird eingeordnet`
   und `Einordnung fehlgeschlagen` (`Edge`). Weil der Inhalt genau zwei Zeilen
   hat und nicht mehr, setzt `line-clamp` auch keine Auslassungspunkte: es
   sieht nach einem Rendering-Fehler aus, nicht nach einer Kürzung
   (`ab69c-filled.png`, `ab69c-edge.png`, `ab69c-in-use.png`). Die Spec
   verlangt „Labels bis zwei Zeilen, darüber `…` mit `title`" — hier ist schon
   die **zweite** Zeile nicht mehr ganz da.
2. **Der DB-Wert läuft aus der Box heraus und wird vom Nachbarn
   abgeschnitten.** `.v2fsm__meta` und `.v2fsm__value` (`v3.css:2838–2839`)
   kürzen nicht; die Box lässt Überlauf stehen. Gemessen in `Edge`: das
   `<code>` von `pending_classification` (`StateMachine.tsx:373`) ist 152 px
   breit und beginnt bei x = 13 in einem 126 px breiten Kasten — es ragt 39 px
   nach rechts hinaus und endet im Bild an der linken Kante von „Eingeordnet"
   (`ab69c-edge.png`); `classification_failed` ebenso mit 145 px. Die Boxen
   selbst überschneiden sich nicht (M2 der ersten Runde ist insoweit behoben),
   aber der sichtbare Befund von damals — „`pending_classificati…` wird vom
   Nachbarn abgeschnitten" — steht unverändert im Bild.
3. **Fünf Kanten laufen durch Boxen, die weder Quelle noch Ziel sind.**
   Gemessen, indem jeder Pfad in sechzig Schritten abgetastet und gegen die
   Rechtecke aller Boxen geprüft wurde:
   `Filled`/`InUse` — „Durchgang beendet (finish_agent_run)" (`agent→prepared`)
   durch `review` und `cancelled`; „Zurück an den Agenten" (`review→agent`,
   dieselbe Spalte) durch `cancelled` und `prepared`, weil der neue
   Seitenbogen (`StateMachine.tsx:188–194`) mit `out = left − COL · 0,28` auf
   x = 108 ausschert und damit mitten in die Nachbarspalte (0…126) greift.
   `Branching`/`Explain` — „Revalidierung (update_invoice_extraction)"
   (`review_needed→processed`) durch `failed`; im Bild scheint der Pfeil auf
   `Prozessiert` aus `Fehlgeschlagen` zu kommen, einem Übergang, den es nicht
   gibt (`ab69c-branching.png`). `Edge` — „Reprocess" aus `classified` durch
   `classification_failed` und `on_hold`, „Reprocess" aus
   `classification_failed` durch `on_hold`. Das Kriterium „kein Pfad kreuzt
   eine Box" ist damit in vier der sechs Stories verletzt. Dass die Kanten
   unter den Boxen liegen, verdeckt es nur — es macht die Aussage falsch,
   statt sie zu ordnen.
4. **Der Rasterkommentar nennt eine Zahl, die es nicht gibt, und die
   weitergereichten Eigenschaften liest niemand.** `v3.css:2789–2790` sagt
   „(Spalte 150, Zeile 74)", während `ROW = 80` und `BOX_H = 60` sind
   (`StateMachine.tsx:68–71`) — dieselbe Art von Falschaussage, die M5 in der
   ersten Runde beanstandet hat, nur an der anderen Datei. Dazu setzt
   `StateMachine.tsx:244–247` vier Eigenschaften `--v2fsm-col`, `--v2fsm-row`,
   `--v2fsm-box-w`, `--v2fsm-box-h` am Raster, die **keine** CSS-Regel liest:
   `grep -- "var(--v2fsm" src/` findet nichts. Das JSDoc `:62–66` („The card
   hands them to CSS as custom properties, so both sides draw the same raster
   from one source") beschreibt damit eine Leitung, die nirgends ankommt.

### Außerhalb der Kriterien aufgefallen

- **Die Spec und die Story sind bei der schmalen Karte auseinander.** Die
  Story-Tabelle (Zeile 209) und das Kriterium (Zeile 262) nennen 480 px, die
  Story nimmt `maxWidth: 360` (`StateMachine.stories.tsx:149`). Der Bau hat
  recht — bei 480 px passt `beleg_inbox` mit seinen 426 px Rasterbreite hinein
  und nichts würde scrollen —, aber die Zahl steht noch zweimal falsch in der
  Spec. Beim nächsten Anfassen mitziehen.
- **Die Rohwert-Box hängt nicht „hinten", sondern an ihrem Rang.** `on_hold`
  steht in `Edge` in Spalte 0, Zeile 2, `quarantined` in Spalte 2, Zeile 2.
  Das folgt aus der Rangregel und ist richtiger als ein Anhängsel am rechten
  Rand; die Spec sagt an zwei Stellen „hinten" und meint die Reihenfolge, nicht
  die Lage. Kein Mangel, aber der Satz taugt so nicht als Prüfstein.
- **Die leere Unterzeile der Rohwert-Box.** `quarantined` hat weder `code`
  noch „aktuell", also steht dort ein `.v2fsm__meta` von 0 px Höhe. Sichtbar
  ist es nicht, es verschiebt aber die Beschriftung gegenüber den Nachbarn um
  ein paar Pixel nach oben.
- **In `Edge` sind zwei Boxen nur nach dem Scrollen erreichbar.** `deleted` und
  `quarantined` liegen außerhalb der 326 px sichtbarer Breite; ein Klick ins
  Blatt trifft sie nicht, ohne vorher zu scrollen. Das ist der Zweck der
  Story und kein Fehler — es heißt nur, dass eine Prüfung des Popovers dort
  immer erst scrollen muss.

Abgenommen von / am: **nicht abgenommen** · geprüft von Claude
(Abnahme-Agent), 2026-09-06 · Offene Punkte: Mängel 1–4 sowie „ersetzt nichts
in der App" (offen App, Befund 1).

## Die vier Mängel der zweiten Abnahme — behoben

**M1 · Zweizeilige Beschriftungen wurden stumm geschnitten.** Der Grund lag
nicht an der Höhe, sondern an einer Zeile CSS, die ich für harmlos hielt:
`.v2fsm__state` war ein **Flex**-Container, und ein Flex-Kind verliert sein
`display: -webkit-box` — der Browser blockifiziert es zu `flow-root`, und mit
ihm fällt `-webkit-line-clamp` aus. Die Beschriftung wurde also nicht
gekürzt, sondern **abgeschnitten**: 35,8 von 38 px, ohne Ellipse.

Die Box ist jetzt ein Block (Innenabstand statt Zentrierung), und die
Beschriftung klemmt wieder. Nachgemessen: „freigegeben (Bridge)" misst 37,5
gegen `scrollHeight` 38 — sie passt; ein zur Laufzeit eingesetzter
94-Zeichen-Name bleibt bei **zwei** Zeilen (`scrollHeight` 131) und ragt nicht
aus der Box. Die Zeile wuchs dafür von 80 auf 92, die Box von 60 auf 72.

**M2 · Der DB-Wert lief aus der Box.** `pending_classification` misst 152 px
in einem 126er Kasten. Er bekommt jetzt eine Ellipse; der volle Wert steht im
Popover daneben. Gemessen: in keiner der sechs Stories ragt noch ein Inhalt
über seine Box hinaus.

**M3 · Fünf Kanten liefen durch fremde Boxen.** Der erste Versuch führte sie
als geschwungenen Bogen — und eine Kurve schneidet auf dem Weg nach oben die
Ecke der Box, an der sie vorbeiwill; gemessen streifte „Quittung" die linke
obere Ecke von `inspection`, und der Weg aus `agent` lief durch `cancelled`.

Jetzt laufen sie **rechtwinklig mit gerundeten Ecken**: die senkrechten Stücke
liegen in den Spaltenlücken, das waagerechte über oder unter allem. Damit
*kann* ein Weg keine fremde Box berühren — das ist keine Feinjustierung,
sondern eine Eigenschaft der Führung.

Nachgemessen mit einem Abtaster, der jeden Pfad in 120 Punkten gegen jede Box
prüft: **null** Kreuzungen in `Filled` (16 Kanten), `Branching` (7), `Edge`
(8) und `InUse` (16).

**M4 · Der Rasterkommentar und die toten Eigenschaften.** Der Kommentar sagte
„Zeile 74", die Zahl war 80 und ist jetzt 92 — er nennt sie und verweist auf
die Datei, in der sie steht. Die vier `--v2fsm-*` sind weg: keine Regel hat
sie je gelesen, sie waren die zweite Fassung derselben Zahlen.

**Nebenbefund:** die Spec nannte die schmale Karte zweimal mit 480 px, die
Story nimmt 360. Die Story hat recht — bei 480 passt `beleg_inbox` hinein und
bewiese nichts. Die Spec ist korrigiert.

## Nach der dritten Abnahme (2026-09-07): der Rückweg kam aus dem Nichts

**Der Blocker erledigt.** Ein Rückweg in die erste Spalte legt seine senkrechte
Spur auf x = −12 und greift mit dem Bogen darüber hinaus; der Behälter hatte
links 2 px Polster und `overflow-x: auto`. Was links der Inhaltskante liegt,
wird geschnitten **und ist nicht zu erreichen** — sichtbar blieb eine
Grundlinie, die am Rand aufhört, und eine Pfeilspitze neben „bereit", zu der
keine Linie führte. Die Abnahme hat 166 von 466 px eines Pfades als unsichtbar
gemessen (35,7 %).

**Der Vorlauf gehört ins Raster, nicht an den Behälter.** Polster am Behälter
verschiebt den Inhalt, nicht die Zeichenfläche: das SVG liegt mit `inset: 0`
auf dem Raster, und ein Pfad bei −12 bleibt links davon, wie viel Polster auch
außen steht. Das Raster hat jetzt **36 px Vorlauf** (`margin-left`), und der
liegt im scrollbaren Inhalt — also bei jeder Kartenbreite erreichbar.

Nachgemessen mit `getPointAtLength`, 200 Punkte je Pfad, gegen die
Behälterkante:

| Story | geprüfte Punkte | unsichtbar | linkester Punkt |
|---|---|---|---|
| `Filled` | 3.417 | **0** | 26 px innerhalb |
| `Edge` | 1.809 | **0** | 26 px innerhalb |
| `InUse` | 3.417 | **0** | 26 px innerhalb |

**Ein Umweg, den ich dokumentiere, weil er lehrreich ist:** zwei Anläufe davor
haben das Polster am Behälter vergrößert (14 px, dann 32 px) und dabei jedes
Mal „unsichtbar" gemessen. Die Messung selbst war falsch —
`getBoundingClientRect()` auf einem `<path>` liefert für leere Pfade
`0, 0, 0, 0`, und das Minimum über alle Pfade war deshalb immer 0, egal was
das Layout tat. Erst die Messung über die Pfadlänge zeigte, wo die Linien
wirklich liegen. Ein Messfehler, der aussieht wie ein Baufehler, kostet zwei
Runden — dasselbe Muster wie „nicht nachweisbar" in 0065.

**M2 erledigt** — `edgePath` gab unbedingt zurück; der Kommentar darunter und
der Zweig für „zwei Boxen derselben Spalte" liefen nie. Beides ist weg.
`tsc` hat es nicht gefunden, weil `allowUnreachableCode` nicht gesetzt ist.
Dazu die Rasterrechnung im Kopf der Datei: sie stand auf „= 60", während
`BOX_H = 72` ist — dieselbe Art Falschaussage, die diese Aufgabe schon zweimal
zurückgebracht hat, diesmal in der TSX statt im CSS.

**M3 erledigt** — die Story-Tabelle nannte „480 px", die Story nimmt 360. Die
Zahl ist an der einen Stelle berichtigt; das Kriterium stand bereits richtig.
(Beim ersten Versuch hätte eine pauschale Ersetzung acht Stellen getroffen,
darunter sechs, die von der **Messung** bei 480 px handeln und richtig sind —
zurückgenommen und einzeln gesetzt.)

**Außerhalb der Kriterien, benannt und nicht gebaut:** die fünf Rückwege von
`Filled` teilen sich eine Grundlinie bei y = 188; zwischen x = 138 und 588
liegen bis zu drei Pfade exakt übereinander, und die Unterkante liest sich als
eine Linie statt als fünf Wege. Das ist ein echter Mangel des Bildes, aber
kein Kriterium — und die Lösung (je Weg eine eigene Spur) ändert die Geometrie
aller Kanten. **Eigene Aufgabe.**

## Abnahme (vierte Runde, fremd, 2026-09-07)

Geprüft gegen die Spec und den Code, nicht gegen den Chat. Storybook lief auf
`localhost:6107`. Gemessen wird die **Wirkung**: die Lage jeder Box aus
`getBoundingClientRect()`, die Lage jeder Kante aus `getTotalLength()` /
`getPointAtLength()` — 201 Punkte je Pfad, über `getScreenCTM()` in
Blattkoordinaten und von dort in die Inhaltskoordinaten des Behälters
gerechnet. Kein Messwert dieser Runde stammt aus dem Rechteck eines `<path>`
(das für leere Pfade `0,0,0,0` liefert und deshalb konstant lügt) oder aus
einem zurückgelesenen Inline-Stil. Werkzeuge im Scratchpad: `ab69e-run.mjs`,
`ab69e-geom.js`, `ab69e-control.js`, `ab69e-int.mjs`, `ab69e-tab.mjs`,
`ab69e-key2.mjs`, `ab69e-pop.mjs`, `ab69e-farben.js`, `ab69e-clamp.js`,
`ab69e-vert.js`, `ab69e-links.js`, `ab69e-scroll.js`, dazu `abn-shot.mjs` und
`console-check.mjs`.

**Urteil: abgenommen.** Der Rückweg ist da, ganz und erreichbar, und die vier
Punkte, die in der dritten Runde hielten, halten weiter. Drei Mängel bleiben
notiert; keiner davon blockiert.

**Die Gegenprobe zuerst — reagiert der Messwert überhaupt?** In `Filled` den
Vorlauf zur Laufzeit auf `margin-left: 0` gesetzt, gemessen, zurückgesetzt:

| Zustand | geprüfte Punkte | unsichtbar | linkester Punkt (Inhaltskante) |
|---|---|---|---|
| wie gebaut | 3.216 | **0** | +26 px |
| `margin-left: 0` | 3.216 | **72** (alle im Pfad „Durchgang beendet") | −10 px |
| zurückgesetzt | 3.216 | **0** | +26 px |

Der Messwert folgt dem Layout. Danach alle Stories mit Rückwegen, jeder Pfad
in 201 Punkten gegen die Inhaltskanten des scrollbaren Behälters:

| Story | Pfade | geprüfte Punkte | unsichtbar | linkester Punkt | oberster / unterster |
|---|---|---|---|---|---|
| `Filled` | 16 | 3.216 | **0** | +26 px | 2 / 214 (Behälter 216) |
| `Edge` | 8 | 1.608 | **0** | +26 px | 2 / 214 |
| `InUse` | 16 | 3.216 | **0** | +26 px | 2 / 214 |
| `Branching` | 7 | 1.407 | **0** | +164 px | 2 / 214 |
| `Explain` | 7 | 1.407 | **0** | +164 px | 2 / 214 |
| `Sequence` | 5 | 1.005 | **0** | +164 px | 62 / 62 |

Der linkeste Punkt liegt in `Filled`, `Edge` und `InUse` bei **x = −12** im
Raster (Strich 1,5 px, also −12,75 px Farbe); das Raster beginnt 38 px hinter
der Inhaltskante (36 px Vorlauf + 2 px Polster). Der Weg zurück in die erste
Spalte ist damit vollständig gezeichnet und ohne Scrollen sichtbar — im Bild
`shot-ab69e-…filled.png` läuft er aus „Agent arbeitet" nach links, unten
herum und mit der Spitze in die linke Kante von „bereit".

**Die vier Punkte, die in der dritten Runde hielten, nachgemessen:** Boxen
**126 × 72** in `Filled` (11), `Branching` (5), `Explain` (5), `Edge` (6),
`Sequence` (6) und `InUse` (11) — ausnahmslos; Beschriftungen **100 px** breit
in jeder dieser Boxen; **null** Kreuzungen (jeder Pfad in 201 Punkten gegen
jedes Boxenrechteck, 1 px Einzug, Quelle und Ziel ausgenommen) in allen sechs
Stories; die Hinweiszeile „Reihenfolge nach Registry, Übergänge nicht
hinterlegt." steht unter `Sequence`. Kein Inhalt ragt mehr aus seiner Box:
`scrollHeight` = `clientHeight` = 70 an jeder Box, der breiteste DB-Wert misst
100 px im 100-px-Gleis (`pending_classification` mit Ellipse).

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` → „Storybook build completed successfully", Exit 0. Dazu `pnpm check:icons` → „in Ordnung. 53 Zeichen in der Registry", Exit 0. `console-check.mjs` über alle sechs Stories: **0** Konsolenmeldungen | ✓ |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `patterns/StateMachine.tsx` + `StateMachine.stories.tsx`; alle sechs IDs `v3-patterns-prozess-statemachine--{filled,branching,sequence,explain,edge,in-use}` laden und rendern; Titel `v3/Patterns/Prozess/StateMachine` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Der Block `@when „What are the ways out of this state?"` / `@instead … ProcessStepper (Z7) … Timeline … StatusInfoDialog` steht unmittelbar vor `export function StateMachine` (`:208–213`); der Kopfkommentar (`:10–28`) beschreibt nur. Bezeichner, Typen, JSDoc englisch, Deutsch nur in sichtbaren Strings | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -E "#[0-9a-fA-F]{3,8}"` in TSX und Story: nichts. Keine Label-Map, kein Statustext. `px` nur an den vier Rastermaßen (`:67–74`, `:250–253`) — die in der zweiten Runde begründete Abweichung | ✓ |
| **Fest** — alle Stories vorhanden; ausgeschlossene Zustände begründet | Sechs Stories, alle sechs ohne Meldung. `Sequence` zeigt sechs Boxen ohne `in_pipeline`; `Empty`/`Loading`/`Error` sind in der Spec mit Grund ausgeschlossen | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Text links (`text-align: start` am Absatz, `left` in der Box), nichts zentriert; Farbe nur an der aktuellen Box und nur als Registry-Ton, immer mit dem Wort „aktuell"; Kanten 3,45:1; Fokusring 2 px sichtbar; Hover färbt; keine Icons, keine Emoji, keine Versalien. Die Beschriftung ist vollständig lesbar oder sauber gekürzt (siehe Label-Zeile) | ✓ |
| **Fest** — im Browser angesehen | Alle sechs Stories im Iframe geöffnet, fünf als Bild (`shot-ab69e-…{filled,edge,in-use,branching,sequence}.png`), dazu ein Ausschnitt mit einer zur Laufzeit verlängerten Beschriftung (`ab69e-ellipse.png`) und echte Maus- und Tastenanschläge über CDP | ✓ |
| Label, Ton, Erklärtext und DB-Ort aus `STATUS_REGISTRY`/`AXIS_SOURCE`; kein Statustext in der Datei | `AXIS_SOURCE` kommt aus `./entity-icons` (`:3`), derselben Stelle wie im `StatusInfoDialog`. Gemessen im Popover: `Explain` → Badge „Prüfung nötig", `review_needed`, Registry-Erklärtext, `client_source_docs_invoices.processing_status`; `Edge` → `client_source_docs.status` | ✓ |
| Ohne `states` Registry-Reihenfolge, mit `states` deren Reihenfolge und Teilmenge | `Branching` ohne `states` → `pending, in_progress, processed, review_needed, failed`; `Filled` mit `states` → `prepared` in Spalte 0, `cancelled` in Spalte 0/Zeile 2; `Sequence` sechs von sieben Keys ohne `in_pipeline` | ✓ |
| Unbekannte Keys hängen hinten als Rohwert-Box: neutral, `code`-Label, kein Erklärtext | `Edge`: `quarantined` und `on_hold` tragen `v2fsm__state--raw`, Label in `JetBrains Mono`, **kein** zweiter Wert darunter; Popover „Diesen Wert kennt die Registry nicht." mit neutralem Badge. `quarantined` misst Rand `rgb(221,226,232)` = `--color-border`, Fläche weiß | ✓ |
| Rang = längster Vorwärtspfad; die Spalten von `Filled` und `Branching` wie in der Story-Tabelle | Von Hand gerechnet (`prepared` 0 · `cancelled` 0 · `agent` 1 · `review` 1 · `ready` 2 · `exporting` 3 · `inspection` 4 · `failed` 4 · `confirmed` 5 · `mirrored` 6 · `closed` 7) und mit `getBoundingClientRect()` verglichen: x = 0 · 0 · 150 · 150 · 300 · 450 · 600 · 600 · 750 · 900 · 1050, zweite Zeile bei y = 92. `Branching`: 0 · 150 · 300 · 300 (y = 92) · 450. Beides Punkt für Punkt die Story-Tabelle | ✓ |
| Vorwärts-Nachbarn durch die Mitte, Sprünge als Bogen oben, Rückwärts als Bogen unten; Pfeilspitze als SVG-`marker`; **kein Pfad kreuzt eine Box** | `Filled`: neun Pfade durch die Mitte, **zwei** oben (`exporting→confirmed` „Quittung", `confirmed→closed` „leerer Diff", oberster Punkt y = 2), **fünf** unten (unterster Punkt y = 214) — zusammen 16. Spitze ist ein `<marker id="v2fsm-arrow">` mit `marker-end`, Füllung `rgb(138,138,138)`, kein Zeichen (T9). Kreuzungen: **0** in allen sechs Stories | ✓ |
| Das Paar `processed ⇄ review_needed` ergibt zwei getrennte, nicht deckende Pfade | `Branching`: „Revalidierung" als Nachbar-Kante durch die Mitte (Pfadlänge 24 px, y = 62), „Revalidierung (update_invoice_extraction)" als Bogen unten (465,9 px, y bis 214) | ✓ |
| Selbst-Übergänge werden nicht gezeichnet und stehen im Popover unter „Hinaus durch" | `Edge`: neun Übergänge, **acht** Pfade; das Popover von `pending_classification` listet „Erneut anstoßen · zurück auf sich selbst" unter „Hinaus durch" | ✓ |
| `label` eines Übergangs steht als `<title>` am Pfad | `Filled` 16 von 16 (von „Aufgreifen (start_agent_run)" bis „Abbruch"), `Branching` 7 von 7, `Edge` 8 von 8 | ✓ |
| Ohne `transitions`: eine Reihe, gepunktete Verbinder ohne Spitze, Hinweiszeile; Popover ohne Hinein/Hinaus | `Sequence`: sechs Boxen, alle y = 0; fünf Pfade mit gemessenem `stroke-dasharray: 2px, 4px`, **null** `marker-end`, **null** `<marker>` im SVG; darunter die Hinweiszeile; Popover von `needs_clarification` zeigt Badge, `code`, Bedeutung, Quelle — keine Wege | ✓ |
| `current` tönt genau eine Box im Registry-`kind`, setzt „aktuell" und `aria-current="step"`; ohne `current` keine getönte Box; Kanten neutral | `Filled`/`InUse`: genau eine Box mit `aria-current="step"`, Rand `rgb(140,96,30)` = `--color-warning` `#8C601E`, Fläche `rgb(245,238,224)` = `--color-warning-bg`, Wort „aktuell" sichtbar (Beschriftung 19,4 px hoch). `Edge`: `on_hold` unbekannt → neutral, `rgb(196,204,213)` / `rgb(244,246,248)`. `Branching`: **null** getönte Boxen, alle Ränder `rgb(221,226,232)`. Kanten überall `rgb(138,138,138)` | ✓ |
| `description` als Absatz über dem Diagramm, linksbündig; ohne Prop kein Absatz und kein Leerraum | `Filled`: `p.v2fsm__lead` ist das erste Kind, `text-align: start`, `max-width: 579 px` (68ch), 12 px Abstand zum Raster. `Branching`: einziges Kind ist `.v2fsm__scroll`, Leerraum oben 0 px; `Sequence`: `.v2fsm__scroll` + `.v2fsm__note`, oben 0 px | ✓ |
| Klick/Enter/Space öffnet das `Popover` mit Badge, `code`-Wert, Erklärtext, Hinein durch, Hinaus durch, DB-Ort; `Esc` schließt; nur eins offen | Echte Anschläge über CDP (`Explain`): Klick auf „Prüfung nötig" → **1** offenes `.v2pop` mit Badge, `review_needed`, Erklärtext, **Hinein durch** „In Bearbeitung · Pipeline durch, reparierbare Findings" / „Prozessiert · Revalidierung", **Hinaus durch** „Revalidierung (update_invoice_extraction) · Prozessiert", zuletzt `client_source_docs_invoices.processing_status`. Klick auf eine zweite Box → weiterhin genau **1**, `aria-expanded` wandert mit. `Escape` → 0. `Enter` (keyDown mit Text) → 1, `Space` → 1, `Escape` → 0 | ✓ |
| `Tab` läuft die Boxen in Spaltenordnung ab; jede Box ist ein `<button>` mit Wort; Fokusring sichtbar; Hover färbt | Echte Tab-Anschläge auf frisch geladener Seite (`Explain`): `pending → in_progress → processed → failed → review_needed`, danach aus der Karte heraus — Rang, dann Zeile. Alle Boxen `<button type="button">` mit sichtbarem Wort. Nach dem Anschlag `:focus-visible` = `true`, `outline: 2px solid rgb(59,143,196)`, `outline-offset: 2px`. Hover: `.v2fsm__state:hover { background: var(--color-bg-soft) }` | ✓ |
| SVG `aria-hidden`; Kanten-Token ≥ 3:1 gegen die Karte, Wert als Kommentar am Token | `aria-hidden="true"` am SVG beider Varianten, am Element gemessen. Kanten `stroke = rgb(138,138,138)` = `--color-border-control` `#8A8A8A`; im Blatt nachgerechnet: **3,45:1** gegen die Kartenfläche `rgb(255,255,255)`, 3,19:1 gegen `#F4F6F8` — beides ≥ 3:1. Der Wert steht als Kommentar an der Regel (`v3.css:3011–3014`) und am Token (`tokens.css:63`) | ✓ |
| Labels bis zwei Zeilen, darüber `…` mit `title`; Boxen behalten ihre Rastergröße | `title` an jedem Label. Zweizeilige Wörter passen: „freigegeben (Bridge)", „in DATEV angekommen", „Wird eingeordnet", „Einordnung fehlgeschlagen" messen 38,75 px bei `scrollHeight` 39. Ein zur Laufzeit eingesetzter 84-Zeichen-Name bleibt bei **zwei** Zeilen (38,75 px bei `scrollHeight` 136) und endet mit einer sichtbaren Ellipse (`ab69e-ellipse.png`); die Box bleibt 126 × 72 | ✓ |
| Bei schmaler Karte (360 px) scrollt `.v2fsm` horizontal, `body` nicht | `Edge`: `.v2fsm__scroll` misst `scrollWidth` 466 gegen `clientWidth` 326, `scrollLeft` lässt sich bis **140** bewegen — es scrollt wirklich, nicht nur der Stil sagt es. `document.body.scrollWidth` = `clientWidth` = 1440. In `InUse` scrollt der Behälter dagegen **nicht** und die Karte schneidet `closed` ab (Mangel 1) | ✓ für `Edge` |
| Kein `ResizeObserver`, kein `getBoundingClientRect`, keine neue Abhängigkeit; Rastermaße an einer Stelle | Kein `ResizeObserver` (das Wort steht nur im Kommentar `:56`), `getBoundingClientRect` kommt in der Datei überhaupt nicht vor, keine neue Abhängigkeit in `package.json`. `grep -- "var(--v2fsm" src/` findet nichts, und der Kommentar behauptet es auch nicht mehr. Die vier Maße stehen an einer Stelle (`:67–74`) — die Herleitung darüber geht allerdings nicht auf (Mangel 3) | ✓ |
| Kein `"use client"`; Client-Anteil nur `Popover` | `grep "use client" src/ui/v3/patterns/StateMachine.tsx` → nichts | ✓ |
| Barrel: Export unter `/* Prozess */`; `@instead` von `StatusInfoDialog` und `ProcessStepper` nennen `StateMachine` | `index.ts:265–269` exportiert `StateMachine` und `StateTransition` unter `/* Prozess */`. `StatusInfoDialog.tsx:34`: „The same axis as a **picture**, with its transitions → StateMachine." · `Process.tsx:179`: „the map instead of the position → StateMachine (Z7)." | ✓ |
| Tut bewusst nicht: Übergänge herleiten, Selbst-Übergänge zeichnen, Besitzer, Phasen, zählen, filtern, auslösen | Ohne `transitions` kein einziger Pfeil (`Sequence`: 0 `<marker>`, 0 `marker-end`); Selbst-Übergang nicht gezeichnet (`Edge`: 8 von 9); kein `Baton`, keine Phase, kein Zähler, kein `onSelect`, kein `href`, kein `fetch`, kein Router-Import | ✓ |
| Ersetzt nichts in der App; das Diagramm im `StatusInfoDialog` wartet auf Befund 1 | `StatusInfoDialog` unverändert bis auf den Halbsatz im `@instead`, kein Umschalter, kein Aufruf außerhalb der eigenen Story | offen (App) |

### Mängel — **keiner blockiert**

1. **`InUse`: „abgeschlossen" wird abgeschnitten und ist nicht zu erreichen.**
   Gemessen: `.v2fsm__scroll` misst `clientWidth` = `scrollWidth` = 1216, und
   `scrollLeft` lässt sich **nicht** bewegen (Maximum 0) — der Behälter ist so
   breit wie sein Inhalt und scrollt deshalb nie. Geschnitten wird statt
   dessen von der Karte: `.v2card` hat `overflow-x: hidden` und endet bei
   x = 1196, die Box `closed` liegt bei 1125…1251 — **55 von 126 px** sind
   weg, und keine Bewegung bringt sie zurück (`body` scrollt auch nicht,
   1440 = 1440). Ursache ist nicht die Komponente, sondern der Aufrufer: das
   Grid-Kind „Ablauf" der Story trägt `min-width: auto` und schrumpft nicht
   unter die Mindestbreite seines Inhalts; die Mindestbreite reicht durch
   `.v2fsm` (Flex-Spalte) bis zum Raster durch. Gegenprobe zur Laufzeit:
   `min-width: 0` an genau diesem `div` → Behälter 1138 px, `scrollLeft` bis
   78, der Rest ist erreichbar. Der neue Vorlauf hat den Schnitt um 36 px
   vergrößert (vorher wären es rund 21 px gewesen), er hat ihn aber nicht
   verursacht — in `Edge`, wo der Aufrufer eine `max-width` setzt, scrollt der
   Behälter einwandfrei. **Blockiert nicht:** das Kriterium nennt `Edge`, und
   dort ist es erfüllt. Vorschlag: `minWidth: 0` am Wrapper
   (`StateMachine.stories.tsx:189`) und ein Halbsatz im JSDoc, dass ein
   Aufrufer im Grid oder Flex `min-width: 0` setzen muss, damit die Karte
   scrollen statt schneiden kann.
2. **Der Kommentar am Vorlauf nennt eine Zahl, die die Messung nicht
   hergibt.** Der Kommentar über `.v2fsm__grid` (`v3.css:2997–3004`) begründet die 36 px mit „ein Rückweg in die
   erste Spalte greift mit seinem Bogen bis x = −30 aus". Gemessen liegt der
   linkeste Punkt jedes Rückwegs bei **x = −12** im Raster (−12,75 px mit dem
   1,5-px-Strich), in `Filled`, `Edge` und `InUse` gleich; auch die Pfeilspitze
   reicht nicht weiter. Der Vorlauf ist damit rund 23 px größer als nötig —
   und er schiebt die Karte gegenüber dem Absatz (`Filled`) und der
   Hinweiszeile (`Sequence`) um 38 px nach rechts, was im Bild als Einzug zu
   sehen ist. Vorschlag: die Zahl berichtigen und den Vorlauf auf das Maß
   bringen, das die Messung trägt (12,75 px Farbe plus Rand), oder begründen,
   warum es mehr sein soll.
3. **Die Rasterrechnung im Dateikopf geht nicht auf.**
   `StateMachine.tsx:68–71`: „Zwei Zeilen Beschriftung (2 × 19) plus die
   Wertzeile (15) plus Innenabstand (2 × 8) und die Ränder = **72**". Die
   genannten Summanden ergeben 71; gemessen sind die Zeilen 19,375 px und
   17,81 px, was 74,56 ergäbe. Die **72** stimmt (an jeder Box gemessen), die
   Herleitung nicht — dieselbe Art Aussage, die diese Aufgabe schon dreimal
   beschäftigt hat, nur diesmal in den Nachkommastellen. Vorschlag: die
   gemessenen Zeilenhöhen einsetzen oder den Satz auf „die Box ist 72 hoch,
   damit zwei Zeilen Beschriftung und die Wertzeile hineinpassen" kürzen.

### Außerhalb der Kriterien aufgefallen

- **Der Abnahme-Eintrag der dritten Runde fehlt in dieser Datei.** Auf „Die
  vier Mängel der zweiten Abnahme — behoben" folgt unmittelbar „Nach der
  dritten Abnahme (2026-09-07)", die dort behobenen Punkte („M2", „M3")
  stehen nirgends beschrieben. Wer den Verlauf nachliest, findet zwei
  Antworten ohne ihre Frage. (Der Entwurf liegt im Scratchpad als
  `ab69d-eintrag.md`; er gehört vor diesen Eintrag.)
- **Die gemeinsame Grundlinie der fünf Rückwege ist bestätigt.** In `Filled`
  enden alle fünf unteren Bögen auf derselben Höhe (unterster Punkt y = 214),
  und zwischen x = 176 und 638 liegen mehrere übereinander. Laut Nacharbeit
  bewusst offen und ausdrücklich **kein** Rückgabegrund — hier nur bestätigt,
  damit die eigene Aufgabe eine Messung hat.
- **Die Statuszeile im Kopf steht auf „Abnahme".** Nach dieser Freigabe
  gehört dort „fertig" hin; eine Abnahme ändert die Spec nicht über ihren
  eigenen Eintrag hinaus, deshalb bleibt sie hier stehen.
- **Das Popover einer Rohwert-Box schreibt den Schlüssel zweimal** (Badge
  `on_hold`, darunter `code` `on_hold`) — in der Box selbst ist das seit der
  zweiten Runde behoben, im Kopf des Popovers steht es noch doppelt.

Abgenommen von / am: **abgenommen (freigegeben)** · geprüft von Claude
(Abnahme-Agent), 2026-09-07 · Offene Punkte: Mängel 1–3 (keiner blockiert),
die gemeinsame Grundlinie der Rückwege (eigene Aufgabe) sowie „ersetzt nichts
in der App" (offen App, Befund 1).

## Nach der vierten Abnahme (2026-09-07): freigegeben, drei Nachträge

Die Abnahme hat **freigegeben** — und ihre eigene Messung gegengeprüft, indem
sie den Vorlauf zur Laufzeit auf 0 setzte: 72 unsichtbare Punkte statt 0, dann
zurück auf 0. Genau die Kontrolle, die der Runde davor gefehlt hat. Null
unsichtbare Punkte in sechs Stories, null Kantenkreuzungen, 44 Boxen à
126 × 72.

- **Der Vorlauf ist von 36 auf 16 px zurück.** Der Kommentar nannte „x = −30";
  gemessen greift der Bogen bis **−12** aus (−12,75 mit Strich). 36 px waren
  rund 23 zu viel und haben die Karte gegen Absatz und Hinweiszeile
  eingeschoben. Nachgemessen: linkester Punkt 6 px innerhalb der Kante, null
  unsichtbar.
- **Die Rasterrechnung im Dateikopf ist raus.** Sie ging nicht auf (die
  Summanden ergaben 71, gemessen sind die Zeilen 19,375 und 17,81 px) und
  stand damit zum zweiten Mal falsch da. Jetzt steht dort, dass **72** an
  allen 44 Boxen gemessen ist — eine Summe hinzuschreiben hieße, sie bei der
  nächsten Schriftstufe still falsch werden zu lassen.
- **`InUse` schnitt den letzten Zustand um 55 px ab.** Nicht das Diagramm war
  schuld, sondern der Aufrufer: das Rasterkind schrumpft mit `min-width: auto`
  nicht, also reichte die Mindestbreite durch und die Karte schnitt, statt
  dass der Behälter scrollt. Mit `minWidth: 0` gemessen: Behälter 1.138 gegen
  Inhalt 1.196, er scrollt. **Das ist in dieser Welle der vierte Fall
  derselben Art** — ein `overflow-x` im Inneren schützt sich nicht selbst.

**Was die Abnahme sonst noch gefunden hat, und es stimmt:** der Abnahme-Eintrag
der **dritten** Runde fehlt in dieser Datei. Auf „Die vier Mängel der zweiten
Abnahme" folgt direkt die Nacharbeit zur dritten. Der Entwurf lag im
Scratchpad und ist nie eingearbeitet worden — die Mängel M2 und M3, auf die
sich die Nacharbeit bezieht, stehen deshalb nirgends beschrieben. Das ist ein
Loch in der Spur, kein Baufehler, und es lässt sich nicht rückwirkend
schließen: der Entwurf ist Arbeitsstand, kein Abnahme-Eintrag. Was er sagte,
steht in der Nacharbeit; wer die Kette liest, findet den Grund dort.
