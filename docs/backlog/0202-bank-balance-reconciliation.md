# 0202 · Bankkonten-Saldenabgleich — Seiten-Stories S1–S14

| | |
|---|---|
| Status | Abnahme |
| Stufe | Seite (`src/showcase/bank-balance/`), keine neue Komponente |
| Klassen-Test | entfällt — Seiten-Story, kein Baustein |
| Quelle | Design-Brief **F298** (`app/docs/backlog/F298-bank-balance-reconciliation-scenarios-design-brief.md`, App 44803437, Owner-abgestimmt 2026-09-25), übergeben von ll-dev5 |
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
| A5 | Formular-Button „Stimmt" | „Stand der Buchungen übernehmen" | T-Regel: Imperativ mit Objekt; „Stimmt" sagt nicht, was geschieht |
| A6 | ruhende Konten ohne Typ | story-lokal `DormantAccount` | die Sammelzeile (R15d) braucht Konto, letzten Umsatz, Vormonat |
| A7 | Beleg am eigenen Kontostand „optional" | nicht in den Stories | eigener Baustein-Weg (`FileDrop`), ändert an der Seite nichts |

## Aufbau

1. **Banner** über der Karte: schlechteste Stufe gewinnt, ein Satz zählt
   („2 von 3 Bankkonten passen · 1 passt erst mit Vorschlägen (1800).").
2. **Karte „Bankkonten"**, Kopf mit Zeitraum, Schalter und „Anderer Stichtag".
   Schalter im Hash (`with_proposals=1`, a2).
3. **Kontozeile** (zu, solange sie passt; offen sonst), sortiert nach Stufe:
   Konto · Urteil (`StateIcon` + `headline`) · Umsätze. Aufgeklappt:
   Umsatzdeckung (J1, nur Teile ≠ 0) → Matrix → Abweichungsansicht →
   Formular.
4. **Matrix:** Zeilen Buchungen (bzw. „Buchungen inkl. Vorschläge") ·
   Kontoauszug · Eigene Angabe · Differenz je Vergleichsquelle. Unter jeder
   Zahl leise Quelle und Detail. Weicht das Stand-Datum vom Stichtag der
   Spalte ab, trägt der Betrag einen `ValueHint`: Hinweis, solange der
   Vergleich trägt (Anfangssaldo am Tag vor der ersten Auszugszeile), Warnung,
   wenn nicht (Auszug endet 22.08.) — dann „—" in der Differenz.
5. **Abweichungsansicht:** Differenz Neu → je Erklärung Stufe, Satz, Aktion,
   Beitrag → Rest (immer). Ohne Rechnung (`remainder: null`) nur die Hinweise.
6. **Kasse, Geldtransit** (`optional`): Hinweis, zu, zuletzt. Nie Warnung.
7. **Ruhende Konten** als eine Sammelzeile; gelb nur, wenn eines im Vormonat
   noch Umsätze hatte.

Stufen: `fits` erledigt · `fits_with_proposals`, `explained` Warnung ·
`differs` Fehler · `not_checkable`, `optional` Hinweis.

## Verhalten

- Tastatur: Chevron je Zeile, Schalter, Links, „Kontostand hinterlegen" im
  Feld Alt bzw. Neu; im Formular `Esc` schließt ohne zu speichern, `Enter`
  speichert. Hinterlegter Betrag ist ein Knopf (a7) → dasselbe Formular.
- Formular: Betrag · Stichtag (vorbelegt: Periodenende bzw. Tag vor
  Periodenanfang) · Quelle · Notiz. Stichtag nach heute →
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
| `S2ProposalsOff` / `S2ProposalsOn` | Referenzfall, beide Schalterstellungen, beide Sätze |
| `S3ProposalFromLastMonth` | Juli-Vorschlag schon in DATEV, außerhalb der Rechnung, Warnsatz |
| `S4NoBalancesInFile` | nur Bewegung prüfbar, Alt/Neu „—", Auszug ohne PDF |
| `S5ManualBalance` | eigene Angabe (Papierauszug) macht Neu prüfbar |
| `S6Explained` | eigene Angabe weicht ab, erklärt durch Umsätze ohne Buchung |
| `S7Differs` | Rest 50,00 € |
| `S8NotCheckable` | kein Auszug, negativer Saldo, noch kein DATEV-Abruf |
| `S9StatementEndsEarly` | Neu-Stand vom 22.08., hervorgehoben, kein Vergleich |
| `S10OtherBatches` | lange Quelle-Zeile, langer Kontoname, 214 Umsätze — aufgeklappt über `openAll`, weil eine passende Zeile sonst zu bleibt |
| `S11CashAndTransit` | Kasse und Geldtransit, leise |
| `S12Dormant` | 20 ruhende, eines still geworden |
| `S13Mixed` | Kopf-Banner über 1 rot, 1 gelb, 1 grün, 2 optional, 20 ruhend |
| `S14FormError` | Formular offen, Stichtag in der Zukunft |

Gemessen 2026-09-25 bei 1280 px: keine waagrechte Scrollleiste; Schalter
schreibt `with_proposals=1` in den Hash, Banner, Urteil und Zeile Buchungen
rechnen neu; Formular fängt den Fokus im ersten Feld, `Esc` schließt und
gibt ihn an „Kontostand hinterlegen" zurück; Speichern meldet über
`role="status"`. Trefferflächen unter 24 px (Textlinks 14–22 px hoch,
Chevron 20 × 21, `ValueHint` 14 × 14) gehören den vorhandenen Bausteinen und
halten den Abstand nach WCAG 2.5.8.

Rechenprüfung: `pnpm check:bank-balance` — je Fixture und Quelle
`old + movement = new`, Summe der Beiträge + Rest = Differenz Neu.

Nicht anwendbare Zustände: lädt / Fehler beim Laden gehören zur App-Seite
(Folge-Spec), nicht zum Beispiel.

## Ausbau

| Was fehlt | Wo | Woran man merkt, dass es Zeit ist |
|---|---|---|
| ein echter Schalter-Baustein | `primitives/` | eine zweite Seite braucht Ein/Aus mit sofortiger Wirkung außerhalb eines Formulars |
| `BankBalanceComparison` aus der App | `src/ludwig/` | Folge-Spec F298 §8 gebaut; dann story-lokalen Typ löschen |
