# 0081 · CaseCard — der Sachverhalt als Karte im Mandantenportal

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
| Freigabe | zurück 2026-09-07 — Neufassung auf einen Einsatzort nach Abschnitt „Freigabe", danach ohne zweite Runde freigegeben |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CaseCard`) und „Listen" (Zeile `PortalCaseList`) |
| Auftrag | Die Karte des Reiters **„Zum Schließen"**: Anzeigename, Bearbeitungsstand, Kennung, Betrag, Gegenpart, Zuständigkeit, Art und Zusammenfassung, darunter Belege und Buchungsvorschläge als Unterlisten. Ersetzt `CloseCasesPanel`. *(Der ursprüngliche Auftrag galt dem Mandantenportal und `PortalCaseList.tsx`; das Portal ist gelöscht, die Neufassung vom 2026-09-07 hat die Karte auf einen Einsatzort gestellt — die Kopfzeile war nicht nachgezogen, berichtigt 2026-09-08, M9.)* |
| Zeigt (Ränge) | 1–7 und 11 — siehe Neufassung; die Zeile darüber galt dem gelöschten Portal |
| Vertagt, weil | die Fünf-Formen-Grenze aus `entitaet-analysieren` §9 mit `CaseCell`, `CaseRow`, `CaseFacts`, `CaseDetailView` (0050) und `CaseDrawer` (0052 Schritt 3) voll ist — und weil der Inhalt der Karte die Klärung ist: sie hängt am Profil `docs/entitaeten/clarification.md` und an `ClarificationCard`. |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

Die Spec schreibt `spec-schreiben`, wenn das Profil auf `geprüft` steht und die
fünf Formen der ersten Welle gebaut sind. Sie nimmt Datenpunkte, Ränge und
„ersetzt" aus dem Profil, nicht aus dem Chat.

*(Der Befund L-32 — das Portal baut die Antwort-Eingabe der Klärung selbst
nach — ist mit dem Seiten-Rückbau vom 2026-09-05 erledigt: es gibt kein Portal
mehr.)*

## Spec 2026-09-07 (Skill `spec-schreiben`)

## Ziel

Der Sachverhalt als **Karte** — die Form, in der er nicht in einer Zeile
steht, sondern mit dem, was unter ihm hängt. Zwei Stellen bauen sie heute je
selbst: `client-portal/ui/PortalCaseList.tsx` (396 Z.) und
`CloseCasesPanel.tsx` (941 Z.).

## Einordnung

**Klasse `entities/accounting-case/`.** Anzeigename, Nummer und Art sind
Fachbegriffe, die Rückfallkette des Anzeigenamens ist eine Ludwig-Regel.

**Regel aus §3, die griff: Nr. 5** — eine neue Entitäts-Form. Sie ist
**zweifach** belegt, nicht einfach; das Entitätsprofil hat das beim zweiten
Lesen korrigiert. Keine vorhandene Form deckt sie ab: `CaseRow` ist die Zeile
(kein Platz für Unterlisten), `CaseFacts` ist die Faktentafel ohne Rahmen und
ohne Kopf, `CaseDetailView` ist die ganze Seite.

**Der Zuschnitt ist die eigentliche Entscheidung**, weil die zwei Einsatzorte
verschiedene Dinge zeigen:

| | Portal (der Mandant) | Abnahme (die Buchhalterin) |
|---|---|---|
| Ränge | 1, 3–4, 7, 9, 11 | 3, 7, 11, 13, 25 |
| Unterlisten | offene Fragen, Belegwünsche | Belege, Buchungsvorschläge |
| Leerfall | „nichts zu tun" | „Keine offenen Buchungsvorschläge" |
| **nicht** dabei | Zustand, Zuständigkeit — der Mandant sieht seine Aufgabe, nicht den Kanzlei-Stand | — |

Gemeinsam sind **3, 7, 11**: Nummer, Art, Zusammenfassung. Der Rest ist je
Rolle ein anderer.

**Zwei Karten wären falsch** (R17, und §4 gibt keinen Trenngrund her: es ist
dieselbe Datenquelle und derselbe Änderungsgrund). **Eine Karte mit einer
Rollen-Variante** wäre die zweite Falle: sie hätte die Rolle im Code, die
Zusatzfelder wären fest verdrahtet, und die dritte Stelle bekäme eine dritte
Variante. Gebaut wird deshalb der Weg, den 0063 im Set schon geht — **ein
Rahmen mit Slots**:

- Die Karte trägt, was **jeder** Sachverhalt hat: den Anzeigenamen mit seiner
  Rückfallkette, die Nummer, die Art und die gekürzte Zusammenfassung.
- Was je Rolle verschieden ist, kommt als Knoten hinein: eine Meta-Zeile und
  der Bereich darunter.

Damit kennt die Karte weder Klärung noch Buchungssatz — sie müsste sonst zwei
fremde Entitäten importieren, und der Leerfall beider Rollen wäre in ihr
verdrahtet.

**Eine Datei, ein Export.** `CaseCard.tsx` neben `CaseCell.tsx`, `CaseRow.tsx`
und `CaseFacts.tsx`.

## Schnittstelle

Typen aus `src/ludwig/modules/accounting-cases/domain/case.ts`:
`CaseListItem` (oder ein Ausschnitt davon), `caseDisplayTitle()`,
`caseKindLabel()`; `Currency` aus dem Geld-Modul.

| Prop | Typ | Bedeutung | Story |
|---|---|---|---|
| `case` | `CaseCardVM` | Anzeigename-Bestandteile (`title`, `kind`, `counterpartyName`), `caseNumber`, `summary` — der Ausschnitt aus `CaseListItem`, den die Karte wirklich liest | `Filled` |
| `href` | `string` (optional) | der Weg zum Sachverhalt. Ohne ihn ist der Kopf Text — nie ein Knopf, der nichts tut. Das Portal setzt ihn nicht: der Mandant hat keine Fallseite | `InPortal`, `InAcceptance` |
| ~~`meta`~~ | — | **Gestrichen mit der Neufassung.** Die Karte baut ihre Faktenzeile selbst; ein freier Knoten daneben wäre eine zweite Ordnung. **Folge, hier festgehalten:** das Personenkonto (Rang 13) hat damit keinen Ort mehr in dieser Form — es stand nur in `meta`. Wer es braucht, zeigt es über `aside` oder in der Liste, nicht in der Karte (Abnahme 2026-09-08, M8) |
| `aside` | `ReactNode` (optional) | rechts im Kopf: eine Plakette, ein Zähler. Die Abnahme setzt hier den Bucket, das Portal nichts | `InAcceptance` |
| `children` | `ReactNode` (optional) | was unter dem Fall hängt — Fragen und Belegwünsche bzw. Belege und Vorschläge. Ohne Kinder fällt der Bereich **samt Abstand** weg | `WithoutSubLists` |
| `summaryLimit` | `number` (optional) | Vorgabe **160** Zeichen (Profil: p90 = 309, ungekürzt ist es ein Absatz und keine Karte); `0` zeigt sie ganz | `Edges` |

**Kann bewusst nicht:**

- **Den Zustand zeigen.** Weder `lifecycleStatus` noch `disposition` stehen in
  der Karte. Im Portal ist das ausdrücklich so gewollt (der Mandant sieht
  seine Aufgabe, nicht den Kanzlei-Stand); in der Abnahme trägt der Bucket die
  Auskunft und kommt über `aside`. Wer den Zustand braucht, setzt ihn dorthin.
- **Die Unterlisten kennen.** Klärung und Buchungssatz haben ihre eigenen
  Formen (`ClarificationCard`, `JournalEntryCard`) und ihre eigenen Profile.
  Die Karte gibt ihnen Platz, mehr nicht.
- **Auswählen.** Die Massenaktion der Abnahmeliste (Auswahl je Karte,
  „Alle bestätigen (n)") gehört der Liste, nicht der Karte — und sie hängt an
  Befund L-16 (Server Actions mit `ids[]`).
- **Laden.** Kein Modul, keine Action, kein Zustand.

## Verhalten

- **Der Anzeigename kommt aus `caseDisplayTitle()`.** Nicht `title` allein
  (53 % gefüllt) und keine eigene Kette: das Profil hat vier verschiedene
  Ketten in der App gefunden, und die v3-Karte ist die eine Regel, nicht die
  Mehrheitsmeinung.
- **Fehlt die Nummer, steht keine da.** `caseNumber` ist `null`, wenn dem Fall
  das Wirtschaftsjahr fehlt — kein Gedankenstrich, der etwas behauptet.
- **Die Kürzung hat einen Weg zurück.** Gekürzte Zusammenfassungen tragen den
  ganzen Text im `title`; sonst ist die Karte eine Abschneidung.
- **Kein Rand und Schatten zugleich** (§9). Die Karte nimmt, was `Card` gibt.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseCard`. Ableitung nach §6: **2 anwendbare
Story-Zustände** (gefüllt · ohne Unterlisten) + 0 Enum-Props + 0
Layout-Booleans + 0 Callbacks + **2** „im Einsatz" + 1 Rand = **5**. Zur
Untergrenze für eine Entitäts-Form (3) kommt sie damit hin; die drei
ausgeschlossenen Zustände mit Grund:

- **lädt** — die Karte lädt nichts; der Ladezustand gehört der Liste um sie
  herum und ihrem Slot.
- **Fehler** — dasselbe: was scheitern kann, ist das Laden der Unterlisten,
  und die kommen als Knoten.
- **leer nach Filter** — die Karte ist kein Filterergebnis.

Zwei „im Einsatz" statt einem, weil die Form **zwei** belegte Einsatzorte hat
und der Zuschnitt genau daran hängt: eine einzige Story bewiese den Rahmen
nur für eine Rolle.

| Story | Beweist |
|---|---|
| `Filled` | Kopf mit Anzeigename, Nummer und Art; Zusammenfassung auf 160 gekürzt mit `title`; Meta-Zeile und zwei Unterlisten |
| `WithoutSubLists` | Ohne `children` fällt der Bereich **samt Abstand** weg — eine Karte ohne Unterlisten sieht nicht aus, als fehlte dort etwas. Das ist im Portal der **Normalfall**: `disposition='client'` trifft im Bestand null Zeilen |
| `Edges` | Fünf Ränder: Zusammenfassung über der Grenze (die Fixture hat **500** Zeichen — das Maximum aus Staging ist 720, aber die Kürzung greift schon bei 160 und wird bei 500 sichtbar), Fall ohne `title`, Fall ohne `caseNumber`, Fall ohne Gegenpart und ohne Betrag, Fall **weder mit Titel noch mit Gegenpart** samt `summaryLimit={40}` |
| `InPortal` | In der Portal-Liste: Betrag und Eröffnet in `meta`, Fragen und Belegwünsche als Kinder, kein `href`, **kein** Zustand und **keine** Zuständigkeit sichtbar |
| `InAcceptance` | In der Abnahmeliste: Personenkonto in `meta`, Abnahme-Bucket in `aside`, Belege und Vorschläge als Kinder, mit `href` |

Daten aus den Spiegeltypen; Werte wie echte: „Eingangsrechnung: Musterbau
GmbH", 2026-0042, 1.249,90 €, 26.08.2026.

## Ausbau (A12)

- **Auswahl je Karte** für die Massenaktion der Abnahmeliste: als
  `selected`/`onSelect`-Paar, sobald L-16 (Server Actions mit `ids[]`) steht.
  Ohne Callback keine Auswahl — keine Prop, die nichts tut.
- **`CloseCaseList`** (Reiter „Zum Schließen") setzt diese Karte voraus und
  bekommt eine eigene Nummer, sobald sie steht. Sie gruppiert nach der Achse
  `triage`, sortiert nicht.
- **Die Antwort-Eingabe der Klärung.** Das Portal baut sie heute selbst nach,
  statt `AnswerInput` zu nutzen (Befund L-32). Das ist keine Aufgabe dieser
  Karte — sie gibt der `ClarificationCard` Platz, und die trägt `mode="answer"`
  bereits.

## Offene Fragen

1. **Trägt die Karte den Gegenpart getrennt, wenn er schon im Anzeigenamen
   steckt?** *Ohne Antwort:* nein — in 47 % der Fälle steht er über die
   Rückfallkette bereits dort; ihn daneben zu wiederholen füllt die Karte,
   ohne etwas zu sagen.
2. **Wie viele Kinder zeigt die Karte, bevor sie kürzt?** *Ohne Antwort:*
   alle. Die Zahl kennt die Liste, nicht die Karte; p90 der offenen Klärungen
   ist 0 und das Maximum 3 — es gibt nichts zu kürzen.
3. **Ist `aside` im Portal wirklich leer?** *Ohne Antwort:* ja. Der einzige
   Kandidat wäre der Zustand, und der ist dort ausdrücklich nicht erwünscht.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` grün (Exit 0); **nicht bauen**, solange parallele Prüfer messen (0117)
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` am Export — `pnpm check:when` Exit 0
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle fünf Stories vorhanden; die drei ausgeschlossenen Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook 6107), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Der Anzeigename kommt aus `caseDisplayTitle()`; `grep` findet keine zweite Kette in der Datei, und die Story zeigt einen Fall ohne `title`, bei dem der Rückfall greift (Story `Edges`)
- [ ] Ein Fall ohne `caseNumber` zeigt keine Nummer und keinen Ersatzstrich (Story `Edges`)
- [ ] Ein Fall ohne Gegenpart zeigt die Art allein, nicht „Art: " mit leerem Rest (Story `Edges`)
- [ ] Die Zusammenfassung ist auf `summaryLimit` (Vorgabe 160) gekürzt und trägt den ganzen Text im `title` — **gemessen**, nicht gelesen: Zeichenzahl im DOM und `title`-Länge (Story `Edges`)
- [ ] Ohne `children` fällt der Bereich samt Abstand weg — Höhe der Karte mit und ohne Kinder gemessen, die Differenz ist der Inhalt, nicht ein leerer Kasten (Story `WithoutSubLists`)
- [ ] `meta` und `aside` erscheinen genau dort, wo die Spec sie beschreibt, und fehlen ohne Prop restlos (Stories `InPortal`, `InAcceptance`)
- [ ] Ohne `href` ist der Kopf Text und kein Knopf; mit `href` ein Link mit sichtbarem Fokus (beide Einsatz-Stories, Fokus per **Tab** gemessen)
- [ ] Weder `lifecycleStatus` noch `disposition` erscheinen von selbst — `InPortal` zeigt gemessen **keinen** StatusBadge (Story `InPortal`)
- [ ] Rand **oder** Schatten, nicht beides (`getComputedStyle` an `.v2card`)
- [ ] Ersetzt die Karte in `PortalCaseList.tsx` und die in `CloseCasesPanel.tsx` ohne Funktionsverlust — beide Rollen mit demselben Export, ohne Rollen-Variante im Code (Stories `InPortal`, `InAcceptance`)

## Abnahme

## Freigabe (2026-09-07, ludwig-coordinator im Auftrag des Owners)

**Urteil: zurück — Neufassung auf einen Einsatzort.** Das Portal ist mit dem Seiten-Rückbau vom 2026-09-05 gelöscht (§11.4; L-32 erledigt; `disposition='client'` stillgelegt, Owner 2026-08-31). Der ganze Zuschnitt „zwei Rollen → Rahmen mit Slots", die Zeile „ersetzt `PortalCaseList.tsx`", die Story `InPortal` und Frage 3 stehen auf einem Bildschirm, den es nicht gibt. Es bleibt **ein** Einsatzort: `CloseCasesPanel` (Reiter „Zum Schließen", `[year]/cases`, Welle 1). §3 Regel 5 trägt weiter — eine Seite braucht die Form, keine vorhandene deckt sie —, aber die Slots werden für einen Aufrufer über die Präzedenz 0050/0063 begründet, nicht über zwei Rollen.

Entscheide: 1 Gegenpart **in der Karte ab S** (Rang 5), ausgelassen nur ohne `title` — das Profil hat das Rückfallketten-Argument am 2026-09-05 widerlegt (in 51 % der Fälle mit `title` fehlt er darin) · 2 alle Kinder zeigen · 3 gegenstandslos, streichen · **Zustand in den Kopf** (`StatusBadge` Achse `sachverhalt`), Bearbeitungsstand (Rang 2) und Zuständigkeit (Rang 6) gehören in die Karte — die Ränge sind kumulativ, und genau diese zwei nennt das Profil als Lücke von `CloseCasesPanel` · der Abnahme-Bucket (Rang 25) geht **nicht** in `aside`: „Gruppenkopf, gehört zur Abnahmeliste, nicht in die Zeile" (Profil).

Vor dem Bau in die Spec: Neufassung auf den einen Einsatzort; Slots gegen 0050/0063 begründen; `InPortal` streichen (vier Stories bleiben über der Untergrenze); Anzeigename und Kennung über `caseTitle()`/`caseIdentifier()` aus `case-title.ts` statt eigener Regeln — „fehlt die Nummer, steht keine da" widerspricht der Familie; kein lokales `CaseCardVM`: `CaseLink` plus `Pick<CaseListItem, …>` für die Zusammenfassung; Kopfzeile bereinigen („Zeigt (Ränge)" gegen den Text, „L-32 fällt an" ist erledigt). Vorab freigegeben, wenn die Neufassung dem folgt.

## Neufassung 2026-09-07 nach der Freigabe — ein Einsatzort

Die Spec darüber steht auf einem Bildschirm, den es nicht mehr gibt: das
Mandantenportal ist mit dem Seiten-Rückbau vom 2026-09-05 gelöscht,
`disposition='client'` ist stillgelegt (Owner 2026-08-31), L-32 erledigt.
Damit fallen der Zuschnitt „zwei Rollen", die Zeile „ersetzt
`PortalCaseList.tsx`", die Story `InPortal` und die offene Frage 3.

## Ziel

Der Sachverhalt als **Karte** — die Form, in der er nicht in einer Zeile
steht, sondern mit dem, was unter ihm hängt. Ein Einsatzort:
`CloseCasesPanel` (941 Z.), der Reiter „Zum Schließen" unter
`[year]/cases`, wo die Buchhalterin die Vorschläge eines Laufs abnimmt.

## Einordnung

**Klasse `entities/accounting-case/`.** Anzeigename, Kennung, Art und
Zuständigkeit sind Fachbegriffe.

**Regel aus §3, die griff: Nr. 5** — eine neue Entitäts-Form. Eine Seite
braucht sie, und keine vorhandene deckt sie ab: `CaseRow` ist die Zeile ohne
Platz für Unterlisten, `CaseFacts` die Faktentafel ohne Rahmen und ohne Kopf,
`CaseDetailView` die ganze Seite.

**Warum Slots und nicht Datenprops.** Die Karte trägt, was jeder Sachverhalt
hat, und lässt Raum für das, was ihn in dieser Liste ausmacht — dieselbe
Bauform wie `CaseDetailView` (0050) und `LedgerAccountView` (0063). Der Grund
ist hier derselbe wie dort: was unter dem Fall hängt, sind **fremde
Entitäten** (Belege, Buchungsvorschläge) mit eigenen Profilen und eigenen
Formen. Eine Karte, die sie kennt, müsste sie importieren und ihren Leerfall
mitbringen; eine Karte mit einem `children`-Slot gibt ihnen Platz und bleibt
bei ihrer eigenen Entität.

**Eine Datei, ein Export.** `CaseCard.tsx` neben `CaseCell.tsx`,
`CaseRow.tsx`, `CaseFacts.tsx` und `CasePicker.tsx`.

## Schnittstelle

Kein lokales Ansichtsmodell: die Karte liest `CaseLink` (`case-title.ts`, den
die Familie ohnehin teilt) plus die Zusammenfassung aus `CaseListItem`.
Anzeigename und Kennung kommen aus `caseTitle()` und `caseIdentifier()` —
nicht aus eigenen Regeln, denn die Familie hat für beides genau eine.

| Prop | Typ | Bedeutung | Story |
|---|---|---|---|
| `case` | `CaseLink & Pick<CaseListItem, "summary" \| "disposition">` | Anzeigename, Kennung, Art, Zustand, Gegenpart, Zusammenfassung, Zuständigkeit | `Filled` |
| `href` | `string` (optional) | der Weg zum Sachverhalt. Ohne ihn ist der Kopf Text — nie ein Knopf, der nichts tut | `InUse` |
| `aside` | `ReactNode` (optional) | rechts im Kopf: was **diese Liste** über den Fall sagt, etwa ihre Auswahl | `InUse` |
| `children` | `ReactNode` (optional) | was unter dem Fall hängt — Belege, Buchungsvorschläge. Ohne Kinder fällt der Bereich **samt Abstand** weg | `WithoutSubLists` |
| `summaryLimit` | `number` (optional) | Vorgabe **160** Zeichen (Profil: p90 = 309, ungekürzt ist es ein Absatz und keine Karte); `0` zeigt sie ganz | `Edges` |

**Die Karte zeigt**: Anzeigename (1), Bearbeitungsstand (2), Kennung (3),
Betrag (4), Gegenpart (5), Zuständigkeit (6), Art (7), Zusammenfassung (11).

*Nicht kumulativ:* die Ränge 8–10 fehlen bewusst, sie gehören der Zeile und
dem Detail. „Kumulativ bis M" stand hier und stimmte nicht (berichtigt
2026-09-08, M9).

Zwei Entscheide der Freigabe stecken darin:

- **Der Gegenpart steht in der Karte**, ausgelassen nur, wo kein `title`
  gesetzt ist — dann trägt ihn der Anzeigename bereits über die
  Rückfallkette. Das Profil hat am 2026-09-05 gemessen, dass er in **51 %**
  der Fälle mit `title` dort *nicht* vorkommt; ihn generell wegzulassen wäre
  also der häufigere Fehler.
- **Bearbeitungsstand und Zuständigkeit gehören in die Karte.** Sie sind die
  zwei Ränge, die das Profil als Lücke von `CloseCasesPanel` nennt. Der
  Zustand steht im Kopf als `StatusBadge` (Achse `sachverhalt`), die
  Zuständigkeit in der Meta-Zeile über die Achse `disposition`.

**Kann bewusst nicht:**

- **Den Abnahme-Bucket zeigen.** Er ist der **Gruppenkopf** der Abnahmeliste,
  nicht eine Angabe der Karte (Profil). Wer ihn braucht, setzt ihn über die
  Karte, nicht hinein.
- **Die Unterlisten kennen.** Beleg und Buchungssatz haben eigene Formen und
  eigene Profile; die Karte gibt ihnen Platz.
- **Auswählen.** Die Massenaktion gehört der Liste und hängt an Befund L-16
  (Server Actions mit `ids[]`). Was die Liste je Karte anzeigen will, kommt
  über `aside`.
- **Laden.** Kein Modul, keine Action, kein Zustand.

## Verhalten

- **Anzeigename und Kennung aus der Familie.** `caseTitle()` und
  `caseIdentifier()` — die Kennung fällt auf die ersten acht Zeichen der id
  zurück, wenn die Nummer fehlt; ein Sachverhalt ohne Nummer bleibt so
  benennbar. „Fehlt die Nummer, steht keine da" wäre eine zweite Regel neben
  der der Familie.
- **Die Kürzung hat einen Weg zurück.** Eine gekürzte Zusammenfassung trägt
  den ganzen Text im `title`.
- **Kein Rand und Schatten zugleich** (§9); die Karte nimmt, was `Card` gibt.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseCard`. Ableitung nach §6: **2 anwendbare
Story-Zustände** (gefüllt · ohne Unterlisten) + 0 Enum-Props + 0
Layout-Booleans + 0 Callbacks + 1 „im Einsatz" + 1 Rand = **4**. Damit liegt
sie auf der Untergrenze für eine Entitäts-Form; die drei ausgeschlossenen
Zustände mit Grund:

- **lädt** und **Fehler** — die Karte lädt nichts; was scheitern kann, ist das
  Laden der Unterlisten, und die kommen als Knoten.
- **leer nach Filter** — die Karte ist kein Filterergebnis.

| Story | Beweist |
|---|---|
| `Filled` | Kopf mit Anzeigename, Zustand und Kennung; Meta-Zeile mit Art, Betrag, Gegenpart und Zuständigkeit; Zusammenfassung auf 160 gekürzt mit `title`; zwei Unterlisten |
| `WithoutSubLists` | Ohne `children` fällt der Bereich **samt Abstand** weg — eine Karte ohne Unterlisten sieht nicht aus, als fehlte dort etwas |
| `Edges` | Zusammenfassung mit 720 Zeichen (Maximum aus Staging), Fall ohne `title` (Rückfallkette greift, Gegenpart entfällt in der Meta-Zeile), Fall ohne Nummer (Kurz-ID), Fall ohne Gegenpart (dann nur die Art), Betrag über eine Million |
| `InUse` | In der Abnahmeliste: drei Karten unter einem Gruppenkopf, `aside` trägt die Auswahl der Liste, `href` führt zum Fall |

## Ausbau (A12)

- **Auswahl je Karte** für die Massenaktion: als `selected`/`onSelect`-Paar,
  sobald L-16 steht. Bis dahin kommt sie über `aside` — ohne Callback keine
  Auswahl, keine Prop, die nichts tut.
- **`CloseCaseList`** (der Reiter selbst) setzt diese Karte voraus und bekommt
  eine eigene Nummer, sobald sie steht. Sie gruppiert nach der Achse `triage`
  und sortiert nicht.

## Offene Fragen

1. **Trägt die Karte den Betrag, wenn er fehlt (48 %)?** *Ohne Antwort:* nein
   — kein Gedankenstrich, keine Null (dieselbe Regel wie in `AmountCell`).
2. **Wie viele Kinder zeigt die Karte, bevor sie kürzt?** *Ohne Antwort:*
   alle (Entscheid 2 der Freigabe). Die Zahl kennt die Liste, nicht die Karte.

## Abnahmekriterien (Neufassung)

Fest (gilt immer):

- [ ] `pnpm typecheck` grün (Exit 0); der Bau läuft je Welle bei einem Prüfer im eigenen Worktree
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` am Export — `pnpm check:when` Exit 0
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle vier Stories vorhanden; die drei ausgeschlossenen Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook 6107), nicht nur gebaut

Variabel (aus dieser Neufassung):

- [ ] Anzeigename aus `caseTitle()`, Kennung aus `caseIdentifier()`; `grep` findet keine zweite Kette und keinen zweiten Rückfall in der Datei (Story `Edges`, an einem Fall ohne `title` und einem ohne Nummer gemessen)
- [ ] Der Gegenpart steht in der Meta-Zeile, **außer** wenn `title` fehlt — dann trägt ihn der Anzeigename (Story `Edges`, beide Fälle nebeneinander)
- [ ] Der Bearbeitungsstand steht im Kopf als `StatusBadge` der Achse `sachverhalt`, die Zuständigkeit in der Meta-Zeile über die Achse `disposition` — beides aus der Registry, keine lokale Map (Story `Filled`)
- [ ] Der Abnahme-Bucket erscheint **nicht** von selbst; `aside` ist der einzige Weg, etwas neben den Kopf zu setzen (Story `InUse`)
- [ ] Ein Fall ohne Betrag zeigt keinen Betrag und keinen Ersatzstrich (Story `Edges`)
- [ ] Die Zusammenfassung ist auf `summaryLimit` (Vorgabe 160) gekürzt und trägt den ganzen Text im `title` — gemessen: Zeichenzahl im DOM und `title`-Länge (Story `Edges`)
- [ ] Ohne `children` fällt der Bereich samt Abstand weg — Kartenhöhe mit und ohne Kinder gemessen (Story `WithoutSubLists`)
- [ ] Ohne `href` ist der Kopf Text und kein Knopf; mit `href` ein Link mit sichtbarem Fokus, per **Tab** gemessen (Story `InUse`)
- [ ] Rand **oder** Schatten, nicht beides (`getComputedStyle` an `.v2card`)
- [ ] Ersetzt die Karte in `CloseCasesPanel.tsx` ohne Funktionsverlust; der Gruppenkopf und die Massenaktion bleiben Sache der Liste (Story `InUse`)

**Status: in Arbeit** — vorab freigegeben, solange die Neufassung dem
Freigabe-Abschnitt folgt.

## Gebaut (2026-09-07)

`src/ui/v3/entities/accounting-case/CaseCard.tsx` samt Stories, CSS und
Barrel-Eintrag. Vier Stories, wie in der Neufassung abgeleitet. Gemessen gegen
den Dev-Server `http://localhost:6107` über CDP bei 1400 px.

**Alle Entscheide der Freigabe sind gemessen sichtbar:**

| Entscheid | gemessen |
|---|---|
| Gegenpart in der Karte, außer ohne `title` | `Filled`: „Eingangsrechnung · 1.249,90 € · **Bürobedarf Meier GmbH** · Kanzlei" — der Fall ohne `title` in `Edges`: „Dauersachverhalt · -89,90 € · Kanzlei", **kein** zweiter Gegenpart |
| Zustand im Kopf, Zuständigkeit in der Karte | `StatusBadge` (Achse `sachverhalt`) neben dem Namen in allen Karten; „Kanzlei" aus der Achse `disposition` in der Meta-Zeile |
| Bucket **nicht** in der Karte | `InUse`: der Gruppenkopf „Prüfen · 3" steht da, aber in **keiner** Karte |
| alle Kinder zeigen | `Filled` und `InUse` rendern beide Belegzeilen |
| Kennung aus der Familie | `Edges`, Fall ohne Nummer: Kopf-Unterzeile **`c-9002ab`** statt eines Strichs; die anderen ihre Nummer |

**Die Kürzung und ihr Weg zurück.** `Edges`, erster Fall: die Zusammenfassung
hat 500 Zeichen, im DOM stehen **161** (160 plus Auslassungszeichen), im
`title` alle **500**.

**Ohne Kinder fällt die Fläche weg, samt Abstand.** Dieselbe Karte mit und
ohne `children`: **268,7 px** gegen **176,9 px**; `.v2casecard__subs` ist im
zweiten Fall nicht im DOM — kein leerer Rahmen mit Trennlinie.

**Und der Rest der Prüfliste:** Rand ja, Schatten nein (`getComputedStyle` an
`.v2card`, alle Karten); der Kopf ist mit `href` ein Link (`InUse`: 3 von 3)
und ohne `href` Text; `aside` trägt in `InUse` die Auswahl der Liste, je eine
Box je Karte.

**Was die Neufassung gestrichen hat**, ist auch im Code nicht da: kein
lokales Ansichtsmodell (`CaseCardData = CaseLink & Pick<CaseListItem, …>`),
keine eigene Rückfallkette (`caseTitle()`/`caseIdentifier()`), keine
Rollen-Variante, kein Bucket.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0.

**Status: Abnahme** — gebaut habe ich, abnehmen muss ein anderer.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

Fremde Abnahme, schlanke Tiefe (Owner-Entscheid 2026-09-08): geprüft wird die
**Schnittstelle**, nicht die Darstellung. Spurbreiten, Zeilenhöhen, Überläufe,
Kontraste, Trefferflächen, Hover, Fokus und Tastaturwege sind nach
`docs/backlog/0119-visuelle-pruefung-nachholen.md` vertagt und hier weder
geprüft noch gemessen.

**Gelesen:** `src/ui/v3/entities/accounting-case/CaseCard.tsx` (118 Z.) und
`CaseCard.stories.tsx` (158 Z.), `case-title.ts`, `CaseDrawer.tsx`,
`CasePicker.tsx`, `case-columns.tsx`, `CaseList.tsx` (die Geschwister der
Familie), `src/ui/v3/primitives/Table.tsx` (`Card`/`CardHead`),
`patterns/StatusBadge.tsx`, der Spiegel
`src/ludwig/modules/accounting-cases/domain/case.ts`,
`src/ludwig/shared/money.ts`, `src/ludwig/ui/status/status-registry.ts`
(Achsen `sachverhalt`, `disposition`), `src/styles/v3.css` Z. 3630–3652,
`src/ui/v3/index.ts` Z. 396, das Entitätsprofil
`docs/entitaeten/accounting-case.md` (Datenpunkte, Formen), `spec-schreiben`
§5–§7 und `docs/design-guidelines.md` Z2.

**Gemessen:** ein Durchlauf über alle vier Stories mit `scripts/cdp.mjs` gegen
`http://localhost:6107` bei 1400 px; Story-IDs aus `index.json`
(`v3-entitäten-sachverhalt-casecard--filled`, `--without-sub-lists`,
`--edges`, `--in-use`), Aktion und Messung getrennt. Ausgelesen je Karte:
Kopftext, Link/Text, Unterzeile, `.actions`, die Knoten der Faktenzeile,
Zeichenzahl der Zusammenfassung im DOM und im `title`, Vorhandensein von
`.v2casecard__subs`, Kartenhöhe, `borderTopWidth`/`boxShadow` aus
`getComputedStyle` und die Zahl der Gedankenstriche. Zusammen 9 Karten.

**Wächter, Ergebnis ist der Exit-Code:** `pnpm typecheck` 0 · `check:icons` 0
(auch `--test` 0) · `check:contrast` 0 (`--test` 0) · `check:mirror`
(`mirror-filter --test`) 0 · `check:when` 0 (`--test` 0) · `check:language` 0.
Gegenprobe, weil `check:language` ohne `--all` nur geänderte Dateien liest und
`CaseCard.tsx` seit dem 2026-09-07 committet ist: der `--all`-Bericht (Exit 1,
377 deutsche Kommentarzeilen in 136 Dateien des Bestands) nennt **keine** Zeile
aus `CaseCard.tsx` oder `CaseCard.stories.tsx`. Die Kommentare sind englisch;
die Bezeichner nicht durchgehend — siehe M10, den der Wächter bauartbedingt
nicht sieht (er prüft Kommentare, keine Namen).

### Feste Kriterien

| Kriterium | Nachweis | Urteil |
|---|---|---|
| `typecheck` grün | Exit 0 | durch |
| Datei nach der Familie benannt, Story daneben, Titel in der Gruppe | `CaseCard.tsx` + `CaseCard.stories.tsx` neben `CaseCell/CaseRow/CaseFacts/CasePicker`; Titel `v3/Entitäten/Sachverhalt/CaseCard` wie die sieben Geschwister | durch |
| Code englisch; `@when`/`@instead` am Export | `check:when` Exit 0; `@when`/`@instead` an `CaseCard` (Z. 59–63); Kommentare englisch (`--all`-Bericht) | mit Mangel M10 (zwei deutsche Bezeichner) |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -E "#[0-9a-f]{3,8}\|[0-9]+px"` in `CaseCard.tsx` ohne Treffer (Exit 1); CSS nur Tokens (`v3.css` 3637–3652, einzige Ausnahme die Haarlinie `1px` wie im ganzen Blatt); Art aus `caseKindLabel` (Spiegel), Zustand und Zuständigkeit aus `resolveStatus` | durch |
| Alle vier Stories vorhanden, drei ausgeschlossene Zustände begründet | `index.json` führt genau vier IDs; Begründung in der Spec Z. 303–305 | durch |
| Prüfliste §9 | im Rahmen der schlanken Tiefe nur der Punkt „Rand **oder** Schatten": `borderTopWidth: 1px`, `boxShadow: none` an **allen 9** Karten; der Rest der Liste ist Darstellung → 0119 | durch, Rest vertagt |
| Im Browser angesehen | vier Stories über CDP bei 1400 px gemessen | durch |

### Variable Kriterien (Neufassung)

| Kriterium | Nachweis | Urteil |
|---|---|---|
| Anzeigename aus `caseTitle()`, Kennung aus `caseIdentifier()`, keine zweite Kette | `grep` findet in der Datei nur diese beiden Aufrufe (Z. 81, 99) und keinen zweiten Rückfall; gemessen: `Edges` Karte 2 ohne `title` → Kopf „Dauersachverhalt: Telekom Deutschland GmbH", Karte 3 ohne Nummer → Unterzeile **`c-9002ab`** statt eines Strichs | durch |
| Gegenpart in der Meta-Zeile, außer ohne `title` | gemessen: Karte 2 (`title: null`) Meta = Art · Betrag · Zuständigkeit, **ohne** Gegenpart; Karten 1 und 3 (mit `title`) Meta mit „Bürobedarf Meier GmbH" | durch |
| Bearbeitungsstand im Kopf als `StatusBadge` (`sachverhalt`), Zuständigkeit in der Meta-Zeile (`disposition`), beides aus der Registry | gemessen: Kopf trägt „Zur Prüfung" bzw. „Klärung offen" — die Labels von `SACHVERHALT_LIFECYCLE` (`status-registry.ts` `open`/`needs_clarification`); Meta trägt „Kanzlei" bzw. „Agent" — die Labels von `DISPOSITION` (Z. 810–814). Keine Map in der Datei | durch, aber M7 |
| Der Abnahme-Bucket erscheint nicht von selbst, `aside` ist der einzige Weg | gemessen: `.v2card__h .actions` existiert nur in `InUse` (3 von 3, Inhalt „übernehmen"), in `Filled`, `WithoutSubLists` und allen vier `Edges`-Karten `null`; der Gruppenkopf „Prüfen · 3" steht in `InUse` außerhalb jeder `.v2card` | durch |
| Ein Fall ohne Betrag zeigt keinen Betrag und keinen Ersatzstrich | gemessen: `Edges` Karte 4 (`amount: null`) Meta = genau ein Knoten („Umbuchung"), 0 Gedankenstriche in der ganzen Karte | durch für das Verhalten — das **Feld** ist der Mangel M1 |
| Zusammenfassung auf `summaryLimit` gekürzt, ganzer Text im `title`, gemessen | `Edges` Karte 1: **161** Zeichen im DOM (160 + Auslassungszeichen), **500** im `title` | durch für die Kürzung; M3, M4, M5 hängen daran |
| Ohne `children` fällt der Bereich samt Abstand weg, Höhe gemessen | dieselbe Karte mit Kindern **268,7 px**, ohne **176,9 px**; `.v2casecard__subs` in `WithoutSubLists` nicht im DOM | durch |
| Ohne `href` Text, mit `href` Link, Fokus per Tab | gemessen: `Edges` 0 von 4 Karten mit `<a>` im Kopf, `Filled`/`WithoutSubLists` 1 von 1, `InUse` 3 von 3 (`#c-4412`, `#c-4413`, `#c-4414`). Der **Fokus** ist nach 0119 vertagt und wurde nicht gemessen | durch, soweit in dieser Tiefe prüfbar |
| Rand **oder** Schatten | `getComputedStyle` an allen 9 `.v2card`: `1px` / `none` | durch |
| Ersetzt die Karte in `CloseCasesPanel.tsx` ohne Funktionsverlust | die Karte kann den Betrag ihres einzigen Aufrufers nicht lesen (M1) und hat für das Personenkonto keinen Ort mehr (M8) | **zurück** |

### Mängel

**M1 · Der Betrag kommt aus dem Feld des Bankauszugs, nicht aus dem des
Sachverhalts.** — Kriterium „Die Karte zeigt … Betrag (4)" (Z. 256–258) und
„Ersetzt die Karte in `CloseCasesPanel.tsx` ohne Funktionsverlust" (Z. 353).
Ort: `CaseCard.tsx:32–36` (`c.amount`, `asCurrency(c.currency)`), Fixture
`CaseCard.stories.tsx:21` (`amount: 1249.9`).
Befund: `CaseCardData = CaseLink & Pick<CaseListItem, "summary" |
"disposition">` holt den Betrag aus `CaseLink.amount`. Das Feld ist in
`case-title.ts:38–39` ausdrücklich gewidmet: *„Only in the bank statement: the
part of the amount that falls on this case"* — sein einziger anderer Leser im
Set ist `BankTransactionRow.tsx:85`, und dort steht daneben die Währung der
**Bankzeile**, nicht die des Falls. Der Betrag des Sachverhalts ist im Profil
Rang 4 und heißt `totalAmount · currency`
(`docs/entitaeten/accounting-case.md`, Zeile „Betrag"); genau den lesen alle
Geschwister: `case-columns.tsx:159`, `CaseDrawer.tsx:110–111`,
`CasePicker.tsx:30`. Der Spiegel kennt an `CaseListItem` **kein** `amount`
(`case.ts:276–318`). Der einzige Einsatzort der Karte arbeitet mit
`CaseListItem`n; da `amount` optional ist, hält der Compiler den Aufrufer
zwar an der Währung an (`string | null` gegen `Currency | null`), sagt zum
Betrag aber nichts — die Karte zeigt dann still gar keinen. Das ist der Fall
aus 0100, nur andersherum: kein ungelesenes Pflichtfeld, sondern ein
gelesenes, das der Aufrufer nicht hat.
Kleinster Weg: `"totalAmount"` in den `Pick` aufnehmen und `c.totalAmount`
lesen (Währung bleibt aus `CaseLink`), Fixtures entsprechend; oder — falls
wirklich der Anteil gemeint ist — das in „Verhalten" hinschreiben und
begründen, warum die Abnahmeliste ihn zeigt.
**Blockiert: ja.**

**M2 · Der Rand-Fall „ohne `title` und ohne Gegenpart" wird von keiner Fixture
ausgelöst, und im Code stünde die Art dann zweimal.** — Kriterium: Story
`Edges`, „Fall ohne Gegenpart (dann nur die Art)" (Z. 311).
Ort: `CaseCard.stories.tsx:112–121` (Karte 4) und `CaseCard.tsx:31`.
Befund: Karte 4 setzt `counterpartyName: null`, behält aber
`title: "Umbuchung Verrechnungskonto"` — gemessen steht im Kopf der Titel, die
Rückfallkette läuft also gar nicht. Der gemeinte Rand ist der, in dem
`caseDisplayTitle` (`case.ts:465–475`) auf **die Art allein** fällt, und der
verlangt `title = null` **und** `counterpartyName = null`. Keine der vier
Karten hat beides. Träfe er ein, stünde die Art zweimal: einmal als
Anzeigename im Kopf, einmal als erster Knoten der Faktenzeile
(`CaseCard.tsx:31` schiebt sie ohne Bedingung hinein). Genau diese Doppelung
hat `CaseDrawer.tsx:91–92 und 113–117` für dieselbe Entität schon einmal
abgestellt (`kindInTitle`, Kommentar „the meta line must not say it a second
time (M6)"). Der Fall „`title` fehlt, Gegenpart vorhanden" ist davon nicht
betroffen — dort verhält sich der Drawer genauso wie die Karte, das ist die
Hausart und kein Mangel.
Kleinster Weg: in Karte 4 zusätzlich `title: null` setzen (dann löst die
Fixture den Rand wirklich aus) und den Art-Knoten wie im Drawer unterdrücken,
wenn der Anzeigename die Art selbst ist.
Blockiert: nein.

**M3 · `Filled` beweist die Kürzung nicht, die die Spec ihr zuschreibt.** —
Kriterium: Stories-Tabelle, Zeile `Filled`: „Zusammenfassung auf 160 gekürzt
mit `title`" (Z. 309).
Ort: `CaseCard.stories.tsx:23–25`.
Befund: die Fixture-Zusammenfassung hat **144** Zeichen; gemessen stehen in
`Filled` 144 Zeichen im DOM und 144 im `title` — nichts ist gekürzt. Die
Kürzung beweist allein `Edges`.
Kleinster Weg: entweder die Fixture über 160 Zeichen bringen oder die Zeile
`Filled` in der Spec auf das beschränken, was sie zeigt.
Blockiert: nein.

**M4 · Der `title` steht an jeder Zusammenfassung, nicht nur an der
gekürzten.** — Kriterium „Verhalten": „Eine **gekürzte** Zusammenfassung trägt
den ganzen Text im `title`" (Z. 291–292).
Ort: `CaseCard.tsx:107` (`title={summary ?? undefined}`).
Befund: gemessen tragen **8 von 8** Karten mit Zusammenfassung ein
`title`-Attribut; in **7** davon ist es zeichengleich mit dem sichtbaren Text
(144/144, 34/34, 49/49 …). Ein Hover, der den sichtbaren Satz wiederholt, ist
kein Weg zurück, sondern Rauschen — und er nimmt dem Attribut die Aussage,
dass hier etwas fehlt.
Kleinster Weg: das Attribut nur setzen, wenn tatsächlich gekürzt wurde.
Blockiert: nein.

**M5 · Die Fixture des Rand-Falls hat 500 Zeichen, ihre Beschriftung nennt
720.** — Kriterium: „Zusammenfassung mit 720 Zeichen (Maximum aus Staging)"
(Z. 311).
Ort: `CaseCard.stories.tsx:85` (JSDoc: „eine Zusammenfassung von 720
Zeichen (Maximum aus Staging)") und `CaseCard.stories.tsx:100–106` (die
Zeichenkette).
Befund: nachgezählt **500** Zeichen, im Browser gemessen `title`-Länge
**500**. 720 ist die Zahl des Profils (`summary`: p50 231 · p90 309 · max
720) — sie ist in die Story-Beschriftung abgeschrieben, ohne dass die Fixture
sie einlöst. Das Storybook zeigt die Beschriftung dem Leser. Die Kürzung
selbst löst schon bei 500 aus, das Verhalten ist also belegt; die Zahl ist es
nicht.
Kleinster Weg: die Zeichenkette auf 720 verlängern (dann stimmt beides) oder
beide Beschriftungen auf 500 setzen und den Bezug zum Maximum streichen.
Blockiert: nein.

**M6 · `summaryLimit` hat keine Story.** — Kriterium: Schnittstellen-Tabelle,
Zeile `summaryLimit`, Story `Edges` (Z. 254); `spec-schreiben` §5: „Jede Prop
bekommt in der Tabelle die Story, die sie beweist."
Ort: `CaseCard.stories.tsx` (kein Vorkommen von `summaryLimit`).
Befund: keine der vier Stories übergibt die Prop; `Edges` misst nur die
Vorgabe 160. Der in der Spec eigens genannte Wert `0` („zeigt sie ganz") wird
nirgends gezeigt — die einzige Ausprägung, die die Prop überhaupt sichtbar
macht, fehlt.
Kleinster Weg: eine fünfte Karte in `Edges` mit `summaryLimit={0}`; die Zahl
der Stories bleibt bei vier.
Blockiert: nein.

**M7 · Derselbe Zustand heißt in zwei Formen der Familie zweierlei.** —
Kriterium: „die Zuständigkeit in der Meta-Zeile über die Achse `disposition` —
beides aus der Registry" (Z. 346).
Ort: `CaseCard.tsx:45` gegen `CaseDrawer.tsx:123–127`.
Befund: `disposition='accounting'` steht in der Faktenzeile der Karte als
**„Kanzlei"** (gemessen) und in der Faktenzeile des Drawers als **„Kanzlei ist
dran"**. Beide holen das Wort aus derselben Achse; das Prädikat hat der Drawer
hinzugefügt, weil das nackte Wort nicht sagt, dass es eine Zuständigkeit ist.
In der Karte steht es hinter dem Gegenpart — gemessen „Eingangsrechnung ·
1.249,90 € · Bürobedarf Meier GmbH · Kanzlei" — und liest sich dort wie ein
weiterer Name. Das ist der Fall aus 0101/L-218 in klein: die Achse führt den
Zusatz nicht, also erfindet ihn jede Form für sich.
Kleinster Weg: eine der beiden Fassungen übernehmen — den Drawer-Satz oder
`StatusBadge axis="disposition"`; die Registry bleibt unberührt.
Blockiert: nein.

**M8 · Rang 13 (Personenkonto) hat keinen Ort mehr.** — Kriterium „Ersetzt die
Karte in `CloseCasesPanel.tsx` ohne Funktionsverlust" (Z. 353).
Ort: Spec Z. 248–258 (Schnittstelle der Neufassung).
Befund: das Profil führt für die Abnahme-Rolle die Ränge „3, 7, 11, 13, 25"
(Formen-Tabelle, Zeile `CaseCard`), und `CloseCasesPanel` zeigt heute je Fall
„Nummer, Art, …, **Personenkonto**, Konfidenz, Zusammenfassung"
(Profil, Zeile `CloseCasesPanel.tsx`). Die erste Fassung der Spec hatte dafür
den Knoten `meta`; die Neufassung hat `meta` mit der Portal-Rolle gestrichen
und Rang 13 nicht ersetzt — die Aufzählung „Die Karte zeigt" nennt ihn nicht,
und `aside` ist als Ort der Liste („etwa ihre Auswahl") beschrieben und in
`InUse` durch die Auswahl belegt.
Kleinster Weg: einen Satz in die Spec — entweder Rang 13 kommt über `aside`
bzw. `children`, oder er fällt bewusst weg und steht unter „Kann bewusst
nicht".
Blockiert: nein.

**M9 · Die Kopfzeile beschreibt weiter das gelöschte Portal, und „kumulativ
bis M" stimmt nicht.** — Kriterium: Freigabe 2026-09-07, „Kopfzeile
bereinigen" (Z. 202).
Ort: Spec Z. 9 (Zeile „Auftrag") und Z. 256.
Befund: die Zeile „Auftrag" sagt weiter „Die Karte, die der **Mandant** von
einem Sachverhalt sieht … Ersetzt `modules/client-portal/ui/PortalCaseList.tsx`" —
den Bildschirm, den es seit dem 2026-09-05 nicht mehr gibt und dessen Streichung
die ganze Neufassung trägt. Die Zeile „Zeigt (Ränge)" darunter ist bereinigt
und **weiß** davon („die Zeile darüber galt dem gelöschten Portal") — der
falsche Text steht trotzdem noch da, und wer nur die Kopfzeile liest, baut die
falsche Komponente. Zweitens: „Die Karte zeigt (Ränge **kumulativ bis M**)" trifft
nicht zu — das Profil sagt „Kumulativ: was S zeigt, zeigt M auch", und die
Ränge 8 (offene Klärungen), 9 (Eröffnet) und 10 (Export-Zustand) stehen dort
ab **S**, fehlen in der Aufzählung aber; ebenso 12–15 aus M. Die Aufzählung
ist eine Auswahl, keine Strecke.
Kleinster Weg: die Zeile „Auftrag" auf den einen Einsatzort umschreiben und
„kumulativ bis M" durch „diese acht" ersetzen (oder die Auslassung mit einem
Halbsatz begründen: 8–10 sind Spalten der Liste, 12–15 gehören `CaseFacts`).
Blockiert: nein.

**M10 · Zwei deutsche Bezeichner in einer neuen Datei.** — Kriterium: CLAUDE.md
(„Code nur Englisch. Bezeichner, Props, Typen, Kommentare").
Ort: `CaseCard.tsx:30` (`teile`) und `:83` (`gekuerzt`); in den Stories
zusätzlich die Hilfsbausteine `Belege` und `Rahmen`
(`CaseCard.stories.tsx:30, 45`).
Befund: die Kommentare sind englisch (`check:language --all` nennt die Datei
nicht), die Namen nicht. Der Wächter kann das nicht sehen — er liest
Kommentare, keine Bezeichner. Die Ausnahme der CLAUDE.md („bestehende deutsche
Bezeichner werden nicht in Masse umbenannt") gilt hier nicht: die Datei ist am
2026-09-07 neu entstanden.
Kleinster Weg: vier Umbenennungen (`parts`, `shortened`, `Documents`,
`Frame`).
Blockiert: nein.

**M11 · Eine fehlende Art zeigt einen Gedankenstrich.** — Kriterium: die Regel
der Karte, dass kein Ersatzstrich etwas behauptet (Z. 348 und Offene Frage 1,
Z. 325–326: „kein Gedankenstrich, keine Null").
Ort: `CaseCard.tsx:31`.
Befund: `CaseCardData` erlaubt über `CaseLink` `kind: null` — bewusst, seit
0070 M2 („a foreign list that only carries the case number must not have to
invent one", `case-title.ts:28–35`). `caseKindLabel(null)` liefert dann **„—"**
(`case.ts:73–76`), und die Karte schiebt diesen Strich ohne Bedingung in die
Faktenzeile, während sie Betrag, Gegenpart und Zuständigkeit bei `null`
weglässt. Keine Story zeigt den Fall. `CaseListItem.kind` ist NOT NULL, der
Fall ist also selten — aber der Typ lässt ihn zu.
Kleinster Weg: den Knoten nur bei `c.kind` einfügen, wie die drei anderen.
Blockiert: nein.

### Geprüft und **kein** Mangel

- **`fiscalYear` liest die Karte nie**, obwohl es Pflichtfeld von
  `CaseCardData` ist. Das trägt die Vererbungskette: `CaseLink` ist der
  gemeinsame Schnitt der Familie (0095) und wird von `CaseCell` und
  `CaseAssignment` mitgenutzt; `CaseFacts.tsx:145` liest das Feld. Das ist der
  Fall aus 0102, nicht der aus 0100.
- **Kein lokal nachgebauter Typ.** `CaseCardData` ist eine Verschneidung aus
  `CaseLink` und einem `Pick` auf den Spiegel, kein zweites Ansichtsmodell;
  `grep "as [A-Z]"` findet in Komponente und Story **keine** Zusicherung.
- **Keine zweite Kette und keine lokale Label-Map.** Anzeigename und Kennung
  über `caseTitle`/`caseIdentifier`, Art über `caseKindLabel` aus dem Spiegel,
  Zustand und Zuständigkeit über `resolveStatus`.
- **Die Karte setzt nicht auf `CaseFacts` auf**, obwohl das Profil sie in
  „setzt auf" nennt. Kein Mangel: `CaseFacts` ist die Faktentafel der Ränge
  11–16 als `FieldList`, nicht eine einzeilige Leiste; `CaseDrawer.tsx:102–130`
  baut seine Meta-Zeile aus demselben Grund selbst.
- **Reiter sind keine Filter** (Owner 2026-09-08): die Spec geht nicht mehr von
  vier gleichwertigen Reitern aus — sie nennt einen Einsatzort, und
  `CaseList.tsx:27–34` schließt `schliessen` ausdrücklich aus und verweist auf
  diese Karte. Konsistent.
- **Story-Zahl nach §6:** 2 Zustände + 0 Enum + 0 Layout-Boolean + 0 Callback
  + 1 „im Einsatz" + 1 Rand = 4; vier Stories vorhanden, Untergrenze 3 für eine
  Entitäts-Form eingehalten. Die Deckung je Prop stimmt bis auf `summaryLimit`
  (M6); der Rand-Fall selbst ist da, löst aber einen seiner vier Fälle nicht
  aus (M2) und trägt eine falsche Zahl (M5).

### Gesamturteil

**zurück.** Ein blockierender Punkt: **M1** — die Karte liest den Betrag aus
`CaseLink.amount`, dem Anteil des Bankauszugs, während der Sachverhalt seinen
Betrag in `totalAmount` trägt (Profil Rang 4, alle Geschwister der Familie).
Ihr einziger Einsatzort arbeitet mit `CaseListItem`n, die dieses Feld nicht
haben; der Compiler stolpert dabei über die Währung, nicht über den Betrag, so
dass die Karte in der Abnahmeliste still ohne Betrag stünde. Damit ist das
Kriterium „ersetzt `CloseCasesPanel.tsx` ohne Funktionsverlust" nicht erfüllt.

Alles andere steht: die Kürzung mit ihrem Weg zurück, der verschwindende
Unterlisten-Bereich samt Abstand, `aside` als einziger Weg neben den Kopf,
Kennung und Anzeigename aus der Familie, Zustand und Zuständigkeit aus der
Registry, Rand ohne Schatten — jedes davon gemessen. M2–M11 sind Nacharbeit an
Spec, Fixtures und Namen; sie halten die Karte nicht auf, sobald M1 sitzt.

Abgenommen von Claude (fremder Prüfer, hat nicht gebaut), 2026-09-08.

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

| Punkt | Was getan |
|---|---|
| **M1** (blockierte) | **Der Betrag kam aus dem falschen Feld.** Die Karte las `CaseLink.amount` — das gehört dem Bankauszug und hält „den Teil des Betrags, der auf diesen Sachverhalt fällt". Rang 4 ist `totalAmount`, so lesen ihn `case-columns`, `CaseDrawer` und `CasePicker`. `CaseListItem` trägt gar kein `amount`: im einzigen Einsatzort hätte die Zahl schlicht gefehlt, und weil das Feld optional ist, hätte nichts es gemeldet. Jetzt im `Pick` und gelesen — und der Typcheck stolpert seither über jede Fixture, die noch `amount` setzt, was drei Stellen in den Stories waren |
| **M2** | Die Art stand **zweimal**, sobald der Anzeigename auf sie zurückfällt („Umbuchung / Umbuchung"). `CaseDrawer` hatte das als sein M6 schon abgestellt; die Karte wiederholte es. Gemessen vorher „Umbuchung Zur Prüfung 2026-0412 **Umbuchung** 1.249,90 €", nachher ohne die zweite |
| **M3/M4** | Der volle Text steht im `title` nur noch dort, wo wirklich gekürzt wurde. Sieben von acht Zusammenfassungen passen; ein `title`, der den sichtbaren Text Wort für Wort wiederholt, ist ein Tooltip, der nichts sagt. Gemessen: 2 von 5 Karten in `Edges` |
| **M5** | Die Story-Beschreibung nennt die Zahl der Fixture (500) statt des Staging-Maximums (720) |
| **M6** | `summaryLimit` hat seinen Nachweis — als fünfter Fall in `Edges`, wo die Kürzung bei 40 sichtbar greift |
| **M8** | `meta` ist mit der Neufassung gestrichen worden, und damit hat **Rang 13 (Personenkonto) keinen Ort mehr** in dieser Form. Das steht jetzt als Folge in der Schnittstellen-Tabelle, statt unbemerkt zu bleiben |
| **M9** | Der Auftrag im Kopf beschrieb weiter das gelöschte Mandantenportal; die Neufassung hatte die Karte längst auf „Zum Schließen" gestellt. Und „Ränge kumulativ bis M" stimmte nicht — 8 bis 10 fehlen bewusst |
| **M10** | Die zwei deutschen Bezeichner (`teile`, `gekuerzt`) heißen `parts` und `clipped` |
| **M11** | `kind: null` schrieb einen Gedankenstrich in eine Zeile, deren Regel „jeder Teil wahlfrei, keiner ein Gedankenstrich" lautet. Ein Fall ohne Art hat jetzt keinen Art-Teil |

### M7 — widersprochen, kein Mangel

Beanstandet war „Kanzlei" (Karte) gegen „Kanzlei ist dran" (Drawer) für
denselben Zustand — mit Verweis auf das Vokabular-Muster von L-218.

**Beide lesen dasselbe Registry-Label**, `resolveStatus("disposition", …).label`;
keiner erfindet ein Wort. Was sie unterscheidet, ist die Grammatik ihres
Ortes: in der Faktenzeile der Karte steht das Label **neben** anderen Werten
(Art · Betrag · Gegenpart · Kanzlei) — dort ist ein Wort richtig und ein Satz
falsch. Im Drawer steht es als eigene Aussage und braucht ein Prädikat; die
Registry-Beschreibung sagt dort selbst „Die Kanzlei ist am Zug".

Das unterscheidet den Fall von L-218, wo zwei Bausteine für einen Zustand
zwei **verschiedene Begriffe** erfanden, weil die Achse keinen führte. Hier
gibt es einen Begriff und zwei Satzstellungen.

`pnpm typecheck` und die fünf Wächter auf Exit 0. Gemessen in `Edges`: fünf
Karten, zwei mit `title`, Beträge 1.284.900,55 € · 89,90 € · 1.249,90 €.
