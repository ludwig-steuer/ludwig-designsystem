# Geschäftspartner-Detail — Seitenprofil

| | |
|---|---|
| Status | Entwurf — geschrieben als Voraussetzung von 0127 |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/partners/[partnerId]/page.tsx` |
| Heute gebaut in | `modules/business-partners/ui/tabs/` — `PartnerTabsBar`, `MasterDataTab` (21 Felder in fünf Boxen), `AccountsTab`, `InvoicesTab`, `CasesTab`, `TechnicalTab` |
| Entitäten | `docs/entitaeten/business-partner.md` (Ränge 1–16), eingebettet: `account`, `accounting-case`, `source-document` |
| Baustein in v3 | `entities/business-partner/BusinessPartnerView.tsx` — Aufgabe **0127** |
| Profil von / am | Claude, 2026-09-10 |
| Layout | **D-L1 Zonen untereinander.** Es gibt keine Quelle zum Abgleich (kein D-L2) und keine Arbeitsfläche: die größte Liste dieser Seite sind die Personenkonten mit **p50 1 · p90 2 · max 6** — daneben etwas mitzulesen gäbe es nichts, was die schmale Spalte füllt (kein D-L3). |
| Reiter | **Übersicht · Details · Rohdaten** — drei statt der heutigen fünf; jede Streichung mit Zahl, siehe §Reiterschnitt |
| Zonendeckung | Zone 1 Kopf ✓ · Zone 2 Mängel **leer, mit Grund** · Zone 3 Fakten ✓ (Ränge 1–7, dazu die Konten) · Zone 4 **eine** Karte „Vorgänge" mit drei Zählern · Zone 5 Verlauf **leer, mit Zahl** |
| Abweichungen vom Standard | D11 „Verlauf, wo es einen Strang gibt" → **hier gibt es keinen** (74 Ereignisse über 14.950 Partner, dazu L-226). Der Reiter entfällt, bis L-226 erledigt ist. |

## Job

> Wenn **eine Kontonummer, ein Name auf einem Beleg oder ein Vorschlag der
> Maschine zweifelhaft ist**, will **die Sachbearbeiterin** **wissen, wer
> dahintersteht und was Ludwig über ihn gelernt hat**, damit **sie die Buchung
> gegen den richtigen Partner stellt.**

- **Fertig ist die Rolle, wenn** sie die Kontonummer und den Reifegrad gesehen
  hat und entweder zur Buchung zurückkehrt oder den Partner bestätigt.
- **Misslungen ist die Seite, wenn** zwei gleichnamige Partner nebeneinander
  stehen und sie nicht sagen kann, welcher gemeint ist — der Fall ist gemessen:
  beim größten Mandanten teilen sich **149 Zeilen einen `legalName`**, und
  weder Kurzname (143 Kollisionen) noch Ort (löst 35 %) entscheiden ihn. Die
  **Kontonummer** tut es: 6.288 verschiedene Debitornummern unter 6.396
  Geschwistern.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Wer ist das?" | Kopf: `legalName`, Kurzname als Beiwort | `EntityHeader` |
| 2 | „Unter welcher Nummer buche ich ihn?" | Kopf: Personenkonto mit Rolle und `intern`-Marke — **99,9 % tragen genau eines** | `AccountChip` bzw. `BusinessPartnerFacts` |
| 3 | „Darf ich ihm trauen?" | Kopf: Reifegrad (Achse `partner`) | `StatusBadge` |
| 4 | „Ist der überhaupt in Gebrauch?" | Übersicht Zone 3: Buchungen und letzte Buchung — **77 % haben 0** | `BusinessPartnerFacts` |
| 5 | „Was bucht man bei dem üblicherweise?" | Übersicht Zone 3: USt-Profil, typische Lieferung, Beschreibung — bei den **benutzten** Partnern zu 75–80 % gefüllt | `BusinessPartnerFacts all` |
| 6 | „Was läuft gerade mit ihm?" | Übersicht Zone 4: Zähler für Sachverhalte, Belege, Buchungssätze, je mit Weg in die gefilterte Liste | Karte „Vorgänge" |
| 7 | „Wo genau steht seine Anschrift, sein Kontakt?" | Reiter **Details** | `BusinessPartnerFacts` (alle 16 Ränge) |
| 8 | „Was steht wirklich im Satz?" | Reiter **Rohdaten** | `RawRecord` (0051) |

Was **nie** gefragt wird und deshalb nicht auf der Seite steht: „wie ändere ich
seine Stammdaten?" — es gibt in der App **keinen Schreibpfad** mehr auf diese
Tabelle. `updateBusinessPartner` existiert nicht, das Agenten-Tool
`update_business_partner` ist mit F127 gestrichen, geschrieben wird nur vom
Onboarding-Import und vom Workflows-Dienst. Die einzige Handlung der Rolle ist
`proposed → confirmed`, und die ist einbahnig.

## Der Reiterschnitt: drei statt fünf

Heute fünf Reiter — Stammdaten, Konten, Belege, Sachverhalte, Technik. Jede
Streichung hat eine Zahl.

| Heute | Wird | Warum, mit Zahl |
|---|---|---|
| Stammdaten | **Details** (Rang 7) | Der Name des ersten Reiters heißt überall „Übersicht" (D11); die Felder bleiben, sie stehen nur unter dem Standard-Namen |
| Konten | **fällt weg — in die Übersicht** | D11: eine Liste mit Rang ≤ 4 steht vollständig in der Übersicht. Das Personenkonto ist **Rang 2**, und p90 ist **2** Zeilen. Ein eigener Reiter für zwei Zeilen ist ein Klick auf die wichtigste Antwort der Seite |
| Belege | **fällt weg — Zähler in Zone 4** | **100 % ohne.** Unter den 57 Partnern mit Beleg: p50 1 · p90 3 · max 10. Ein Reiter, der bei 99,6 % der Partner leer ist |
| Sachverhalte | **fällt weg — Zähler in Zone 4** | **99 % ohne.** Unter den 168 mit: p50 1 · p90 4 · max 43 |
| Technik | **Rohdaten** | D12: „Rohdaten" ist der einzige Technik-Reiter, immer zuletzt, überall gleich benannt. `TechnicalTab` **ist** dieser Reiter, er heißt nur anders |
| — | **kein Verlauf** | 74 Ereignisse im **ganzen Bestand** (14.950 Partner), verteilt auf drei `resource_kind`-Werte (`business_partner` 39, `creditor` 33, `debtor` 2). Ein Verlauf, der bei praktisch jedem Partner leer ist, und dazu einer, der ohne L-226 nur ein Drittel zeigt |

**Der Zähler ist nicht der kleine Bruder des Reiters.** Er beantwortet Frage 6
(„was läuft gerade mit ihm?") vollständig — die Zahl ist die Antwort —, und
sein Weg führt in die **Liste der jeweiligen Entität, gefiltert auf diesen
Partner**, nicht in eine zweite Liste auf dieser Seite. Dort steht sie mit
Sortierung, Filter und Pager; hier stünde sie ohne.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Einen vorgeschlagenen Partner bestätigen (`proposed → confirmed`) | **38 Partner im Bestand** (36 proposed, 2 draft) — also selten, aber es ist die einzige Handlung der Seite | einen Knopf oben rechts |
| Die Kontonummer für die Buchung ablesen und zurückspringen | häufig — es ist der Grund, warum die Seite meist geöffnet wird | **nichts**: sie steht im Kopf |
| Prüfen, ob zwei Partner derselbe sind | selten, aber teuer wenn es misslingt | einen Blick in Details (Anschrift, USt-IdNr.) |

## Was hier nicht hingehört

- **Ein Editor für die Stammdaten.** Es gibt keinen Schreibpfad (§Job). Ein
  Formular ohne Ziel wäre ein Versprechen ohne Deckung.
- **Die Liste der Partner.** Sie ist eine eigene Seite; der Weg zurück steht
  im `RecordPager` mit ihrem Namen (D7).
- **„Top-Kreditoren" oder ähnliche Ranglisten.** Der Owner hat die Kachel vom
  Mandantenjahr genommen, mit dem Satz, der auch hier gilt: über eine so
  flache Verteilung sortiert eine „Top"-Liste Rauschen.
- **Der Vorschlags-Review (`CreditorProposalsReview`).** Er zeigt
  Vorschlags-**Kandidaten**, keine Partner — eine andere Entität, eine andere
  Seite.

## Zweifel am heutigen Format

1. **Fünf Reiter für einen Datensatz mit 16 Rängen**, zwei davon bei 99 %
   der Partner leer. Folgerung: der Schnitt oben.
2. **Der Kopf zeigt die Verrechnungskonten nicht.** Die 12 Abrechner
   (0,08 %) tragen weder Kreditor- noch Debitornummer — im Kopf steht bei
   ihnen also **nichts**, wo bei allen anderen die Nummer steht. Folgerung:
   das Verrechnungskonto füllt denselben Platz, mit seinem eigenen Wort.
3. **Das USt-Profil stand als roher Enum-Wert in der Liste** (L-223).
   Folgerung: erledigt am 2026-09-10, die Wörter kommen aus der Domäne.
4. **Kontakt-Felder werden nirgends gezeigt** (`contactEmail` 14 %,
   `contactPhone` 39 %). Zwei Spalten mit Wert, die keine Form kennt.
   Folgerung: sie stehen im Reiter Details, Rang 14.

## Offene Fragen

1. **Führt der Zähler in die gefilterte Liste?** Die Belegliste und die
   Sachverhaltsliste müssen dafür einen Filter auf `business_partner_id`
   kennen. *Ohne Antwort:* der Zähler steht ohne Weg, und das Fehlen des
   Filters ist ein Befund für die App.
2. **Bleibt es bei drei Reitern?** Der Schnitt oben ist aus den Zahlen
   abgeleitet; der Owner sieht die Seite im Alltag. *Ohne Antwort:* drei.
3. **Braucht der Abrechner eine eigene Kopfzeile?** *Ohne Antwort:* ja — das
   Verrechnungskonto steht an der Stelle des Personenkontos, mit dem Wort
   „Verrechnung", weil der Platz sonst leer bleibt.
