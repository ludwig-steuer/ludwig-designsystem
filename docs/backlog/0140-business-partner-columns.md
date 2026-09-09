# 0140 · `businessPartnerColumns()` — der Spaltenkatalog der Geschäftspartner

| | |
|---|---|
| Status | spec — geschrieben 2026-09-09 |
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

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
