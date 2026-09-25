# 0202 · Bankkonten-Saldenabgleich — Seiten-Stories S1–S14

| | |
|---|---|
| Status | App umgesetzt (60187496), DS-Abnahme 2026-09-25 mit Auflagen |
| Stufe | Seite (`src/showcase/bank-balance/`), keine neue Komponente |
| Klassen-Test | entfällt — Seiten-Story, kein Baustein |
| Quelle | Design-Brief **F298** (`app/docs/backlog/F298-…-design-brief.md` — historisch, mit F298 gelöscht (App f121c6bc); die Regeln stehen jetzt in `app/docs/topics/bank.md` R8 und im GLOSSARY („Bank reconciliation", „Balance confirmation"), App 44803437, Owner-abgestimmt 2026-09-25), übergeben von ll-dev5 |
| Ersetzt | vorerst nichts — Vorbild für `batch-review/ui/Step4.tsx` (`AbgleichZeile`) und `bank-transactions/ui/BalanceConfirmationCard.tsx`; die App zieht mit einer eigenen Folge-Spec nach (F298 §8) |
| Blockiert | die Folge-Spec der App (View-Model `BankBalanceComparison`) |
| Spec von / am | Claude, 2026-09-25 |

## Ziel

Schritt 4 der Stapelabnahme, Karte „Bankkonten". Die Sachbearbeiterin prüft
am Monatsende je Bankkonto, ob alle Umsätze gebucht sind (J1), sieht den
alten und neuen Stand (J2, J3) mit Quelle und Datum (J4) und die Differenz
(J5), und kann einen eigenen Kontostand hinterlegen (J6). Oben steht sofort
das Urteil: Farbe **und** Satz (E6). Die Stories entwickeln das Beispiel zu
Ende, der Owner nimmt es ab, danach baut die App.

## Einordnung

- **Wiederverwenden:** Kontozeile = `ExpandableRow` in `Table` in `Card`;
  Matrix Quelle × (Alt · Bewegung · Neu) = `Table`; Abweichungsansicht =
  `Table` + `StateIcon` (wie im Brief §10 verlangt); Kopf-Urteil = `Banner`;
  abweichendes Stand-Datum = `ValueHint` am Betrag; Formular = `Field`,
  `AmountInput`, `DateField`, `Select`, `Input`, `Button`; Fehler im Formular =
  `Banner tone="danger" title="Nicht gespeichert"`.
- **Nicht genommen:** `BalanceCheck` (0188) rechnet eine Summe gegen **ein**
  Ziel; hier stehen drei Quellen in drei Spalten. `ReconciliationTable`
  (0161) paart Einzelsätze, keine Stände.
- **Schalter „Buchungsvorschläge mitzählen" = `Checkbox`.** Das Set hat keinen
  Switch; ein neuer Baustein bräuchte den Owner (Brief §10). Die Checkbox ist
  derselbe Ja/Nein-Wert und steht mit Wort.
- **Neu:** nichts im Set. Die Seiten-Komposition `BankAccountsCard` liegt
  story-lokal im Showcase.

## Abweichungen vom Brief (benannt, Owner-Abnahme)

| # | Brief | Hier | Grund |
|---|---|---|---|
| A1 | Ordner `src/showcase/saldenabgleich/` | `src/showcase/bank-balance/`, Storybook-Titel „Seiten/Saldenabgleich" | Owner-Regel 2026-09-10: nie Deutsch in Dateinamen |
| A2 | `headline: string` | `headline: { released; withProposals }` | „der Hinweissatz nennt immer beide Wahrheiten" (E6) — der Satz hängt am Schalter wie `verdict` |
| A3 | `explanation[].amount` mit Vorzeichen des Umsatzes; S3 zählt den Juli-Vorschlag mit | `amount` = **Beitrag zur Differenz Neu der freigegebenen Sicht** (Buchungen − Vergleichsquelle); `null` = steht außerhalb der Rechnung | Nur so geht die Rechnung auf. Im Brief ergibt S3 5.380,40 − 48,20 ≠ 5.380,40, S7 150,00 − 120,00 + 50,00 ≠ 320,00 |
| A4 | Rest als Zeile `key: "remainder"` **und** als Feld `remainder` | beides bleibt; die Zeile `remainder` trägt Satz und Aktion der Rest-Zeile, zählt aber nicht zur Summe | sonst steht der Rest doppelt in der Rechnung |
| A5 | Formular-Button „Stimmt" | „Stand der Buchungen einsetzen (Betrag)", setzt ein, speichert nicht | T-Regel: Imperativ mit Objekt; „Stimmt" sagt nicht, was geschieht |
| A6 | ruhende Konten ohne Typ | story-lokal `DormantAccount` | die Sammelzeile (R15d) braucht Konto, letzten Umsatz, Vormonat |
| A7 | Beleg am eigenen Kontostand „optional" | nicht in den Stories | eigener Baustein-Weg (`FileDrop`), ändert an der Seite nichts |
| A8 | Kartenkopf „Anderer Stichtag" | App: „Zu den Konten" (`/banks`) | der Reporting-Reiter braucht ein Konto, im Kartenkopf gibt es keins (ll-dev5, 2026-09-25) — angenommen; die Story behält den Link als Vorbild |

## Aufbau (Owner-Überarbeitung 2026-09-25)

1. **Banner** über der Karte: schlechteste Stufe gewinnt, ein Satz zählt
   („1 von 3 Bankkonten passt · 1 weicht ab (1830) · …"). Passt keines, stehen
   nur die Gruppen.
2. **Karte „Bankkonten"**, Kopf mit Spanne (`01.–31.08.2026`), Schalter und
   „Anderer Stichtag". Schalter im Hash (`with_proposals=1`, a2).
3. **Kontozeile** (zu, solange sie passt; offen sonst), sortiert nach Stufe:
   Konto · Urteil (`StateIcon` + `headline`) · Umsätze. Aufgeklappt:
   Umsatzdeckung + Knopf „Kontostand hinterlegen" → Tabelle → Hinweise.
4. **Tabelle: Quellen als Spalten, Zeit nach unten.** Zeilen Vor Periode
   (`01.08.2026`) · Bewegung (`01.–31.08.2026`) · Periodenende (`31.08.2026`)
   — Owner 2026-09-25 statt „Alt/Neu", auch in Sätzen und Dialog — ein
   kurzer Verlauf je Quelle. Spalten Buchungen (bzw. „inkl. Vorschläge") ·
   Kontoauszug · Eigene Angabe (**nur, wenn eine hinterlegt ist**) · Differenz
   je Vergleichsquelle. Kopf mit Fläche, Spaltenlinien, die Differenzspalte
   mit eigener Fläche und stärkerer Linie. Eine Zeile mit Differenz ≠ 0 ist
   **ganz** in der Stufe des Kontos eingefärbt.
5. **Zahlen nur als Zahl:** gestrichelt unterstrichen, der Tooltip nennt
   Quelle, Detail und Stand-Datum; eine Auszugszahl ist zugleich der Link zum
   Auszug. Unter **jeder** Zahl genau **eine** Zeile — in jeder Zelle der Zeile,
   leere Zellen halten sie frei; zu lang wird gekürzt, der ganze Text steht im
   Tooltip. Abweichendes Stand-Datum: `ValueHint` am Betrag.
6. **Werte mit Vorschlägen** (Schalter an) stehen in der Stufe Hinweis (blau,
   wie `proposed` in der Registry), die Unterzeile sagt „inkl. 64 Vorschläge",
   der Tooltip „enthält 64 Buchungsvorschläge, noch nicht freigegeben".
6a. **Die Zahlen unter der Bewegung sind Links** („22 Buchungen", „64
   Umsätze"): sie öffnen einen Drawer mit den Buchungen bzw. Umsätzen des
   Kontos im Zeitraum (Owner 2026-09-25). Den Drawer baut die App (Liste,
   Filter, Zeilen-Drawer, a4); die Story schreibt nur
   `#drawer=bookings|transactions&account=…&from=…&to=…` in den Hash — die App
   setzt ihre Query dafür ein.
7. **Teile des alten Stands** (`LedgerTriple.oldParts`): andere Stapel,
   Mandantenstapel, ein Vorschlag aus dem Vormonat stehen als eigene
   „davon"-Zeilen unter Alt. Die Prüfung rechnet: Teile = Alt.
8. **Erklärung der Differenz im Popover am Differenzwert** (Klick auf den
   Betrag, Unterzeile „weicht ab · Erklärung"): Differenz Neu → je Erklärung
   Stufe, Satz, Aktion, Beitrag → Rest (immer). Nicht unter der Tabelle —
   dort war nicht zu sehen, wozu sie gehört. Hinweise ohne Rechnung (kein
   Auszug, Auszug endet früher) stehen als Zeilen unter der Tabelle.
9. **Eigene Angabe über einen Dialog** (Knopf „Kontostand hinterlegen");
   danach trägt der Wert einen Stift, der denselben Dialog vorbelegt öffnet.
10. **Kasse, Geldtransit** (`optional`): Hinweis, zu, zuletzt, nur Spalte
    Buchungen, Umsätze „—". **Ruhende Konten** als eine Sammelzeile; gelb nur,
    wenn eines im Vormonat noch Umsätze hatte.

Stufen: `fits` erledigt · `fits_with_proposals`, `explained` Warnung ·
`differs` Fehler · `not_checkable`, `optional` Hinweis.

**Benannte Ausnahmen (Owner, 2026-09-25):** Die Tabelle ist ein eigenes
`<table class="v3bbr">` statt `Table`, weil das Raster von `Table` keine
durchgehende Spaltenfläche und keine Spaltenlinien kann; Kopf- und
Differenzspalte tragen Fläche, obwohl Hintergrund sonst nur für
aktiv/ausgewählt/alarmiert steht. CSS in `v3.css` §0202. Wird die Form ein
zweites Mal gebraucht, wird sie ein Baustein.

## Verhalten

- Tastatur: Chevron je Zeile, Schalter, jede Zahl ist ein Fokus-Halt (Tooltip
  auch auf Fokus), Differenzwert öffnet das Popover, Knopf „Kontostand
  hinterlegen", Stift (a7). Im Dialog `Esc` schließt ohne zu speichern,
  `Enter` speichert, der Fokus kehrt zum Auslöser zurück.
- Dialog: Zeitpunkt (Alt/Neu) · Kontostand (darunter „Stand der Buchungen
  einsetzen" — setzt ein, speichert nicht) · Stichtag (vorbelegt: Periodenende
  bzw. Tagesende vor Periodenanfang) · Quelle · Notiz. Stichtag nach heute →
  „Nicht gespeichert", Eingabe bleibt. Gespeichert wird im Story-Zustand, die
  Zeile Eigene Angabe und ihre Differenz rechnen neu; das Urteil kommt weiter
  aus dem View-Model (die App rechnet es).
- Farbe nie am Vorzeichen (A7): Beträge neutral, nur Differenz ≠ 0 in der
  Stufe des Kontos, immer mit Satz.

## Stories

Titel „Seiten/Saldenabgleich". Je Story oben Banner + Urteil + Satz.

| Story | Beweist |
|---|---|
| `S1Fits` | alles freigegeben, Auszug mit Salden |
| `S2ProposalsOff` / `S2ProposalsOn` | Referenzfall, beide Schalterstellungen, beide Sätze; an = aufgeklappt, Vorschlagswerte blau |
| `S3ProposalFromLastMonth` | Juli-Vorschlag schon in DATEV, außerhalb der Rechnung, Warnsatz |
| `S4NoBalancesInFile` | nur Bewegung prüfbar, Alt/Neu „—", Auszug ohne PDF |
| `S5ManualBalance` | eigene Angabe (Papierauszug) macht Neu prüfbar — Spalte und Stift, aufgeklappt |
| `S6Explained` | eigene Angabe weicht ab, erklärt durch Umsätze ohne Buchung |
| `S7Differs` | Rest 50,00 € |
| `S8NotCheckable` | kein Auszug, negativer Saldo, noch kein DATEV-Abruf |
| `S9StatementEndsEarly` | Neu-Stand vom 22.08., hervorgehoben, kein Vergleich |
| `S10OtherBatches` | „davon"-Zeilen für DATEV, Stapel 2026-0003, Mandantenstapel; langer Kontoname, 214 Umsätze — aufgeklappt über `openAll`, weil eine passende Zeile sonst zu bleibt |
| `S11CashAndTransit` | Kasse und Geldtransit, leise |
| `S12Dormant` | 20 ruhende, eines still geworden |
| `S13Mixed` | Kopf-Banner über 1 rot, 1 gelb, 1 grün, 2 optional, 20 ruhend |
| `S14FormError` | Dialog offen, Stichtag in der Zukunft |

Gemessen 2026-09-25 bei 1280 px (nach der Überarbeitung): keine waagrechte
Scrollleiste; Schalter schreibt `with_proposals=1` in den Hash, Banner,
Urteil und Spalte Buchungen rechnen neu; Dialog nimmt den Fokus, `Esc`
schließt, der Fokus kehrt zu „Kontostand hinterlegen" zurück; nach dem
Speichern erscheinen „Eigene Angabe" und ihre Differenzspalte, Meldung über
`role="status"`; Stift öffnet vorbelegt. Trefferflächen: Zahl 24 px hoch,
Stift 24 × 24; unter 24 px bleiben Chevron (20 × 21) und `ValueHint`
(14 × 14) der vorhandenen Bausteine, mit Abstand nach WCAG 2.5.8.

Rechenprüfung: `pnpm check:bank-balance` — je Fixture und Quelle
`old + movement = new`, `oldParts` = Alt, Summe der Beiträge + Rest = Differenz Neu.

Nicht anwendbare Zustände: lädt / Fehler beim Laden gehören zur App-Seite
(Folge-Spec), nicht zum Beispiel.

## Ausbau

| Was fehlt | Wo | Woran man merkt, dass es Zeit ist |
|---|---|---|
| ein echter Schalter-Baustein | `primitives/` | eine zweite Seite braucht Ein/Aus mit sofortiger Wirkung außerhalb eines Formulars |
| `BankBalanceComparison` aus der App | `src/ludwig/` | Folge-Spec F298 §8 gebaut; dann story-lokalen Typ löschen |

## Abnahme der App-Umsetzung (2026-09-25, Claude/DS)

App **60187496** (`batch-review/ui/BankBalanceCard.tsx`, `Step4.tsx`,
`domain/bank-balance-comparison.ts`), geprüft als Code-Diff gegen
`BankAccountsCard.tsx` (63e1bec). Nicht im Browser gemessen — die Karte ist
eine Zeile-für-Zeile-Portierung der gemessenen Story; die Drawer sind neu und
ungemessen.

**Angenommen:** Tabelle `.v3bbr`, Zeilen und Spalten, Tooltips, „davon"-Zeilen,
Popover-Erklärung, Dialog mit Stift, „Stand der Buchungen einsetzen" füllt nur
ein, Stichtag nach heute → Banner, Speichern über `recordReviewBalanceAction` +
`router.refresh()`, Schalter in `?with_proposals=1`, Banner-Satz
(`summarizeBankBalances`), Drawer-Query `drawer`/`drawer_account`, A8.
Übernommen ins Showcase: Satz der ruhenden Konten „… — fehlt ein Auszug?",
`ManualAmount.source`/`by` nullable.

**Auflagen an die App (vor Schließen von F298):**

| # | Wo | Befund | Regel |
|---|---|---|---|
| B1 | `Step4.tsx` BuchungenDrawer | Betrag über `formatAmount` als Text, Datum über lokales `tag()` — ohne `tnum`, zweite Quelle | Zahlen nur über Wertzellen (`AmountCell`, `DateCell`) |
| B2 | beide Drawer, `meta` | `${n} Buchungen` / `${n} Umsätze` ohne `formatCount` → „1 Buchungen"; „davon 0 ohne freigegebene Buchung" steht auch bei 0 | Zahl mit Wort über `formatCount`; Nebensatz nur bei > 0 |
| B3 | `BankBalanceCard` Umsatzdeckung vs. Domain-Erklärung | „n ohne Buchung geschlossen" und „als ‚keine Buchung nötig' geschlossen" für dieselbe Sache | ein Wort für eine Sache — die Domain-Fassung nehmen |
| B4 | `Explanation` | Differenz = Σ Beiträge + Rest, also tautologisch; ein Rechenfehler der Domain verschwindet | Differenz aus Buchungen − Vergleichsquelle rechnen (wie `releasedDifferenceNew` im Showcase) |

**Erledigt 2026-09-25:** B1–B4 in App **1947c8d2** (Code geprüft; B1 über
`dateColumn`/`amountColumn`). `LedgerPart.proposed: boolean` statt Label-Präfix
— App 1947c8d2, Showcase nachgezogen. Drawer im Browser weiter ungemessen.

**Offen:** Lokale Wortlisten `MANUAL_SOURCE_LABEL`,
`HERKUNFT`, `GRUND` gehören in die Status-Registry — beim nächsten Spiegel-Lauf
(über acto), dann fällt `types.ts` hier.
