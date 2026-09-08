# 0026 · OpenItemLinkRow — die Klammer Rechnung ↔ Zahlung

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06 zurückgestellt — wartet auf einen Bildschirm, siehe Abschnitt „Freigabe" |
| Stufe | `entities/open-item-link/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, eine Ausgleichs-Zuordnung ist Buchhaltung |
| Quelle | Soll-Katalog §11.7 Stufe 3 „Ausgleichs-Zuordnung — fehlt (§3.1)"; `ui-repraesentationen.md` §3.2 Nr. 3 |
| Ersetzt | den abgeleiteten Text in `cases/[caseId]/page.tsx` und die Gegenstands-Liste in Abnahme-Schritt 4 |
| Blockiert | Abnahme-Schritt 4, Sachverhalt-Detail, den OPOS-Blick von der Zahlung her |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Seit F77 ist die Zuordnung „diese Zahlung gleicht jene Rechnung aus" eine
eigene Tabelle — im UI ist sie ein Satz Fließtext. Die Sachbearbeiterin sieht
nicht, welche Rechnung an welcher Zahlung hängt, wie viel davon zugeordnet
wurde und ob Ludwig oder die Kanzlei die Klammer gesetzt hat. Bei einer
Teilzahlung mit Skonto ist genau das die Frage.

## Einordnung

- **Wiederverwenden:** `ComparisonTable` stellt zwei Stände gegenüber, nicht
  zwei Belege einer Klammer. `FieldList` zeigt Schlüssel und Wert, aber keine
  Paar-Beziehung mit Differenz.
- **Neue Entitäts-Form, weil:** Regel 5 — `ui-repraesentationen.md` §3.1
  führt die Ausgleichs-Zuordnung ohne jede Darstellung, §3.2 an Platz 3.
- **Zuschnitt:** eine Datei, ein Export (`OpenItemLinkRow`). Die
  Gegenüberstellung ist eine Zeile, kein Zweispalter — sie steht in Listen.
- **Setzt auf:** `Row`, `AmountCell`, `Timestamp`, `TextButton` (0011) für den
  Sprung zum Beleg, `StatusBadge` für den verwaisten Zustand.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `link` | `OpenItemLink` | ja | Die Klammer (Felder unten) | `Filled` |
| `invoice` | `{ label: string; date: string; amount: number }` | ja | Die Rechnungsseite, wie sie in der Zeile steht | `Filled` |
| `payment` | `{ label: string; date: string; amount: number } \| null` | ja | Die Zahlungsseite; `null` = noch offen | `Unpaid` |
| `currency` | `Currency` | nein | Default `"EUR"` | `Filled` |
| `onOpen` | `(entryId: string) => void` | nein | Sprung in den Buchungssatz | `Interactive` |

Felder aus `ludwig.client_open_item_links`: `accountNumber`, `belegfeldValue`,
`amountAllocated`, `matchedBy`, `rationale`, `orphanedAt`, `belegfeldState`.

`matchedBy` ist die Herkunft der Klammer und gehört sichtbar in die Zeile —
gesetzt beim Buchen, aus dem Spiegel-Import oder von Hand. GLOSSARY:
`open item link`, deutsch „Ausgleichs-Zuordnung" oder „Klammer"; im UI steht
das deutsche Wort.
**Befund für `ludwig/app`:** in `src/ludwig/` fehlt der Typ; ein
`OpenItemLink`-Interface gehört dorthin, nicht in diese Komponente.

Was die Zeile **nicht** kann: eine Klammer setzen oder lösen (das ist eine
Handlung des Moduls), Skonto rechnen, und sie rät nie: mehrdeutig heißt keine
Klammer, so wie die Schreibregel es vorgibt.

## Verhalten

Server-Component ohne `onOpen`. Beide Seiten stehen mit Betrag rechts und
`tnum`; die **Differenz** steht als eigene Zahl daneben und trägt nur dann
eine Tonstufe, wenn sie nicht null ist — ein Vorzeichen allein bekommt keine
Farbe (V6, A7). `orphanedAt` macht aus der Zeile einen sichtbaren Sonderfall
(„verwaist seit …", Wort plus Ton, V7), sie verschwindet nicht. `rationale`
steht als `title` an der Herkunft, nicht als Dauertext.

## Stories

Titel `v3/Entitäten/Ausgleichs-Zuordnung/OpenItemLinkRow`. Abgeleitet nach §6:
3 Zustände (gefüllt, leer, Fehler) + 1 Callback + 1 „im Einsatz" + 1 Rand
(Teilzahlung, verwaist) = 6.

| Story | Beweist |
|---|---|
| `Filled` | Rechnung und Zahlung, Differenz null |
| `Partial` | Teilzahlung mit Differenz und Skonto-Rest |
| `Unpaid` | Rechnung ohne Zahlung — die Klammer wartet |
| `Orphaned` | verwaiste Klammer mit Datum und Grund |
| `Interactive` | Klick öffnet den Buchungssatz |
| `InCase` | drei Klammern in der Sachverhalt-Karte |

Nicht anwendbar: `Laedt` (der Aufrufer zeigt `Skeleton`, 0016),
`LeerNachFilter`.

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

- [ ] Die Differenz steht als eigene Zahl, nicht als Farbe der Beträge (Story `Partial`, Regel V6)
- [ ] `matchedBy` ist in der Zeile lesbar (Story `Filled`)
- [ ] Verwaiste Klammern verschwinden nicht, sie werden benannt (Story `Orphaned`, Regel V7)
- [ ] Beträge rechts mit `tnum`, Konto mono (Story `Filled`, Regel V3)
- [ ] Ersetzt den abgeleiteten Text in `cases/[caseId]/page.tsx` ohne Funktionsverlust

## Offene Fragen

1. Eine Zeile je Klammer oder je Rechnung? *Ohne Antwort: je Klammer — eine
   Rechnung kann mehrere Zahlungen haben, und jede ist ein eigener Vorgang.*
2. Gehört `belegfeldState` in die Zeile? *Ohne Antwort: nur wenn er nicht
   `computed` ist — sonst ist er Rauschen.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: zurückgestellt (Status offen).** Zwei Gründe: (1) Story `Unpaid` (`payment: null`) widerspricht dem Schema — `client_open_item_links` erzwingt genau eine Zahlungsseite (Migration `20260815120000_open_item_links.sql:72–75`); eine Rechnung ohne Zahlung ist eine Erwartung (0025) oder ein OPOS (0029). (2) Kein Bildschirm liest die Klammer heute als Paar: das Sachverhalt-Detail zeigt DATEV-OPOS-Zeilen, Abnahme-Schritt 4 zeigt Gate-Zeilen, das Seitenprofil nennt die Klammer in keiner Frage. Ohne Ort greift §3 Regel 5 nur formal.

Entscheid: die Zeile wird gebaut, sobald eine Seite sie braucht — Kandidat ist der Saldo-/DATEV-Reiter der Sachverhaltsansicht (0050) oder die OPOS-Seite von der Zahlung her; das entscheidet der Owner beim Seitenprofil. Bis dahin gilt: `payment` Pflicht ohne `null`, `Unpaid` streichen, `Empty`/`Error` aufnehmen oder begründen, „verwaist" als `Badge` mit Wort (V7) oder Achse als Befund, L-03 präzisieren zu „Lese-VM der Klammer in `accounting-cases/domain/`", `Timestamp` → `Time`. Nebenbefund fürs Repo: `docs/ui-repraesentationen.md` §3.1/§3.2 beschreibt die Abnahme-Schritte 4 und 5 vor F123.

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-03 ist erledigt** (App-Commit `52914c45`): `OpenItemLink` steht in
`datev-truth/domain/open-item.ts` und wird gespiegelt. Die Aufgabe bleibt
zurückgestellt — hier ist nur festgehalten, dass der Typ da ist, wenn sie
drankommt: der lokale Nachbau, den die Spec vorsah, entfällt damit.

## Neufassung 2026-09-08 nach dem Owner-Entscheid — der Ort steht

**Der Bildschirm ist entschieden:** der **Saldo-/DATEV-Reiter der
Sachverhaltsansicht** (`CaseDetailView`, 0050). Dort stehen heute die
DATEV-OPOS-Zeilen; die Klammer gehört daneben, weil sie genau die Frage
beantwortet, die dort aufkommt — welche Zahlung gleicht welche Rechnung aus,
und zu wie viel. Damit greift §3 Regel 5 nicht mehr nur formal.

Die fünf Auflagen der Freigabe vom 2026-09-06 sind eingearbeitet:

**1. `payment` ist Pflicht, `Unpaid` fällt weg.** `client_open_item_links`
erzwingt genau eine Zahlungsseite (Migration `20260815120000_open_item_links.sql`).
Eine Rechnung ohne Zahlung ist keine Klammer — sie ist eine Erwartung (0025)
oder ein offener Posten (0029). Die Story, die das Gegenteil zeigte, ist
gestrichen.

**2. Leer, lädt und Fehler gelten für eine Zeile nicht** — und das ist der
Grund, nicht die Ausrede: die Zeile bekommt eine fertige Klammer als Prop. Was
fehlen, laden oder scheitern kann, ist die **Liste** um sie herum; die steht
im Reiter und bringt ihre eigenen Zustände mit.

**3. „Verwaist" wird ein `Badge` mit Wort, keine Registry-Achse.** Die
Registry kennt keine Achse dafür, und sie ist seit dem 2026-09-07 eingefroren.
Ein einzelner Zustand ohne Wertebereich ist auch keine Achse — er ist ein
Wort. **Befund für `ludwig/app`:** wenn die Klammer je mehr Zustände bekommt
als „gilt" und „verwaist", gehört daraus eine Achse.

**4. `OpenItemLink` kommt aus dem Spiegel** (`datev-truth/domain/open-item.ts`,
seit App-Commit `52914c45`). Der lokale Nachbau, den die alte Spec vorsah,
entfällt.

**5. `Time` statt `Timestamp`.**

### Schnittstelle (Neufassung)

| Prop | Typ | Pflicht | Bedeutung | Story |
|---|---|---|---|---|
| `link` | `OpenItemLink` | ja | Die Klammer aus dem Spiegel — Konto, Belegfeld, zugeordneter Betrag, Herkunft, Begründung, verwaist seit | `Filled` |
| `invoice` | `OpenItemSide` | ja | Die Rechnungsseite, wie sie in der Zeile steht | `Filled` |
| `payment` | `OpenItemSide` | ja | Die Zahlungsseite. **Kein `null`** — ohne sie gibt es keine Klammer | `Filled` |
| `currency` | `Currency` | nein | Vorgabe `"EUR"` | `Edges` |
| `onOpen` | `(entryId: string) => void` | nein | Sprung in den Buchungssatz. Ohne ihn ist die Seite Text, kein Knopf, der nichts tut | `Roundtrip` |

`OpenItemSide` ist der Ausschnitt, den die Zeile von einer Seite braucht:
`{ entryId: string; label: string; date: string; amount: number }` — der
Aufrufer weiß, ob die Seite eine Ludwig- oder eine Spiegel-Buchung ist
(`invoiceJournalEntryId` gegen `invoiceMirrorEntryId`), die Zeile nicht.

**Kann bewusst nicht:** eine Klammer setzen oder lösen (Handlung des Moduls),
Skonto rechnen, oder raten — mehrdeutig heißt keine Klammer, so wie die
Schreibregel es vorgibt.

### Stories (Neufassung)

Ableitung nach §6: **2 anwendbare Zustände** (gilt · verwaist) + 0 Enums + 0
Layout-Booleans + 1 Callback + 1 „im Einsatz" + 1 Rand = **5**.

| Story | Beweist |
|---|---|
| `Filled` | Beide Seiten mit Betrag rechts, der zugeordnete Betrag dazwischen, Herkunft und Belegfeld |
| `Orphaned` | `orphanedAt` gesetzt: die Klammer bleibt als Spur stehen, zählt aber nicht mehr — Wort statt nur Farbe (V7) |
| `Roundtrip` | `onOpen` mit `useState`: beide Seiten führen in ihren Buchungssatz |
| `InUse` | Im Saldo-/DATEV-Reiter der Sachverhaltsansicht, neben den OPOS-Zeilen |
| `Edges` | Teilzahlung (zugeordnet < Rechnung), Fremdwährung, langes Belegfeld, Klammer ohne Begründung |

### Befunde für `ludwig/app`

- **`matchedBy` hat keinen Wertebereich.** Der gespiegelte Typ sagt „Abgleich,
  Hand, Regel", die Spalte ist ein freier String, und weder Registry noch
  Label-Map kennen ihn. Die Zeile zeigt deshalb den Rohwert, wo sie kein Wort
  hat — wie `caseKindLabel()` es vormacht. Ein Wertebereich (Achse oder
  Label-Map neben `OpenItemLink`) gehört in die App.

## Gebaut (2026-09-08)

`src/ui/v3/entities/open-item-link/OpenItemLinkRow.tsx` samt Stories, CSS und
Barrel-Eintrag. Fünf Stories wie abgeleitet. Gemessen gegen den Dev-Server
`http://localhost:6107` über `scripts/cdp.mjs`, 1400 px.

| | gemessen |
|---|---|
| `Filled` | eine Zeile, 45,9 px; Text „RE-4471 · Bürobedarf Meier GmbH · 26.08.2026 → Überweisung Commerzbank 1210 · 30.08.2026" |
| `Orphaned` | das Wort **verwaist** steht da — `Badge`, keine erfundene Achse |
| `Edges` | vier Zeilen, Höhen **45,9 und 44,9**, kein Überlauf |
| `Roundtrip` | Klick auf die Rechnungsseite liefert `je-1` an `onOpen` |

**Dabei einen eigenen Fehler gefunden und behoben:** das Belegfeld
`SAMMEL-2026-08-KW35-NACHTRAG` brach die Zeile in der 140-px-Spur auf
**66,8 px** auf, neben Nachbarn von 45,9. Genau der Ausreißer, den der
Owner-Entscheid zu `CaseCell` heute für Listen abgestellt hat — eine Liste
liest sich über ihre Zeilenhöhe. Das Belegfeld kürzt jetzt und trägt den
ganzen Wert im `title`.

Die fünf Auflagen der Freigabe stehen im Code: `payment` ohne `null` (die
Story, die das Gegenteil zeigte, gibt es nicht mehr), „verwaist" als `Badge`
mit Wort, `OpenItemLink` aus dem Spiegel statt lokalem Nachbau, `Time` statt
`Timestamp`, und leer/lädt/Fehler sind mit Grund ausgeschlossen — die Zeile
bekommt eine fertige Klammer, was fehlen kann, ist die Liste um sie herum.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0.

**Status: Abnahme** — gebaut habe ich, abnehmen muss ein anderer.
