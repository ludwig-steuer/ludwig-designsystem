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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
