# 0021 · FileDrop — die Dateiablage

| | |
|---|---|
| Status | Abnahme |
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

---

**Nachprüfung, 2026-09-05 — gegen die wiederhergestellten Kriterien** (dritter
Agent, weder Erbauer noch Vorprüfer). Grund: `64fbe27` hat in zwölf Specs
„Abnahmekriterien" und „Offene Fragen" **gelöscht** und zugleich die
Abnahme-Tabelle eingetragen; geprüft wurde also gegen eine Liste, die im
Dokument nicht mehr stand. `e6eae99` hat beide Abschnitte aus `64fbe27^`
zurückgeholt. Diese Runde prüft jedes Kriterium noch einmal am Code und im
Browser und übernimmt das frühere Ergebnis nicht.

**Wiederherstellung geprüft:**
`diff <(git show 64fbe27^:docs/backlog/0021-file-drop.md) docs/backlog/0021-file-drop.md`
— in „Abnahmekriterien" und „Offene Fragen" genau eine Abweichung, eine
zusätzliche Leerzeile vor „## Offene Fragen". Sieben feste Kriterien, fünf
variable und beide offenen Fragen stehen wortgleich wieder da. Nichts fehlt.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | Zu Beginn dieser Runde: `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. Der Lauf am Ende meldet zwei Fehler, beide in `src/ui/v3/patterns/entity-icons.ts` (fehlende Achsen gegenüber `Record<StatusAxis, string>`). Sie stammen aus einer **fremden, parallel laufenden Sitzung**, die die Status-Registry erweitert (`git diff --stat HEAD -- src/ludwig/ui/status/status-registry.ts` → 86 neue Zeilen). `FileDrop.tsx` ist im Arbeitsbaum unverändert (`git status --porcelain` → leer) und kommt in keiner Fehlerzeile vor | ✓ (für diese Aufgabe; der offene Fehler gehört einer anderen Sitzung) |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen: parallel laufen weitere Sitzungen, und der Build schreibt nach `storybook-static`. Zitiert wird der Lauf für diesen Stand, der grün war („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/FileDrop.tsx`, daneben `FileDrop.stories.tsx`; Titel `v3/Primitives/Formular/FileDrop` (`FileDrop.stories.tsx:7`); Export `src/ui/v3/index.ts:109`. `curl -s localhost:6107/index.json` führt alle sechs Einträge unter diesem Titel | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Zwei Exporte: `FileDrop` mit beiden Zeilen (`FileDrop.tsx:33–35`) und das Interface `DroppedFile` (`:15`) ohne — Typ-Exporte tragen im ganzen Set keine `@when`-Zeilen (Stichprobe `Badge.tsx`, `Toast.tsx`, `Combobox.tsx`: je 0 Treffer). Bezeichner, Props, Kommentare englisch; deutsch nur in den Nutzer-Strings | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:' src/ui/v3/primitives/FileDrop.tsx` → keine Treffer; Maße in `v3.css:1886–1907` (`.v2drop*`; Zeilennummern nach heutigem Arbeitsstand, die Datei wird parallel geändert). Kein Status im Spiel | ✓ |
| **Fest** — alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--empty`, `--with-files`, `--uploading`, `--rejected`, `--interactive`, `--in-card` — sechs, genau die Ableitung. `LeerNachFilter` ist mit Grund ausgeschlossen. Story-Deckung der Schnittstelle selbst nachgesehen: `label`/`hint`/`accept`/`multiple`/`disabled` → `--empty` (zweite Zone gesperrt, `button.disabled` im DOM), `files` → `--with-files`, `progress` → `--uploading` („35 %", „80 %" als Wort neben dem Balken), `onFiles`/`onRemove` → `--interactive` (echt ausgelöst, Liste wächst und schrumpft), `maxSizeMb` → `--rejected` und `--interactive` | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Stufe `primitives/`, Importe nur abwärts (`./Progress`, `./TextButton`), kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Name links, Größe rechts mit `tnum` (`.v2dropfile__size`, `font-variant-numeric` gemessen), nichts zentriert ✓ · Farbe nur am Fehler `rgb(168,64,60)`, jede rote Zeile trägt den Grund als Wort (V7) ✓ · Fortschritt mit Prozentwort ✓ · vier Zustände gebaut, `LeerNachFilter` begründet ausgeschlossen ✓ · Kontrast selbst gerechnet: Fehlerrot auf Weiß 6,06:1, Zonentext 13,77:1 (≥ 4,5:1), Fokusring `rgb(59,143,196)` 3,55:1 (≥ 3:1) ✓ · Fokusring sichtbar, keine Bewegung auf `.v2drop` ✓ · Hauptweg per Tastatur ✓ · Hover färbt eine Tonstufe ✓ · kein Icon, kein Emoji ✓ · Karte in `--in-card` mit Rand ohne Schatten ✓. **Zwei Punkte reißen:** die Texte T1–T5 (Zeile **M1**) und die doppelte Kennung (Zeile **M2**). Set-weiter Befund ohne Bezug zu dieser Aufgabe: `.v2field__label` in Versalien — im Browser gemessen steht „BELEGE HOCHLADEN" (A2/T3, wie in 0017) | ✗ (wegen M1 und M2) |
| **Fest** — im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories auf `localhost:6107` in einer eigenen Chromium-Instanz geöffnet (die MCP-Instanz war von einer parallelen Sitzung belegt); echte Dateien über den Dateidialog gewählt, echte `drop`-Ereignisse mit `DataTransfer` ausgelöst, „Entfernen" geklickt, Bilder von `--empty`, `--with-files`, `--uploading`, `--rejected` und `--in-card` angesehen | ✓ |
| **Variabel** — die Zone ist per Tastatur erreichbar und öffnet mit Enter den Dateidialog (`Empty`, V11) | `--empty`: ein Tab landet auf `BUTTON.v2drop`, Fokusring `2px solid rgb(59,143,196)`, Offset 2 px. **Enter wurde diesmal wirklich gedrückt** — der Dateidialog öffnet, das `filechooser`-Ereignis kam an (`multiple: true`), und über diesen Weg gewählte Dateien (`beleg.pdf`, `notiz.txt`) laufen durch dieselbe Prüfung wie eine Ablage: `notiz.txt` erscheint abgelehnt in der Liste, `beleg.pdf` geht durch. Der Tastaturweg ist damit vollständig belegt, nicht nur aus dem Markup geschlossen | ✓ |
| **Variabel** — beim Überziehen ändert sich nur der Hintergrund, nichts wächst (`Empty`, V12) | `--empty`, echtes `dragover` ausgelöst und vorher/nachher gemessen: Hintergrund `rgb(255,255,255)` → `rgb(244,246,248)` (Klasse `v2drop` → `v2drop is-over`), Maße unverändert 460 × 84,25 px | ✓ |
| **Variabel** — abgelehnte Dateien nennen den Grund, die übrigen kommen trotzdem an (`Rejected`) | Der Mechanismus stimmt. **Format:** echter `drop` auf `--empty` (`accept="application/pdf,image/*"`, `maxSizeMb=20`) mit vier Dateien → abgelehnt nur `notiz.txt` (Format) und `scan-ordner-2026.pdf` (21,0 MB), `quittung.pdf` und `foto.png` gehen durch. **Größe:** echter `drop` auf `--interactive` (`maxSizeMb=5`) mit `riesig.pdf` (6,0 MB) und `tabelle.xlsx` → in der Liste „riesig.pdf · 6,0 MB · Zu groß — höchstens 5 MB.", `tabelle.xlsx` steht mit „Entfernen" darüber und verschwindet auf Klick. Der **Wortlaut** des Formatgrundes reißt trotzdem — siehe M1 | ✓ (Wortlaut siehe M1) |
| **Variabel** — die Komponente lädt selbst nichts hoch (Blick in den Code: kein `fetch`) | `grep -nE 'fetch\|XMLHttpRequest\|use server\|axios' src/ui/v3/primitives/FileDrop.tsx` → keine Treffer. Gegenprobe im Browser: beim Ablegen in `--interactive` mitgeschnitten — keine einzige Netzanfrage | ✓ |
| **M1 · Fest (§9, T4/T5)** — der Ablehnungsgrund ist ein Text für die Sachbearbeiterin | **Reißt weiter, unverändert.** `FileDrop.tsx:86` setzt den einzigen selbst formulierten Grund aus `accept` zusammen: `` `Format nicht vorgesehen — ${accept}.` ``. Im Browser steht in `--empty` nach dem Ablegen von `notiz.txt` wörtlich „Format nicht vorgesehen — application/pdf,image/*." — auf demselben Weg auch nach der Auswahl über den Dateidialog. Ein MIME-Ausdruck vor einer Steuerfachangestellten (T4), ohne nächsten Schritt (T5). `--rejected` zeigt „Format nicht vorgesehen — PDF, JPG oder PNG." — dieser Satz kommt aus der `files`-Prop der Story, nicht aus der Komponente; die Story führt eine Formulierung vor, die es im Code nicht gibt | ✗ |
| **M2 · Fest (§9)** — eine Kennung kommt nur einmal vor | **Reißt weiter, unverändert.** `aria-describedby="v2drop-hint"` (`FileDrop.tsx:114`) und `id="v2drop-hint"` (`:129`) sind feste Literale, kein `useId()`. Im DOM nachgesehen: in `--empty`, `--with-files`, `--rejected`, `--interactive` und `--in-card` trägt der Hinweis jedes Mal dieselbe `id` `v2drop-hint`, sie hängt also nicht an der Instanz. Zwei Ablagen mit `hint` auf einer Seite erzeugen damit dieselbe `id` zweimal, und `getElementById` liefert für beide Zonen denselben Satz. Heute fällt es nur nicht auf, weil keine Story zwei Zonen mit `hint` zeigt (in `--empty` hat die zweite Zone keinen). Im Set gibt es den richtigen Weg bereits: `Popover.tsx` und `ExpandableRow.tsx` nutzen `useId` | ✗ |
| **Variabel** — ersetzt die Drop-Zone in `InvoiceUploader.tsx` ohne Funktionsverlust | Betrifft `ludwig/app`; die Datei liegt nicht in diesem Repo (`find` → kein Treffer) und ist hier nicht erfüllbar. Der fachliche Befund der Vorrunde bleibt stehen: `DroppedFile` kennt nur `progress` und `error`, das Original zeigt je Datei ein Schrittwort und einen Link „Beleg öffnen" | offen (App) |

**Ergebnis: bleibt `in Arbeit`.** Beide Mängel der Vorrunde bestehen
unverändert; alle übrigen Kriterien sind erfüllt, das App-Kriterium ist offen.
Zu tun bleibt, was oben unter 1. und 2. steht:

1. **M1** — der Ablehnungsgrund darf keinen MIME-Ausdruck zeigen (Formate in
   Worten mitgeben oder `accepted()` übersetzen lassen); danach zeigt `Rejected`
   den Text, den die Komponente selbst erzeugt.
2. **M2** — `id` und `aria-describedby` mit `useId()` eindeutig machen.

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-05 — zweite Prüfung gegen die
wiederhergestellten Kriterien


## Mängel der Abnahme vom 2026-09-05 — behoben

**M1 — der Ablehnungsgrund zeigte einen MIME-Ausdruck.** Die Zeile las
„Format nicht vorgesehen — application/pdf,image/*." Das ist das
`accept`-Attribut; es gehört in den Dateidialog, nicht vor eine
Sachbearbeiterin (T4/T5). Jetzt sagt der Grund, welche **Endung** sie gerade
versucht hat, und verweist auf den Hinweis, in dem die erlaubten stehen:
„PNG-Dateien nehmen wir hier nicht — erlaubt ist: PDF oder Bild, bis 10 MB."
Ohne `hint` endet der Satz nach dem ersten Teil.

**M2 — `id="v2drop-hint"` war ein festes Literal.** Zwei Ablagen auf einer
Seite trugen dieselbe `id`, und `aria-describedby` beider zeigte auf denselben
Hinweis. Jetzt `useId()`, wie es `Popover` und `ExpandableRow` schon machen.

## Abnahmekriterien (Nachtrag)

- [ ] Der Ablehnungsgrund nennt keine MIME-Angabe (Story `Rejected`, Text im DOM)
- [ ] Der Grund nennt die versuchte Endung und, wenn `hint` gesetzt ist, die erlaubten
- [ ] Zwei `FileDrop` auf einer Seite tragen verschiedene `id`s (im DOM gemessen)

## Abnahme der Nachbesserung, 2026-09-05

Dritte Runde, fremder Prüfer (weder Erbauer noch Vorprüfer). Geprüft gegen
die festen und die variablen Kriterien und gegen den Nachtrag. Gemessen in
einem eigenen headless Chromium (1440 × 900) auf `localhost:6107`; wo eine
zweite Instanz nötig war, ist sie zur Laufzeit in denselben React-Baum
gerendert.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0 | ✓ |
| **Fest** — `pnpm build` grün | Nicht gestartet: er schreibt nach `storybook-static`, und parallel arbeiten weitere Sitzungen im Baum | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/FileDrop.tsx` mit `FileDrop.stories.tsx` daneben; Titel `v3/Primitives/Formular/FileDrop` (`FileDrop.stories.tsx:7`); Export `src/ui/v3/index.ts:109` | ✓ |
| **M3 · Fest** — Code englisch | **Reißt neu.** Die Nachbesserung hat zwei deutsche Kommentarzeilen in die Komponente gesetzt: `FileDrop.tsx:78–79` „// Zwei Ablagen auf einer Seite dürfen nicht dieselbe `id` tragen — sonst zeigt `aria-describedby` beider auf denselben Hinweis (0021)." Vor `9a831fa` war die Datei durchgängig englisch; die Vorrunde hat sie ausdrücklich so protokolliert. `CLAUDE.md` lässt Deutsch nur in Strings zu, die Nutzer sehen. (Das deutsche Zitat in `:41–42` ist kein Verstoß — es zitiert den alten UI-Text in einem englischen Satz.) | ✗ |
| **M4 · Fest** — `@when`/`@instead` an jedem Export | **Reißt neu.** Der Block mit beiden Zeilen steht in `FileDrop.tsx:32–36`, aber der Export beginnt erst in `:54`; dazwischen liegen die JSDoc (`:38–46`) und die Deklaration der privaten Hilfsfunktion `rejectionReason` (`:47`). Der Block hängt damit vor dem Helfer, nicht vor der Komponente — `export function FileDrop` trägt gar kein JSDoc mehr. `git show 9a831fa^:src/ui/v3/primitives/FileDrop.tsx` zeigt ihn noch unmittelbar über `export function FileDrop`; die Einfügung von `rejectionReason` hat ihn abgehängt. Greppbar ist er weiter, an der Komponente steht er nicht mehr | ✗ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}\b|[0-9]+px|fontSize' src/ui/v3/primitives/FileDrop.tsx` → 0; die Maße stehen in `v3.css` (`.v2drop*`). Kein Status im Spiel | ✓ |
| **Fest** — alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--empty`, `--with-files`, `--uploading`, `--rejected`, `--interactive`, `--in-card` — sechs, genau die Ableitung. `LeerNachFilter` mit Grund ausgeschlossen | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Die zwei App-Punkte übersprungen. Der Ablehnungsgrund erfüllt jetzt T4/T5 (Zeile darunter). Gerissen sind die zwei Punkte oben: Code englisch (M3) und `@when`/`@instead` am Export (M4). Der Rest unverändert wie in der Vorrunde protokolliert | ✗ (wegen M3/M4) |
| **Fest** — im Browser angesehen | `--empty`, `--rejected` und `--interactive` geöffnet, echte `drop`-Ereignisse mit `DataTransfer` ausgelöst, die Liste ausgelesen | ✓ |
| **Variabel** — Zone per Tastatur erreichbar, Enter öffnet den Dateidialog (V11) | Unverändert: die Zone ist ein echtes `<button type="button">` (`FileDrop.tsx:130–131`), in der Vorrunde mit gedrückter Eingabetaste belegt | ✓ |
| **Variabel** — beim Überziehen ändert sich nur der Hintergrund, nichts wächst (V12) | Unverändert (`v2drop` → `v2drop is-over`, Maße gleich) | ✓ |
| **Variabel** — abgelehnte Dateien nennen den Grund, die übrigen kommen trotzdem an | `--empty` (`accept="application/pdf,image/*"`, `maxSizeMb=20`, `hint` gesetzt), echter `drop` mit `buchungen.xlsx`, `notiz.txt`, `beleg.pdf`, `ohneendung`: in der Liste stehen genau die drei abgelehnten mit Grund, `beleg.pdf` läuft durch | ✓ |
| **Variabel** — die Komponente lädt selbst nichts hoch | `grep -nE 'fetch\|XMLHttpRequest\|use server\|axios' src/ui/v3/primitives/FileDrop.tsx` → kein Treffer | ✓ |
| **Variabel** — ersetzt die Drop-Zone in `InvoiceUploader.tsx` | Betrifft `ludwig/app`, hier nicht erfüllbar | offen (App) |

**Nachtrag**

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Der Ablehnungsgrund nennt keine MIME-Angabe (Story `Rejected`, Text im DOM) | `--rejected`, `.v2dropfile__err` ausgelesen: „Zu groß — höchstens 20 MB." und „Format nicht vorgesehen — PDF, JPG oder PNG." Kein `application/…`, kein `image/*` im DOM. Gegenprobe an der Komponente selbst (`--empty`, echter `drop`): „XLSX-Dateien nehmen wir hier nicht — erlaubt ist: PDF, JPG oder PNG, höchstens 20 MB je Datei" — ebenfalls ohne MIME | ✓ |
| Der Grund nennt die versuchte Endung und, wenn `hint` gesetzt ist, die erlaubten | Die **Komponente** tut es: `rejectionReason` (`FileDrop.tsx:47–52`) setzt Endung + `hint` zusammen; gemessen in `--empty` „XLSX-Dateien nehmen wir hier nicht — erlaubt ist: …", „TXT-Dateien nehmen wir hier nicht — …", und ohne Endung „Diese Datei nehmen wir hier nicht — …". Die **Story `Rejected`** zeigt das nicht: dort steht weiter „Format nicht vorgesehen — PDF, JPG oder PNG." aus der `files`-Prop (`FileDrop.stories.tsx:88`), also der alte Wortlaut, den die Komponente nicht mehr erzeugt, ohne versuchte Endung. Die Story setzt zudem kein `accept` (`:70–75`), kann den Formatfall also gar nicht selbst auslösen. Genau das stand als Auftrag in der Vorrunde: „danach zeigt die Story `Rejected` den Formatfehler so, wie die Komponente ihn erzeugt" | ✗ |
| Zwei `FileDrop` auf einer Seite tragen verschiedene `id`s (im DOM gemessen) | Zwei Instanzen mit `hint` zur Laufzeit in **einen** React-Baum gerendert und im DOM gemessen: `aria-describedby` `_r_2_` und `_r_3_`, die beiden `.v2drop__hint` tragen dieselben, verschiedenen `id`s, und `document.getElementById` liefert je den eigenen Satz („PDF, bis 20 MB" bzw. „Nur Bilder"). Zusammen mit der Zone der Story stehen drei verschiedene `id`s im Dokument. `useId()` (`FileDrop.tsx:80`) greift | ✓ |

**Zurück auf `in Arbeit`.** Drei Mängel:

1. **M2 der Story — `Rejected` führt einen Wortlaut vor, den es im Code nicht
   gibt.** `FileDrop.stories.tsx:88` setzt den Formatfehler über `files` auf
   „Format nicht vorgesehen — PDF, JPG oder PNG."; die Komponente sagt
   „XLSX-Dateien nehmen wir hier nicht — erlaubt ist: …". Der Story `accept`
   geben und den Fehler entstehen lassen, oder wenigstens den Text der
   Komponente einsetzen.
2. **M3 — deutscher Kommentar in `FileDrop.tsx:78–79.`** Neu hinzugekommen,
   in einer bis dahin englischen Datei. Übersetzen.
3. **M4 — `@when`/`@instead` hängen nicht mehr am Export.** Der Block
   (`FileDrop.tsx:32–36`) steht vor der privaten Hilfsfunktion; `export
   function FileDrop` (`:54`) trägt kein JSDoc. Den Block direkt über den
   Export zurückschieben.

**Befunde** (keine Mängel):

4. **Der Satz endet ohne Punkt, wenn `hint` gesetzt ist** — „… erlaubt ist:
   PDF, JPG oder PNG, höchstens 20 MB je Datei" (`FileDrop.tsx:51`). Ohne
   `hint` steht der Punkt. Der Text der Nachbesserung oben zitiert die Fassung
   mit Punkt.
5. **Der Grund erbt den ganzen `hint`.** Steht im Hinweis auch die Größe („…,
   höchstens 20 MB je Datei"), taucht sie im Format-Grund mit auf. Lesbar,
   aber der Satz sagt mehr, als er beantwortet.
6. **`.v2field__label` in Versalien** (`v3.css`) — set-weit, wie in 0017 und in
   der Vorrunde festgestellt; eigene Aufgabe.

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-05

## Die drei Mängel der Abnahme vom 2026-09-05 (zweite Runde) — behoben

**M1 — die Story `Rejected` zeigte den alten Wortlaut.** Sie reicht ihre
Fehlersätze als `error` an den Dateien herein, statt sie von der Komponente
erzeugen zu lassen — eine statische Story kann nichts fallen lassen. Der Satz
lautet jetzt wörtlich so, wie `rejectionReason` ihn beim echten Ablegen
bildet: „XLSX-Dateien nehmen wir hier nicht — erlaubt ist: PDF, JPG oder PNG,
höchstens 20 MB je Datei." Dazu trägt die Story ein `accept`, damit die
Ablehnung überhaupt der Fall ist, den sie zeigt, und ein Satz im Story-JSDoc
sagt, woher der Text kommt.

**M2 — der neue Kommentar an `hintId` war deutsch.** Englisch.

**M3 — das `@when`/`@instead` hing vor der falschen Funktion.** Beim Einschub
von `rejectionReason` (`9a831fa`) ist der Block zwischen JSDoc und Export
geraten: seither trug die private Hilfsfunktion die Abgrenzung und
`export function FileDrop` gar keine. Der Block steht wieder am Export.

**Nebenbei, aus dem Befund der Abnahme:** der Satz endete ohne Punkt, sobald
`hint` gesetzt war. Er endet jetzt immer auf einen — und wenn der Hinweis
selbst schon einen trägt, nicht auf zwei.

Nicht geändert: dass der Format-Grund den ganzen `hint` erbt, also auch die
Größenangabe. Das ist gewollt — der Hinweis ist der eine Satz, in dem steht,
was hier erlaubt ist, und eine zweite, gekürzte Fassung davon wäre eine
zweite Wahrheit.
