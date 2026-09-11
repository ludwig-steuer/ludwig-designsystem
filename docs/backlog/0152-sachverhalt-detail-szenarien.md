# 0152 · Die Sachverhaltsseite als Szenarien

| | |
|---|---|
| Status | **in Arbeit** — fremd abgenommen 2026-09-11 mit einem Mangel, Nacharbeit gebaut am selben Tag, Nachprüfung offen; Reiter nach Zielgruppe neu geschnitten (4a64223), deren Abnahme offen |
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

## Nachtrag 2026-09-11 — Reiter nach Zielgruppe, Erwartungen in der Randspalte

Owner-Entscheid nach der Vorschau („leg das mal alles so an"):

**Sieben Reiter statt zehn, nach Zielgruppe.** Für die Sachbearbeitung
Übersicht · Ereignisse · Rückfragen · Plausibilität · Wiederkehr (nur
Dauerfall) · Stammdaten; für Prüfung und Support **Technik**.

| vorher | jetzt |
|---|---|
| Saldo & Konten | in **Plausibilität** — Personenkonto, offene Posten, Ausgleich unter Prüfpunkten und Register; eine Frage: geht es auf? |
| DATEV-Wahrheit · Protokoll · Rohdaten | ein Reiter **Technik**, untereinander; dazu die Herkunft des Datensatzes; Rohdaten eingeklappt (`Disclosure`) |
| Stammdaten mit Anker, Angelegt von, Buchungslauf, Buchungszyklus | diese vier stehen in Technik; `CaseFacts` bekommt dafür `technical={false}` (0097) |
| Ereignisse: Strang, darunter die Box „Buchung zum Beleg" | `list-detail` wie die Übersicht: links der Strang, rechts der gewählte Eintrag; die Box entfällt |

Schlüssel des neuen Reiters: `technical` (englisch, weil nicht aus der App;
die übrigen Schlüssel des Showcase bleiben, bis F210 die Namen der App
umstellt). „Technik" weicht vom Detailseiten-Standard ab (dort heißt der
letzte Reiter „Rohdaten") — Nachtrag dort; Beleg, Konto und Partner bleiben,
bis der Owner den Schnitt auch dort will.

**Erwartungen in der Randspalte.** Jede Übersicht trägt rechts einen Block
„Erwartungen" zwischen Notizen und Rückfragen: `ExpectationRow` (0025) je
offene Erwartung, sonst ein Satz. Grundlage:
`docs/entitaeten/expectation-staging-erhebung-2026-09-11.md` — 135
Erwartungen an 132 Fällen, höchstens zwei je Fall; 72 offene
Zahlungserwartungen hängen an geschlossenen Fällen und waren auf der
Fallseite bisher unsichtbar.

**„Zu tun" nennt eine Erwartung nur, wenn sie fällig ist** (Reife `due`
oder `escalated`). Die laufende steht nur rechts — sonst stünde dieselbe
Erwartung dreimal auf der Seite (Strang, Zu tun, Randspalte).
`ProposalPending`, `AwaitingDocument` und `ExpenseReport` verlieren deshalb
ihren Punkt; `AwaitingDocumentEscalated` behält ihn.

Reiter-Stories jetzt: `Events`, `Clarifications`, `Plausibility`,
`Recurrence`, `Technical` (statt `BalanceAndAccounts`, `DatevTruth`, `Log`,
`RawData`).

Gemessen bei 1440 × 900 auf einem Storybook aus einem Worktree (6128), alle
Stories unter `Seiten/Sachverhalt/`: keine Fehler, kein Querlauf, kein Text in
16 px, der aus diesem Umbau stammt. Reiter: sechs, beim Dauerfall sieben.
Ereignisse: Liste bei x = 0, Detail bei x = 633, beide oben bündig.
Stammdaten ohne die vier technischen Zeilen, Technik mit ihnen (soweit
belegt). Erwartungen: eine Zeile in `ProposalPending`, `AwaitingDocument`,
`AwaitingDocumentEscalated`, `ExpenseReport`, `InUse`, `PartnerDrawer`,
sonst der Satz.

Die Einstellungen der Wiederkehr als eigener Baustein folgen als eigene
Spec, gegen `docs/entitaeten/recurring-rule-staging-erhebung-2026-09-11.md`.

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

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761 (für 0152/0157 bca4b7d); statische Checks alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

**Zurückgestellt, Reiter-Schnitt offen:** `Seiten/Sachverhalt/Reiter` (P3, alle 8 Exporte inkl. `Recurrence`) — nicht abgenommen (Koordinator 2026-09-11). Die Nachtrags-Kriterien, die nur am Reiter Wiederkehr hängen, stehen unten als zurückgestellt.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: typecheck · build · Sprache · @when · Registry | Checks oben, alle 0 (bca4b7d) | ok |
| Alle Story-IDs existieren, kein Querlauf | 18 Einzelfall + 6 Sammel/Dauer + 3 Seite bei 1440 und 1280: `scrollW == vw` überall (`m0152.txt`, `m-bca.txt`). `CollectivePayment`: Klammer-Tabelle (`minWidth 980`) scrollt in `.v2tbl__inner`, Seite nicht | ok |
| W1 Rang 1–4 bei 1440×900 ohne Scrollen | `einzelfall--proposal-pending` @1440: Kopf 48–161, Status im Kopf, Signal 181–277, „Zu tun" 443–481, erster Strang-Eintrag 536–599. `seite--in-use` (AppShell) @1440: Signal 269–365, „Zu tun" 531–569, erster Eintrag 624–687; @1280: 645–730 | ok |
| W1 Wechsel Jetzt ↔ Eintrag ändert **nur** Spalte 2 | `w1b.txt`: jeder Strang-Eintrag in 23 Seiten-Stories geklickt. Bei Ereignissen: Spalte 1 nur Auswahlmarke, Spalte 3 und Kopf byte-gleich, Spalte 2 wechselt ✓. **Aber:** Erwartungen und Klärungen haben keinen `details`-Eintrag → der Eintrag wird `aria-current`, „Zu tun" verliert `is-active`, **Spalte 2 bleibt „Zu tun"** (`COL2-UNCHANGED`): `proposal-pending` Einträge 0+1, `with-datev-entry` 0, `awaiting-document(-escalated)` 0, `clarification-open-firm` 0, `client-batch` 0–11 (alle 12 Rückfragen), `expense-report` 0+1, `seite--in-use` und `--partner-drawer` 0+1 | **Mangel** |
| W1 Ludwig- und DATEV-Einträge in **einer** Reihe, Wort „DATEV", keine Handlungen in Spalte 2 | `with-datev-entry`: ein `.v2tl`, Eintrag 3 „Gutschrift desselben Kreditors 21,82 € **DATEV** Gebucht Gebucht" (Badge-Wort, kein Icon allein); gewählt → Spalte 2 „Gutschrift aus DATEV … Diese Buchung steht in DATEV", `mainButtons = []` | ok |
| W1 Mängel-Zone ist ein Pattern (0153) | `patterns/OpenPoints.tsx`; Aufrufer `showcase/case/scenario.tsx`, `showcase/account/scenario.tsx`, `entities/source-document/SourceDocumentAside.tsx`; `grep v2docaside|v2docdef src` = 0 | ok |
| W2 Jeder Leerfall trägt einen Satz, keinen Strich | `no-events`: „Noch nichts geschehen."; Offen-Box: „An diesem Sachverhalt ist nichts offen." / „Nichts offen: beide Ereignisse sind gebucht …"; Rückfragen: „Keine Rückfragen."; Notizen: „keine". Gedankenstriche nur in Tabellenzellen (Klammer-Tabelle Belegfeld, Log-Spalte, Rohdaten `closed_at`) — keine Leerzustände | ok |
| W2 Genau ein Signal oder keins; entfällt, wenn der Fall auf jemand anderen wartet | `signals` je Story ≤ 1 (m0152/m-bca): 1 bei ProposalPending, RecurringWithoutRule, OutgoingWithPayment, JudgeFlagged, JudgeAdjusted, ClientBatch, CollectivePayment, HandedToFirm, InUse, PartnerDrawer; **0** bei AwaitingDocument(+Escalated), ClarificationOpenFirm, ProposalWithdrawn, Superseded, OpenItemCarryover, CompleteAndExported, Contract, NoEvents, NewWithoutCounterparty | ok |
| W3 120 (508) Ereignisse brechen das Layout nicht | `client-batch`: 20 Einträge + „488 ältere Einträge im Reiter Ereignisse"; scrollW 1440/1280 = vw; `expense-report` 21 Einträge dito | ok |
| W3 Kein Gegenpart bei `adjustment_only` ist kein Mangel | `client-batch`: Kopf ohne Gegenpart, keine Kennzahl „—" (`dashes=0`), Offen-Box: „12 Rückfragen …", „508 Buchungen … Abnahme" — keine Gegenpart-Zeile | ok |
| Nachtrag: Kein Gegenpart bei Eingangsrechnung **ist** ein Mangel mit Weg | `new-without-counterparty`: Offen „Der Gegenpart fehlt. … Partner wählen" (Weg), zweite Zeile „nicht gebucht"; Kopf ohne Kennzahl (`metric: null`), kein Signal | ok |
| Nachtrag: „Wiederkehr" nur beim Dauersachverhalt; Leerzustand ein Angebot | Reiterleiste: `recurring-with-rule` und `reiter--recurrence` tragen „Wiederkehr", `reiter--events`/`--log` nicht ✓. Leerzustand/Angebot am Reiter selbst: **zurückgestellt** (Reiter-Schnitt) | zurückgestellt |
| Nachtrag: Kopfbetrag nicht ein zweites Mal auf der Übersicht (D7) | `complete-and-exported` Kopf 214,20 € — Spalte 2 ohne „214,20"; `awaiting-document(-escalated)` Kopf 86,00 € — Spalte 2 ohne „86,00" | ok |
| Kein Text ≥ 16 px im Arbeitsregister | fs≥16 nur Titel (19 px), Callout-Titel (17), Leerzustand-Titel (18), Drawer-Titel (16, Set-Drawer), AppShell-Hinweis „Zu schmal" | ok |
| Spec beschreibt das Gebaute | Welle-2/3-Tabellen + Nachtrag 2026-09-11 decken alle 27 Seiten-Exporte; `FALL_TABS`-Reiter im Nachtrag genannt | ok |

**Hinweis:** DATEV-Zeile zeigt zwei Badges „Gebucht" (Achse `ereignis` + Achse `buchung`, beide beschriftet „Gebucht") — dasselbe Wort zweimal in einer Zeile.

**Urteil: in Arbeit.** Mangel: Erwartungs- und Klärungs-Einträge im Strang sind wählbar, ohne dass Spalte 2 wechselt (Story-IDs oben; Ursache `scenario.tsx` `ScenarioPage`: `selected === TODO_ID || !detail ? <TodoPane/>`). Entweder ein Detail je Eintrag oder Einträge ohne Detail nicht wählbar. Reiter-Stories zurückgestellt.

### Nacharbeit 2026-09-11 (durch den Bauenden, Nachprüfung offen)

| Mangel | Nacharbeit | Messung (6107, 1440 × 900) |
|---|---|---|
| Erwartungs- und Klärungs-Einträge wählbar, Spalte 2 bleibt „Zu tun" | `ScenarioPage` zeigt je Eintrag seine Fläche: Ereignis → `EventPane`, Erwartung → `ExpectationPane` (`ExpectationRow`, was sie erledigt, „Erledigt"/„Aufheben"), Klärung → `ClarificationPane` (die Zeile mit Zustand und Weg in den Reiter; bei der beantwortbaren Frage die Karte); die Erstattung in `ExpenseReport` hat ein Detail bekommen | jeder Strang-Eintrag geklickt: `proposal-pending` 0 → „Erwartete Zahlung", 1 → „Rückfrage"; `awaiting-document(-escalated)` 0 → „Erwarteter Beleg"; `clarification-open-firm` 0 → „Rückfrage"; `client-batch` 0–11 → „Rückfrage"; `expense-report` 0 → „Erwarteter Beleg", 1 → „Erstattung Reisekosten Juli"; `seite--in-use` 0/1 wie `proposal-pending`; `with-datev-entry` 0 → „Erwartete Zahlung" |

Die Reiter-Stories sind seit 4a64223 nach Zielgruppe geschnitten (Nachtrag oben) und warten auf ihre eigene Abnahme.
