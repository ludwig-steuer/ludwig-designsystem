# 0060 · ClarificationCard — die Frage, ihr Verlauf, ihre Antwort

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/clarification/` — Gruppe Klärung |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Zielgruppe, Schwere und der zweite Ausgang „ohne Antwort auflösen" sind Ludwig-Fachlogik |
| Quelle | Entitätsprofil `docs/entitaeten/clarification.md` (2026-09-04) §Eine Antwort nicht mehrere, §Datenpunkte Rang 8–19, §Formen · Owner-Rückfrage 2026-09-04 („read only mit bereits erfolgter Antwort · zu beantworten mit Antwortoptionen und Actions · sehr unterschiedliche Quellen agent/user"; „Erstellung und Beantwortende … mit jeweils Datum") |
| Ersetzt | `AnswerInput` (`modules/accounting-cases/ui/sachverhalt/parts.tsx`, 69 Z.) **und** die zweite Umsetzung derselben Logik in `PortalCaseList.tsx` (Befund B5) · den aufgeklappten Teil von `ClarificationsBanner` · den Antwortblock in `RueckfragenListe` |
| Blockiert | 0058 `ClarificationDrawer` · die Klärungs-Flächen der Wellen Sachverhalt, Stapelabnahme, Portal |
| Setzt voraus | 0028 `ChoicePrompt` (fertig), 0059 `Clarification` (Typ `ClarificationVM`) |
| Spec von / am | Claude, 2026-09-04 |
| Gebaut von / am | Claude, 2026-09-04 · `pnpm typecheck` und `pnpm build` grün, Stories im Browser angesehen |

## Ziel

Die aufgeklappte Klärung: was gefragt wurde, worauf sich die Frage stützt,
wer sie wann gestellt hat — und, wenn die Betrachterin gefragt ist, die
Antwort mit einem Klick. Heute steht diese Fläche zweimal im Code, einmal
für die Kanzlei und einmal für das Portal, und driftet: die eine kennt
`document_upload`, die andere nicht.

Zwei Dinge, die es heute nirgends gibt und die das Profil belegt hat:

1. **Der Verlauf.** Wer gefragt hat, steht nicht in der Tabelle — es gibt
   kein `created_by`. Der Audit hat alles (`case.clarification_raised` 403,
   `_answered` 70, `_resolved` 57, jeder Eintrag mit `clarificationId`), nur
   lädt ihn niemand. Die Karte zeigt ihn als **0…n Einträge** mit Person und
   Datum. Heute sind das ein bis drei; das Format hält auch, wenn die
   Datenbank später mehrere Antworten je Frage speichert (Befund B8).
2. **Der zweite Ausgang.** `resolveClarification` schließt eine Frage ohne
   Antwort mit Pflichtgrund (57-mal im Bestand). Beantwortet und aufgelöst
   sehen in den Daten gleich aus — `answered_at` ist gesetzt. Die Karte
   hält sie auseinander.

## Einordnung

- **Wiederverwenden, nicht nachbauen:**
  - `ChoicePrompt` (0028, `@when A question with two to seven suggested
    answers — a clarification on a case, a query in the batch review, an
    answer in the portal`) **deckt die Antwortfläche vollständig**: Optionen
    als Knöpfe, Vorauswahl über `defaultOptionId`, optionaler Freitext,
    `pending`, `error`. Der Bestand passt: p50 **2** Optionen, max 4, 90 %
    erlauben Freitext. Die Karte ruft sie auf und baut keine zweite Eingabe.
    Nach `spec-schreiben` §3.1 wäre das allein noch keine neue Komponente —
    neu ist alles darum herum (Kopf, Fakten, Quellen, Verlauf, zweiter
    Ausgang).
  - `ReasonDialog` (`@when Action whose reason belongs in the audit log`)
    trägt „ohne Antwort auflösen" — Pflichtgrund, Vorschlags-Chips. Kein
    eigener Dialog.
  - `FieldList` für `facts_json`, `Markdown` für die Erläuterung (Agent-Text
    ist Markdown), `Time` für jedes Datum, `StatusBadge` für Zustand,
    Schwere und Art, `Callout` für den Hinweis „diese Frage geht an den
    Mandanten".
- **Neu, weil:** `spec-schreiben` §3.5 — die Form „Karte" der Entität
  Klärung; keine vorhandene Form deckt sie ab, und sie steht heute auf drei
  Screens (Sachverhalt, Abnahme, Portal).
- **Zuschnitt:** eigene Datei `entities/clarification/ClarificationCard.tsx`,
  getrennt von 0059 — sie braucht `"use client"` für die Antwort, die Zeile
  nicht (§4, Regel „ein Teil braucht `use client`").
- **Setzt auf:** `ChoicePrompt`, `ReasonDialog`, `FieldList`, `Markdown`,
  `LongText`, `Time`, `StatusBadge`, `Badge`, `Callout`, `TextButton`.

## Schnittstelle

### Ergänzung zum VM aus 0059

Die Karte nimmt `ClarificationVM` **plus** die Felder, die nur sie zeigt.
Getrennter Typ, damit die Zeile leicht bleibt:

| Feld von `ClarificationDetailVM` | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `question` | `string \| null` | nein | die kompakte, eigenständige Frage (16 % gefüllt) | `Gefuellt` |
| `context` | `string \| null` | nein | Beobachtung und Problemstellung (16 %) | `Gefuellt` |
| `text` | `string` | ja | die volle Erläuterung — der Aufrufer wählt `professional_text` oder `client_text`; die Karte weiß nicht, welche (Regel: ins Portal geht nie ein professional-Text) | `Gefuellt`, `ImPortal` |
| `recommendation` | `string \| null` | nein | Empfehlung des Fragestellers (10 %); benennt bei Choice-Fragen eine Option wörtlich → wird zu `defaultOptionId` | `MitEmpfehlung` |
| `facts` | `readonly { label: string; value: string }[]` | nein | `facts_json` — was zum Beantworten gebraucht wird (7 % nicht leer) | `Gefuellt` |
| `sources` | `readonly { kind: RationaleSourceKind; label: string; href?: string }[]` | nein | `sources_json` (31 % nicht leer); die Karte rendert Verweise, löst aber keine IDs auf | `Gefuellt` |
| `questionTypeLabel` | `string \| null` | nein | **deutsches Label als Prop**, weil es dafür keinen Katalog gibt (Befund B1). Keine lokale Map | `Gefuellt` |
| `originLabel` | `string \| null` | nein | Herkunft in Worten („Buchungsvorschlag", „Kanzlei") — dito Befund B2 | `Gefuellt` |
| `answerKind` | `ClarificationAnswerKind` | ja | steuert die Antwortfläche | `Antworten` |
| `answerOptions` | `readonly string[]` | nein | die Optionen; der Text **ist** der Wert (Regel S13) | `Antworten` |
| `allowFreeText` | `boolean` | nein | zusätzliches Freitextfeld | `Antworten` |
| `raisedBy` | `ClarificationActor \| null` | nein | wer gefragt hat — `string` oder `Actor` (`@/ludwig/modules/audit-log`, Achse `actor_kind`, dieselbe Form wie `LogList`). Es gibt kein `created_by` (B7); kommt die Spalte, ändert sich an dieser Prop nichts | `Personen` |
| `answeredBy` | `ClarificationActor \| null` | nein | wer geantwortet hat; `answered_by` ist nur zu 6 % gefüllt | `Personen` |
| `history` | `readonly ClarificationEvent[]` | nein | der volle Verlauf aus dem Audit. **Gewinnt gegen `raisedBy`/`answeredBy`**; fehlt er, baut die Karte aus den beiden die zwei offensichtlichen Einträge — eine Darstellung, zwei Quellen | `Verlauf` |

### `ClarificationEvent` — ein Eintrag des Verlaufs

| Feld | Typ | Pflicht | Bedeutung |
|---|---|---|---|
| `kind` | `"raised" \| "answered" \| "resolved" \| "deferred"` | ja | entspricht `case.clarification_*` im Audit |
| `at` | `string` | ja | ISO-Zeitpunkt |
| `by` | `ClarificationActor \| null` | nein | `string` oder `Actor`; `null` heißt Agent oder System und wird als solches beschriftet, **nicht** als Gedankenstrich. Ein `Actor` ohne `label` bekommt das Wort seiner Achse (`actor_kind`) |
| `text` | `string \| null` | nein | Antworttext bzw. Auflösungsgrund |

### `ClarificationCard`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `clarification` | `ClarificationVM & ClarificationDetailVM` | ja | die Frage | alle |
| `mode` | `"read" \| "answer"` | nein | Voreinstellung `"read"`. `"answer"` blendet die Antwortfläche ein — der Aufrufer entscheidet, ob die Betrachterin gefragt ist (`audience` gegen ihre Rolle) | `Antworten`, `Gefuellt` |
| `onAnswer` | `(answer: ChoiceAnswer) => Promise<void>` | nur bei `mode="answer"` | reicht die Antwort durch; die Karte schreibt nichts | `Antworten` |
| `onResolve` | `(reason: string) => Promise<void>` | nein | der zweite Ausgang; ohne die Prop erscheint er nicht | `Antworten` |
| `pending` | `boolean` | nein | läuft gerade | `Laedt` |
| `error` | `string` | nein | Fehler der letzten Aktion, am Knopf | `Fehler` |

**Was die Karte bewusst nicht kann:** nicht laden (Verlauf und Labels kommen
als Props), keine zweite Antwort erzwingen (die Datenbank lässt heute genau
eine zu — Befund B8), keinen Beleg-Upload anbieten (`answer_kind =
'document_upload'` ist seit F125 Altlast, 8 Zeilen: die Karte zeigt für
diesen Wert die Frage **ohne** Eingabe und einen Hinweis, dass der Beleg über
die Erwartung kommt), keine Frage stellen (0061), keine Wiedervorlage setzen
(offene Frage 1 des Profils).

## Verhalten

- **Client-Komponente** (`"use client"`): `ChoicePrompt` und `ReasonDialog`
  tragen Zustand.
- **Zwei Herkünfte, ein Bauplan.** Eine Agenten-Frage bringt Kontext, Fakten,
  Quellen und Empfehlung mit, eine von Hand gestellte nur Text. Die Karte
  zeigt, was da ist, und lässt leere Blöcke weg — kein zweiter Zweig.
- **Reihenfolge im Kopf** (Ränge des Profils): Titel · Zustand · Schwere ·
  Art · Zielgruppe · gestellt am. Darunter Frage, Kontext, Erläuterung,
  Fakten, Quellen, Empfehlung. Ganz unten Verlauf, dann Antwortfläche.
- **Gelesen wird auch beantwortet:** in `mode="read"` mit `history` steht
  die Antwort als Text mit Person und Datum, nicht als gefülltes Formular.
- **Empfehlung → Vorauswahl:** stimmt `recommendation` wörtlich mit einer
  Option überein, wird sie `defaultOptionId` von `ChoicePrompt`; der
  Empfehlungstext bleibt trotzdem sichtbar, damit die Vorauswahl begründet
  ist.
- **Tastatur:** die von `ChoicePrompt` (Absenden mit ⌘/Ctrl+Enter im ganzen
  Block) und `ReasonDialog`. Kein eigener Weg.
- **Zustände:** gefüllt (offen) · beantwortet · aufgelöst ohne Antwort ·
  lädt · Fehler. **Nicht anwendbar:** „leer" — eine Karte ohne Klärung wird
  nicht gerendert; „leer nach Filter" — die Karte filtert nicht.

## Stories

Titel `v3/Entitäten/Klärung/ClarificationCard`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Agenten-Frage, `mode="read"`, mit Fakten, Quellen, Kontext |
| `Antworten` | `mode="answer"` mit `single_choice`, `yes_no` und `free_text` nebeneinander; Rundlauf über `useState` |
| `MitEmpfehlung` | Empfehlung wird zur Vorauswahl und bleibt lesbar |
| `Personen` | `raisedBy` als `Actor` ohne Label, `answeredBy` als String — ohne `history` |
| `Verlauf` | drei Einträge: gestellt vom Agenten, beantwortet von einer Person, aufgelöst mit Grund — je mit Datum |
| `VonHand` | Frage aus der Kanzlei: nur Text, keine Fakten, keine Quellen, keine Optionen |
| `ImPortal` | `client_text`, Zielgruppe Mandant, ohne Herkunft und ohne Schwere-Badge |
| `Laedt` | `pending` am Antwortknopf |
| `Fehler` | `error` am Knopf, Eingabe bleibt erhalten |

Neun Stories. Nicht anwendbar: `Leer` (oben begründet).

## Ausbau

Nach A12: keine Prop auf Vorrat, hier steht der Plan.

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zurückstellen | `onDefer?: (until, reason) => Promise<void>` — dieselbe Bauart wie `onResolve` | **jetzt**: Aufgabe 0065 |
| Mehrere Antworten je Frage | keine — `history` trägt schon 0…n Einträge | das Schema bekommt einen Faden (Befund B8); die Karte ändert sich dann nicht |
| Deutsche Wörter für Frageart und Herkunft aus der Domain | keine — `questionTypeLabel` und `originLabel` bleiben Props, der Aufrufer holt sie dann aus dem Katalog statt aus einer lokalen Map | Befunde B1/B2 sind in `ludwig/app` gelöst |
| Beleg-Upload | keiner — seit F125 ist der fehlende Beleg eine Erwartung | nie; der Hinweis-Zweig entfällt, sobald die acht Altzeilen migriert sind (B6) |
| Frage weiterleiten („das kann nur der Mandant beantworten") | `onReroute?: (audience) => Promise<void>` | die Abnahme braucht es; heute löst die Kanzlei das, indem sie selbst antwortet |

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

- [ ] Die Antwortfläche ist `ChoicePrompt` — kein zweiter Satz Knöpfe, kein
      eigenes Textarea-Formular (Blick in die Datei, Story `Antworten`)
- [ ] `onResolve` fehlt → der zweite Ausgang erscheint nicht (Story `Gefuellt`)
- [ ] `questionTypeLabel` und `originLabel` sind Props; die Datei enthält
      keine `Record<string, string>`-Map für Frageart oder Herkunft (grep)
- [ ] `answerKind="document_upload"` zeigt keinen Upload, sondern den Hinweis
      auf die Erwartung (Story `Antworten`)
- [ ] Der Verlauf zeigt je Eintrag Art, Person und Datum; `by = null` wird zu
      „Agent" bzw. „System", nie zu „—" (Story `Verlauf`)
- [ ] Ohne `history` bauen `raisedBy`/`answeredBy` denselben Verlauf; ein
      `Actor` ohne `label` zeigt das Wort seiner Achse (Story `Personen`)
- [ ] Leere Blöcke (keine Fakten, keine Quellen, keine Empfehlung) erzeugen
      keine leeren Überschriften (Story `VonHand`)
- [ ] Ersetzt `AnswerInput` und die Portal-Kopie ohne Funktionsverlust — offen (App)

## Offene Fragen

1. Darf die Kanzlei eine Frage beantworten, die an den Mandanten gerichtet
   ist? Die Abnahme lässt es heute zu („sie sieht zu und kann selbst
   antworten, wenn sie es besser weiß"). — ohne Antwort: ja, der Aufrufer
   entscheidet über `mode`; die Karte prüft keine Rolle.
2. Soll `mode="read"` die Antwortoptionen anzeigen, die **nicht** gewählt
   wurden? — ohne Antwort: nein, nur die gegebene Antwort.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: … · Offene Punkte: …
