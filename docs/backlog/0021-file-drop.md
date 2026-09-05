# 0021 · FileDrop — die Dateiablage

| | |
|---|---|
| Status | in Arbeit |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Dateien ablegen ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 1 „Dateiablage (Drop-Zone, Liste, Fortschritt)"; Kit `UploadZone` |
| Ersetzt | 5 rohe `type="file"` und 6 Drag-Handler in `InvoiceUploader`, `CaseDocumentUploaderModal` u. a. |
| Blockiert | Posteingang, Beleg-Nachforderung, Portal-Karte — überall, wo ein Beleg ankommt |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Mandant zieht drei Fotos in den Posteingang, die Kanzlei lädt einen
DATEV-Export hoch. Heute macht das jede Stelle anders: mal ein nacktes
`<input type="file">`, mal eine eigene Drop-Zone ohne Tastaturweg, nirgends
eine einheitliche Antwort auf „zu groß", „falsches Format", „lädt noch".

## Einordnung

- **Wiederverwenden:** `Field` trägt Label und Fehler, kennt aber keine
  Dateien. `Callout` zeigt den Fehler, wenn er schon feststeht.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, fünf belegte
  Verwendungen, und Drag-and-drop mit Tastaturweg ist an der Aufrufstelle
  nicht in 15 Zeilen richtig zu bauen.
- **Zuschnitt:** eine Datei, ein Export. Die Dateiliste ist Teil davon, weil
  sie ohne die Zone nie auftritt.
- **Setzt auf:** `Button` (Datei wählen), `ProgressCell` (Fortschritt je
  Datei), `TextButton` (entfernen), `Callout` (Fehler).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Was abgelegt werden soll — sichtbar (I8) | `Empty` |
| `onFiles` | `(files: File[]) => void` | ja | Auswahl oder Ablage; der Aufrufer lädt hoch | `Interactive` |
| `files` | `DroppedFile[]` | nein | `{ id, name, size, progress?, error? }` — der Stand, den der Aufrufer hält | `WithFiles` |
| `onRemove` | `(id: string) => void` | nein | Eintrag aus der Liste nehmen | `Interactive` |
| `accept` | `string` | nein | MIME-Filter wie beim nativen Feld | `Empty` |
| `multiple` | `boolean` | nein | Mehrere Dateien, Default `true` | `Empty` |
| `maxSizeMb` | `number` | nein | Grenze; darüber gibt es einen Fehler **vor** dem Aufruf | `Rejected` |
| `disabled` | `boolean` | nein | Keine Ablage möglich | `Empty` |
| `hint` | `string` | nein | Ein Satz unter der Zone: erlaubte Formate, Größe (T6) | `Empty` |

Was die Komponente **nicht** kann: hochladen (kein `fetch`, keine Server
Action — sie meldet nur, was abgelegt wurde), Bilder drehen oder verkleinern,
und sie kennt keine Belegart. Der Fortschritt kommt von außen; sie erfindet
keinen.

## Verhalten

Client-Component. **Tastaturweg zuerst:** die Zone ist ein `<button>`, das den
Dateidialog öffnet — Drag-and-drop ist die Zugabe, nicht der einzige Weg
(V11). Beim Überziehen bekommt die Zone eine Tonstufe Hintergrund, sie wächst
nicht und springt nicht (§2, V12). Abgelehnte Dateien (Format, Größe) stehen
mit Namen und Grund in der Liste, nicht in einem Alert; die übrigen werden
trotzdem übergeben. `aria-describedby` verbindet Zone und `hint`.

## Stories

Titel `v3/Primitives/Formular/FileDrop`. Abgeleitet nach §6: 4 Zustände
(leer, gefüllt, lädt, Fehler) + 1 Callback + 1 „im Einsatz" = 6.

| Story | Beweist |
|---|---|
| `Empty` | leere Zone mit Hinweis und Knopf, dazu `disabled` |
| `WithFiles` | drei Dateien mit Größe, eine entfernbar |
| `Uploading` | zwei Dateien mit Fortschritt, eine fertig |
| `Rejected` | zu groß und falsches Format — mit Grund in der Liste |
| `Interactive` | Rundlauf: wählen, Liste wächst, entfernen |
| `InCard` | in einer `Card` als Beleg-Nachforderung, wie im Portal |

Nicht anwendbar: `LeerNachFilter` — es gibt keinen Filter.

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

- [ ] Die Zone ist per Tastatur erreichbar und öffnet mit Enter den Dateidialog (Story `Empty`, Regel V11)
- [ ] Beim Überziehen ändert sich nur der Hintergrund, nichts wächst (Story `Empty`, Regel V12)
- [ ] Abgelehnte Dateien nennen den Grund, die übrigen kommen trotzdem an (Story `Rejected`)
- [ ] Die Komponente lädt selbst nichts hoch (Blick in den Code: kein `fetch`)
- [ ] Ersetzt die Drop-Zone in `InvoiceUploader.tsx` ohne Funktionsverlust


## Offene Fragen

1. Soll die Komponente eine Vorschau zeigen? *Ohne Antwort: nein — Name,
   Größe, Zustand reichen; die Belegvorschau ist eine Entitäts-Form.*
2. Wer entfernt eine Datei, die schon hochgeladen ist? *Ohne Antwort: der
   Aufrufer über `onRemove`; die Komponente kennt keinen Server.*

## Abnahme

**Zweite Abnahme, 2026-09-05** (fremder Prüfer, nicht der Erbauer). Der erste
✗ ist behoben — `accept` greift jetzt auch beim Ablegen. Zwei Punkte reißen
weiter, einer davon neu. Jedes Kriterium einzeln, fest und variabel:

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; zweimal gelaufen (Beginn und Ende der Abnahme, 2026-09-05) | ✓ |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen (schreibt nach `storybook-static`, parallele Abnahmen). Der Lauf für diesen Stand war grün („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/FileDrop.tsx` mit `FileDrop.stories.tsx` daneben; Titel `v3/Primitives/Formular/FileDrop` (`FileDrop.stories.tsx:7`); Export `src/ui/v3/index.ts:109` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Zwei Exporte: `DroppedFile` (`:15`) und `FileDrop` (`:37`) mit `@when`/`@instead` in `:33–35`. Bezeichner, Props und Kommentare englisch | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:" FileDrop.tsx` → keine Treffer; Maße in `v3.css:1873–1894` (`.v2drop*`). Kein Status im Spiel | ✓ |
| **Fest** — alle Stories der Spec vorhanden, ausgeschlossene Zustände begründet | `index.json`: `--empty`, `--with-files`, `--uploading`, `--rejected`, `--interactive`, `--in-card` — sechs, wie in der Ableitung (4 Zustände + 1 Callback + 1 „im Einsatz"). `LeerNachFilter` ist mit Grund ausgeschlossen | ✓ |
| **Fest** — Story-Deckung der Schnittstelle | Alle neun Props sind belegt: `label` → `--empty`, `onFiles` → `--interactive` (echte Auswahl über das native Feld, die Liste wächst), `files` → `--with-files`, `onRemove` → `--interactive` (geklickt, die Zeile verschwindet), `accept`/`multiple` (am `input` ausgelesen: `application/pdf,image/*`, `multiple: true`) und `hint` → `--empty`, `maxSizeMb` → `--rejected` und `--interactive`, `disabled` → `--empty` (zweite Zone, `disabled` am `<button>`) | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 (ohne die zwei App-Punkte) | Stufe `primitives/`, Importe nur abwärts (`Progress`, `TextButton`), kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Text links, Größe rechts mit `tnum` (`.v2dropfile__size`: `lining-nums tabular-nums`, gemessen) ✓ · Dateizeile 6 px Polster, unter `.v2tbl__row` ✓ · Farbe nur am Fehler (Rot = Stufe Fehler), sonst grau ✓ · jeder farbige Zustand mit Wort: die rote Zeile trägt den Grund im Klartext (V7) ✓ · der Fortschritt trägt „35 %" als Wort neben dem Balken ✓ · fünf Zustände: vier gebaut, `LeerNachFilter` begründet ausgeschlossen ✓ · Kontrast gemessen: Fehlerzeile 5,6:1, Hinweis 4,88:1, Größe 6,17:1, Zonentext 13,77:1 ✓ · Fokusring `2px solid rgb(59,143,196)`, Offset 2 px ✓ · keine Transition auf `.v2drop`, `prefers-reduced-motion` gegenstandslos ✓ · Hover: `.v2drop:hover` färbt eine Tonstufe ✓ · kein Icon, kein Emoji, keine Unicode-Zeichen ✓ · Karte in `--in-card` mit Rand, ohne Schatten ✓. **Ein Punkt reißt:** die Texte T1–T5 — siehe Zeile **M1**. Set-weiter Befund: `.v2field__label` in Versalien (`v3.css:842–845`, A2/T3), wie in 0017 als Befund gewertet | ✗ (wegen M1) |
| **Fest** — im Browser angesehen | Alle sechs Stories in Chromium auf `localhost:6107` geöffnet; echte Dateien über das native Feld ausgewählt, echte `drop`-Ereignisse mit `DataTransfer` ausgelöst, Einträge entfernt; Bild von `--in-card` geprüft | ✓ |
| **Variabel** — Zone per Tastatur erreichbar, Enter öffnet den Dateidialog (V11) | `--empty`: ein Tab landet auf `BUTTON.v2drop`, `:focus-visible` greift (`outline: 2px solid rgb(59,143,196)`, `outline-offset: 2px`). Die Zone ist ein echtes `<button type="button">` (`FileDrop.tsx:110–111`), Enter löst also den Klick aus; nicht gedrückt, weil der native Dateidialog die Sitzung blockiert hätte. Dass derselbe Weg Dateien annimmt, ist in `--interactive` über das verdeckte `input` gezeigt | ✓ |
| **Variabel** — beim Überziehen ändert sich nur der Hintergrund, nichts wächst (V12) | `--empty`, `dragover` ausgelöst und gemessen: `background` `rgb(255,255,255)` → `rgb(244,246,248)` (Klasse `v2drop is-over`), Maße vorher und nachher identisch 460 × 84,25 px | ✓ |
| **Variabel** — abgelehnte Dateien nennen den Grund, die übrigen kommen trotzdem an | **Größe:** echter `drop` auf `--interactive` (`maxSizeMb=5`) mit `riesig.pdf` (6 MB) und `tabelle.xlsx` → in der Liste steht „riesig.pdf · 6,0 MB · Zu groß — höchstens 5 MB.", `tabelle.xlsx` ist durchgelaufen. **Format:** echter `drop` auf `--empty` (`accept="application/pdf,image/*"`, `maxSizeMb=20`) mit vier Dateien → abgelehnt werden nur `notiz.txt` (Format) und `scan.pdf` (21 MB, Größe), `beleg.pdf` und `foto.png` gehen durch. `accepted()` (`FileDrop.tsx:68–77`) prüft Endung, `typ/*` und exakten MIME-Typ — das ist der behobene ✗ der ersten Runde | ✓ |
| **Variabel** — die Komponente lädt selbst nichts hoch | `grep -n "fetch\|XMLHttpRequest\|use server" FileDrop.tsx` → kein Treffer; beim Ablegen entstehen keine Netzwerk-Anfragen (in der Story beobachtet) | ✓ |
| **M1 · Variabel** — der Ablehnungsgrund ist ein Text für die Sachbearbeiterin (T4/T5) | **Reißt.** Den einzigen Grund, den die Komponente selbst formuliert, setzt sie aus `accept` zusammen: `FileDrop.tsx:86` → `` `Format nicht vorgesehen — ${accept}.` ``. Im Browser steht damit in `--empty` nach dem Drop von `notiz.txt` wörtlich „Format nicht vorgesehen — application/pdf,image/*." — ein MIME-Ausdruck vor einer Steuerfachangestellten (T4: technische Namen nur in Technik-Sichten; T5: kein nächster Schritt). Die Story `--rejected` zeigt stattdessen „Format nicht vorgesehen — PDF, JPG oder PNG." — dieser Text kommt aus der `files`-Prop, nicht aus der Komponente. Die Story führt also eine Formulierung vor, die es im Code nicht gibt | ✗ |
| **M2 · Fest** — eine Kennung kommt nur einmal vor | **Reißt (aus der ersten Runde übernommen, unverändert).** `aria-describedby="v2drop-hint"` (`FileDrop.tsx:114`) und `id="v2drop-hint"` (`:129`) sind feste Literale. Zwei `FileDrop` mit `hint` auf einer Seite erzeugen dieselbe `id` zweimal; die Vorlesehilfe liest dann für beide Zonen denselben Satz. Heute unauffällig, weil in `--empty` nur die erste Zone einen `hint` trägt | ✗ |
| **Variabel** — ersetzt die Drop-Zone in `InvoiceUploader.tsx` ohne Funktionsverlust | Betrifft das Repo `ludwig/app` und ist hier nicht erfüllbar. Der fachliche Befund der ersten Runde bleibt: `DroppedFile` kennt nur `progress` und `error`, das Original zeigt je Datei ein Schrittwort und einen Link „Beleg öffnen" — solange das fehlt, kann die App die Zone nicht eins zu eins übernehmen | offen (App) |

**Zurück auf `in Arbeit`.** Zu tun:

1. **M1 — der Ablehnungsgrund darf keinen MIME-Ausdruck zeigen.** Entweder der
   Aufrufer gibt die erlaubten Formate in Worten mit (eine Prop neben `accept`,
   oder der ohnehin vorhandene `hint` trägt den Text), oder `accepted()`
   übersetzt die Regel („PDF", „Bild"). Danach zeigt die Story `Rejected` den
   Formatfehler so, wie die Komponente ihn erzeugt — heute ist er dort über
   `files` gestellt.
2. **M2 — `id` und `aria-describedby` eindeutig machen** (`useId()`), damit zwei
   Ablagen mit `hint` auf einer Seite nebeneinander stehen können.

**Befund** (kein Mangel dieser Aufgabe): `.v2field__label` (`v3.css:842–845`)
setzt `text-transform: uppercase`; die Beschriftung erscheint als „BELEGE
HOCHLADEN" — A2/T3, betrifft jedes Feld des Sets und gehört in eine eigene
Aufgabe (wie in 0017 festgestellt).

Erste Runde (2026-09-03, Historie): ✗ am Format-Fall (`accept` griff nicht beim
Ablegen) und am App-Kriterium; der Format-Fall ist behoben und nachgeprüft.
