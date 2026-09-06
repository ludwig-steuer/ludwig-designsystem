# 0069 · StateMachine — die Landkarte einer Status-Achse

| | |
|---|---|
| Status | Abnahme |
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
| `Edge` | `beleg_inbox` (Labels bis „Einordnung fehlgeschlagen", zwei Zeilen), Übergänge aus dem Registry-Kommentar plus drei Ränder: ein Ziel `quarantined`, das die Registry nicht kennt (Rohwert-Box hinten, neutral, `code`-Label), ein Selbst-Übergang `pending_classification→pending_classification` („Erneut anstoßen", nicht gezeichnet, im Popover unter Hinaus durch), und `current="on_hold"`, das nirgends vorkommt (zweite Rohwert-Box, hervorgehoben, ohne Ton — `kind` neutral). Dazu die Karte auf 480 px Breite: der Container scrollt, die Seite nicht |
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
- [ ] Bei 480 px Kartenbreite scrollt `.v2fsm` horizontal, `body` nicht (`Edge`)
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

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
