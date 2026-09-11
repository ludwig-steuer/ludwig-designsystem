# 0152 · Die Sachverhaltsseite als Szenarien

| | |
|---|---|
| Status | **gebaut 2026-09-10** — alle drei Wellen und P3 (edb6d3f, 65c733b, 9a9e609); **Nachtrag 2026-09-11**: Abgleich mit Brief §7 (E6, E9, Reiter Wiederkehr). Abnahme je Welle offen, nicht durch den Bauenden |
| Stufe | `src/showcase/case/` (Seiten-Stories) · dazu Erweiterungen an `entities/accounting-case/CaseTimeline.tsx` |
| Klassen-Test | Die Seite gehört der App und lebt in `showcase/` — wie 0144 für den Beleg. Was an Bausteinen fehlt, wird `entities/` bzw. `patterns/`, nicht Teil der Seite |
| Quelle | Design-Brief **F196** (`ludwig/app` staging `672665f8`), überbracht von `ludwig-cto` · Seitenprofil `docs/seiten/sachverhalt-detail.md` · Entitätsprofil `docs/entitaeten/accounting-case.md` |
| Setzt voraus | **0154** (die vier Spaltenmuster) — gebaut · **0127**/`DetailView` — gebaut |
| Präzedenz | `src/showcase/document/` (0144) |
| Spec von / am | Claude, 2026-09-10 |

## Ziel

Die komplette Sachverhaltsseite als Seiten-Stories, aus vorhandenen
v3-Bausteinen, mit synthetischen Fixtures — **21 Szenarien** in drei
Story-Dateien. Dort wird das Beispiel zu Ende entwickelt und vom Owner
abgenommen; danach löst die App `SachverhaltScreen.tsx` (1815 Zeilen) samt
acht Reitern dagegen ab.

## Der Rahmen: `DetailView` + `Columns`, nicht `CaseDetailView`

Der Brief nennt `CaseDetailView` als Rahmen. Seit heute gibt es den
gemeinsamen: **`DetailView`** (0127/0138 Weg 1) trägt die Zeilen — Pager ·
Kopf · Signal · Reiter · Körper —, und der Körper trägt das Spaltenmuster
**`Columns`** (0154). Genau die Ordnung, die §5a des Briefs verlangt.

`CaseDetailView` bleibt unangetastet stehen, bis der Owner die Migration der
drei alten Rahmen freigibt. Die Szenarien hier bauen auf dem neuen — sonst
zeigte die Vorschau eine Struktur, die es beim Bauen nicht mehr gibt.

## Was an den Bausteinen fehlt

Gemessen am Brief, nicht geraten. Drei Lücken, alle in `CaseTimeline` (0040):

| Fehlt | Warum der Brief es braucht | Vorschlag |
|---|---|---|
| **Die Jetzt-Zeile** | §5: der Anker zwischen Vergangenheit und Zukunft, und **selbst ein wählbarer Eintrag** — ohne `?event=` ist „Jetzt" gewählt | Ein Eintrag der Art `now`, den die Timeline aus `today` selbst setzt; `selectedId={null}` heißt „Jetzt" |
| **Buchungen als Einträge** | §5: die Timeline trägt Belege, Zahlungen **und Buchungen** | Heute trägt sie Ereignisse; eine Buchung hängt am Ereignis. Zu klären: eigener Eintrag oder zweite Zeile am Ereignis |
| **DATEV-Spiegel-Einträge** | §5/§7 (E1b): gleichrangig eingereiht, mit dem Wort „DATEV" als Quelle, in Spalte 2 lesend | Ein `source`-Feld am Eintrag; das Wort steht in der Zeile, nicht als Icon allein (V7) |

> **Nachtrag 2026-09-10 — die Jetzt-Zeile ist wieder draußen** (Owner nach
> der Vorschau von Welle 1). „Jetzt" — auf der Seite heißt es **„Zu tun"** —
> steht **über** dem Strang, nicht darin: es ist der Standardzustand der
> Seite, kein Ereignis, und im Strang war es ein Eintrag ohne Datum zwischen
> lauter datierten. Es verhält sich weiter wie ein Eintrag (dieselbe Auswahl,
> dieselbe Fläche in Spalte 2), aber es gehört der Seite. Deshalb sind
> `showNow`, `NOW_ID` und `{ type: "now" }` aus `CaseTimeline` wieder
> entfernt — eine Prop, die keine Seite mehr bedient, wird gelöscht (A12).
> Die Abnahme prüft die erste Zeile der Tabelle oben also **nicht** mehr an
> der Timeline, sondern an der Zeile „Zu tun" in den Seiten-Stories.
>
> Im selben Durchgang umbenannt: Reiter „Details" → **Stammdaten**, Reiter
> „Verlauf" → **Protokoll** (die Prüfspur; „Ereignisse" bleibt der
> Fach-Strang), und die Karte über dem Strang heißt wie ihr Reiter,
> **Ereignisse**.

Diese drei sind **Bau an der Entität**, nicht an der Seite — sie gehören in
`CaseTimeline` und werden mit Welle 1 gebaut.

## Zuschnitt: drei Wellen

21 Szenarien sind keine Aufgabe, sondern drei. Der Schnitt folgt dem, was
sich gegenseitig bedingt:

| Welle | Inhalt | Warum zuerst |
|---|---|---|
| **1 · Der Rahmen und der Referenzfall** | `CasePage` (Rahmen), `fixtures.ts`, die drei `CaseTimeline`-Erweiterungen, **E1** `ProposalPending` und **E1b** `WithDatevEntry` | E1 ist der Fall, an dem sich das Layout entscheidet: drei Spalten, Jetzt ↔ Eintrag, Rang 1–4 über der Falz. Was hier nicht trägt, trägt in keinem der anderen 19 |
| **2 · Die übrigen Einzelfälle** | E2–E9 samt Varianten (10 Exporte) | Sie variieren denselben Rahmen — Zustände, Leerfälle, Eskalation |
| **3 · Sammel, Dauer und die Seite** | S1–S5, P1–P4 | Die Extremfälle (120 Ereignisse, 12 Klärungen) und die Seitenzustände; sie prüfen, was die ersten beiden Wellen gebaut haben |

**Abgenommen wird je Welle**, nicht am Ende — 21 Szenarien auf einmal
abzunehmen hieße, den ersten Fehler 21 mal zu bauen.

## Die Übersicht in drei Spalten

`Columns pattern="list-detail-aside"`:

| Spalte | Inhalt | Baustein |
|---|---|---|
| 1 · Timeline | alle Einträge des Falls samt Jetzt-Zeile, Fuß „vergrößern →" | `CaseTimeline` (erweitert) |
| 2 · Hauptfläche bei „Jetzt" | **Offen** (Mängel mit Weg, Kritikalität absteigend) · **Fehlende Freigaben** · **Log** (letzte fünf) | die Mängel-Zone von 0150, hier zum zweiten Mal → **0153** wird fällig |
| 2 · Hauptfläche bei Eintrag | das Ereignis: Beleg · Zahlung · Buchung als Journal-Sicht, mit `AiBookingNotes` | `JournalEntryGrid`, `AiBookingNotes` (0151) |
| 3 · Notizen | Zusammenfassung, Kommentar-Historie, Rückfragen **lesend** | `ClarificationList`, `Timeline` |

**Die Mängel-Zone erscheint hier zum zweiten Mal.** Das ist der Auslöser aus
0153: was beim Beleg `SourceDocumentDefects` heißt, ist hier dieselbe Zone mit
anderen Zeilen. Sie wird mit Welle 1 zum Pattern gehoben, nicht kopiert.

## Welle 2, neu geschnitten nach der Erhebung (2026-09-10)

`docs/entitaeten/accounting-case-staging-erhebung-2026-09-10.md`, 1.094 Fälle.
**Sie stellt den Schnitt des Briefs auf den Kopf**, und das ist der Grund, warum
Welle 2 nicht nach E2–E9 gebaut wird.

### Was der Brief annimmt und der Bestand nicht hat

| Szenario im Brief | Bestand |
|---|---|
| E7 Storno (`system_reversal`) | **0**. „reversed" sind zurückgezogene Vorschläge (`withdrawn_by_agent` 85) |
| E5-Variante zurückgestellte Klärung | **0 von 234** |
| E4-Variante Eskalationsstufe 2 | **0** (Stufe 1 genau einmal) |
| `disposition = client` | **0** |
| Judge-Korrekturen | 15 (`ai_edited`) — es gibt sie, aber selten |

Fünf Szenarien für Zustände, die niemand je sieht. Sie werden **nicht**
gebaut; was ein Zustand ohne Bestand braucht, ist kein Bild, sondern ein Satz
im Profil.

### Was größer ist als angenommen

- **Mandantenstapel: max 508 Ereignisse**, nicht 120 wie im Brief. Die
  Pagination in Spalte 1 ist damit keine Vorsichtsmaßnahme, sondern Pflicht.
- **12 offene Klärungen** an einem Fall — die Notizspalte muss das tragen.
- Klärungen nach S16 (Kontext + Frage + Empfehlung) gibt es nur bei **9 %**;
  der Regelfall ist Titel + Text. Die Karte darf die reiche Form nicht
  voraussetzen.

### Der neue Schnitt: acht Ausprägungen decken 88 %

| % | Ausprägung | Was sie zeigt |
|---:|---|---|
| 29 | **OPOS-Vortrag Ausgang** | ein Ereignis, **keine** Buchung — die stillste Seite des Bestands, und die häufigste |
| 13 | Eingang, nur Beleg | der Fall ohne Zahlung |
| 11 | Ausgang mit Zahlung | |
| 10 | Eingang, Beleg + Zahlung mit Klammer | der „vollständige" Fall |
| 9 | Mandantenstapel | 508 Ereignisse, 12 Klärungen |
| 8 | Dauer **ohne** Regel | 75 % aller Dauerfälle |
| 8 | Vortrag Eingang | |
| 5 | Zahlung ohne Beleg | |

Dazu vier Ränder mit je einer Story: Ausgleichsgruppe (20 Fälle, max 25
Ereignisse), Spesen (8, max 38), Vertrag (2) und **Fall ohne ein einziges
Ereignis** (41 — der ist real, nicht nur ein Story-Zustand).

**Die stillste Seite ist die häufigste.** Das ist die Lehre für den Entwurf:
was bei 29 % der Fälle zu sehen ist, sind ein Ereignis, kein Vorschlag, keine
Klärung — und trotzdem muss die Seite dort etwas sagen.

## Die Regel und ihre automatischen Buchungen

Aus derselben Erhebung, weil der Brief sie nur streift:

- **Zwölf Ereignisse, nicht eins.** Jeder Monat ist ein eigenes
  `accrual`-Ereignis mit eigener Buchung; der Fall ist die Klammer. Ein Jahr
  sind bis 25 Ereignisse.
- **Eine Regel ist im Bestand ein Satz:** „monatlich am 1. erwartet Ludwig
  einen Zahlungseingang von X über Y; gebucht wird Gegenkonto an Personenkonto,
  Beleg per `period_key`". Prozent-Zeilen (`template_lines`), Toleranzen,
  IBAN-/Regex-Kriterien und Lernnotiz sind **0 von 30** — sie stehen im Schema,
  nicht in den Daten. Eine Fixture, die sie zeigt, erfände sie.
- **Eine Regel-Buchung sieht anders aus als eine Agenten-Buchung.**
  `proposal_rationale` trägt dort `rule_id`, `period`, `source`, `needs_review`
  — **kein** `agent_rationale`, keine Quellen, keine Guard-Warnungen, **kein
  Judge**. `AiBookingNotes` ist an so einem Satz also die falsche Form: zu
  sehen sein soll die Herkunft „Regelwerk", die Regel als Satz mit Periode,
  und `needs_review` als einziger Hinweis.

**Befund für die App:** die Registry sagt zu `recurring_rule` „wird nicht
exportiert" — 27 von 27 sind exportiert. **L-282.**

## Welle 2 — gebaut (2026-09-10)

Auftrag des Owners über `ludwig-manager`: 15–20 Szenarien mit Daten, damit
das Design gegen sie optimiert werden kann. Grundlage ist der Schnitt aus der
Erhebung, ergänzt um zehn Zustände, die die Sachbearbeiterin unterscheiden
muss. Wo beides zusammenfällt, ist es **eine** Story.

**Aufbau: ein Szenario ist ein Datenobjekt.** `src/showcase/case/scenario.tsx`
trägt den Typ `CaseScenario` und `ScenarioPage`, die daraus die ganze Seite
zeichnet; `scenarios.tsx` trägt die Daten. Zwei Stories unterscheiden sich
damit nur im Fall — die Regel aus 0144 als Struktur, nicht als Vorsatz.

| Export (`Seiten/Sachverhalt/Einzelfall`) | Ausprägung | Punkt des Auftrags | Signal |
|---|---|---|---|
| `ProposalPending` | A2 (13 %), E1 | — | Vorschlag prüfen |
| `WithDatevEntry` | E1b | — | keins |
| `OpenItemCarryover` | A1 (29 %) + A4 (8 %) | — | keins — wartet auf den Kunden |
| `CompleteAndExported` | A3 (10 %) | 6 · exportiert | keins — nichts zu tun |
| `RecurringWithoutRule` | A6 (8 %) | — | Vorschlag prüfen |
| `AwaitingDocument` | A7 (5 %) | 2 · wartet auf Beleg | keins — wartet auf den Mandanten |
| `AwaitingDocumentEscalated` | A7, Stufe 1 (einmal im Bestand) | 2 · Eskalation | keins; die Zeile ist rot, nicht der Kopf |
| `OutgoingWithPayment` | A8 (11 %) | — | Zahlungseingang prüfen |
| `ClarificationOpenFirm` | querliegend (43 Fälle) | 1 · Kanzlei am Zug | **keins**, die Antwort steht in Spalte 3 (S13) |
| `ProposalWithdrawn` | querliegend (85 Buchungen) | 3 · zurückgezogen | keins — der Agent bucht neu |
| `Superseded` | querliegend (14 Fälle) | 4 · ersetzt | keins, Verweis auf den Nachfolger |
| `JudgeFlagged` | querliegend | 7 · beanstandet | Warnfarbe |
| `JudgeAdjusted` | querliegend (`ai_edited` 15) | 7 · angepasst | Vorschlag prüfen |
| `MasterData` | Reiter Stammdaten | — | — |

**Nicht gebaut, weil der Bestand null ist** (Satz statt Story, die Regel oben):
abgelehnt (`closed_rejected`, 0 — gezählt von `ludwig-manager` am
2026-09-10), Storno-Buchung (`system_reversal`, 0), zurückgestellte Rückfrage
(0 von 234), Eskalationsstufe 2 (0), `disposition = client` (0).

**Abweichung vom Brief:** E5 sah für die offene Rückfrage ein Signal vor. Der
Owner will es ohne — die Antwort mit ihren Optionen steht in der
Notizspalte, und Signal plus Karte wären dieselbe Aufforderung zweimal.

**Befund L-284:** die Achse `buchung` beschriftet `reversed` mit „Storniert";
im Bestand ist `reversed` in 85 von 86 Fällen ein zurückgezogener Vorschlag
ohne Gegenbuchung. `ProposalWithdrawn` erklärt es am Ereignis mit einem Satz.

## Welle 3 — gebaut (2026-09-10)

| Export | Datei · Titel | Ausprägung | Punkt |
|---|---|---|---|
| `ClientBatch` | `CaseCollective` · Sammel und Dauer | A5 (9 %), 508 Ereignisse, 12 Rückfragen | — |
| `RecurringWithRule` | ebd. | A9 (3 %), zwölf Abgrenzungen, kein Judge | 8 |
| `ClearingGroup` · `ClearingGroupBalanced` | ebd. | A10 (2 %), Verrechnungskonto 1360, Rest offen / ausgeglichen | 9 |
| `CollectivePayment` | ebd. | Modus „mehrere", zwölf Klammern (p90) | 10 |
| `ExpenseReport` | ebd. | A11 (1 %), 36 Belege | — |
| `Contract` | `CaseSingle` · Einzelfall | A12, E8 | — |
| `NoEvents` | ebd. | A13 (4 %, 41 Fälle) | — |
| `InUse` | `CasePageStates` · Seite | P1 | — |
| `LoadingErrorNotFound` | ebd. | P2 | — |
| `PartnerDrawer` | ebd. | P4 | — |

**Lange Stränge ohne neue Prop.** Der Mandantenstapel und die
Spesenabrechnung zeigen die jüngsten 20 Einträge und darunter den Weg in den
Reiter Ereignisse, wo geblättert wird — Komposition an der Seite, nicht eine
Pagination im Baustein. `CaseTimeline` bleibt, wie es ist.

**Die Regel-Welt ist hochgerechnet.** Der Bestand zeigt Regel-Buchungen für
genau einen Monat; zwölf Abgrenzungen sind die Form des Bestands, auf ein Jahr
gezogen (so sagt es auch die Erhebung).

**Befund L-285:** Fremdtilgung und Gate-Mangel aus F206 fehlen im Spiegel.

**P3 — alle Reiter** (`CaseTabs` · `Seiten/Sachverhalt/Reiter`): `Events`,
`Clarifications`, `Plausibility`, `BalanceAndAccounts`, `DatevTruth`, `Log`,
`RawData` — je Reiter oben der Inhalt am Referenzfall, darunter derselbe
Reiter ohne Daten mit seinem Leerzustand als Satz. Stammdaten steht unter
Einzelfall (`MasterData`). Kein freies Raster: was zusammengehört, steht
untereinander.

## Nachtrag 2026-09-11 — Abgleich mit der Szenarienliste des Briefs

Auf Wunsch des Owners die Liste aus F196 §7 Punkt für Punkt gegen das
Gebaute gehalten. Welle 2 und 3 waren nach der Erhebung geschnitten, nicht
nach dem Brief; drei Punkte des Briefs **mit Bestand** fehlten deshalb.

| Brief | gebaut als | Stand |
|---|---|---|
| E1 · E1b | `ProposalPending` · `WithDatevEntry` | ✓ |
| E2 Ausgeglichen | `CompleteAndExported` | ✓ |
| E3 OPOS-Vortrag | `OpenItemCarryover` | ✓ in der Form der Erhebung (A1) |
| E4 Wartet auf Beleg, überfällig | `AwaitingDocument` · `AwaitingDocumentEscalated` | ✓ Stufe 1 statt 2 (Stufe 2: 0) |
| E5 Rückfrage offen | `ClarificationOpenFirm` | ✓; zurückgestellt: 0 von 234 |
| **E6 Bei der Kanzlei abgegeben** | **`HandedToFirm`** | **neu** — 27 offene Fälle bei der Kanzlei ohne Rückfrage |
| E7 Ersetzt und storniert | `Superseded`, `ProposalWithdrawn`; „keine Buchung nötig" in `OpenItemCarryover`, `RecurringWithRule`, `Contract` | ✓; Storno-Buchung: 0 |
| E8 Vertrag | `Contract` | ✓ |
| **E9 Neu, ohne alles** | **`NewWithoutCounterparty`** | **neu** — rund 5 % der Fälle ohne Gegenpart |
| S1 Sammel, Zentralregulierer | `CollectivePayment` + Reiter Plausibilität | ✓; ein gefülltes Belegnummern-Register hat der Bestand nicht (0 %) |
| S2 Dauersachverhalt | `RecurringWithRule` + **Reiter Wiederkehr** | **Reiter neu** |
| S3 Dauer ohne Regel | `RecurringWithoutRule` + Leerzustand des Reiters | **Angebot neu** |
| S4 Ausgleichsgruppe | `ClearingGroup` · `ClearingGroupBalanced` | ✓ |
| S5 Mandantenstapel | `ClientBatch` | ✓ mit 508 statt 120 |
| P1–P4 | `InUse` · `LoadingErrorNotFound` · Reiter · `PartnerDrawer` | ✓ |

**Reiter Wiederkehr** (`Seiten/Sachverhalt/Reiter` · `Recurrence`): der
Schlüssel ist `regelwerk` aus `CASE_TABS` der App, die Beschriftung
„Wiederkehr" (O2: Regelwerk und Zuordnung in **einem** Reiter). `CasePage`
zeigt ihn nur bei `recurring_charge`. Oben `RecurringRuleFacts` mit Vorschau,
darunter die zwölf Abgrenzungen mit der zugeordneten Zahlung. Der
Leerzustand ist der Dauerfall **ohne** Regel: ein Angebot mit Knopf, dahinter
der vorbefüllte `RecurringRuleEditor` (0135). Der Weg „Regel ansehen" in
`RecurringWithRule` zeigte bis heute auf `?tab=wiederkehr`, einen Reiter, den
es nicht gab.

**D7 auf dieser Seite** (Owner 2026-09-11, zur Kontoseite entschieden): der
Kopfbetrag steht in Spalte 2 nicht noch einmal. `CompleteAndExported` und die
beiden `AwaitingDocument`-Stories nannten ihn im Satz; das tun sie nicht mehr.

Neuer Stand: **26 Szenarien** (Einzelfall 18 samt Stammdaten, Sammel und
Dauer 6, dazu `NoEvents` und `Contract` in Einzelfall), 3 Seitenzustände,
**8 Reiter**.

Gemessen bei 1440 × 900 auf einem eigenen Storybook aus einem Worktree
(6107 blieb für die Abnahme unberührt): `HandedToFirm` ein Signal,
`NewWithoutCounterparty` keins und keine Kennzahl im Kopf; beide ohne
Querlauf und ohne Text in 16 px. „Wiederkehr" erscheint bei `Recurrence` und
`RecurringWithRule`, nicht bei `Events` und `Log`; zwölf Zeilen; der Knopf
öffnet den Editor mit „Beispiel-Energie AG" und 142,00 €. Der Kopfbetrag
kommt in Spalte 2 bei keiner Story mit Betrag vor.

## Offene Fragen

1. **Ist die Buchung ein eigener Timeline-Eintrag oder eine zweite Zeile am
   Ereignis?** Der Brief sagt „alle Einträge", das Modell hängt die Buchung
   ans Ereignis. *Ohne Antwort:* zweite Zeile am Ereignis — ein Ereignis mit
   seiner Buchung ist **ein** Vorgang, und zwei Zeilen dafür wären zwei
   Behauptungen über dasselbe.
2. **Fällt Spalte 3 nach unten oder klappt Spalte 1 ein?** `ludwig-cto` hat
   „Spalte 3 nach unten" vorgeschlagen, der Owner hat es noch nicht
   bestätigt. *Ohne Antwort:* nach unten — so ist `Columns` gebaut und
   gemessen.
3. **O1 „Verbundene Belege" als Reiter?** *Default aus dem Brief:* nein.

## Abnahmekriterien

Fest (gilt immer): typecheck · build · Code englisch · `@when`/`@instead` ·
keine Hex/px · Status nur über Registry · Prüfliste §9 · im Browser angesehen.

Variabel (je Welle):

- [ ] **W1** Rang 1–4 stehen bei 1440 × 900 ohne Scrollen (gemessen)
- [ ] **W1** Der Wechsel Jetzt ↔ Eintrag ändert **nur** Spalte 2
- [ ] **W1** Ludwig- und DATEV-Einträge stehen in **einer** Reihe; der
      DATEV-Eintrag trägt das Wort „DATEV" und hat in Spalte 2 **keine**
      Handlungen
- [ ] **W1** Die Mängel-Zone ist ein Pattern (0153), keine zweite Kopie
- [ ] **W2** Jeder Leerfall trägt einen Satz mit Grund, keinen Strich
- [ ] **W2** Genau ein Signal oder keins; es entfällt, wenn der Fall auf
      jemand anderen wartet (E4, E5-Variante)
- [ ] **W3** 120 Ereignisse brechen das Layout nicht (Pagination in Spalte 1)
- [ ] **W3** Kein Gegenpart bei `adjustment_only` ist **kein Mangel** —
      NULL heißt dort „hat bewusst keins"
- [ ] **Nachtrag** Kein Gegenpart bei einer Eingangsrechnung **ist** ein
      Mangel mit Weg (`NewWithoutCounterparty`)
- [ ] **Nachtrag** „Wiederkehr" nur beim Dauersachverhalt; sein Leerzustand
      ist ein Angebot, kein Strich (`Recurrence`)
- [ ] **Nachtrag** Der Kopfbetrag steht nicht ein zweites Mal auf der
      Übersicht (D7)

## Abnahme

| Welle | Nachweis | Ergebnis |
|---|---|---|
| | | |
