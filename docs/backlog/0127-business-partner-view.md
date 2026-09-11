# 0127 · Die Seite des Geschäftspartners — und der gemeinsame Detailrahmen

| | |
|---|---|
| Status | **in Arbeit** — fremd abgenommen 2026-09-11, Verhalten ok; nur die Story-Namen in der Spec waren nachzuziehen (erledigt am selben Tag), Nachprüfung offen |
| Stufe | `patterns/DetailView.tsx` (neu) · `src/showcase/partner/` (Seiten-Stories) |
| Klassen-Test | Rahmen: „Ergäbe das auch in einer Versicherungs-App Sinn?" → **ja**, er kennt keine Entität, nur Slots → `patterns/`. Die Seite selbst gehört der App und lebt in `showcase/` |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md` · Seitenprofil `docs/seiten/partner-detail.md` (mit dieser Aufgabe geschrieben) · Auftrag `app-03` im Namen des Owners, 2026-09-10 |
| Löst ein | **0138 Weg 1** — der gemeinsame Rahmen, dessen Auslöser diese Nummer war |
| Ersetzt | `partners/[partnerId]/page.tsx` samt `PartnerTabsBar`, `MasterDataTab`, `TechnicalTab`, `AccountsTab`, `InvoicesTab`, `CasesTab` |
| Spec von / am | Claude, 2026-09-10 |

## Das Ergebnis in einem Satz

**Es gibt keinen `BusinessPartnerView`** — es gibt einen `DetailView` für alle,
und der Partner ist sein erster Aufrufer.

## Warum keine vierte Rahmen-Komponente

0138 hat die Frage offengehalten, mit einem Satz, der jetzt eingelöst ist:

> Drei Rahmen mit derselben Struktur können immer noch drei Rahmen sein, die
> zufällig gleich aussehen; erst der vierte Fall zeigt, ob die Struktur trägt.

Der vierte Fall ist dieser, und er brauchte **nichts**, was die drei nicht
haben: keinen zusätzlichen Slot, keine Randspalte, keinen zweiten Inhaltsblock
zwischen Kopf und Reitern. Ein `BusinessPartnerView` hätte nichts getragen als
seinen Namen.

Also: `patterns/DetailView.tsx` mit den fünf Slots des Standards (D3), und der
Showcase-Rahmen `PartnerPage` setzt ihn zusammen — so wie `DocumentPage` es für
0144 tut.

**Die drei bestehenden Rahmen bleiben**, bis der Owner ihre Migration freigibt.
Sie sind dieselben fünf Slots unter einem Entitätsnamen; was sie zusätzlich
tragen, ist bei zweien nichts und bei `LedgerAccountView` das Paar
`summary`/`chart` — **Inhalt**, kein Signal (0138s eigene Korrektur). Der
`DetailView` kennt es bewusst nicht: wenn die Kontoseite umzieht, bringt sie
den Slot mit ihrer eigenen Begründung mit.

### Was der Rahmen nicht erfindet

`minDetail` hat **keinen Default**. Beide bestehenden Werte wurden in Abnahmen
gegen eine gemessene Seite erkämpft — 460 px neben den Fakten eines
Sachverhalts (0050), 960 px neben der siebenspaltigen Tabelle eines Kontos
(0063). Ein Rahmen, der hier eine Zahl erfände, überstimmte beide still.

## Der Reiterschnitt: drei statt fünf

Aus dem Seitenprofil, jede Streichung mit Zahl:

| Heute | Wird | Zahl |
|---|---|---|
| Stammdaten | **Details** | D11: der erste Reiter heißt überall „Übersicht" |
| Konten | **in die Übersicht** | Rang 2, p90 **2 Zeilen** — ein Reiter dafür wäre ein Klick auf die wichtigste Antwort |
| Belege | **Zähler** | **100 % ohne**; unter den 57 mit: p50 1 · p90 3 |
| Sachverhalte | **Zähler** | **99 % ohne**; unter den 168 mit: p50 1 · p90 4 |
| Technik | **Rohdaten** | D12: eine Technik-Sicht, immer zuletzt, überall gleich benannt |
| — | **kein Verlauf** | 74 Ereignisse im ganzen Bestand (14.950 Partner), verteilt auf drei `resource_kind`-Werte (L-226) |

## Schnittstelle `DetailView`

| Prop | Bedeutung | Nachweis |
|---|---|---|
| `pager` | Woher die Leserin kam, wo der nächste Satz ist | `Typical` |
| `header` | Der Satz selbst (`EntityHeader`) — Pflicht | alle |
| `signal` | **Eines** für den ganzen Satz, nie ein Stapel | `Proposed` |
| `tabs` | Die Reiterleiste; ohne sie fällt die Zeile weg | alle |
| `aside` | Was **neben** dem Körper mitgelesen wird (D-L3); leer → eine Spalte | — (der Partner braucht keine) |
| `minDetail` | Der Boden der Körperspalte, ohne Default | — |

**Kann bewusst nicht:** eine eigene Höhe oder einen Scroll-Container setzen.
Ränge 1–4 müssen ohne Scrollen dastehen; wer hier eine Höhe setzt, nimmt genau
das weg.

## Stories

| Story | Beweist |
|---|---|
| `Typical` | Ein bestätigter Kreditor mit Buchungen — Rang 1–4 über der Falz |
| `NoActivity` | Die Karteileiche, und sie ist der Regelfall: **77 %** haben null Buchungen |
| `Proposed` | Die einzige Handlung der Seite, als **ein** Knopf im Signal-Slot (D8) |
| `BillingProvider` | Verrechnungskonto an der Stelle des Personenkontos — sonst stünde dort nichts (12 Partner) |
| `DuplicateName` | Zwei gleichnamige nebeneinander; die Kontonummer entscheidet, nicht der Ort |
| `Reiter` | „Details" mit allen 16 Rängen, „Rohdaten" statt „Technik" |

## Messung 2026-09-10 (1440 × 900)

- Der Rahmen rendert **vier** Slots (Pager 28 px · Kopf 113 · Reiter 43 ·
  Körper 879); der Signal-Slot fällt beim bestätigten Partner mit seinem
  Abstand weg
- Reiter: **Übersicht · Details · Rohdaten**
- Rang 4 („Buchungen") steht bei y ≈ 788 — **über der Falz**
- Unter der Falz bleibt **eine** Karte: „Vorgänge" (Rang 6)
- **Korrektur beim Messen:** die Übersicht zeigte die Fakten zuerst mit `all`.
  Die Karte war damit 1.160 px hoch, „Personenkonten" begann bei y ≈ 1.190,
  und USt-Profil samt Verhalten standen zweimal auf der Seite — einmal hier,
  einmal im Reiter „Details". Jetzt trägt die Übersicht die Kurzfassung, der
  Reiter die ganze Liste: Körper 879 statt 1.160 px

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente; Status nur über Registry
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen

Variabel (aus dieser Spec):

- [ ] `DetailView` trägt die fünf Slots des Standards in der Reihenfolge D3;
      ein leerer Slot fällt **mit seinem Abstand** weg
- [ ] `minDetail` hat keinen Default
- [ ] Der Kopf trägt **einen** Zustand (Reifegrad) — Rolle, USt-Profil und
      typische Lieferung stehen in den Fakten, nicht im Kopf (D6/D7)
- [ ] Beim Abrechner steht das Verrechnungskonto an der Stelle, an der sonst
      die Personenkontonummer steht
- [ ] Drei Reiter, und „Rohdaten" ist der letzte (D12)
- [ ] Ein Zähler auf **null** ist kein Link (ein Weg auf eine leere Liste
      führt ins Nichts)
- [ ] Die Übersicht schreibt nicht — es gibt keinen Schreibpfad auf die
      Stammdaten (D1)

## Offene Fragen

1. ~~**Führt der Zähler in die gefilterte Liste?**~~ **Beantwortet am
   2026-09-10** (ludwig-manager, geprüft): die **Belegliste** filtert wirklich
   (`?partner=<uuid>` → `parseInvoiceFilter` → `businessPartnerId`), der Weg
   steht. Die **Sachverhaltsliste** nicht: `?partner=` öffnet dort nur den
   Drawer, das Filterfeld `counterpartyPartnerId` existiert im Kern
   (`listCasesForClient`, F101), die Listenseite bildet den Parameter aber
   nicht darauf ab. Der Sachverhalts-Zähler hat also **noch keinen Weg** — App-Befund,
   von der App-Seite als Auftrag übernommen.
2. **Wandern die drei bestehenden Rahmen auf `DetailView`?** *Ohne Antwort:*
   nein, sie bleiben; der Owner gibt die Migration frei.

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761 (für 0152/0157 bca4b7d); statische Checks alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: typecheck, build, @when, kein px, Registry | Checks oben; `DetailView.tsx` JSDoc | ok |
| Fünf Slots in Reihenfolge D3; leerer Slot fällt mit Abstand weg | `partner-detail--typical`: `v2pager 0–28 · v2ehead 48–161 · v2tabs 181–224 · Körper 244–968` (kein Signal-Slot, gleicher 20-px-Abstand); `--proposed`: `v2callout 184–301` zwischen Kopf und Reitern | ok |
| `minDetail` ohne Default | `DetailView.tsx:85 minDetail?: number`, `:100` nur durchgereicht | ok |
| Kopf trägt **einen** Zustand | `.v2ehead [title]`: „Geschäftspartner: Bestätigt" (1 Badge + Info-Knopf); Rolle/Ort als Meta-Text | ok |
| Abrechner: Verrechnungskonto an der Kontostelle | `--billing-provider` Kopf: „Verrechnung 1370 · 1371" statt „Kreditor 7xxxx" | ok |
| Drei Reiter, „Rohdaten" zuletzt | „Übersicht Details Rohdaten" in allen sechs Exporten | ok |
| Zähler auf null ist kein Link | `--no-activity`: „Sachverhalte keine" / „Belege keine" ohne `<a>`; `--typical`: „Sachverhalte 4 ansehen" mit Link | ok |
| Übersicht schreibt nicht | 0 `input/textarea/select`, keine Bearbeiten-Knöpfe in `--typical` | ok |
| Rang 4 über der Falz | `--typical` @1440: Karte „Personenkonten" 558, „Vorgänge" 775 (< 900) | ok |
| Spec beschreibt das Gebaute | **Stories-Tabelle nennt `Normalfall`, `Vorgeschlagen`, `Abrechner`, `Namensdublette`; gebaut (Owner-Regel „Code englisch") sind `Typical`, `Proposed`, `BillingProvider`, `DuplicateName` (`PartnerDetail.stories.tsx`). Schnittstellen-Tabelle „Nachweis: Normalfall/Vorgeschlagen" ebenso** | **Mangel (Spec-Nachzug)** |

**Urteil: in Arbeit** — nur Doku: Story-Namen in Spec 0127 (Stories-Tabelle, Nachweis-Spalte, Messungs-Absatz) auf die englischen Exporte ziehen. Verhalten vollständig ok.

### Nacharbeit 2026-09-11 (durch den Bauenden, Nachprüfung offen)

Story-Namen in Schnittstellen-, Stories- und Messungsteil auf die englischen Exporte gezogen: `Typical`, `Proposed`, `BillingProvider`, `DuplicateName`.
