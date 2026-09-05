# 0098 · CaseDrawer — den Sachverhalt neben der Arbeit nachschlagen

| | |
|---|---|
| Status | spec |
| Stufe | `entities/accounting-case/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → der **Rahmen** ja (`Drawer`, 0042), der **Inhalt** nein: Zone 3 sind die Fakten dieses Vorgangs |
| Quelle | `docs/backlog/0052-entity-drawer.md` **Schritt 3** — dort ausdrücklich auf das Entitätsprofil und 0050 vertagt · Entitätsprofil `docs/entitaeten/accounting-case.md` (Status `geprüft`), Formen-Tabelle Zeile `CaseDrawer` |
| Ersetzt | den Seitenwechsel, den `CaseCell` heute erzwingt — es gibt drüben keinen Sachverhalts-Drawer, den man ablösen könnte |
| Voraussetzung | 0095 `CaseCell` · 0097 `CaseFacts` (Zone 3 muss dieselbe Komponente sein wie im View) · `Drawer` (0042) |
| Blockiert | nichts — er ist das Ende der ersten Welle dieser Familie |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Die Sachbearbeiterin prüft einen Kontoauszug und stolpert über einen Verweis
auf Sachverhalt 2026-0412. Heute führt dieser Verweis aus der Seite heraus —
sie verliert die Zeile, an der sie war, den Filter, die Scroll-Position, und
muss zurückfinden. Der Drawer beantwortet **die eine Frage, die woanders
aufkam**, und bietet für alles Weitere den Weg in den View an (0052).

Der Sachverhalt ist dabei der Prüfstein, den 0052 selbst benannt hat: eine
Entität **ohne Original**. Zone 2 entfällt, und damit zeigt sich, ob das
Fünf-Zonen-Schema auch ohne Vorschau trägt.

## Einordnung

- **Wiederverwenden:** `Drawer` (0042) trägt Rahmen, Breite, Fokus und die
  drei Schließwege. `CaseFacts` (0097) trägt Zone 3 — das ist keine
  Empfehlung, sondern ein Kriterium aus 0052: „Zone 3 verwendet **dieselbe**
  Komponente wie der View der Entität — kein zweiter Satz Feldzeilen."
  `CaseCell` (0095) trägt den Kopf.
- **Neu, weil:** `spec-schreiben` §3 Regel 5, und 0052 hat ihn als Schritt 3
  bestellt. Präzedenz und Vorbild ist `SourceDocumentDrawer` (0052/0076).
- **Zuschnitt:** eine Datei, ein Export. **Klasse B** (F113): Daten kommen
  als Props, der Drawer lädt nichts — anders als der App-`BankTransactionDrawer`,
  der seine Daten selbst holt.
- **Setzt auf:** `Drawer`, `CaseFacts`, `CaseCell`, `StatusBadge`, `Button`.

## Die fünf Zonen, hier ohne Zone 2

| Zone | Inhalt | Quelle |
|---|---|---|
| 1 · Kopf | Anzeigename, Nummer, Bearbeitungsstand (Ränge 1–3) | `CaseCell`-Bausteine, `StatusBadge` |
| 2 · Original | **entfällt** — ein Sachverhalt hat keins. Das ist der Prüfstein aus 0052 | — |
| 3 · Kernfakten | `CaseFacts` **ohne** `all`, `tone="bare"` (Ränge 11–16) | 0097 |
| 4 · Grenze | ein Satz, was der Schnellblick nicht beantwortet | Text, Ton nach `ton-und-sprache.md` |
| 5 · Ausgang | ein `Button` in den View, mit dem Wort „Sachverhalt öffnen" | `Drawer` |

Der Satz für Zone 4 steht fest, damit er nicht jedes Mal neu erfunden wird:
**„Ereignisse, Klärungen und Buchungen stehen in der vollständigen
Sachverhaltsansicht."** Er nennt genau das, was der Drawer weglässt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `case` | `CaseDetail \| null` | ja | Der Fall. `null` heißt: noch nicht geladen — der Aufrufer hält den Ladezustand, nicht der Drawer | `Filled`, `Loading` |
| `open` | `boolean` | ja | Offen oder zu; der Aufrufer hält den Zustand (Klasse B) | `Filled`, `Closed` |
| `onClose` | `() => void` | ja | Der dritte Schließweg neben Esc und Scrim | `Filled` |
| `viewHref` | `string` | ja | Zone 5. Ohne Ausgang ist der Drawer eine Sackgasse, deshalb Pflicht | `Filled` |
| `error` | `string \| null` | nein | Was schiefging beim Laden; steht statt Zone 3 | `Error` |
| `eventCount` | `number` | nein | Der Zähler „n Ereignisse" im Kopf — die einzige Relation, die der Drawer zeigt | `Filled` |

**Kann bewusst nicht:**

- **Laden.** Klasse B. Wer den Drawer öffnet, holt die Daten.
- **Schreiben.** Kein Editor, kein Statuswechsel, keine Klärungsantwort —
  alles das ist der View.
- **Die Ereignisse auflisten.** Nur der Zähler; der Strang ist `CaseTimeline`
  (0040) und gehört in den View. Das ist genau die Grenze aus Zone 4.
- **Zone 2 haben.** Ein Sachverhalt hat kein Original. Wer eines sucht,
  findet es am Beleg (`SourceDocumentDrawer`).

## Verhalten

Client-Island nur, soweit `Drawer` es ist. Breite `--drawer-lg` wie beim
Beleg — 0052 hat das entschieden und die Messung steht dort.

Zustände, alle vier aus 0052: **gefüllt** · **lädt** (`case={null}`: eine
ruhige Fläche **in der Form des Inhalts** — fünf `Skeleton`-Zeilen für Zone
3, nicht eine Karte; das war Mangel M2 der 0052-Abnahme und wird hier nicht
wiederholt) · **Fehler** (`error`: der Satz steht statt Zone 3, Zone 5 bleibt
erreichbar) · **zu** (`open={false}`: nichts im DOM).

Tastatur: alles aus `Drawer` — Esc schließt, der Fokus geht in den Drawer und
beim Schließen an den Auslöser zurück. Nichts Eigenes.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseDrawer`. Abgeleitet nach §6: 4 anwendbare
Zustände + 0 Enums + 0 Layout-Booleans + 1 Callback (`onClose`) + 1 „im
Einsatz" + 1 Rand = 7.

| Story | Beweist |
|---|---|
| `Filled` | Alle vier Zonen; Zone 2 fehlt und hinterlässt keine Lücke |
| `Loading` | `case={null}`: fünf Zeilen in der Form der Fakten, keine 96-px-Karte |
| `Error` | `error`: der Satz steht statt Zone 3, der Ausgang bleibt |
| `Closed` | `open={false}`: kein `[role=dialog]` im DOM |
| `Interactive` | Rundlauf: öffnen, Esc, Fokus zurück am Auslöser |
| `Sparse` | Rand: ein Fall ohne Betrag, ohne Partner, ohne Personenkonto — die drei bedeutenden Nullwerte stehen als Wort |
| `InUse` | Aus einer Bank-Zeile heraus geöffnet: die Liste bleibt hinter dem Scrim sichtbar, der Kontext geht nicht verloren |

Nicht anwendbar: `leer nach Filter`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die Klärungen als Liste statt nur als Zähler | `clarifications?: ClarificationRow[]` | eine Seite will im Drawer beantworten statt nur lesen — dann ist es aber ein View |
| Der URL-Zustand (`?case=…`) | keine Prop — der Aufrufer setzt den Suchparameter (L3) | die erste echte Seite baut ihn ein |

## Befunde für `ludwig/app`

- **B1** — Es gibt drüben keinen Sachverhalts-Drawer. Diese Aufgabe ersetzt
  keinen Baustein, sondern einen **Seitenwechsel**: `CaseCell` verlinkt heute
  aus drei Listen heraus in die Detailseite. Der Umzug ist deshalb kein
  Import-Tausch, sondern eine Änderung an den drei Seiten.
- **B2** — `CaseDetail` in `src/ludwig/` muss die Ränge 11–16 tragen; was
  fehlt, meldet 0097 als B2. Der Drawer erbt diese Lücke.

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

- [ ] **Zone 3 importiert `CaseFacts`** — im Drawer steht keine zweite Feldliste (Nachweis: der Import zeigt auf 0097; `grep` findet kein `FieldList` in der Datei)
- [ ] Die Zonen 1, 3, 4, 5 stehen in dieser Reihenfolge; Zone 2 fehlt und hinterlässt keine Lücke (Story `Filled`)
- [ ] Der Grenz-Satz aus Zone 4 steht wörtlich wie oben
- [ ] `Loading` zeigt die Form des Inhalts, nicht eine 96-px-Karte (Story `Loading`, gemessen)
- [ ] `error` ersetzt Zone 3 und lässt Zone 5 stehen (Story `Error`)
- [ ] Klasse B: die Datei enthält kein `useEffect` mit Datenholung, kein `fetch`, keinen Modul-Import (`grep`)
- [ ] Esc schließt, der Fokus kehrt an den Auslöser zurück (Story `Interactive`) — und der Fokus kommt beim Öffnen **in** den Drawer (Aufgabe 0092, dort behoben)
- [ ] Hinter dem offenen Drawer bleibt der Kontext sichtbar (Story `InUse`)
- [ ] offen (App): die drei Listen mit `CaseCell` öffnen den Drawer, statt die Seite zu wechseln

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Zeigt der Drawer den Verlauf als Zähler oder gar nicht? *Ohne Antwort:
   als Zähler im Kopf („4 Ereignisse"). Er beantwortet damit „hängt da viel
   dran?", ohne den Strang zu bauen — und Zone 4 sagt, wo der Strang steht.*
2. Breite `--drawer-lg` wie beim Beleg, obwohl es kein Original gibt? *Ohne
   Antwort: ja. Zwei Breiten für dieselbe Mechanik wären eine Entscheidung je
   Entität, und 0052 hat die Breite einmal entschieden.*
3. Bleibt Zone 5 im Fehlerfall? *Ohne Antwort: ja — gerade dann ist der Weg
   in den View die Antwort, und ein Drawer ohne Ausgang ist eine Sackgasse.*
