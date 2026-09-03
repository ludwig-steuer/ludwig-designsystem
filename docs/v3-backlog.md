# v3 — was noch fehlt

Erhoben am 2026-09-03 gegen `ludwig/app/apps/web/src` (219 Komponentendateien).
**Stand 2026-09-03, abends:** die beiden ersten Gruppen sind gebaut — was
dort steht, ist die Erhebung von morgens und bleibt als Beleg der Zahlen
stehen; der Status je Baustein steht im Soll-Katalog `design-guidelines.md`
§11.7 und in `docs/backlog/`.
Zahlen sind gezählt, nicht geschätzt: „Dateien" = Dateien mit Import,
„Stellen" = JSX-Vorkommen.

Maßgeblich bleiben `design-guidelines.md` §11 (Inventar) und R21 (Dreiteilung):
`primitives/` kennt kein Fachwort, `patterns/` kennt Prozessbegriffe,
`entities/<x>/` gehört genau einer Entität.

## Zuerst — ohne diese fünf kommt keine Seitenmigration voran

**Alle fünf stehen** (2026-09-03): `Badge` und `EmptyState` waren beim
Erheben schon da — die Zeilen 1 und 3 waren bereits überholt, offen war an
`EmptyState` nur die Zentrierung (behoben). `PageHeader` ist 0002,
`FilterBar` 0003, `ActionButton` 0004; den Bestätigungsdialog trägt
`ActionButton` mit `confirm`, statt dass es einen eigenen Baustein gibt.

| # | Baustein | Heute | Nutzung | Stufe |
|---:|---|---|---:|---|
| 1 | **`Plakette`** (generisches Badge) | `legacy/components/primitives/Badge.tsx` + 8 Modul-Wrapper | **47 Dateien / 146 Stellen** | `primitives` |
| 2 | **`Kopfzeile`** (PageHeader, kompakter) | `ui/components/primitives/PageHeader.tsx` | 19 / 22 | `primitives` |
| 3 | **`Leerzustand`** | `ui/components/primitives/EmptyState.tsx` | 28 / 50 | `primitives` |
| 4 | **`FilterLeiste`** | 12 Varianten in 12 Dateien | 12 | `primitives` |
| 5 | **`AktionsKnopf`** + **`BestaetigenDialog`** | 61× `useTransition` von Hand; 28× `window.confirm` | 61 / 14 | `primitives` |

Warum diese Reihenfolge:

- **Plakette** ist der meistgenutzte Rest aus v1. Nicht jede Pille ist ein
  Status (Art, Zähler, Rolle, Provider) — `StatusBadge` deckt das nicht ab,
  und acht Modul-Badges hängen an der Basis. Ohne sie lässt sich keine Zeile,
  Karte oder Zelle vollständig auf v3 ziehen.
- **Kopfzeile** steht am Anfang jeder Seite; sie blockiert alle vier Wellen
  aus §11.4. `CardHead` sitzt eine Ebene tiefer und ersetzt sie nicht.
- **Leerzustand**: `EmptyRow` gilt nur innerhalb der Karte. Jede Liste, Karte
  und Seite braucht „nichts da" mit Titel, Erklärung und Handlung (V9, T6).
- **FilterLeiste** steht schon als Nr. 2 in §11.6 und setzt auf `Input`,
  `Select`, `Button`, `FilterChips` auf — die stehen alle. Erst danach sind
  `entries`, `opos`, `datev`, `partners`, `accounts` überhaupt anfassbar.
  (Die Guidelines nennen acht Varianten; gezählt sind **zwölf**.)
- **AktionsKnopf + BestaetigenDialog**: 61 Client-Komponenten bauen Pending,
  Fehler und Erfolg von Hand nach, 28 Stellen benutzen `window.confirm` —
  ein I2-Verstoß. Das ist die Voraussetzung dafür, dass `ActionBar`,
  `RowActions` und ein künftiges Überlaufmenü echte Handlungen tragen.

## Danach — von den Detail- und Drawer-Umzügen der Welle 1 gebraucht

**Alle fünf stehen** (2026-09-03): `Disclosure` 0005, `FieldList tone="bare"`
0006 (statt einer zweiten DescriptionList), `Toast` 0007, `OverflowMenu` 0008,
`Combobox` 0009.

| Baustein | Heute | Nutzung | Stufe |
|---|---|---:|---|
| **`Aufklapper`** (Disclosure) | natives `<details>/<summary>` | 34 Stellen / 20 Dateien | `primitives` |
| **`Werteliste`** | 10 lokale `Row({label})`-Helfer + 10 `<dl>` | ~20 | `primitives` |
| **`Meldung`** (flüchtige Rückmeldung) | **keine Implementierung** | 43 Dateien mit Ad-hoc-Meldung | `primitives` |
| **`Ueberlaufmenue`** | 8 Eigenbauten | 8 | `primitives` |
| **`Auswahlfeld`** (Combobox mit Suche) | `KontoCombobox`, `CreditorCombobox`, `TaxKeySelect` | 3 | `primitives` |

`Werteliste` und `FieldList` grenzen sich so ab: `FieldList` gehört in die
Karte, `Werteliste` steht frei — in Drawer, Detail, Zusammenfassung.
`Auswahlfeld` ist die Basis, aus der `AccountField` die Konto-Variante wird.

## Später — echter Bedarf, aber kein Blocker

Davon stehen seit 2026-09-03: `Timeline` (0023), `Markdown` (0022),
`DateField`/`DateRangeField` (0024), `FileDrop` (0021), `Skeleton` (0016).
Offen bleiben `Assistent` (Wizard), `Rohdaten`, `Balkendiagramm`,
`KopierenKnopf`, `Schalter` (0018 — Bedarf nicht belegt, erst entscheiden),
`Trennlinie`, `Avatar`, `Brotkrume`.

| Baustein | Nutzung | Stufe |
|---|---:|---|
| `Assistent` (mehrschrittiger Dialog: CSV-Import, DATEV-Export, Onboarding) | 6 Dateien / 11 Stellen | `patterns` |
| `Verlauf` (Zeitstrahl — heute siebenmal verschieden) | 7 | `patterns` |
| `Rohdaten` (JSON/`<pre>`-Ansicht) | 17 Dateien | `primitives` |
| `Datumsfeld` / `Zeitraumfeld` | 14 Dateien | `primitives` |
| `Markdown` (KI-Texte, Notizen) | 5 / 12 | `primitives` |
| `Dateiablage` (Upload/Dropzone) | 5 | `patterns` |
| `Balkendiagramm` | 4 / 5 | `primitives` |
| `Ladeanzeige` außerhalb der Tabelle | 3 | `primitives` |
| `KopierenKnopf` · `Schalter` · `Radiogruppe` · `Trennlinie` · `Avatar` · `Brotkrume` | 3 / 2 / 2 / 6 / 3 / 2 | `primitives` |

## Knöpfe — eigene Erhebung vom 2026-09-03

441 `.tsx` und 11 Stylesheets gezählt. Der `Button` deckt Variante, Größe,
Icon links, Hotkey und `href` ab; sechs Fähigkeiten fehlen:

| Was | Belegt | Aufgabe |
|---|---:|---|
| Textknopf-Form (`.v2link`, `pad 0`, Hover unterstrichen) | **86** | 0011 |
| `loading` — heute 81× als `{pending ? "Speichere …" : …}` | **81** | 0010 |
| Icon-only (9 davon ohne `aria-label`) | **31** | 0012 |
| `size="xs"` — heute 21 Inline-`padding`-Overrides | **21** | 0010 |
| `iconEnd` — nicht per `className` umgehbar | **10** | 0010 |
| `fullWidth` | 3 + 6 Zeilenknöpfe | 0010 |

Kein Bedarf: `size="lg"` (**0** Belege — der Login-Knopf ist nicht größer,
sondern vollbreit), `variant="warning"` als Knopf (0), `SplitButton` (0).

Zwei Nebenbefunde: das Repo hat **keinen einzigen Spinner** und keine
Keyframes dafür — 0010 bringt ihn mit. Und `ActionBar` wird **0×** benutzt,
`RowActions` **1×** (dort handgeschrieben als `<span className="v2actions">`):
kein Lückenschluss am Knopf, sondern ein Adoptionsproblem der Migration.

Nicht zu vergessen bei der Umstellung: `.btn` ist heute **37 px**, `.btn-sm`
**30 px** — `.v2btn--md`/`--sm` sind 40/32. 398 Knöpfe wachsen um 2–3 px.

## Aufräumen im eigenen Haus

- **`legacy/` leeren.** Fünf Bausteine warten dort auf ihre Einordnung:
  StatusBadge + Registry, Banner, LongText, Pagination, Buchungs-Formatierung.
  Erst wenn der Ordner leer ist, ist v3 vollständig (siehe `legacy/README.md`).
- **`.v2tbl__empty` ist zentriert** (`v3.css`) — Verstoß gegen V3 „nichts
  zentriert". Die Guidelines markieren ihn als „im v2-Set **sofort**".
- **`AiBookingNotes` hat keine Story.** Einziger v3-Export ohne eine (Stand
  2026-09-03 unverändert).
- **Sammeldateien**: `Surface.tsx` und `Interactive.tsx` sind bereits in
  Einzeldateien aufgelöst; `Cells.tsx` (7 Exporte), `Form.tsx` (5), `Nav.tsx`
  (4) und `Table.tsx` (8) sind es noch nicht. Konsequent wäre dieselbe
  Auflösung — jede Komponente eine Datei, jede mit ihrer Story daneben.
  Stand 2026-09-03: `Cells.tsx` 8 Exporte (neu: `MonoCell`), `Table.tsx` 8,
  `Form.tsx` 5, `Nav.tsx` 4.

## Bleibt Alt-Mechanik, bekommt nur v3-Optik

Nicht verhandelbar laut §11.2 — hier wird nichts neu gebaut, nur umgestylt:
`StatusHeader` (34 Dateien / 54 Stellen, hängt an `Tooltip`) · `Tooltip`
(2 direkte Importe, aber **11 Neubauten** in Modulen) ·
`Drawer`/`UrlDrawer`-Familie (29 Importstellen) · `LogTable`/`LogView`.

Der `Tooltip`-Befund ist der bemerkenswerteste: elf Module haben sich einen
eigenen gebaut, statt den vorhandenen zu nehmen.

## Nicht `primitives`

`AppShell`/`Sidebar`/`TopBar`/`UserMenu`/`MandantSwitcher`/`YearSwitcher`
tragen Mandanten- und Jahreswechsel — Fachbegriffe. Der Anwendungsrahmen
gehört nach `entities/` oder bleibt in der App, nicht in `primitives/`.

Ebenso die Entitäten-Familien, die §11.3 als „v2 fehlt" führt: `CaseCell`
(Sachverhalt), die Buchungs-Anzeigen (`JournalEntryView`, `AccountRef`,
`RationaleSources`, `ConfidenceMeter`/`ConfidenceDot`, `BookingProposalView`/
`-Compact`, `BookingLineRow`) und die Beleg-Familie (`BelegPreview`,
`BelegSummary`). `JournalEntryEditor` deckt den Editor ab, nicht die
Anzeige-Varianten.
