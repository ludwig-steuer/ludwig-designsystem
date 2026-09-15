# 0182 · PaymentAccountSettingsList — Bankkonten und Kasse konfigurieren

| | |
|---|---|
| Status | spec |
| Stufe | `entities/payment-account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Auszugserwartung, Zahlungsart, DATEV-Anbindung |
| Quelle | Entitätsprofil `docs/entitaeten/payment-account.md`, Abschnitt „Listen" (zweite Zeile), „Zuschnitt" |
| Ersetzt | in `ludwig/app` die Handtabelle in `configuration/payment-accounts/page.tsx` (372 Z.) und `PaymentChannelActivitySection` (Abschalt-Vorschläge) |
| Blockiert | nichts; sie ist die letzte Liste des Profils |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Beim Einrichten eines Mandanten entscheidet die Kanzlei drei Dinge je Konto:
liefert es Auszüge, welche Zahlungsart landet automatisch hier, und läuft es
überhaupt noch. Die 25 bis 43 Konten eines Mandanten sind dabei zu 80 % Kulisse
aus dem Kontenrahmen — deshalb stehen die geführten oben, nicht alphabetisch
dazwischen.

## Einordnung

- **Wiederverwenden:** `paymentAccountColumns()` (0180) mit `SETTINGS_COLUMNS`,
  `DataTable` mit Abschnitten (0149) und Auswahl (0057).
- **Neu, weil:** Regel 6 — eigener Job; nach §8 eine eigene Komponente, weil
  Grundgesamtheit, Spaltensatz und Massenaktion abweichen.
- **Zuschnitt:** eine Datei.
- **Setzt auf:** `DataTable` (Gruppen, `selection`), `paymentAccountColumns`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `inUse` / `others` | `readonly PaymentAccountRowData[]` | ja | die beiden Abschnitte — „in Gebrauch" und „weitere aus dem Kontenrahmen"; die Trennung rechnet der Aufrufer mit `isPaymentAccountInUse()` | `Filled` |
| `head` | `{ title, sub?, meta?, actions? }` | ja | Zone 1 | `Filled` |
| `columns` | `readonly PaymentAccountColumn[]` | nein | Vorgabe `SETTINGS_COLUMNS` | `Filled` |
| `retireAction` | `AnyBulkAction` | nein | „Abschaltung bestätigen" über die Auswahl; ohne sie hat die Liste keine Häkchen | `Retire` |
| `rowActions` | `(row) => AnyRowAction[]` | nein | „Bearbeiten" je Zeile (der Editor ist eine Seite) | `Filled` |
| `empty` | `{ title, description? }` | nein | Vorgabe: „Keine Zahlungskonten — sie entstehen mit dem DATEV-Abgleich." | `Empty` |
| `loading`, `error` | wie `DataTable` | nein | | `LoadingAndError` |
| `statementHref`, `accountHref` | Funktionen | nein | Wege | `Filled` |

**Kann bewusst nicht:** bearbeiten (das ist der Editor), abschalten ohne
Bestätigung (die Massenaktion bestätigt, R-Regel A7), filtern über mehr als die
Abschnitte.

## Verhalten

Server-Component; die Auswahl ist die Insel von `DataTable`. Die beiden
Abschnitte tragen ihre Zahl im Kopf. Ein leerer Abschnitt **fehlt**, außer
„in Gebrauch": steht dort nichts, sagt der Abschnitt es in einem Satz — ein
Mandant ohne geführtes Konto ist der Fall, den die Einrichtung sucht
(`emptyHint` von `TableGroup`).

## Stories

Titel `v3/Entitäten/Zahlungskonto/PaymentAccountSettingsList`.

| Story | Beweist |
|---|---|
| `Filled` | zwei Abschnitte mit Zahlen, Konfigurations-Spalten, Zeilenaktion „Bearbeiten" |
| `Retire` | Auswahl mit der Massenaktion „Abschaltung bestätigen" |
| `NoneInUse` | „in Gebrauch" leer, mit Satz statt Leerzeile |
| `Empty` | gar keine Konten |
| `LoadingAndError` | Kopf und Spaltenkopf bleiben stehen |

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

- [ ] Die geführten Konten stehen oben, jeder Abschnitt mit seiner Zahl (Story `Filled`)
- [ ] „in Gebrauch" leer sagt einen Satz, „weitere" leer fehlt ganz (Story `NoneInUse`)
- [ ] Ohne `retireAction` gibt es keine Häkchen (Story `Filled` gegen `Retire`, DOM)
- [ ] Ersetzt die Handtabelle der Konfigurationsseite ohne Funktionsverlust

## Offene Fragen

Keine — die Entscheidungen stehen im Profil.
