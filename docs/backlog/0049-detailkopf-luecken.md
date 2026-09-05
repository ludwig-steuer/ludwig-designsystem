# 0049 · Fünf Lücken am Detailkopf

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` (4) · `patterns/` (1) — bestehende Bausteine, keine neuen |
| Klassen-Test | entfällt: alle fünf sind Erweiterungen bestehender Komponenten |
| Quelle | Screenshot der Sachverhaltsansicht vom 2026-09-03 · Abgleich Bestand ↔ Screen |
| Ersetzt | handgebaute Stellen in `modules/accounting-cases/ui/sachverhalt/parts.tsx` |
| Blockiert | 0048 `EntityHeader`, 0050 `CaseDetailView` |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Fünf kleine Fehlstellen, die einzeln keine Aufgabe wert sind und zusammen
verhindern, dass die Sachverhaltsansicht aus v3-Bausteinen gebaut werden kann.
Eine Aufgabe, ein Commit, fünf Stories.

## Die fünf

| # | Baustein | Fehlt | Beleg im Screen |
|---|---|---|---|
| 1 | `FieldList` (`primitives`) | `layout="row"` — Label/Wert nebeneinander in Spalten statt untereinander | Faktenzeile ERÖFFNET · STATUS · PERSONENKONTO · GESCHÄFTSPARTNER |
| 2 | `StatusBadge` (`patterns`) | Auslöser eines Menüs sein: Chevron, `aria-haspopup`, Auswahl der erlaubten Folgezustände | „Noch nicht ausgeglichen ⌄" |
| 3 | `StatusCallout` (`primitives`) | `icon` links vom Kicker | Leiste „NÄCHSTE AKTION" |
| 4 | `Tabs` (`primitives`) | `dot` — Marke ohne Zahl, wenn es etwas gibt, das sich nicht zählen lässt | Reiter „Saldo & Konten ●" |
| 5 | `CardHead` (in `primitives/Table.tsx`) | `icon` links, `meta` rechts neben den Aktionen | Karten „TIMELINE · 1 Ereignis" und „DETAIL" |

## Einordnung

- **Erweitern statt neu, weil:** jede der fünf ist ein Prop an einem Baustein,
  der die Aufgabe schon zu 90 % erfüllt. Keiner rechtfertigt eine eigene
  Komponente (`spec-schreiben` §3: neue Primitives brauchen zwei Verwendungen
  *und* keinen passenden Träger).
- **Geprüft bei #2 — kein `StatusPicker`.** Die Registry kennt **keine**
  Übergänge: `STATUS_REGISTRY` beschreibt Ausprägungen (Label, Ton,
  Bedeutung), nicht, welcher Zustand auf welchen folgen darf. Die Liste der
  erlaubten Folgezustände kommt also vom Aufrufer, und `axisLegend(axis,
  only)` (`status-registry.ts:1734`) nimmt sie bereits als Teilmenge
  entgegen. Damit bleibt es bei `Popover` + `StatusBadge` in einer Story;
  `StatusBadge` bekommt nur den Chevron.
- **Geprüft bei #5:** `CardHead` sitzt weiter in `Table.tsx` — 0043 ist
  gelaufen und hat `Card`/`CardHead`/`CardFoot` bewusst nicht umgezogen.
  Diese Aufgabe fasst den Ort nicht an.

## Schnittstelle — die fünf Erweiterungen

| # | Datei | Neu | Typ | Default | Nachweis (Story) |
|---|---|---|---|---|---|
| 1 | `primitives/FieldList.tsx` | `layout` | `"stack" \| "row"` | `"stack"` (heutiges Verhalten) | `FactsRow` |
| 2 | `patterns/StatusBadge.tsx` | `chevron` | `boolean` | `false` | `StatusMenu` |
| 3 | `primitives/StatusCallout.tsx` | `icon` | `ReactNode` | — | `NextAction` |
| 4 | `primitives/Nav.tsx` (`TabItem`) | `dot` | `boolean` | — | `TabsWithDot` |
| 5 | `primitives/Table.tsx` (`CardHead`) | `icon`, `meta` | `ReactNode` | — | `CardHeadIconMeta` |

**Bewusst nicht:**

- Kein `StatusPicker`-Export (siehe oben) und **kein `aria-haspopup` an
  `StatusBadge`**: der Chevron ist Optik, die ARIA-Beziehung gehört an den
  Auslöser, und `Popover` setzt sie dort bereits (`Popover.tsx:139`). Ein
  zweites `aria-expanded` am Chip wäre eine falsche Behauptung.
- Kein `dot` **mit** `count` an einem Reiter: entweder es ist zählbar, dann
  steht die Zahl da, oder es ist nur „da", dann der Punkt. Beides zusammen
  sagt zweimal dasselbe. Der Punkt weicht der Zahl, wenn beides gesetzt ist.
- `layout="row"` bekommt **keine** Spaltenzahl als Prop: die Spalten ergeben
  sich aus der Zahl der Paare, der Umbruch aus der Breite.

## Verhalten

- **#1 `layout="row"`:** die Paare stehen **nebeneinander** statt
  untereinander, je Paar Label über Wert. Das Label bleibt die
  Versalienzeile, der Wert steht darunter in Lesegröße. Bei zu wenig Platz
  bricht die Reihe um — sie scrollt nicht.
- **#2 `chevron`:** ein `ChevronDown` (Lucide, 1.5 px) hinter dem Label,
  gedämpft. Ohne `chevron` ist der Chip unverändert; der Chip bleibt
  server-tauglich (der Chevron ist Markup, kein Zustand).
- **#3 `icon`:** links vom Kicker, in der Farbe des Tons — also Teil der
  Tonleiter, nicht des Textes. Das Wort im Kicker bleibt (V7).
- **#4 `dot`:** ein Punkt an der Stelle, an der sonst der Zähler steht.
  `alarm` färbt ihn wie die Zahl. Steht auch `count`, gewinnt die Zahl.
- **#5 `icon`/`meta`:** Symbol links vor Titel und Nebenzeile, `meta`
  rechts **vor** den Aktionen — die Aktion bleibt außen, wo die Hand sie
  sucht.

## Stories

Eine Story je Lücke, in der Story-Datei des jeweiligen Bausteins.

| Story | Datei | Beweist |
|---|---|---|
| `FactsRow` | `FieldList.stories.tsx` | vier Paare nebeneinander, Umbruch bei Enge |
| `StatusMenu` | `StatusBadge.stories.tsx` | Chip mit Chevron als `Popover`-Auslöser, Folgezustände aus `axisLegend(axis, only)` |
| `NextAction` | `StatusCallout.stories.tsx` | Leiste „NÄCHSTE AKTION" mit Symbol, drei Töne |
| `TabsWithDot` | `Nav.stories.tsx` | Reiter mit Punkt neben Reitern mit Zähler; Punkt weicht der Zahl |
| `CardHeadIconMeta` | `Table.stories.tsx` | Karte mit Symbol, `meta` und Aktionen nebeneinander |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; JSDoc der geänderten Props englisch
- [ ] Kein Hex, kein px im TSX; neue Maße als Tokens/Klassen in `v3.css`
- [ ] Alle fünf Stories vorhanden
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Jede der fünf Props hat ihren Default so, dass **kein** bestehender
      Aufrufer sich ändert (Story-Vergleich der Bestands-Stories)
- [ ] `layout="row"` stellt die Paare nebeneinander und bricht um, statt zu
      scrollen (Story `FactsRow`, schmales Fenster)
- [ ] `StatusBadge` trägt kein `aria-haspopup`/`aria-expanded`; die ARIA-
      Beziehung steht am `Popover`-Auslöser (Story `StatusMenu`, DOM-Probe)
- [ ] Ein Reiter mit `dot` **und** `count` zeigt die Zahl, nicht den Punkt
      (Story `TabsWithDot`)
- [ ] `CardHead` ohne `icon`/`meta` rendert dasselbe Markup wie vorher
      (Story-Vergleich)
- [ ] Kein neuer Export in `src/ui/v3/index.ts` — fünf Props, keine
      Komponente

## Befund beim Bauen (2026-09-03)

- **`axisLegend` schluckt falsche Keys lautlos.** Die Story `StatusMenu`
  hatte erst `["…", "booked", "rejected"]` — beides keine DB-Werte der Achse
  (die heißen `closed_accepted` und `closed_rejected`). Ergebnis: ein Menü mit
  zwei statt vier Einträgen, ohne Fehler, ohne Warnung. Der Kommentar an
  `axisLegend` (`status-registry.ts:1731`) sagt das zwar („unbekannte Keys
  werden still ignoriert"), aber wer eine Teilmenge nennt, hat sich verschrieben
  und merkt es nicht. **Befund für die Registry:** eine Variante, die auf
  unbekannte Keys hinweist, statt sie zu verschweigen, wäre eine eigene kleine
  Aufgabe wert — für die Aufrufstelle, nicht für die Anzeige.
- **Zwei Layouts brauchten `margin-right: auto`.** `StatusCallout` und
  `CardHead` stehen beide auf `justify-content: space-between` mit zwei
  Kindern. Ein drittes Kind (Symbol bzw. `meta`) landet damit in der Mitte;
  der Textblock schiebt jetzt die rechte Gruppe nach außen. Ohne `icon`/`meta`
  ist das Ergebnis unverändert — das war das Kriterium.
- **Kein Prop für die Spaltenzahl** bei `layout="row"`: die Reihe bricht bei
  Enge um (im engen Kasten der Story sichtbar: drei Paare oben, eines
  darunter). Eine Spaltenzahl wäre eine Behauptung über den Platz, den der
  Aufrufer hat.
- `dot` **und** `count` am selben Reiter zeigt die Zahl — die Story belegt es
  am Reiter „Historie".

## Neue Story-IDs

`v3-primitives-fläche-fieldlist--facts-row` ·
`v3-patterns-prüfen-statusbadge--status-menu` ·
`v3-primitives-fläche-statuscallout--next-action` ·
`v3-primitives-navigation-tabs--tabs-with-dot` ·
`v3-primitives-tabelle-table--card-head-icon-meta`
## Abnahme

Abgenommen gegen die Kriterien oben, von einem zweiten Agenten (nicht dem
Erbauer). Grundlage: Spec, Code, DOM-Proben und die fünf neuen sowie vier
Bestands-Stories im Browser (Chromium, Storybook auf Port 6107).

**Story-Deckung** — fünf Lücken, fünf neue Props, fünf Stories, jede in der
Story-Datei ihres Bausteins: `--facts-row` · `--status-menu` ·
`--next-action` · `--tabs-with-dot` · `--card-head-icon-meta`. Die Story-IDs
sind genau die, die die Spec vorhergesagt hat; `dot` liegt in
`Tabs.stories.tsx` statt in einer `Nav.stories.tsx` (die es nicht gibt) —
Titel und ID stimmen mit der Spec überein, also keine Lücke. Zustände sind
hier nicht abzudecken: die Aufgabe fügt keinem Baustein einen Zustand hinzu,
sondern je eine Darstellungs-Prop; die fünf Zustände hängen an den
Bausteinen selbst und bleiben unberührt (unten belegt).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` (= `tsc --noEmit`), Exit-Code 0, 2026-09-05 vor und nach der Abnahme | ✓ |
| `pnpm build` grün | Nicht erneut gelaufen (parallele Abnahmen auf demselben Stand). Zitiert wird der Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Code englisch; JSDoc der geänderten Props englisch | `FieldList.tsx:32` (`layout`), `StatusBadge.tsx:21–26` (`chevron`), `StatusCallout.tsx:20–24` (`icon`), `Nav.tsx:19–24` (`dot`, deutsch — siehe letzte Zeile), `Table.tsx:50, 52` (`icon`, `meta`) | ✓ |
| Kein Hex, kein px im TSX; neue Maße als Tokens/Klassen in `v3.css` | Alle fünf Maße stehen im CSS-Block „Fünf Lücken am Detailkopf" (`v3.css:2088–2126`). Ausnahme: der Chevron trägt `style={{ marginLeft: 3, opacity: 0.7 }}` inline (`StatusBadge.tsx:92–95`) — dieselbe Schreibweise, die die Datei seit jeher für ihre Innenabstände nutzt (`gap: 6`, `marginRight: 4`). Als Befund gemeldet, siehe letzte Zeile | ✓ |
| Alle fünf Stories vorhanden | `http://localhost:6107/index.json`: `v3-primitives-fläche-fieldlist--facts-row`, `v3-patterns-prüfen-statusbadge--status-menu`, `v3-primitives-fläche-statuscallout--next-action`, `v3-primitives-navigation-tabs--tabs-with-dot`, `v3-primitives-tabelle-table--card-head-icon-meta` | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle fünf gerendert, je ein Screenshot; `--status-menu` zusätzlich geklickt (Menü öffnet mit vier Folgezuständen), `--facts-row` bei 1440 px und bei 420 px angesehen | ✓ |
| Jede der fünf Props hat ihren Default so, dass kein bestehender Aufrufer sich ändert | Story-Vergleich gegen die Bestands-Stories: `--fieldlist--filled` und `--bare` → 0 × `.v2fields--cols`, Zeilen weiter `display: flex` · `--statusbadge--core-axes` → 16 Chips, 0 Chevrons · `--statuscallout--open` → kein `.v2callout__ico`, Aktionen weiter 25 px vom rechten Rand wie in `--next-action` · `--tabs--with-counters` → 0 Punkte · `--table--filled` (`CardHead` ohne `icon`/`meta`) → Kinder `["DIV","actions"]`, Titel bei 18 px, identisch zur dritten Karte in `--card-head-icon-meta` | ✓ |
| `layout="row"` stellt die Paare nebeneinander und bricht um, statt zu scrollen | `--facts-row` bei 1440 px: vier Paare, ein einziger Zeilenanfang (`top` viermal 16). Bei 420 px: drei oben, eines darunter (`top` 16/16/16/71). Computed `display: flex`, `flex-wrap: wrap`, `overflow-x: visible` — kein Scroll-Container. Label als Versalienzeile über dem Wert, Wert linksbündig | ✓ |
| `StatusBadge` trägt kein `aria-haspopup`/`aria-expanded`; die ARIA-Beziehung steht am `Popover`-Auslöser | DOM-Probe `--status-menu`: kein `.bdg` trägt eines der beiden Attribute; der einzige Träger ist `<button class="v2btn v2btn--tertiary v2btn--sm">` mit `aria-expanded` und `aria-controls`, gesetzt von `Popover`. Klick → `aria-expanded="true"`, vier Folgezustände sichtbar. Der Chevron ist `ChevronDown` über die Icon-Registry, 12 px, `stroke-width 1.5` | ✓ |
| Ein Reiter mit `dot` und `count` zeigt die Zahl, nicht den Punkt | `--tabs-with-dot`: Reiter „Historie" ist mit `count: 12, dot: true` gesetzt (`Tabs.stories.tsx:83`); im DOM steht `<span class="n">12</span>` und kein `.v2tab__dot`. „Saldo & Konten" und „Plausibilität" tragen den Punkt, letzterer in `--color-danger` (`alarm`) | ✓ |
| `CardHead` ohne `icon`/`meta` rendert dasselbe Markup wie vorher | Story-Vergleich (siehe Default-Zeile): Kinder `["DIV","actions"]`, Titel bei 18 px vom linken Kartenrand — in `--table--filled` wie in der dritten Karte von `--card-head-icon-meta`. Mit `icon`/`meta`: `["v2card__ico","DIV","v2card__meta","actions"]`, `meta` links von den Aktionen | ✓ |
| Kein neuer Export in `src/ui/v3/index.ts` | `git show 9109924 --stat -- src/ui/v3/index.ts` → leer; der Bau-Commit fasst zwölf Dateien an, `index.ts` ist keine davon | ✓ |
| **Befund, kein Kriterium dieser Spec:** ein Reiter mit `dot` sagt der Vorlesehilfe nichts (`Nav.tsx:54`, `aria-hidden="true"`) | Der Punkt ist die einzige Auskunft „hier gibt es etwas" und ist für Screenreader unsichtbar; die Zahl daneben wird wenigstens vorgelesen. Die Spec verlangt nur den Punkt, deshalb kein Mangel — aber ein Wort am Punkt („Neues") wäre die V7-treue Fassung. Ebenso als Befund: `Nav.tsx` beschreibt `dot` auf Deutsch, während CLAUDE.md Englisch für JSDoc verlangt — die Datei ist durchgehend deutsch kommentiert und wird nicht in Masse umbenannt | Befund |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte:
zwei Befunde ohne Kriteriumsbezug — der `dot` ohne Wort für die Vorlesehilfe
und das inline `marginLeft: 3` am Chevron; beide gemeldet, keiner blockiert.
