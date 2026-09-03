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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Zone per Tastatur erreichbar, Enter öffnet den Dateidialog (V11) | `v3-primitives-formular-filedrop--empty`: Tab landet auf `BUTTON.v2drop`, `:focus-visible` greift (`outline: rgb(59,143,196) solid 2px`, `outline-offset: 2px`). Die Zone ist ein echtes `<button>`, Enter löst also den Klick aus — nicht gedrückt, weil der native Dateidialog die Browser-Sitzung blockiert hätte | ✓ |
| Beim Überziehen ändert sich nur der Hintergrund, nichts wächst (V12) | `--empty`, `dragover` ausgelöst: `background` `rgb(255,255,255)` → `rgb(244,246,248)` (Klasse `is-over`), Maße unverändert 460 × 84,25 px | ✓ |
| Abgelehnte Dateien nennen den Grund, die übrigen kommen trotzdem an | **Größe ✓**: echter `drop` auf `--interactive` (`maxSizeMb=5`) mit drei Dateien → „riesig.pdf · 6,0 MB · Zu groß — höchstens 5 MB." in der Liste, `klein.pdf` und `tabelle.xlsx` sind durchgelaufen. **Format ✗**: `take()` prüft nur die Größe, `accept` geht ausschließlich an das native Feld — eine per Drag abgelegte Datei falschen Formats wird durchgereicht. Der Formatfehler in `--rejected` kommt aus der `files`-Prop, nicht aus der Komponente; die Spec verlangt unter „Verhalten" beides | ✗ |
| Die Komponente lädt selbst nichts hoch | `grep fetch src/ui/v3/primitives/FileDrop.tsx` → kein Treffer; keine Server Action, kein `XMLHttpRequest` | ✓ |
| Ersetzt die Drop-Zone in `InvoiceUploader.tsx` ohne Funktionsverlust | Vergleich mit `app/apps/web/src/modules/files/ui/InvoiceUploader.tsx`: Zone, Klick, Drag, Tastaturweg, Hinweiszeile, Dateiliste, Größe, Fortschritt und Entfernen sind gedeckt — die stille Ablehnung des Originals wird sogar zum genannten Grund. Nicht abbildbar ist der **Zustand je Datei**: `DroppedFile` kennt nur `progress` und `error`, das Original zeigt sechs Schrittwörter (`wartend`, `Upload-URL`, `Upload NN %`, `Bestätigung`, `Registrieren`, `Bereit`/`Duplikat`) und je Datei einen Link „Beleg öffnen →" | ✗ |
| `pnpm typecheck` / `pnpm build` | beide grün | ✓ |

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:
(1) `accept` auch beim Ablegen prüfen und die abgelehnte Datei mit Grund in die
Liste stellen — sonst ist die Story `Rejected` für den Formatfall gestellt und
nicht bewiesen. (2) `DroppedFile` um ein Zustandswort (und wahlweise eine
Handlung je Zeile) erweitern, sonst bleibt `InvoiceUploader` beim Eigenbau.
(3) Kleinigkeit: `aria-describedby="v2drop-hint"` ist eine feste Kennung — zwei
`FileDrop` mit `hint` auf einer Seite erzeugen dieselbe `id` zweimal.
