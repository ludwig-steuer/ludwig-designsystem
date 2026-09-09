# 0140 · `businessPartnerColumns()` — der Spaltenkatalog der Geschäftspartner

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
| Stufe | `entities/business-partner/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Kreditor, Debitor, Reifegrad, Verrechnungskonto |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md` (`geprüft`, 2026-09-09), Abschnitte „Listen" und „Formen" |
| Ersetzt | die rohe `<table className="tbl">` in `partners/page.tsx` samt lokalem `AccountCell` und `ClearingCell` |
| Setzt voraus | **0139** `BusinessPartnerCell` (Rang 1 in jeder Zeile) · `DataTable` (0057) · `StatusBadge axis="partner"` |
| Blockiert | 0128 `BusinessPartnerList` — die Seite setzt diesen Katalog mit `DataTable` zusammen |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Eine Liste, 6.363 Zeilen im p90, elf bis zwölf Spalten — und sie steht heute
als rohe `<table>` in der Seitendatei, mit zwei lokal definierten Zellen. Das
wird ein **Spaltenkatalog**, keine Zeilen-Komponente: `DataTable` baut die
Zeile, und zwei Zeilenbauten für eine Entität verbietet R17. Präzedenz sind
`accountColumns()` (0062), `sourceDocumentColumns()` (0070),
`bankTransactionColumns()` (0101) und `recurringRuleColumns()` (0131).

**Warum keine `BusinessPartnerRow`:** es gibt genau **eine** Partnerliste, und
die hat 6.363 Zeilen im p90 — also `DataTable` mit Serverfilter. Eine zweite,
kurze Partnerliste gibt es nirgends; die Reiter am Partner zeigen *andere*
Entitäten. Damit hat die Zeile nur einen Rahmen, und der ist eine
Spaltendefinition. (Von der Prüfung am 2026-09-09 bestätigt.)

## Einordnung

- **Regel aus §3, die griff:** Nr. 5 — neue Entitäts-Form, und zwar die, die
  `ui-repraesentationen.md` für diese Entität führt.
- **Zuschnitt:** eigene Datei `business-partner-columns.tsx` neben
  `BusinessPartner.tsx`. Derselbe Schnitt wie bei Konto, Beleg und
  Wiederkehr-Regel: die Zelle wohnt bei ihrer Familie, der Katalog daneben.
- **Ein Katalog, benannte Sätze.** Heute genau einer (`PARTNER_LIST_COLUMNS`);
  die Struktur ist trotzdem die des Musters, weil der zweite Satz mit dem
  Konten-Reiter des Views kommt und dann kein Umbau sein soll.

## Die Spalten

Ränge 1–7 des Profils, dazu die Verrechnung. **Rang 2 steht als zwei
Spalten** — das ist der eine Punkt, an dem die Liste vom Profil abweicht, und
mit Grund: das Profil führt Kreditor- und Debitorkonto als **einen**
Datenpunkt, weil 99,9 % der Partner genau eines tragen und der Punkt getrennt
an der 20-%-Regel scheitern würde. Die Tabelle hat aber den Platz, und zwei
Spalten sagen die Rolle **ohne ein eigenes Wort**: gefüllt links heißt
Kreditor, gefüllt rechts Debitor, beides leer und Verrechnung gefüllt heißt
Abrechner.

| Schlüssel | Kopf | Rang | Inhalt | sortierbar |
|---|---|---|---|---|
| `partner` | Geschäftspartner | 1 (+7) | `BusinessPartnerCell` mit `name`, `shortName` und `href` | ja |
| `creditorAccount` | Kreditorkonto | 2 | `MonoCell`, Weg zum Kontoblatt; leer heißt „keins", nicht „unbekannt" | nein |
| `debtorAccount` | Debitorkonto | 2 | wie oben | nein |
| `clearing` | Verrechnung | — | die Nummern aus `clearingAccounts`, `mono`, durch `·` getrennt | nein |
| `onboarding` | Reifegrad | 3 | `StatusBadge axis="partner"` | ja |
| `bookings` | Buchungen | 4 | Zahl, rechts, `tnum`; **0 steht als 0**, nicht als Strich | ja |
| `lastBooking` | Letzte Buchung | 5 | `Time format="date"`; ohne Buchung leer | ja |
| `city` | Ort | 6 | Text, gekürzt | nein |

**Warum kein Wort für die Rolle** (Owner-Entscheid 2026-09-09): Die drei
Kontospalten kodieren sie eindeutig, und zwar genauer als ein Wort — welche
Nummer, nicht nur welche Art. Gemessen: alle 12 Abrechner tragen weder
Kreditor- noch Debitornummer, 27 von 14.950 tragen beide, 14 tragen keine.
Eine eigene Spalte würde für 0,08 % des Bestands Breite kosten.

**Warum kein „Art"-Wort** (`typicalNature`): 14 % gefüllt über den ganzen
Bestand. Es gehört in die Fakten (0142), nicht in eine Liste, in der es
sechsmal von sieben leer stünde.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `partnerHref` | `(partnerId: string) => string` | nein | Der Weg zum Partner, auf der **Namenszelle**. Ohne ihn ist der Name Text | `Filled` |
| `accountHref` | `(accountNumber: string) => string` | nein | Der Weg zum Kontoblatt, auf jeder Kontonummer — Kreditor, Debitor und Verrechnung | `Filled` |
| `columns` | `readonly BusinessPartnerColumn[]` | nein | **Welche** Zellen, nicht in welcher Ordnung: die Rangordnung gilt in jeder Form (dieselbe Regel wie bei 0132, dort am 2026-09-08 falsch beschrieben). Vorgabe `PARTNER_LIST_COLUMNS` | `Narrow` |

Dazu die Exporte des Katalogs: `BusinessPartnerColumn` (die Union),
`BusinessPartnerColumnOptions` (was `businessPartnerColumns()` nimmt — der
Aufrufer, der die Optionen typisieren will, findet den Namen sonst nur im
Code),
`BusinessPartnerColumnOptions` (was `businessPartnerColumns()` nimmt — der
Aufrufer, der die Optionen typisieren will, findet den Namen sonst nur im
Code),
`BusinessPartnerRowData` (was eine Zeile zeigt), `PARTNER_LIST_COLUMNS` (der
eine benannte Satz), `PARTNER_COLUMN_LABEL`, `businessPartnerTracks()` und
`businessPartnerColumnOrder()` — der letzte, weil eine von Hand gebaute
Kopfzeile sonst aus einer anderen Quelle käme als die Zellen (die Lehre aus
0132, gezogen am 2026-09-08).

**Typen aus dem Spiegel, nicht neu erfunden:** `BusinessPartnerListItem`
trägt alles, was hier gezeigt wird — `legalName`, `shortName`, `city`,
`onboardingState`, `usageBookingCount`, `lastBookingDate`, `creditorAccount`,
`debtorAccount`, `clearingAccounts`. `BusinessPartnerRowData` ist deshalb ein
Ausschnitt daraus plus `businessPartnerId`, kein eigenes Modell.

**Kann bewusst nicht:**

- **Sortieren.** Die Reihenfolge kommt vom Aufrufer; `PARTNER_SORT_KEYS` steht
  in der App, wirkt aber nicht (**L-15**: `sort`/`dir` fehlen in
  `PageRequest`). Der Katalog markiert die sortierbaren Spalten und überlässt
  den Rest `DataTable`.
- **Filtern.** Ebenso: `BusinessPartnerFilter` ist gespiegelt, die Seite setzt
  ihn (0128).
- **Das USt-Profil zeigen.** Die Liste zeigt es heute **roh** (`domestic_reverse_charge`
  statt eines Wortes) — **L-223**: `VAT_PROFILE_LABEL` lebt privat in
  `MasterDataTab.tsx`, weder GLOSSARY noch Domäne führen die Wörter. Eine
  lokale Map wäre R1 verletzt. Die Spalte entfällt, bis die Wörter da sind;
  das ist derselbe Weg, den die Wiederkehr-Regel bis zum 2026-09-09 gegangen
  ist.

## Stories

| Story | Beweist |
|---|---|
| `Filled` | Acht Spalten, sechs Zeilen aus dem Bestand: einer mit beiden Konten, einer nur Kreditor, einer nur Debitor, ein Abrechner, einer ohne jedes Konto, einer ohne Buchungen |
| `Narrow` | Ein kürzerer Satz über `columns` — die Ordnung bleibt die des Profils, auch wenn der Aufrufer sie anders übergibt |
| `States` | Die drei Reifegrade nebeneinander (`confirmed` 14.912 · `proposed` 36 · `draft` 2) |
| `Edges` | Name mit 50 Zeichen, Ort mit dem längsten Wert, drei Verrechnungskonten in einer Zelle, `usageBookingCount: 0`, `lastBookingDate: null` |
| `InUse` | 25 Zeilen in `DataTable` mit Pager und Spaltenkopf — so stellt 0128 sie |

Ausgelassen mit Grund: **lädt**, **Fehler** und die beiden Leerfälle gehören
`DataTable` und der Seite (0128), nicht dem Katalog — er liefert Spalten, keine
Tabelle.

## Ausbau

Ein **zweiter Satz** für den Konten-Reiter des Views (0127), der
`PartnerPersonalAccount` über alle Wirtschaftsjahre zeigt. Er entsteht dort,
nicht hier: seine Zeilen sind Konten, nicht Partner.

Die **USt-Profil-Spalte**, sobald L-223 erledigt ist — dann als
`PARTNER_LIST_COLUMNS` plus einem Schlüssel, ohne Umbau.

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

- [ ] Rang 1 wird von `BusinessPartnerCell` gerendert, nicht von einer zweiten
      Namensausgabe (`grep -n "legalName" business-partner-columns.tsx` findet
      nur die Übergabe an die Zelle)
- [ ] **Keine** Spalte mit einem Wort für die Rolle; die drei Kontospalten
      tragen sie (Story `Filled`, Zeilen 1–4)
- [ ] Leere Kontonummer bleibt leer — kein „—", kein „ohne" (Story `Filled`,
      Zeile 5)
- [ ] `usageBookingCount: 0` steht als **0**, nicht als Strich (`Edges`)
- [ ] Zahlen rechts mit `tnum`, Text links, nichts zentriert (§9, `Filled`)
- [ ] `columns` wählt aus und ordnet **nicht** um; Kopf, Spuren und Zellen
      kommen aus `businessPartnerColumnOrder()` (`Narrow`)
- [ ] Keine lokale Map für das USt-Profil (`grep -n "domestic_" .` → 0 Treffer)
- [ ] Ersetzt die rohe `<table>` in `partners/page.tsx` samt `AccountCell` und
      `ClearingCell` ohne Funktionsverlust

## Gebaut 2026-09-09

`business-partner-columns.tsx` neben `BusinessPartner.tsx` — acht Spalten,
sechs Exporte plus die zwei Helfer, fünf Stories. Rang 1 geht durch
`BusinessPartnerCell` (0139), nicht durch eine zweite Namensausgabe.

**Gemessen** (`scripts/cdp.mjs`, 1500 px):

| Was | Gemessen |
|---|---|
| Kopfzeile | acht Wörter in der Rangordnung des Profils: Geschäftspartner · Kreditorkonto · Debitorkonto · Verrechnung · Reifegrad · Buchungen · Letzte Buchung · Ort |
| **`columns` ordnet nicht um** | `Narrow` übergibt absichtlich verdreht (`bookings`, `partner`, `creditorAccount`) und rendert Geschäftspartner · Kreditorkonto · Buchungen — die Ordnung des Profils |
| Leere Kontospalte | wirklich **leer** (`""`), kein Gedankenstrich. Der Abrechner zeigt in beiden Kontospalten nichts und in der Verrechnung `1360 · 1361` — so sagen die drei Spalten die Rolle ohne ein Wort |
| `usageBookingCount: 0` | steht als **`0`**, nicht als Strich |
| Reifegrad | „Bestätigt" · „Vorgeschlagen" · „Entwurf" aus der Registry-Achse `partner`, keine lokale Map |
| Zeilenhöhe | 46–47 px durchgehend — keine Zeile bricht um |

**Zwei Dinge sind beim Bauen weggefallen**, die aus dem Muster
`account-columns.tsx` mitkopiert waren: die Sets `NUMERIC` und `SORTABLE`.
Sie waren hier tot — `align` und `sortable` stehen direkt an den
Spaltendefinitionen, wo man sie beim Lesen sucht, und ein Set daneben wäre eine
zweite Stelle für dieselbe Auskunft.

**Und eine Korrektur an der Prop:** `StatusBadge` heißt `status`, nicht
`value`. Die Spec sagte nichts dazu, der Typcheck schon.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide 2026-09-09 gelaufen, `exit 0` (`tsc --noEmit`; Storybook-Build nach `storybook-static`) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `business-partner-columns.tsx` + `business-partner-columns.stories.tsx`, Titel `v3/Entitäten/Geschäftspartner/businessPartnerColumns` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `businessPartnerColumns` (`:175–179`), `businessPartnerColumnOrder` (`:107–111`), `businessPartnerTracks` (`:120–123`); die vier Typ-/Konstanten-Exporte tragen erklärendes JSDoc | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `PARTNER_COLUMN_LABEL` sind Spaltenköpfe, keine Werte-Map; der Reifegrad geht über `StatusBadge axis="partner"` (`:236`), Achse in `status-registry.ts:2187` und `:2619–2629`. px nur in `TRACK` als `grid-template-columns` — dieselbe Stelle wie `account-columns.tsx:136 ff.` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | fünf von fünf: `Filled`, `Narrow`, `States`, `Edges`, `InUse`; lädt/Fehler/leer sind in der Spec `DataTable` und 0128 zugeschlagen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | ohne Browser durchgegangen; die zwei App-Punkte („ersetzt ihr v1-Gegenstück", „in §11 auf v2 gesetzt") übersprungen (backlog/README) | ✓ |
| Im Browser angesehen (Storybook) | schlanke Abnahme (Owner-Entscheid 2026-09-08): Pixel, Abstände und Farbwirkung gehen an 0119; kein Storybook gestartet | vertagt auf 0119 |
| **Schnittstelle Zeichen für Zeichen** | | |
| Drei Props, Name · Typ · Pflicht | `BusinessPartnerColumnOptions` `:150–156` — `partnerHref?`, `accountHref?`, `columns?: readonly BusinessPartnerColumn[]`: alle drei wie die Tabelle | ✓ |
| Exporte vollständig genannt | die Spec nennt sechs plus `businessPartnerColumns()`. Die Datei exportiert **acht**: es fehlt `BusinessPartnerColumnOptions` (`:150`), die auch im Barrel steht (`index.ts:476`) | ✗ |
| **Variabel** | | |
| Rang 1 durch `BusinessPartnerCell` | `:193–199`; `grep -n legalName business-partner-columns.tsx` findet nur `:139` (Typ-Ausschnitt) und `:195` (Übergabe an die Zelle) | ✓ |
| **Keine** Spalte mit einem Wort für die Rolle; die drei Kontospalten tragen sie | `PARTNER_ROLE_LABEL` wird in `src/ui` **nirgends** benutzt (grep → 0 außerhalb der Domäne). Die Kodierung ist vollständig: Story `Filled` Zeile 1 nur Kreditor, Zeile 2 nur Debitor, Zeile 3 beide (`10007` neben `70001`), Zeile 4 nur Verrechnung (`1360 · 1361` = Abrechner), Zeile 5 gar keins. Damit sind alle drei `PARTNER_ROLES` plus der Abrechner unterscheidbar | ✓ |
| Leere Kontonummer bleibt leer | `accountCell()` gibt `null` zurück (`:169`) statt durch `MonoCell`s Gedankenstrich-Zweig (`Cells.tsx:222`) zu gehen — der Kommentar `:158–164` nennt genau diesen Grund; `Filled` Zeile 5 | ✓ |
| `usageBookingCount: 0` steht als **0** | `formatCount()` (`:246`, `format.ts:83–85`) über `Intl.NumberFormat`; Stories `Edges` und `InUse` | ✓ |
| Zahlen rechts mit `tnum`, Text links, nichts zentriert | `align: "end"` nur an `bookings` (`:242`) → `DataTable.tsx:410`/`:481` setzen `v2num`, `v3.css:215` (`text-align: right; font-variant-numeric: tabular-nums`). Kein `center` in der Datei | ✓ |
| `columns` wählt aus und ordnet **nicht** um | `businessPartnerColumnOrder()` `:112–117` filtert `ORDER`; Kopf, Spuren und Zellen gehen alle drei durch dieselbe Funktion (`:127`, `:264`). Story `Narrow` übergibt absichtlich verdreht | ✓ |
| Keine lokale Map für das USt-Profil | `grep -n domestic_ business-partner-columns.tsx` → 0 | ✓ |
| Ersetzt die rohe `<table>` in `partners/page.tsx` samt `AccountCell` und `ClearingCell` | Migrationsschritt in `ludwig/app` (backlog/README) | offen (App) |

**Offen (2026-09-09):** ein Punkt — `BusinessPartnerColumnOptions` steht im
Code und im Barrel, aber nicht in der Aufzählung der Exporte. Eine Zeile in der
Schnittstelle genügt.

**Hinweis ohne Kriterium:** `ORDER` (`:43–52`) und `PARTNER_LIST_COLUMNS`
(`:66–75`) sind heute zwei buchstabengleiche Achtlisten. Wer eine Spalte
ergänzt, muss beide anfassen, und der Typcheck sagt nichts — dieselbe Sorte
zweite Wahrheit, die der Bau bei `NUMERIC`/`SORTABLE` gerade entfernt hat.
`PARTNER_LIST_COLUMNS` könnte `ORDER` sein, solange es nur einen Satz gibt.

Das Kriterium „offen (App)" hat **keine** Zeile in `docs/befunde-app.md`,
Abschnitt E — dort fehlt die ganze Geschäftspartner-Familie (0139–0143).

## Nacharbeit zur Abnahme, 2026-09-09

Ein Mangel und ein Hinweis, und der Hinweis war der wertvollere.

**M1 — `BusinessPartnerColumnOptions` fehlte in der Aufzählung der Exporte.**
Nachgetragen. Wer die Optionen typisieren will, fand den Namen sonst nur im
Code.

**Der Hinweis ohne Kriterium: `ORDER` und `PARTNER_LIST_COLUMNS` waren zwei
buchstabengleiche Achtlisten.** Wer eine Spalte ergänzt, hätte beide anfassen
müssen, und der Typcheck hätte geschwiegen — dieselbe zweite Wahrheit, die der
Bau bei `NUMERIC`/`SORTABLE` gerade entfernt hatte, zwanzig Zeilen weiter oben
wieder aufgebaut. Jetzt **ist** `PARTNER_LIST_COLUMNS` die Liste `ORDER`; ein
zweiter Satz, der weniger zeigt, wählt daraus aus.

Dass die Abnahme das ohne Kriterium gefunden hat, ist der Grund, warum sie ein
anderer machen muss als der Bau: mir ist es beim Schreiben nicht aufgefallen,
obwohl ich denselben Fehler im selben Vormittag schon einmal behoben hatte.
