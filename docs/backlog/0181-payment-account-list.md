# 0181 · PaymentAccountList — die Konten mit Bewegung

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/payment-account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Kontoauszug, Sachkonto, Zahlungen ohne Sachverhalt |
| Quelle | Entitätsprofil `docs/entitaeten/payment-account.md`, Abschnitt „Listen" (erste Zeile), „Zuschnitt" |
| Ersetzt | in `ludwig/app` die Tabelle in `[year]/banks/page.tsx` (180 Z.) |
| Blockiert | das Seitenprofil `kontoauszug` (die Seite darüber), 0168 |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Montagmorgen: **welchen Auszug muss ich öffnen?** Die Liste beantwortet das mit
zwei Zahlen je Konto — was sich bewegt hat, und was davon noch keinem
Sachverhalt zugeordnet ist.

## Einordnung

- **Wiederverwenden:** `paymentAccountColumns()` (0180) trägt die Zellen,
  `DataTable` den Rahmen.
- **Neu, weil:** Regel 6 aus `entitaet-analysieren` §7 — ein Listen-Job mit
  eigener Grundgesamtheit.
- **Zuschnitt:** eine Datei, eine Komponente. **Nicht** dieselbe wie die
  Konfiguration: die beiden unterscheiden sich in Grundgesamtheit, Spaltensatz
  und Massenaktion (§8, Frage 2 des Profils, bestätigt).
- **Setzt auf:** `DataTable`, `paymentAccountColumns` (0180).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `accounts` | `readonly PaymentAccountRowData[]` | ja | die Konten, **fertig sortiert** — Bewegung absteigend (Entscheidung des Profils); die Liste sortiert nicht (E2) | `Filled` |
| `head` | `{ title, sub?, meta?, actions? }` | ja | Zone 1 | `Filled` |
| `columns` | `readonly PaymentAccountColumn[]` | nein | Vorgabe: `MOVEMENT_COLUMNS` plus `unassigned` | `Filled` |
| `sort`, `href` | wie `DataTable` | nein | Sortierung über die URL | `Sorted` |
| `empty` | `{ title, description?, action? }` | nein | Vorgabe: „Kein Konto hat in diesem Jahr Bewegung." mit dem Weg zum Import | `Empty` |
| `loading`, `error` | wie `DataTable` | nein | | `LoadingAndError` |
| `statementHref`, `accountHref`, `unassignedHref` | Funktionen | nein | Wege zum Auszug, zum Sachkonto und zu den offenen Zahlungen eines Kontos | `Filled` |

**Kein Pager, kein Filter:** vier geführte Konten je Mandant im Bestand (max
43 insgesamt, davon 23 in Gebrauch über alle sieben Mandanten) — beides wäre
Mechanik ohne Anlass (§8).

## Verhalten

Server-Component. Die Spalte „offene Zahlungen" zeigt die Zahl der Bankzeilen
ohne Sachverhalt; ist sie 0, steht ein Haken-Satz statt einer Null, denn 0 ist
hier das Ziel (L6). Mit `unassignedHref` ist die Zahl ein Weg dorthin.

## Stories

Titel `v3/Entitäten/Zahlungskonto/PaymentAccountList`.

| Story | Beweist |
|---|---|
| `Filled` | vier Konten, Bewegung absteigend, offene Zahlungen mit Weg |
| `Sorted` | Sortierung über die URL an „Saldo" |
| `Empty` | „Kein Konto hat in diesem Jahr Bewegung." mit dem Weg zum Import |
| `LoadingAndError` | Kopf und Spaltenkopf bleiben stehen |

Nicht anwendbar: leer nach Filter (es gibt keinen), Pagination.

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

- [ ] Die Liste sortiert nicht selbst (Grep: kein `sort(` in der Datei)
- [ ] „offene Zahlungen" = 0 sagt einen Satz, keine Null (Story `Filled`)
- [ ] Kein Pager, kein Filter (Story `Filled`, DOM)
- [ ] Ersetzt die Tabelle in `banks/page.tsx` ohne Funktionsverlust

## Offene Fragen

Keine — die Entscheidungen stehen im Profil.

## Gebaut (2026-09-15)

`PaymentAccountList.tsx`, im Barrel. Die Spalte „Offene Zahlungen" ist neu im
Katalog (0180): eine Zahl mit Weg, und bei 0 der Satz „alles zugeordnet" statt
einer Null (L6).

Gemessen (CDP, Storybook 6107):

| Story | Beobachtung |
|---|---|
| `Filled` | drei Konten, kein Pager, kein Filter; „3 offen" führt zu den Zahlungen ohne Sachverhalt, „alles zugeordnet" steht ohne Weg |
| `Sorted` | Sortierpfeil an „Saldo", der Zustand kommt über die URL |
| `Empty` | „Kein Konto hat in diesem Jahr Bewegung." mit dem Satz zum Import |
| `LoadingAndError` | Kopf und Spaltenkopf bleiben stehen |

`pnpm typecheck`, alle vier Guards und `pnpm build` grün; Screenshots
angesehen. Abnahme durch einen anderen Agenten steht aus.
