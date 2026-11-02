# 0242 · ClarificationCard: Kopf der Schritt-Form mit Titel und Frage

| | |
|---|---|
| Status | fertig — abgenommen 2026-11-03 (fremde Abnahme, keine Mängel, H1–H5) |
| Stufe | `entities/clarification/` (Änderung an `ClarificationCard`, `variant="step"`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein, die Rückfrage im Prüflauf eines Stapels |
| Quelle | llcto 2026-11-03, DS-Wunsch 0242 (Owner 2026-11-02). Vorbild des Owners: ein Titel im Muster „<Thema>: <Gegenpartei> <Betrag>“ (das Beispiel stammt aus echten Daten und steht deshalb nicht hier) |
| Ersetzt | den Kopf aus 0222 (Thema klein und grau, `h2` = `question ?? title`) |
| Blockiert | nichts. Den DS-Zeiger in der App setzt llcto |
| Spec von / am | Designer-Sitzung, 2026-11-03 |

## Ziel

In der Schritt-Form steht heute die ganze Frage als Überschrift („Wie soll die
Wolkenhaus-Rechnung WH-26-00871 über 42,84 € gebucht werden?“) und der Titel
klein und grau darüber. Der Owner empfindet die Überschrift als zu umfangreich.
Den Kontext darunter liest er als „fehlend“, weil er als Fließtext ohne
erkennbaren Anfang dasteht. Künftig sagt die Überschrift kurz, worum es geht,
so wie ein Mensch es schreiben würde („Steuerschlüssel unklar: Wolkenhaus
S.à r.l. 42,84 €“). Darunter steht die Frage als ganzer Satz, danach der Kontext.
Wer nach vier Wochen Pause die Seite öffnet, erkennt am Titel den Fall und am
Satz darunter, was er entscheiden soll.

## Einordnung

- **Wiederverwenden:** die Rollen aus 0220. `lw-ui-section` (`h2`) für den
  Titel, wie bisher. `lw-ui-text` (Fließtext, 13,5/400, `--color-text`) für die
  Frage.
  - Nicht `lw-ui-lead`: Die Einleitung ist grau (`--color-text-muted`) und
    stellt einen Titel vor. Die Frage ist aber der Inhalt selbst, das, was zu
    entscheiden ist. llcto nennt ausdrücklich „wie Fließtext, nicht muted“.
- **Neu oder erweitert:** nichts. Kein Prop, kein Export, kein Token, kein Wort.
  Die Regel `.v2clc__topic` entfällt, weil nichts sie mehr nutzt.
- **Zuschnitt:** der Zweig `step` von `head` in `ClarificationCard.tsx`.
- **Setzt auf:** vorhandene Felder `title` und `question` (`ClarificationVM`).

## Schnittstelle

Unverändert. Es ändert sich nur, welches Feld wo steht:

| Feld | Bisher (0222) | Neu | Nachweis (Story) |
|---|---|---|---|
| `title` | klein und grau über der Überschrift, nur wenn `question` anders lautet | die Überschrift `h2` (`lw-ui-section`), immer | `Step` |
| `question` | die Überschrift `h2` | direkt unter der Überschrift, `p.lw-ui-text`, nur wenn gesetzt und (getrimmt) anders als `title` | `Step`, `StepFreeText` |
| `context`, `text` | Markdown nach dem Kopf | unverändert | `Step` |

**Kann bewusst nicht:**
- Sie kürzt keinen Titel und baut keinen aus Feldern zusammen. Den Titel im
  Muster „<Thema>: <Gegenpartei> <Betrag>“ schreibt die App.
- Sie ändert die volle Karte (`variant="card"`) nicht. Dort steht der Titel als
  `h3`. Beim Lesen folgt die Frage nach der Mandanten-Notiz und vor dem Kontext.
  Beim Antworten trägt sie der `ChoicePrompt` als Kopf der Optionen, ein zweites
  Mal wäre doppelt. llcto: „Wenn der ChoicePrompt sie dort sowieso trägt,
  bleibt es, wie es ist.“

## Verhalten

- **Reihenfolge im Kopf:** `h2` Titel · Frage · Hinweis bei `optional` ·
  `caseLink`. Dann wie bisher: Zurückstellung, Mandanten-Notiz, Kontext, Text,
  Grundlage (0241, eingeklappt).
- **Abstand:** Die Frage steht im `header` und hat deshalb `--space-1` zum
  Titel. Zum Kontext ist der Abstand `--space-3`, wie zwischen den Blöcken der
  Karte. So gehört der Satz sichtbar zum Titel.
- **Fokus:** `headingRef` und `tabIndex={-1}` bleiben an der `h2`. Beim
  Blättern landet der Fokus auf dem Titel (I13, 0222).
- **Antwort-Zone:** unverändert. `ChoicePrompt` mit `hideQuestion`, die Wege,
  der Kasten „Kontext“ rechts.
- **Gleich lautend:** Ist `question` leer oder gleich `title`, steht nur der
  Titel, kein zweiter Satz.
- **Zustände:** Die Karte hat ihre fünf Zustände schon (0214, 0222). Beim
  Senden und beim Fehler am Knopf bleiben Titel und Frage stehen, wie die
  Eingabe (H4 der Abnahme).
- **Server/Client:** unverändert.

## Stories

Titel `v3/Entitäten/Klärung/ClarificationCard`. Keine neue Story:

| Story | Beweist |
|---|---|
| `Step` | Titel kurz im Muster „<Thema>: <Gegenpartei> <Betrag>“ („Steuerschlüssel unklar: Wolkenhaus S.à r.l. 42,84 €“), darunter die Frage als ganzer Satz, dann Kontext und Grundlage. Fiktive Daten |
| `StepFreeText` | eine zweite Frage mit eigenem Titel und Satz, dazu der Hinweis bei `optional` unter der Frage |
| `StepPaging` | Fokus nach dem Blättern auf der `h2` mit dem Titel |
| `InBatchReview` | volle Karte unverändert: Titel `h3`, die Frage im `ChoicePrompt` |

Ausgeschlossen: leer und leer nach Filter, weil die Schritt-Form immer eine
Frage zeigt.

## Ausbau

Kein Ausbau. Fehlt der App ein kurzer Titel, ist das ein Befund für die App und
kein Prop der Karte.

## Offene Fragen

Keine. Die Typo-Rolle der Frage (`lw-ui-text`) folgt aus dem Wortlaut des
Auftrags.

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

- [ ] `h2` ist `title`, 16/600 `--color-text`. Kein `.v2clc__topic` mehr im DOM und in `v3.css` (`Step`)
- [ ] Die Frage steht direkt unter der `h2` als `p.lw-ui-text`, 13,5/400 in `--color-text` (nicht muted), mit `--space-1` Abstand (`Step`, gemessen)
- [ ] Ist die Frage gleich dem Titel oder leer, steht kein zweiter Satz (Code, `question.trim() !== title.trim()`)
- [ ] Danach Kontext und Text wie bisher, dann „Grundlage“ eingeklappt (0241) (`Step`)
- [ ] Hinweis bei `optional` unter der Frage (`StepFreeText`)
- [ ] Fokus nach dem Blättern auf der `h2` mit dem neuen Titel, `document.activeElement` gemessen (`StepPaging`)
- [ ] Volle Karte unverändert: Titel `h3`, im Antwortmodus die Frage einmal, im `ChoicePrompt` (`InBatchReview`); beim Lesen `p.v2clc__question` (`Filled`)
- [ ] Bei 1280 px läuft nichts über, der Titel bricht bei Bedarf um (`Step`)

## Abnahme

Gemessen auf dem laufenden Dev-Server (Port 6107), der weder neu gestartet noch
neu gebaut wurde. Messbrowser war die Headless Shell 1247 über `CHROME_BIN` und
`scripts/cdp.mjs`, ein Browser je Skript. Gemessen wurde bei 1280 px, mit
Stichproben bei 1920 px. Die Proben (`step.mjs`, `card.mjs`, `sweep.mjs`,
`rest.mjs`) und die Screenshots liegen im Scratchpad der Sitzung und ändern
keine Datei im Repo. Geprüft wurde der Diff gegen `HEAD` (`c74bef4`). Story-IDs
unten ohne das Präfix `v3-entitäten-klärung-clarificationcard`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` lief nach Auftrag nicht im Arbeitsbaum. `pnpm exec storybook build -o <Scratchpad>` endet mit Exit 0 („Storybook build completed successfully“) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Die Änderung steht im Zweig `step` von `head` in `entities/clarification/ClarificationCard.tsx`, die Fixture in `ClarificationCard.stories.tsx` daneben, Titel `v3/Entitäten/Klärung/ClarificationCard`. Es gibt keine neue Datei | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Der neue Kommentar im Kopf, das JSDoc von `ClarificationCard` („the title as the headline and the question under it (0242)“) und die Kommentare der Stories sind englisch. Deutsch steht nur in Strings der Fixture. Es gibt keinen neuen Export. `check:when` meldet „in Ordnung“, die Selbstprüfung (`--test`) 11 Fälle grün. `check:language` meldet „0 German comment lines“ | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Im Diff steht kein Hex und kein px. Der Hinweis bei `optional` kommt weiter aus der Registry (`clarification_severity`). `v3.css` verliert `.v2clc__topic` und bekommt keine Regel dazu. `check:type` meldet „ok“, `check:contrast` und `check:icons` enden mit Exit 0. `check:classes` endet mit Exit 1 und genau den vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `--step`, `--step-free-text`, `--step-paging` und `--in-batch-review` stehen im Index und rendern. Der Titel in `--step` folgt dem Muster „<Thema>: <Gegenpartei> <Betrag>“: „Steuerschlüssel unklar: Wolkenhaus S.à r.l. 42,84 €“, die Daten sind fiktiv. Leer und leer nach Filter sind ausgeschlossen, mit dem Grund „die Schritt-Form zeigt immer eine Frage“. Senden und Fehler am Knopf zeigt `--step-loading-and-error` (H4) | ✓, H4 |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Überschriften nach §2a: Die Schritt-Form beginnt mit `h2.lw-ui-section`, die Frage ist Fließtext `p.lw-ui-text`. Gliederung `--step`: `h2` Titel → `h3` „Ihre Antwort“ → `h3` „Kontext“. In `--step-deferred-with-history` kommt `h3` „Verlauf dieser Frage“ davor. Es gibt keinen Sprung. Die Schrift kommt aus der Skala: 16 px/600 und 13,5 px/400. Kontrast `rgb(45, 45, 45)` auf Weiß 13,77:1 für beide. Text steht links. Es gibt keine neue Farbe und kein neues Zeichen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Bei 1280 px geladen: 27 Stories von `ClarificationCard`, 11 von `ClarificationRow`, `seiten-deck--questions`, `seiten-deck--question-detail` und acht Sachverhalt-Seiten. Keine Seite läuft quer. Die Konsole meldet 0 Fehler, 0 Warnungen und 0 Ausnahmen. Alle 11 Schritt-Formen in 9 Stories zeigen die `h2` mit dem Titel und darunter die Frage, wo es eine gibt, die vom Titel abweicht. Screenshots `0242-step-1280.png`, `0242-step-1920.png`, `0242-step-free-text-1280.png`, `0242-filled-1280.png` | ✓ |
| `h2` ist `title`, 16/600 `--color-text`. Kein `.v2clc__topic` mehr im DOM und in `v3.css` | `--step` bei 1280 und 1920: `h2.lw-ui-section.v2clc__q` enthält `title` „Steuerschlüssel unklar: Wolkenhaus S.à r.l. 42,84 €“, 16 px, 600, `rgb(45, 45, 45)`, `tabIndex` −1. `.v2clc__topic` kommt in keiner der 48 geladenen Stories im DOM vor. `grep` findet die Klasse in `src/` nicht mehr | ✓ |
| Die Frage steht direkt unter der `h2` als `p.lw-ui-text`, 13,5/400 in `--color-text` (nicht muted), mit `--space-1` Abstand | `--step` bei 1280 und 1920: Das nächste Geschwister der `h2` ist `p.lw-ui-text` mit „Wie soll die Rechnung WH-26-00871 von Wolkenhaus über 42,84 € (Dezember 2025) gebucht werden?“. Die Schrift ist 13,5 px, 400, `rgb(45, 45, 45)`, nicht `rgb(92, 92, 92)`. Die Lücke zur `h2` beträgt 4,00 px (`--space-1`), vom Kopf zum Kontext 12,00 px (`--space-3`). Die Frage bricht bei 579 px um (H1) | ✓, H1 |
| Ist die Frage gleich dem Titel oder leer, steht kein zweiter Satz | Code `ClarificationCard.tsx:1005`: `c.question && c.question.trim() !== c.title.trim()`. Im Browser: `clarificationrow--in-batch-review-drawer` rendert die Schritt-Form ohne `question`, dort steht nur die `h2` (H3) | ✓, H3 |
| Danach Kontext und Text wie bisher, dann „Grundlage“ eingeklappt (0241) | `--step`: Die Kinder von `.v2clc__about` sind `header` (`h2`, `p`), der Kontext (`.v2clc__prose`) und `details` „Grundlage 3“ mit `open` false. `text` ist in der Fixture leer und rendert nichts | ✓ |
| Hinweis bei `optional` unter der Frage | `--step-free-text`: Der Kopf hat `h2` „Tabula-Rechnung vom 03.01.2026 ohne Projekt“, dann `p.lw-ui-text` „Zu welchem Projekt gehört die Tabula-Rechnung über 54,00 USD vom 03.01.2026?“, dann `p.lw-ui-hint` „Hilfreich, aber die Buchung kann auch ohne Antwort erfolgen.“ (`0242-step-free-text-1280.png`) | ✓ |
| Fokus nach dem Blättern auf der `h2` mit dem neuen Titel, `document.activeElement` gemessen | `--step-paging`, Klick auf „Speichern und weiter“: `document.activeElement` ist die `h2` „Gegenpartei weicht ab: Beleg nennt „Brightline Technology GmbH““, darunter „Welche Gegenpartei gilt für diesen Sachverhalt?“. Nach dem zweiten Klick ist es die `h2` „Druckerei-Hansen-Rechnung ohne Leistungsmonat“. Die `h2` trägt keinen Ring, wie in 0222 (`0241-0242-step-paging-after-1280.png`) | ✓ |
| Volle Karte unverändert: Titel `h3`, im Antwortmodus die Frage einmal, im `ChoicePrompt`; beim Lesen `p.v2clc__question` | `--in-batch-review`: `h3.v2clc__title` „Bewirtung oder Reisekosten? Beleg nennt beides“. Die Frage steht genau einmal als Text im DOM, in `div.v2ask__q` des `ChoicePrompt`, und es gibt kein `p.v2clc__question`. `--filled`: `p.v2clc__question` steht einmal, nach dem Kopf und vor dem Kontext. Die Gliederung der Karte ist `h3` → `h4`. Im Zweig `card` ändert der Diff nur einen Kommentar | ✓ |
| Bei 1280 px läuft nichts über, der Titel bricht bei Bedarf um | `--step` bei 1280 und 1920: `scrollWidth` = `clientWidth`, der Titel steht auf einer Zeile (21,59 px). Als DOM-Probe ein Titel mit 160 Zeichen: zwei Zeilen (43,19 px), `scrollWidth` der `h2` 774 = `clientWidth`, die Seite bleibt bei 1280 (`0242-step-long-title-probe-1280.png`) | ✓ |

Abgenommen von / am: fremde Abnahme, 2026-11-03 · Offene Punkte: keine Mängel; H1–H5 nicht blockierend

### Hinweise

- **H1 · Die Frage hat ein kürzeres Maß als der Kontext darunter.**
  `.lw-ui-text` bringt `max-width: var(--content-measure)` mit, 579 px. In
  `--step` bricht die Frage nach „(Dezember 2025)“ um, der Kontext darunter
  läuft bis 774 px. So stehen zwei Absätze Fließtext mit zwei rechten Kanten
  untereinander (`0242-step-1280.png`). Die Rolle ist richtig gewählt, das Maß
  gehört zu ihr. Ob der Kontext (`.v2clc__prose`) dasselbe Maß bekommt oder die
  Frage die volle Breite, ist ein Systementscheid.
- **H2 · Die Beleg-Prüfung im selben Lauf hat noch den alten Kopf.**
  `SourceDocumentReview` (0223) zeigt die graue Themenzeile
  `.v3docreview__topic` über der Frage als `h2`. In der Stapelabnahme stehen
  damit zwei Schritt-Formen mit gegenläufigem Kopf hintereinander. 0242 schließt
  das nicht ein. Will der Owner beide gleich, braucht es eine Folge-Spec.
- **H3 · Story-Daten zeigen noch das alte Bild.**
  `v3-entitäten-klärung-clarificationrow--in-batch-review-drawer` rendert die
  Schritt-Form mit Titeln, die ganze Fragen sind („Wie soll die
  Wolkenhaus-Rechnung WH-26-00871 über 42,84 € gebucht werden?“), ohne
  `question`. Die `h2` ist dort die lange Frage. Der Code verhält sich richtig,
  aber das Bild zeigt den Kopf, den 0242 ersetzt.
- **H4 · Ein Satz der Spec stimmt nicht.** Unter Verhalten steht „Laden und
  Fehler zeigen keinen Kopf mit Titel, das bleibt so“. `--step-loading-and-error`
  zeigt beim Senden und beim Fehler am Knopf Titel und Frage, so wie vorher die
  Frage als Überschrift. Das Verhalten ist richtig, denn die Eingabe bleibt
  stehen. Nur der Satz beschreibt es falsch.
- **H5 · Docs.** Außerhalb von `docs/backlog/` beschreibt keine Datei den alten
  Kopf. In 0222 nennt die Bau-Tabelle („Obere Zone `.v2clc__about`“) noch
  „Thema, Frage (`h2`) … Grundlage (`h3`)“. Der Nachtrag vom 2026-11-03 nennt
  nur „Punkte 1 und 2 der Liste oben“. Er deckt die Zeile inhaltlich ab, nennt
  sie aber nicht. Die Abnahme-Zeilen von 0222 sind Befunde ihrer Zeit und
  bleiben.

### Nach der Abnahme (2026-11-03)

- H4: Satz unter Verhalten berichtigt.
- H5: Nachtrag in 0222 nennt die Zeile „Obere Zone“ der Bau-Tabelle.
- H1 (Maß der Frage gegen den Kontext) und H2 (`SourceDocumentReview` mit altem Kopf) gehen als Frage an llcto. H3 (Fixture der Zeilenliste 0224) bleibt bis zu einem Anlass.
