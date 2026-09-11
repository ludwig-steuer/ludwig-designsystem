# 0006 · FieldList freistellen (statt neuer DescriptionList)

| | |
|---|---|
| Status | fertig · **Nachtrag 2026-09-11 offen** (Prosa-Zeile) |
| Stufe | `primitives/` — Erweiterung eines vorhandenen Exports |
| Klassen-Test | entfällt — keine neue Komponente |
| Quelle | `docs/v3-backlog.md` — „Danach": `Werteliste`, 10 lokale `Row({label})`-Helfer + 10 `<dl>` |
| Ersetzt | die lokalen Key-Value-Helfer in `admin/audit-log`, `admin/jobs`, `[year]/datev/stapel/[…seq]`, `configuration/logs`, `RuleEditorForm`, `ImportResultSummary`, `CycleTimeline` u. a. |
| Blockiert | Detail- und Drawer-Umzüge der Welle 1 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Stammdaten und Eigenschaften stehen in Ludwig überall als Schlüssel-Wert-Paare:
im Drawer, im Detail, in der Zusammenfassung. Wo eine Karte drumherum ist,
gibt es dafür `FieldList`. Wo keine ist — im Drawer, unter einer Überschrift,
in einer Spalte — hat sich zwanzigmal ein lokaler Helfer gebildet.

## Einordnung

- **Wiederverwenden:** `FieldList` („Master data and properties of an item,
  read-only") **deckt den Fall inhaltlich vollständig ab**. Es fehlt nur die
  Darstellung ohne Karte: die Komponente rendert heute immer `.v2fields` mit
  Kopfzeile `.v2fields__h`, und `title` ist Pflicht.
- **Erweitert, weil:** Regel 2 — das `@when` deckt den Fall zu vier Fünfteln,
  das Fehlende ist eine Designentscheidung, die wiederkommt (rund 20 Stellen),
  und sie lässt sich in einem Halbsatz an die `@when`-Zeile hängen. Statt einer
  zweiten Komponente mit fast gleicher Schnittstelle bekommt das vorhandene
  `tone`-Enum einen dritten Wert.
- **Zuschnitt:** keine neue Datei. `FieldList.tsx` bleibt, wie es ist.

**Warum keine eigene `DescriptionList`:** Zwei Komponenten, die dieselben
Zeilen mit denselben Abständen rendern und sich nur im Rahmen unterscheiden,
laufen mit der Zeit auseinander — genau das ist in der App zwanzigmal passiert.
Ein Enum-Wert hält sie zusammen.

## Schnittstelle

Geändert wird genau zweierlei:

| Prop | Vorher | Nachher | Nachweis (Story) |
|---|---|---|---|
| `tone` | `"surface" \| "soft"` | `"surface" \| "soft" \| "bare"` — `bare` ohne Fläche, ohne Rahmen, ohne Innenabstand | `Bare` |
| `title` | Pflicht | optional — ohne Titel entfällt die Kopfzeile | `BareWithoutTitle` |

Alles andere bleibt: `rows: [ReactNode, ReactNode][]`, `empty`.

**Kann bewusst nicht:** verschachtelte Werte, Bearbeiten, Spalten-Umbruch bei
sehr vielen Zeilen. Wer bearbeiten will, nimmt `Field` aus `Form.tsx`.

## Verhalten

Server-Component, bleibt es.

- `bare` rendert dieselben Zeilen mit denselben Abständen wie `surface` —
  nur ohne Fläche, Rahmen und Innenabstand. Die Schlüssel-Spalte behält ihre
  Breite, damit Werte untereinander fluchten (V3: Text links).
- Ohne `title` gibt es keine Kopfzeile und keinen Leerraum, wo sie stünde.
- `empty` gilt weiterhin: eine leere Werteliste sagt „Keine Angaben.", statt
  zu verschwinden.

## Stories

Titel `v3/Primitives/Fläche/FieldList` — die vorhandenen Stories bleiben, zwei
kommen dazu.

| Story | Beweist |
|---|---|
| `Bare` | `tone="bare"` mit Titel, neben `surface` zum Vergleich |
| `BareWithoutTitle` | ohne Kopfzeile, wie im Drawer |

Nicht anwendbar: keine neuen Zustände — Leer, Laedt und Fehler verhalten sich
wie bisher und sind bereits belegt.

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

- [ ] `tone="bare"` rendert keine Fläche, keinen Rahmen, keinen Innenabstand (Story `Bare`)
- [ ] Ohne `title` entsteht keine leere Kopfzeile (Story `BareWithoutTitle`)
- [ ] Die Zeilenabstände sind in allen drei Tönen identisch — im Storybook nebeneinander sichtbar (Story `Bare`)
- [ ] Die `@when`-Zeile nennt den freistehenden Fall in einem Halbsatz
- [ ] Die bestehenden Stories rendern unverändert (Story-Zahl steigt um genau 2)
- [ ] Ersetzt einen der lokalen `Row({label})`-Helfer in `ludwig/app` ohne Funktionsverlust

## Offene Fragen

Keine.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `tone="bare"` ohne Fläche, ohne Rahmen, ohne Innenabstand | `v3-primitives-fläche-fieldlist--bare`, gemessen im Browser: `background rgba(0,0,0,0)`, `border-top-width 0px`, `border-radius 0px`, `padding 0px` — daneben `surface` mit Weiß, 1 px Rand, `--radius-lg`, 20 px | ✓ |
| Ohne `title` keine leere Kopfzeile | `--bare-without-title`: kein `.v2fields__h` im DOM, erstes Kind ist `.v2fields__row`, Abstand über der ersten Zeile 0 px | ✓ |
| Zeilenabstände in allen drei Tönen identisch | `--bare`: `.v2fields__row` in beiden Listen `padding 5px 0`, Zeilenhöhe 30,25 px. Die Story stellt `surface` und `bare` nebeneinander; `soft` fehlt darin, ändert laut `v3.css:568` aber allein `background` — die Zeilenregeln sind dieselben | ✓ |
| Die `@when`-Zeile nennt den freistehenden Fall | `FieldList.tsx:12` — „read-only — in a card (`surface`/`soft`) or free-standing inside one (`bare`)" | ✓ |
| Bestehende Stories unverändert, Story-Zahl steigt um genau 2 | `git show 008b3d4^:…/FieldList.stories.tsx \| grep -c "^export const"` → 3, heute 5; `Filled`, `SideBySideToned`, `Empty` im Diff unberührt | ✓ |
| Ersetzt einen lokalen `Row({label})`-Helfer ohne Funktionsverlust | App gelesen: `admin/tenants/[tenantId]/clients/[clientId]/page.tsx:953` und `dev/gallery/page.tsx:247` sind `({ label, children })` — Schlüssel/Wert, gedeckt durch `rows: [ReactNode, ReactNode][]`. Der Umzug in `ludwig/app` steht aus | ✓ |

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: keine.
Hinweis: der JSDoc-Kopf von `FieldList.tsx` ist deutsch (bestand schon vor
0006, der neue Absatz führt ihn fort) — die Hausregel will englische
Kommentare; sauber wäre, ihn beim nächsten Anfassen der Datei zu übersetzen.

## Nachtrag 2026-09-11 — die Feldliste kann keinen Satz tragen

`FieldList` setzt jeden Wert rechtsbündig in fetter Schrift (`.v2fields__row >
span:last-child`). Für Stammdaten ist das richtig, für einen Satz nicht:
rechtsbündige Prosa ist unlesbar (V3). Zwei Aufrufer bauen sich deshalb heute
denselben Umweg in `v3.css`:

| Aufrufer | Umweg | Form |
|---|---|---|
| `BankTransactionFacts` (0102) | `.v2btxf__note` + `.v2fields__row:has(.v2btxf__note) > :last-child { flex: 1 }` | **eine** Zeile Prosa zwischen Stammdaten |
| `ProvenanceNote` (0163) | `.v3prov__note .v2fields` als Grid mit Subgrid, Werte links, Gewicht 400 | die **ganze** Liste ist Prosa, eine gemeinsame Label-Spalte |

Die Bedingung aus 0102 („jeder Aufrufer baut sich seinen eigenen") ist mit dem
zweiten Aufrufer erfüllt. Der Verweis „gehört 0058" in 0102 war falsch — 0058
ist der verworfene `ClarificationDrawer`; gemeint war diese Spec.

**Auftrag für `spec-schreiben`:** beide Formen tragen — eine Zeile Prosa und
eine Liste aus Prosa —, danach beide Umwege aus `v3.css` streichen. Offene
Frage mit Default: ohne Antwort eine Prop je Liste (`values="prose"`: Werte
links, eine Label-Spalte) und für die einzelne Zeile ein Wert-Wrapper, den die
Liste per `:has()` erkennt, wie heute `.v2btxf__note`.

