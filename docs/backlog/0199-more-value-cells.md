# 0199 · Weitere Wertzellen — Ja/Nein, Prozent, IBAN

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-24, fremde Abnahme steht aus |
| Stufe | `primitives/` — Familie `Cells.tsx`, Formatierer in `format.ts` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Ja/Nein-Merkmale, Quoten, Bankverbindungen |
| Quelle | Owner 2026-09-24 über app-b9, Nachtrag zu 0197: 7 Zellen mit lokalem `? "Ja" : "Nein"`, 3 Prozent-Stellen (Anteil, Steuersatz), IBAN in `entities/payment-account` |
| Ersetzt | lokale Ja/Nein- und Prozent-Formatierung in der App (app-b9 zählt die Stellen beim Umbau); `MonoCell` für IBAN in `payment-account-columns.tsx:120` und `PaymentAccountDrawer.tsx:91` |
| Blockiert | 0198 (`percentColumn`) |
| Spec von / am | Claude, 2026-09-24 |

## Ziel

Ein Ja/Nein, ein Steuersatz und eine IBAN sehen in jeder Tabelle gleich aus
und werden mit derselben Funktion zu Text wie außerhalb. Heute baut jede
Stelle ihr eigenes „Ja"/„Nein", und die IBAN steht ungruppiert als
22-stellige Zeichenkette.

## Einordnung

- **Wiederverwenden:** `MonoCell` (Geometrie für Kennungen), `ValueHint` und
  `CellHint` (0197), `DeviationCell`. Die Abweichungszelle ist für einen
  Anteil zu speziell: Sie hat ein Vorzeichen und einen Vier-Stufen-Ton.
- **Neu (Regel 3):** drei Zellen mit je einer Funktion in `format.ts`. Keine
  davon lässt sich in 15 Zeilen an der Aufrufstelle bauen, ohne die
  Formatierung wieder lokal zu machen.
- **IBAN:** Die Vierergruppierung liegt nirgends zentral.
  `src/ludwig/shared/iban.ts` hat nur `validateIban`. `formatIban` ist neu.
- **Zuschnitt:** Familie `Cells.tsx` (wie 0197).
- **Confidence ist nicht Prozent** (Owner 2026-09-24): Eine Konfidenz ist eine
  Ampel mit Schwellen, die Zahl steht nur im Hover. Das bleibt bei
  `patterns/Confidence.tsx` und ist nicht Teil dieser Aufgabe. `PercentCell`
  ist ein Anteil oder ein Satz, als Zahl gelesen.

## Schnittstelle

| Export / Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `formatBoolean(value)` | `boolean \| null → string` | — | „Ja" / „Nein" / „—" | `MoreValues` |
| `BooleanCell.value` | `boolean \| null` | ja | Wort, links, kein Häkchen; `null` → „—" | `MoreValues` |
| `formatPercent(value, digits?)` | `number \| null, number → string` | — | `value` in **Prozentpunkten** (19 → „19 %"), Vorgabe 0 Nachkommastellen, geschütztes Leerzeichen vor „%" | `MoreValues` |
| `PercentCell.value` / `digits` / `hint` | `number \| null`, `number`, `CellHint` | ja / nein / nein | rechts, `tnum`, `null` → „—" | `MoreValues` |
| `formatIban(raw)` | `string \| null → string` | — | Leerzeichen raus, groß, in Vierergruppen | `MoreValues` |
| `IbanCell.value` | `string \| null` | ja | mono, links, `title` = ungruppiert zum Kopieren; `null` → „—" | `MoreValues`, `payment-account` |

**Kann nicht (bewusst):**
- Die IBAN prüfen, das tut `validateIban`.
- Ein Häkchen statt Wort zeigen. Ein Wort ist ohne Legende lesbar (V7), ein
  Häkchen im Sinne von „erledigt" ist eine Icon-Zelle (Owner-Liste, eigene
  Aufgabe).
- Eine Konfidenz zeigen, siehe oben.

## Verhalten

- Server-Components, bis auf das Hinweis-Zeichen. Es gibt keinen Zustand
  außer gefüllt und leer. „Lädt", „Fehler" und „leer nach Filter" gelten für
  eine Zelle nicht (siehe 0197).

## Stories

Titel `v3/Primitives/Tabelle/Zellen`. Eine Story `MoreValues`: je Typ eine
Spalte mit gefülltem Wert, Grenzfall und `null`. Dazu kommen die bestehenden
Stories von `payment-account` als Einsatz.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| IBAN kopieren per Knopf | `IbanCell.copy?` mit `CopyTextButton` | eine Seite, auf der IBANs abgeschrieben werden |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `formatBoolean`/`BooleanCell`: „Ja", „Nein", „—" (Story `MoreValues`)
- [ ] `formatPercent(19)` → „19 %", `formatPercent(7.5, 1)` → „7,5 %", rechtsbündig (Story `MoreValues`)
- [ ] `formatIban("de12250500000123456789")` → „DE12 2505 0000 0123 4567 89"; `title` ungruppiert (Story `MoreValues`)
- [ ] `payment-account`-Spalte „Kennung" und Drawer zeigen die IBAN gruppiert (Stories von `payment-account`)

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Bau (2026-09-24)

Gebaut wie spezifiziert. Leerzeichen vor „%" ist ein geschütztes (U+00A0), damit
„19 %" in einer schmalen Spalte nicht bricht. `payment-account-columns.tsx`
(„Kennung") und `PaymentAccountDrawer.tsx` zeigen die IBAN über `IbanCell`,
eine Kartenkennung ohne IBAN weiter über `MonoCell`.

Selbst angesehen (nicht die Abnahme): `Zellen/MoreValues`,
`PaymentAccountList/Filled`, `PaymentAccountDrawer/Filled` bei 1300 px,
IBAN gruppiert („DE89 3704 0044 0532 0130 00"), keine Konsolenfehler.
