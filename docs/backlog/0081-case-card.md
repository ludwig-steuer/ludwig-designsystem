# 0081 · CaseCard — der Sachverhalt als Karte im Mandantenportal

| | |
|---|---|
| Status | Abnahme |
| Freigabe | zurück 2026-09-07 — Neufassung auf einen Einsatzort nach Abschnitt „Freigabe", danach ohne zweite Runde freigegeben |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CaseCard`) und „Listen" (Zeile `PortalCaseList`) |
| Auftrag | Die Karte, die der **Mandant** von einem Sachverhalt sieht: Anzeigename, Nummer, Art, Betrag, Eröffnet, Zusammenfassung — darunter seine offenen Fragen und Belegwünsche als Unterlisten. Ersetzt `modules/client-portal/ui/PortalCaseList.tsx` (396 Z.). |
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
| `meta` | `ReactNode` (optional) | die Zeile unter dem Kopf: im Portal Betrag und Eröffnet (Ränge 4, 9), in der Abnahme Personenkonto und Abnahme-Bucket (13, 25) | `InPortal`, `InAcceptance` |
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
| `Edges` | Zusammenfassung mit 720 Zeichen (Maximum aus Staging), Fall ohne `title` (Rückfallkette greift), Fall ohne `caseNumber`, Fall ohne Gegenpart (dann nur die Art) |
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

**Die Karte zeigt** (Ränge kumulativ bis M): Anzeigename (1),
Bearbeitungsstand (2), Kennung (3), Betrag (4), Gegenpart (5),
Zuständigkeit (6), Art (7), Zusammenfassung (11).

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
