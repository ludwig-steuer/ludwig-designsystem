# 0098 · CaseDrawer — den Sachverhalt neben der Arbeit nachschlagen

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
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
| 1 · Kopf | Anzeigename und Nummer (Ränge 1, 3), darunter eine Meta-Zeile: Bearbeitungsstand, Betrag, Art · Gegenpart, Zuständigkeit (Ränge 2, 4–7) — wie der Kopf des `SourceDocumentDrawer` | `caseTitle`, `StatusBadge`, `Amount` |
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
| `reference` | `string` | ja | Die Kennung, die nachgeschlagen wurde. Sie steht im Kopf, im Fehlersatz **und** im Nicht-gefunden-Text — nur so weiß man, wonach gesucht wurde | `Filled`, `Error`, `NotFound` |
| `record` | `CaseQuickView \| null` | ja | Der Fall. `null` heißt **nicht gefunden**, nicht „lädt noch" — das trennt `loading` | `Filled`, `NotFound` |
| `loading` | `boolean` | nein | Schlägt `record`: solange gesetzt, steht die Ladefläche | `Loading` |
| `error` | `ReactNode` | nein | Was schiefging; steht statt Zone 3, Zone 5 bleibt | `Error` |
| `onOpenFull` | `() => void` | ja | Zone 5. Als Callback, nicht als `href` — die Familie öffnet den View über den Aufrufer (Route, Suchparameter, Tab) | `Filled` |
| `open` | `boolean` | ja | Offen oder zu; der Aufrufer hält den Zustand (Klasse B) | `Interactive` |
| `onClose` | `() => void` | ja | Der dritte Schließweg neben Esc und Scrim | `Interactive` |
| `accountHref` | `(accountNumber: string) => string` | nein | Reicht an `CaseFacts` durch | `Filled` |
| `partnerHref` | `string` | nein | Reicht an `CaseFacts` durch | `Filled` |

`CaseQuickView` trägt die Kopf-Ränge (Titel, Gegenpart, Betrag, Zuständigkeit,
Ereignis-Zähler) und die Fakten als `CaseFactsVM`. Dieser Typ ist **lokal**
definiert, weil `src/ludwig/` keine Detail-Sicht des Sachverhalts spiegelt —
Befund **L-68**, dieselbe Lücke wie bei 0097.

**Kann bewusst nicht:**

- **Laden.** Klasse B. Wer den Drawer öffnet, holt die Daten.
- **Schreiben.** Kein Editor, kein Statuswechsel, keine Klärungsantwort —
  alles das ist der View.
- **Die Ereignisse auflisten.** Nur der Zähler; der Strang ist `CaseTimeline`
  (0040) und gehört in den View. Das ist genau die Grenze aus Zone 4.
- **Zone 2 haben.** Ein Sachverhalt hat kein Original. Wer eines sucht,
  findet es am Beleg (`SourceDocumentDrawer`).

## Verhalten

Client-Island nur, soweit `Drawer` es ist. Breite **`md`**: 0052 staffelt
`sm` für Fakten, `md` für ein Detail, `lg` für ein Dokument oder eine Tabelle.
Der Sachverhalt hat weder Dokument noch Tabelle — `lg` wäre die Breite des
Belegs ohne dessen Inhalt.

Zustände, alle vier aus 0052: **gefüllt** · **lädt** (`loading`: eine
ruhige Fläche **in der Form des Inhalts** — fünf `Skeleton`-Zeilen für Zone
3, nicht eine Karte; das war Mangel M2 der 0052-Abnahme und wird hier nicht
wiederholt) · **Fehler** (`error`: der Satz steht statt Zone 3, Zone 5 bleibt
erreichbar) · **nicht gefunden** (`record={null}` ohne `loading`: ein
`EmptyState` mit der Kennung, kein leerer Rahmen).

Die vier Zustände des 0052-Schemas sind **lädt · Fehler · nicht gefunden ·
Inhalt** — „zu" ist keiner von ihnen mehr, sondern der Normalfall des
Aufrufers; `Interactive` zeigt ihn im Rundlauf.

Tastatur: alles aus `Drawer` — Esc schließt, der Fokus geht in den Drawer und
beim Schließen an den Auslöser zurück. Nichts Eigenes.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseDrawer`. Abgeleitet nach §6: 4 anwendbare
Zustände (Inhalt, lädt, Fehler, nicht gefunden) + 0 Enums + 0 Layout-Booleans
+ 1 Callback (`onClose`) + 1 „im Einsatz" + 1 Rand = 7.

| Story | Beweist |
|---|---|
| `Filled` | Alle vier Zonen; Zone 2 fehlt und hinterlässt keine Lücke |
| `Loading` | `loading`: fünf Zeilen in der Form der Fakten, keine 96-px-Karte |
| `Error` | `error`: der Satz steht statt Zone 3, der Ausgang bleibt |
| `NotFound` | `record={null}` ohne `loading`: die gesuchte Kennung steht im Text, der Ausgang bleibt |
| `Interactive` | Rundlauf: öffnen, Esc, Fokus zurück am Auslöser |
| `Sparse` | Rand: ein Fall ohne Betrag, ohne Partner, ohne Personenkonto — die drei bedeutenden Nullwerte stehen als Wort |
| `InUse` | Aus einer Bank-Zeile heraus geöffnet: die Liste bleibt hinter dem Scrim sichtbar, der Kontext geht nicht verloren |

Nicht anwendbar: `leer nach Filter`. `Closed` entfällt — „zu" ist kein
Zustand des Schemas mehr; `Interactive` deckt ihn ab.

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
- [ ] Zone 1 trägt die Ränge 1–7: Name, Nummer, Stand, Betrag, Zuständigkeit, Ereignis-Zähler (Story `Filled`)
- [ ] Der Grenz-Satz aus Zone 4 steht wörtlich wie oben
- [ ] `Loading` zeigt die Form des Inhalts, nicht eine 96-px-Karte (Story `Loading`, gemessen)
- [ ] `error` ersetzt Zone 3 und lässt Zone 5 stehen (Story `Error`) — bewusste Abweichung vom `SourceDocumentDrawer`, im Code als Kommentar begründet
- [ ] `record={null}` ohne `loading` heißt **nicht gefunden** und nennt die Kennung (Story `NotFound`)
- [ ] `reference` steht im Kopf, im Fehlersatz und im Nicht-gefunden-Text (Stories `Filled`, `Error`, `NotFound`)
- [ ] Breite `size="md"` (gemessen: `--drawer-md`)
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
2. Breite `--drawer-lg` wie beim Beleg, obwohl es kein Original gibt?
   **Entschieden: nein, `md`** — die Staffelung aus 0052 richtet sich nach
   dem Inhalt, nicht nach der Entität.*
3. Bleibt Zone 5 im Fehlerfall? *Ohne Antwort: ja — gerade dann ist der Weg
   in den View die Antwort, und ein Drawer ohne Ausgang ist eine Sackgasse.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Entscheide: 1 Zähler im Kopf · 2 **`size="md"`** (0052: `sm` Fakten, `md` Detail, `lg` Dokument oder Tabelle — `AccountDrawer` ist `lg` wegen der Tabelle) · 3 Zone 5 auch im Fehlerfall, als bewusste Abweichung vom `SourceDocumentDrawer` hinschreiben · Zone 1 wird um Betrag (Meta-Zeile), Art · Gegenpart und Zuständigkeit erweitert (Ränge 4–7), wie der `SourceDocumentDrawer`-Kopf · Ausgang als `onOpenFull` (Familie), nicht `viewHref`.

**Gilt für 0098 und 0103 gemeinsam:** Schnittstelle nach dem 0052-Schema — `reference` (im Kopf und im Fehlertext), `record | null` = **nicht gefunden**, `loading`, `error`, `onOpenFull`; vier Zustände lädt · Fehler · nicht gefunden · Inhalt.

Vor dem Bau in die Spec: Schnittstelle auf das 0052-Schema, Story `NotFound` statt `Closed`, `size="md"`, Zonen-Tabelle Zeile 1 um 4–7, Typ-Verweis auf L-68.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — der Kopf zeigte nicht die nachgeschlagene Kennung.** Er baute sie aus
dem Record (`caseIdentifier`), und weil `Filled` beide gleich hatte, bewies
die Story nichts; bei `caseNumber === null` hätte er die id auf acht Zeichen
geschnitten und eine falsche Nummer angezeigt. Jetzt steht `reference` selbst
im Kopf — was nachgeschlagen wurde, nicht was zurückkam. `Sparse` hat dafür
bewusst `caseNumber: null`: gemessen steht dort „2026-0501", die Referenz.

**M2/M6 — `Sparse` behauptete drei Wort-Nullwerte und der Kopf sagte die Art
zweimal.** Der Drawer zeigt Zone 3 **ohne** `all`, also kann er nur zwei der
drei tragen; die Story sagt das jetzt. Und fällt der Titel auf die Art zurück
(ein Fall ohne Titel und ohne Gegenpart), lässt die Meta-Zeile sie weg —
gemessen „Umbuchung · 2026-0501 · Zur Prüfung · 0 Ereignisse" statt zweimal
„Umbuchung".

**M3 — die Ladefläche hatte nicht die Form des Inhalts.** Fünf nackte Balken,
87 px, ohne Rahmen; beim Eintreffen sprang der Rumpf um 214 px und bekam eine
Karte, die vorher nicht da war. Jetzt liegen die fünf Zeilen in derselben
`Card` mit demselben `CardHead title="Kernfakten"` — gemessen 176 px gegen
265 px, gleicher Rahmen, gleicher Kopf.

**M4 — Zone 4 fiel in drei von vier Zuständen weg.** Der Satz beschreibt den
Drawer, nicht den Datensatz: gerade im Fehlerfall ist „der Rest steht im View"
die nützlichste Auskunft. Er steht jetzt außerhalb der frühen Rückgaben, in
allen vier Zuständen (gemessen).

**M5 — der Fehlertext hatte keinen nächsten Schritt (T5).** Jetzt: „**Sachverhalt
2026-0412 konnte nicht geladen werden.** Zeitüberschreitung beim Laden. Bitte
erneut öffnen — oder den Sachverhalt vollständig ansehen."

**M7 — die Links waren im Blatt keine Links.** Wurzel gefunden: Tailwinds
Preflight lädt nach `tokens.css` und setzt `a { color: inherit }`. Behoben in
`index.css` (die Regel steht nach den Direktiven noch einmal); gemessen
`rgb(46, 120, 168)` statt `rgb(45, 45, 45)`. Die Reihenfolge selbst ist
**0111**.

**M8** (Badge-Kontrast 4,14:1) ist **0112**, **M9** (`prefers-reduced-motion`)
ist Befund 2 von **0111** — beide gehören der Grundschicht, nicht dieser
Aufgabe.

**M10** (deutsche Story-JSDoc) bleibt: die Familie `accounting-case` schreibt
sie durchgehend deutsch, und der Text erscheint in Storybook — er ist damit
näher an „Strings, die Nutzer sehen" als an Code. Eine Umstellung wäre eine
Hausentscheidung für alle Familien, keine dieser Aufgabe.

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**Der Satz „Dieser Typ ist lokal definiert" oben gilt nicht mehr.** L-68 ist
mit `18ddaa28` erledigt: `CaseDetail` liegt in `domain/`, wird gespiegelt, und
`CaseFactsVM` ist seither `Partial<CaseDetail>` plus vier Pflichtfelder
(0097). Der Drawer reicht den Typ unverändert durch — an seiner Schnittstelle
ändert sich nichts, nur die Herkunft der Felder.
