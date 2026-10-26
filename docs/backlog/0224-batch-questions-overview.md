# 0224 · „n Fragen bei Ludwig" — alle Fragen des Stapels im Blick

| | |
|---|---|
| Status | Abnahme · gebaut 2026-10-26 (s. „Gebaut") |
| Stufe | erweitert `entities/clarification/Clarification.tsx` (`ClarificationList`, `ClarificationRow`, `ClarificationVM`) · `primitives/RecordPager.tsx` (ein Platz für Nebenwege) |
| Klassen-Test | Liste: nein (Rückfrage, ihre Stände). Pager-Platz: ja („Datensatz 3 von 12" und daneben ein Weg zur ganzen Menge gibt es in jeder App mit einer Warteschlange) |
| Quelle | Owner-Wunsch 2026-10-26 über llcto (Rückfragen-Schritt der Abnahme, `batches/[id]/close`); Props-Vorschlag des DS an llcto vom selben Tag, vom Owner bestätigt: `RecordPager.actions`, `ClarificationList groupBy="state"`, `onOpen`, `activeId`, `ClarificationVM.answer`; Gruppe „Beantwortet" (Registry), Knopf „n Fragen bei Ludwig", bei n = 0 kein Knopf |
| Ersetzt | nichts — heute sieht man beantwortete Fragen im neuen Ablauf nirgends mehr (Owner) |
| Blockiert | Einbau-Spec der App (llcto), Einbau ll-abnahme |
| Spec von / am | designsystem (Claude), 2026-10-26 |

## Ziel

Im Rückfragen-Schritt beantwortet die Buchhalterin eine Frage nach der
anderen (0222, „Frage 1 von 12"). Was sie beantwortet hat, liegt danach bei
Ludwig — und ist aus dem Ablauf verschwunden. Wer nach der fünften Frage
wissen will, was sie bei der zweiten geantwortet hat, oder welche Fragen noch
kommen, hat heute keinen Weg. Neben dem Pager steht deshalb ein Knopf
„3 Fragen bei Ludwig"; er öffnet die Fragen des Stapels als Liste: zuerst die
offenen (ein Klick springt im Ablauf dorthin), dann die beantworteten mit der
gegebenen Antwort, nur zum Lesen.

## Einordnung

- **Wiederverwenden:** `ClarificationList` (`@when` „The clarifications of a
  case, a batch, a run or a portal user — few rows, optionally grouped by who
  is asked") trägt den Fall zu vier Fünfteln: Zeilen, Gruppen mit Zähler,
  Aufklappen zur vollen Karte über `renderDetail`, Markierung `active` an der
  Zeile. `Drawer` (`@when` „Looking at something existing next to a list …
  without leaving the list") trägt den Rahmen: der Schritt bleibt stehen, `Esc`
  schließt (R15: ansehen im Drawer). `RecordPager` steht schon über der Karte.
- **Nicht `TodoList` + `toTodoItem`:** das ist die Arbeitsliste eines Schritts
  (jeder Eintrag wählbar, Sprung zum nächsten offenen, Tasten J/K). Hier ist
  es eine Übersicht zum Nachschlagen: offene Fragen führen **aus** dem Drawer
  in den Ablauf, beantwortete liest man an Ort und Stelle. Zwei Jobs, zwei
  Bausteine.
- **Erweitert, weil (Regel 2):** vier Dinge fehlen, jedes eine
  Designentscheidung, die wiederkommt — Gruppierung nach Stand (auch am
  Sachverhalt und im Portal denkbar), ein Sprungweg je offener Zeile, die
  Markierung der Frage, die gerade im Ablauf steht, und die Antwort in der
  Zeile. Am `RecordPager` fehlt ein Platz für einen Nebenweg; die
  Belegprüfung (0223) hat denselben Bedarf („Alle Belege als Liste").
- **Zuschnitt:** keine neue Datei, kein neuer Export. Der Drawer mit der Liste
  ist Markup an der Aufrufstelle (Regel 4: ohne eigenen Zustand keine
  Komponente) und wird als Story vorgemacht.
- **Setzt auf:** `ClarificationRow`, `Disclosure`, `StatusBadge`, `Time`,
  `Drawer`, `TextButton`, `ClarificationCard mode="read"`.

## Schnittstelle

### `RecordPager` — neu

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `actions` | `ReactNode` | nein | Nebenwege rechts in der Pager-Zeile, nach dem Pfeil „Nächster" (ein, höchstens zwei `TextButton`); auch ohne Warteschlange neben dem Weg zurück | `RecordPager/WithActions` |

### `ClarificationVM` — neu

| Feld | Typ | Bedeutung | Nachweis |
|---|---|---|---|
| `answer` | `string \| null` (optional) | die gegebene Antwort als Text — der gewählte Optionstext, der Freitext, bei „anderweitig geklärt" der Grund. Die App leitet ihn aus `answer_payload` ab (L-367) | `ClarificationRow/ByState` |

### `ClarificationList` — neu

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `groupBy` | `"audience" \| "none" \| "state"` | nein, Standard `"none"` | `state`: Gruppen in der Reihenfolge Offen · Zurückgestellt · Beantwortet, Wort aus der Registry (Achse `clarification`), Zähler im Kopf; Notizen (`type: "comment"`) zuletzt unter dem Registry-Wort „Notiz" (Achse `clarification_type`). Leere Gruppen fehlen. Innerhalb der Gruppe die Reihenfolge des Aufrufers | `ClarificationRow/ByState` |
| `onOpen` | `(c: ClarificationVM) => void` | nein | Zeilen offener und zurückgestellter **Fragen** sind ein Weg: ein Klick auf die Zeile ruft `onOpen` (die App schließt den Drawer und springt im Ablauf zur Frage). Beantwortete Fragen und Notizen bekommen keinen Sprung | `ClarificationRow/ByState` |
| `activeId` | `string \| null` | nein | die Frage, die gerade im Ablauf steht, ist markiert (`active` an ihrer Zeile, `aria-current`) | `ClarificationRow/ByState` |

### `ClarificationRow` — neu

| Prop | Typ | Pflicht | Bedeutung | Nachweis |
|---|---|---|---|---|
| `onOpen` | `() => void` | nein | wie oben, für die einzelne Zeile; die Liste reicht ihn nur bei offenen und zurückgestellten Fragen durch | `ClarificationRow/ByState` |
| `hideBadges` | `boolean` | nein | ohne Badges (`groupBy="state"` setzt es): den Stand sagt die Gruppe, „Blockierend" trägt nichts, weil fast jede Frage blockiert (Owner 2026-10-26, Nachtrag); eine offene oder zurückgestellte **optionale** Frage trägt in der Meta-Zeile das Registry-Wort „optional" | `ClarificationRow/ByState` |

**Die Zeile mit Antwort:** Ist `answer` gesetzt, steht unter dem Titel eine
Zeile „Antwort: {answer}", einzeilig gekürzt, ganz im `title`-Hover und im
Aufklapper. Ohne `answer` keine Zeile.

**Der Knopf** (App, kein neuer Baustein): `TextButton` in `RecordPager.actions`,
Wort „{n} Fragen bei Ludwig" bzw. „1 Frage bei Ludwig"; n = Fragen dieses
Stapels mit Stand `answered`. Bei n = 0 kein Knopf (Owner 2026-10-26).

**Der Drawer** (App, Story `InBatchReviewDrawer` macht ihn vor): Titel
„Fragen dieses Stapels", `meta` die Zählung mit den Registry-Wörtern
(„9 offen · 3 beantwortet"), Inhalt `ClarificationList groupBy="state"
showCase onOpen activeId renderDetail`, wobei `renderDetail` nur für
beantwortete Fragen die volle Karte `mode="read"` liefert.

Typen aus `src/ludwig/modules/accounting-cases/domain/case.ts`
(`ClarificationState`, `clarificationState()`), Achsen `clarification` und
`clarification_type` aus der Registry. GLOSSARY: clarification = Rückfrage,
batch = Stapel.

Was der Baustein **nicht** kann (bewusst): er zählt nicht „bei Ludwig" (die
App kennt, wer geantwortet hat; die Liste zeigt, was sie bekommt), er schließt
den Drawer nicht (die App hält den Zustand, der Drawer ist ihr Markup), er
sortiert nicht (der Aufrufer bestimmt die Ordnung, wie bisher), er lässt eine
Antwort nicht ändern (eine Frage hat genau eine Antwort, `answerClarification`
verweigert die zweite — Entitätsprofil „Eine Antwort, nicht mehrere").

## Verhalten

- **Client oder Server:** die Liste bleibt ohne `"use client"`; mit `onOpen`
  braucht der Aufrufer ohnehin einen Client-Baum.
- **Zeile mit `onOpen`:** der Titel ist ein Knopf mit Überzug über die ganze
  Zeile (`v2rowlink`, wie in Tabellenzeilen), Hover färbt die Zeile
  `--color-bg-soft`, der Titel in Linkfarbe. Andere Klickziele in der Zeile
  (Sachverhaltsnummer mit `href`) liegen über dem Überzug.
- **Beantwortete Zeile:** mit `renderDetail` klappt sie auf (natives
  `<details>`), ohne bleibt sie flach. Kein Sprung, kein Hover, der etwas
  anderes verspricht.
- **Tastatur:** `Tab` durch die Zeilen; `Enter`/Leertaste auf einer offenen
  Zeile ruft `onOpen`; auf einer beantworteten klappt sie auf und zu; `Esc`
  schließt den Drawer (Drawer). Nach dem Sprung gibt der Drawer den Fokus an
  den Knopf zurück, der ihn geöffnet hat — er steht in der Pager-Zeile direkt
  über der Frage, der nächste `Tab` führt in sie hinein. Kein eigener
  Fokuszug nötig (gemessen).
- **Zustände:** gefüllt; leer (`ClarificationList` zeigt seinen Leertext — im
  Ablauf kommt es nicht vor, ohne beantwortete Frage gibt es keinen Knopf);
  leer nach Filter: die Liste filtert nicht; lädt und Fehler: die Liste lädt
  nicht, die Fragen kommen mit dem Schritt.
- **Live-Region:** nicht nötig — nichts ändert sich, während der Drawer offen
  ist.

## Stories

| Story | Beweist |
|---|---|
| `ClarificationRow/ByState` | `groupBy="state"`: Offen (zwei, eine davon `activeId`), Zurückgestellt (eine), Beantwortet (drei, eine mit langer Antwort gekürzt, eine „anderweitig geklärt"), Notiz (eine) — in dieser Reihenfolge, Zähler je Kopf, kein Stand-Badge in den Zeilen; `onOpen`-Rundlauf („springt zu: …") nur bei offenen und zurückgestellten |
| `ClarificationRow/InBatchReviewDrawer` | im Einsatz: `RecordPager` „Frage 4 von 9" mit `actions` „3 Fragen bei Ludwig" über der Step-Karte (0222); Klick öffnet den Drawer; offene Zeile springt und schließt; beantwortete klappt zur Karte `mode="read"` auf |
| `RecordPager/WithActions` | `actions` rechts nach dem Pfeil, einmal mit Warteschlange, einmal nur mit dem Weg zurück |

Ableitung (§6): Zustand gefüllt → `ByState`; leer → vorhandene Story `Empty`;
Enum `groupBy` neuer Wert → `ByState` (die Werte `audience`/`none` zeigen
`InStack`/`Filled`); Callback `onOpen` → Rundlauf in `ByState`; im Einsatz →
`InBatchReviewDrawer`; Rand (lange Antwort) → in `ByState`; Layout-Prop
`actions` → `WithActions`. Ausgeschlossen mit Grund: leer nach Filter, lädt,
Fehler (s. Verhalten).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Wer geantwortet hat, in der Zeile | `ClarificationVM.answeredBy` (Name) | mehrere Personen beantworten Fragen eines Stapels |
| Antwort zurücknehmen, solange Ludwig sie nicht verarbeitet hat | `onReopen?: (c) => Promise<void>` an der Liste | die App kann eine Antwort zurücknehmen (heute verweigert sie die zweite) |

## Befunde an die App

- **L-367** `ClarificationVM.answer` — die App leitet den Text aus
  `answer_payload` ab: gewählte Option (Optionstext, Regel S13) oder Freitext;
  bei einer Auflösung ohne Antwort der Grund (Entitätsprofil: „`resolution`
  … benennen, statt ihn wie eine Antwort zu zeigen" — die Zeile sagt dann
  „Anderweitig geklärt: …").

## Offene Fragen

1. ~~Bleibt „Blockierend" in den Zeilen der Liste?~~ Entschieden (Owner
   2026-10-26 über llcto): nein, s. Nachtrag.
2. Kommen Notizen in den Drawer? *Ohne Antwort:* ja, als letzte Gruppe — die
   App gibt mit, was sie hat; „Fragen dieses Stapels" ohne Notizen hieße, die
   App filtert sie selbst heraus.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `groupBy="state"`: Gruppen Offen · Zurückgestellt · Beantwortet · Notiz in dieser Reihenfolge, Wörter aus der Registry, leere Gruppen fehlen, Zähler im Kopf, **kein Badge** in den Zeilen, optionale offene/zurückgestellte Frage mit „optional" in der Meta-Zeile (Story `ByState`; Nachtrag 2026-10-26)
- [ ] `onOpen` nur an offenen und zurückgestellten Fragen; ganze Zeile klickbar mit Hover, `Enter` löst aus; beantwortete und Notizen ohne Sprung (Story `ByState`, Tastatur gemessen)
- [ ] `activeId` markiert genau eine Zeile mit `aria-current` (Story `ByState`)
- [ ] `answer`: Zeile „Antwort: …" einzeilig gekürzt, ganz im Hover; ohne `answer` keine Zeile (Story `ByState`, Rand)
- [ ] `RecordPager.actions` rechts nach dem Pfeil, mit und ohne Warteschlange; Trefferfläche ≥ 24 × 24 px (Story `WithActions`, gemessen)
- [ ] Im Einsatz: Knopf öffnet den Drawer, offene Zeile springt und schließt ihn, beantwortete klappt lesend auf, `Esc` schließt (Story `InBatchReviewDrawer`)
- [ ] Vorhandene Stories von `ClarificationList`/`ClarificationRow`/`RecordPager` ohne die neuen Props unverändert
- [ ] offen (App): Knopf und Drawer im Rückfragen-Schritt, n aus den beantworteten Fragen des Stapels, `answer` aus `answer_payload` (L-367)

## Gebaut 2026-10-26

`Clarification.tsx`: `ClarificationVM.answer`; `ClarificationRow` mit
`onOpen` (Titel als `button.v2link.v2rowlink`, Überzug über die Zeile; mit
`onOpen` klappt die Zeile nicht), `hideState` (nur noch „Blockierend";
im Nachtrag ersetzt durch `hideBadges`), Zeile „Antwort: …"; `ClarificationList` mit
`groupBy="state"` (Gruppen aus `resolveStatus("clarification", …)` und
`resolveStatus("clarification_type", "comment")`, eine Gruppenschleife für
`audience` und `state`), `onOpen` nur an offenen und zurückgestellten Fragen,
`activeId`. `RecordPager.tsx`: `actions` nach dem Pfeil „Nächster", auch ohne
Warteschlange. `v3.css`: `.v2cl__item:has(.v2rowlink)` (Hover, Zeiger),
`.v2cl__open`, `.v2cl__answer`, `.v2cl__answerlabel`, `.v2pager__actions`.
Stories `ClarificationRow/ByState`, `ClarificationRow/InBatchReviewDrawer`,
`RecordPager/WithActions`.

Gemessen (eigener Messbrowser `scripts/cdp.mjs`, Fenster 1042 × 1000):
`ByState` Karte 521 px (= Drawer `md`), `scrollWidth` 1042; Gruppen
„Offen 2 · Zurückgestellt 1 · Beantwortet 3 · Notiz 1"; in den Zeilen kein
Stand-Badge, „Blockierend" an den zwei offenen; nur die lange Antwort gekürzt
(`scrollWidth > clientWidth`), alle mit `title`; Hover über der Zeilenfläche
einer offenen Frage `rgb(244, 246, 248)`, Zeiger, Titel unterstrichen;
beantwortete Zeile ohne Hover; Klick auf die Zeilenfläche und `Enter` auf dem
Titel rufen `onOpen`; Fokusring 2 px. `WithActions`: Knopf 122 × 24 px, 24 px
nach dem Pfeil bzw. nach dem Rückweg. `InBatchReviewDrawer`: Knopf öffnet den
Drawer, aktuelle Frage markiert, beantwortete klappt zur Karte `mode="read"`
mit Verlauf auf, Klick auf eine offene Frage → „Frage 2 von 3", Drawer zu,
Fokus auf „3 Fragen bei Ludwig"; `Esc` schließt.
Beim Messen gefunden: ein Grid als Story-Rahmen zog die Spalte auf die Breite
der ungebrochenen Antwortzeile (1230 px) — Fehler der Fixture, nicht des
Bausteins; der Rahmen ist jetzt ein Block wie der Drawer-Körper.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Nachtrag 2026-10-26 — keine Badges in der Fragenliste (Owner über llcto)

Owner-Linie vom selben Tag, nach dem Bau: „Blockierend" trägt auch in der
Fragenliste nichts — fast jede Frage blockiert. In `groupBy="state"` fällt
deshalb **jedes** Badge aus der Zeile; eine optionale Frage bekommt höchstens
den kurzen Registry-Hinweis, kein Tag.

| Was | Entscheid |
|---|---|
| Prop | `ClarificationRow.hideState` wird `hideBadges` (noch kein Aufrufer außer der Liste selbst; die App nutzt `groupBy`) |
| Zeile | ohne `.v2cl__state`; der Titel nimmt die ganze Breite |
| Optional | in der Meta-Zeile „· optional" — das Registry-Wort (`clarification_severity.optional.label`) klein im laufenden Text wie „zurückgestellt bis …"; nur bei offenen und zurückgestellten Fragen. Der lange Registry-Satz der Karte („Hilfreich, aber …") passt in keine einzeilige Meta-Zeile |
| Andere Gruppierungen | unverändert: `audience`/`none` zeigen Stand und „Blockierend" wie bisher |

