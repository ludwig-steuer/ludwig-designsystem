# 0251 · Buchungssatz: Altlasten der Kopfzeile (Trefferfläche, Zeichen, Inline-px)

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-20 (gemessen) |
| Stufe | `entities/journal-entry/` (`JournalEntryEditor`, `JournalEntryGrid`) und `src/styles/v3.css` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein: Buchungssatz, Rest, DATEV-Sicht |
| Quelle | Abnahme 0250, Hinweise H1 und H3; Auftrag ll-ceo 2026-11-20 („nachrangig“) |
| Ersetzt | nichts; behebt Verstöße gegen CLAUDE.md §2 im Bestand seit der Erstbestückung |
| Blockiert | nichts |
| Spec von / am | Designer-Sitzung, 2026-11-20 |

## Ziel

Die Kopfzeile des Buchungssatzes (0250) hält drei Hausregeln nicht ein. Der
Wechsel „Einfach/Voll“ ist kleiner als 24 px. Unicode-Zeichen tragen
Bedeutung (✓ am ausgeglichenen Rest, ◂ ▸ am Wechsel). Und der Editor setzt
einen Abstand in px direkt im TSX. Diese Aufgabe räumt das auf, ohne Prop
und ohne neues Wort.

## Einordnung

- **Trefferfläche ≥ 24 × 24 px** (CLAUDE.md §2, Bedienung): Gemessen hat
  der Wechsel „Voll · Alt+V“ 20,9 px Höhe (0250, H3). Er bekommt eine
  Klasse `.bse__mode` mit `min-height: 24px` als `inline-flex`, im Editor
  (`button`) wie im Lesegitter (`Link`). Wo der Wechsel steht, wird die
  Kopfzeile dadurch 2 px höher (33 → 35 px, gemessen; das Abzeichen ist
  22 px hoch). Das ist der Preis der Trefferfläche. Ohne Wechsel (Lesegitter
  ohne `modeHref`) bleibt sie 33 px.
- **Keine Unicode-Zeichen als Bedeutungsträger** (CLAUDE.md §2,
  Darstellung):
  - „ ✓“ hinter „Rest 0,00 €“ entfällt. Die Zahl sagt, dass nichts offen
    ist, die Farbe `is-ok` kommt dazu, die Farbe steht also nicht allein
    (V7).
  - „◂“ und „▸“ an „Einfach“ und „Voll“ entfallen. Das Wort bleibt, ebenso
    der `title` („Zur vollen Sicht — alle DATEV-Spalten“). Ein Icon aus der
    Registry stattdessen wäre ein neues Zeichen für den Sichtwechsel; nötig
    ist es nicht.
- **Kein px im TSX** (CLAUDE.md §2): `JournalEntryEditor.tsx:315`
  `marginBottom: … 8` wird `var(--space-2)` (8 px). Dieselbe Stelle, kein
  Unterschied im Maß.
- **Ordnung im CSS** (0250, H1): `.bse__top-end` rückt neben `.bse__top`.
- **Nicht hier: das echte Minus** (0250, H3). Der Rest wird über
  `formatAmount` (`src/ui/v3/format.ts`) geschrieben. Das ist der zentrale
  Formatierer des Sets mit 24 Nutzern, und er liefert wie `Intl` für `de-DE`
  den Bindestrich U+002D. CLAUDE.md verlangt „echtes Minus vor der Zahl“,
  T7 in `design-guidelines.md` nennt nur „Vorzeichen“. Ein Wechsel auf U+2212
  ändert jeden negativen Betrag im Set. Er bricht außerdem das Einfügen in
  Excel oder DATEV, die U+2212 nicht als Zahl lesen. → Owner-Frage, eigene
  Aufgabe, nicht in diesem Zuschnitt.
- **Zuschnitt:** zwei Komponenten derselben Familie, eine CSS-Regel neu, eine
  verschoben.

## Schnittstelle

Keine Änderung.

| Stelle | vorher | nachher |
|---|---|---|
| Rest ausgeglichen | „Rest 0,00 € ✓“ | „Rest 0,00 €“ (Farbe `is-ok` wie bisher) |
| Wechsel im Editor | „Voll ▸ · Alt+V“ / „Einfach ◂ · Alt+V“, 20,9 px hoch | „Voll · Alt+V“ / „Einfach · Alt+V“, ≥ 24 px |
| Wechsel im Lesegitter | „Voll ▸“ / „Einfach ◂“ | „Voll“ / „Einfach“, ≥ 24 px |
| Hinweis „gesperrt“ im Editor | `marginBottom: 8` | `marginBottom: "var(--space-2)"` |

## Verhalten

Keine neue Interaktion. Alt+V, Hover und Fokus wie bisher. Die Kopfzeile
bleibt eine Zeile (0250).

## Stories

Keine neue Story; die vorhandenen beweisen es:

| Story | Beweist |
|---|---|
| `JournalEntryEditor` · `S5_RemainderDoesNotBalance` | Wechsel ≥ 24 px, ohne ▸, Rest ohne Zeichen |
| `JournalEntryEditor` · `S2_SplitFull` | Vollsicht: „Einfach · Alt+V“, Rest 0,00 € ohne ✓ |
| `JournalEntryGrid` · `InUse` oder `Full` | Wechsel im Lesegitter ≥ 24 px, ohne ◂ ▸ |

Den Sperrhinweis **mit** Aktion (`locked.onAction`, der Zweig mit dem
Abstand) zeigt keine Story. `S20_EditorOnly` sperrt ohne Aktion. Der
Abstand ist darum nur über das Token belegt (`--space-2` = 8 px in
`tokens.css`). Eine Story dafür käme zu 14 bestehenden; ausgelassen, weil
sich am Maß nichts ändert.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Echtes Minus (U+2212) in Beträgen | keine; `formatAmount` zentral | Owner entscheidet zwischen Typografie und Einfügen in Excel/DATEV |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] Kein „✓“, „◂“, „▸“ mehr in `JournalEntryEditor.tsx` und `JournalEntryGrid.tsx` (`grep`)
- [ ] Wechsel „Einfach/Voll“ im Editor und im Lesegitter ≥ 24 px hoch, gemessen (`getBoundingClientRect`), Kopfzeile weiter eine Zeile
- [ ] Rest 0,00 € in Vollsicht ohne Zeichen, mit der Farbe `is-ok`; Rest ≠ 0 unverändert (`S2_SplitFull`, `S5_RemainderDoesNotBalance`)
- [ ] `title` des Wechsels unverändert; Alt+V wechselt weiter die Sicht im Editor
- [ ] Kein Zahlenwert in px mehr im `style` des Sperrhinweises; `--space-2` ist 8 px (`tokens.css`), also derselbe Abstand (Lesen; keine Story zeigt den Zweig, s. Stories)
- [ ] `.bse__top-end` steht in `v3.css` direkt bei `.bse__top`; `check:classes` ohne neuen Fund
- [ ] `formatAmount` unverändert (kein Diff in `src/ui/v3/format.ts`)

## Nachtrag nach der Abnahme (Spec-Autor, 2026-11-20)

- H6: Die Beschreibung von `JournalEntryGrid.stories.tsx` · `ReverseCharge13b`
  nennt jetzt „Rest 0,00 €“ ohne ✓.
- H4: Der Verweis „(I8)“ an `.bse__mode` und an den beiden 24-px-Regeln aus
  0247 (`.v3frv__ref`, Quelle als Ziel) heißt jetzt „(§9, WCAG 2.5.8)“. Nur
  Kommentare.
- H3, Minus: Die Frage ist schon entschieden. Die Freigabe von 0100
  (Punkt b) hat „Minus ist U+2212“ gestrichen: Es gilt der Bindestrich, den
  `formatAmount` (`de-DE`) schreibt. Eine eigene Aufgabe entfällt. Offen
  bleibt nur der Wortlaut „echtes Minus vor der Zahl“ in CLAUDE.md, der
  dieser Freigabe widerspricht. Er geht an den Owner; CLAUDE.md ändert das
  Set nicht selbst.

## Abnahme

Gemessen im laufenden Storybook (Port 6118), Playwright, je Story ein per JS
erzeugtes iframe in Messbreite, `getBoundingClientRect` auf `.bse__mode` und
die Kinder von `.bse__top`. Stories kurz: `ed--s1` =
`v3-entitäten-buchungssatz-journalentryeditor--s-1-edit-with-warning`,
`ed--s2` = `…journalentryeditor--s-2-split-full`, `ed--s5` =
`…journalentryeditor--s-5-remainder-does-not-balance`, `ed--draft` =
`…journalentryeditor--draft-by-hand`, `gr--*` = `…journalentrygrid--*`,
`dr--*` = `…journalentrydrawer--*`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `pnpm typecheck` Exit 0 · `pnpm build --output-dir <Scratchpad>` Exit 0 („Storybook build completed successfully“, danach gelöscht) · `pnpm check:type` Exit 0 („0 older findings“) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | keine neue Datei; Änderung in `JournalEntryEditor.tsx`, `JournalEntryGrid.tsx` unter `entities/journal-entry/` und in `v3.css`; Stories daneben, Titel `v3/Entitäten/Buchungssatz/…` (IDs aus `index.json`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Diff: eine Klasse an zwei Stellen, ein Token, zwei englische CSS-Kommentare, kein neuer Export · `pnpm check:language` Exit 0 („0 German comment lines“) · `pnpm check:when` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `JournalEntryEditor.tsx:315` jetzt `"var(--space-2)"`; `min-height: 24px` steht in `v3.css`, wie bei `.v2ask__links .v2link` und `.v2pager__actions .v2link`; kein Hex, keine Map; Abzeichen weiter `StatusBadge axis="journal_entry"` · `pnpm check:icons` Exit 0 · `pnpm check:contrast` Exit 0 · `pnpm check:domain-paths` Exit 0 | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `ed--s5`, `ed--s2`, `gr--full` in `index.json`; der Zweig `locked.onAction` hat keine Story, das ist in der Spec begründet (Maß über das Token belegt); `gr--in-use` zeigt keinen Wechsel (kein `modeHref`), im Lesegitter beweisen es `gr--full` und `gr--edges` (H2) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Trefferfläche gemessen (unten); Hover: `text-decoration-line` `none` → `underline` am `button` (`ed--s5`) und am `a` (`gr--full`), `cursor: pointer`; Tastatur: per Tab erreicht, `:focus-visible`, Ring `2px solid rgb(59, 143, 196)`, Abstand 2 px, kein beschneidender Vorfahr; Schrift 13,5 px 600 (`--fs-ui`, geerbt), Rest 12,5 px (`--fs-ui-sm`); Taste „Alt+V“ am Editor-Wechsel sichtbar; kein Icon, kein Zeichen; Rest rechts | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle 30 Stories (`ed--*` 14, `gr--*` 10, `dr--*` 6) bei 700 px geladen: 0 Fehler, 0 Warnungen in der Konsole (Fang der iframe-Konsole mit einer Probe `console.error` geprüft); Screenshots der Kopfzeile von `ed--s5`, `ed--s2`, `gr--full` bei 1280 px in Ruhe, Fokus und Hover | ✓ |
| Kein „✓“, „◂“, „▸“ mehr in `JournalEntryEditor.tsx` und `JournalEntryGrid.tsx` (`grep`) | `grep -n "✓\|◂\|▸"` auf beide Dateien: kein Treffer (Exit 1); im gerenderten Text aller 30 Stories ebenfalls keines (`/[✓◂▸]/` auf `body.textContent`) | ✓ |
| Wechsel ≥ 24 px hoch in Editor und Lesegitter, Kopfzeile eine Zeile | `ed--s1`, `ed--s2`, `ed--s5`, `ed--draft`, `gr--full`, `gr--edges` je bei 700/1100/1400/1920: Wechsel 24,0 px hoch (`button` „Voll · Alt+V“ 71,8 × 24,0, „Einfach · Alt+V“ 96,3 × 24,0; `a` „Einfach“ 48,9 × 24,0); Kopfzeile: Streuung der senkrechten Mitten 0 px, `nowrap`, rechtes Ende bündig (0 px), Höhe 35,0 px mit Wechsel, 33,1 px ohne (`gr--simple`, `gr--in-use`), wie in der Spec; alle übrigen Editor- und Grid-Stories bei 700 px: Wechsel 24,0, Streuung 0 | ✓ |
| Rest 0,00 € in Vollsicht ohne Zeichen, Farbe `is-ok`; Rest ≠ 0 unverändert | `ed--s2`: „Rest 0,00 €“, `bse__rest is-ok`, `rgb(63, 122, 90)`; `gr--full` ebenso; `ed--s5`: „Rest 75,60 €“, `bse__rest is-off`, `rgb(168, 64, 60)`, Text wie vorher (das Zeichen kam nur bei 0) | ✓ |
| `title` des Wechsels unverändert; Alt+V wechselt im Editor | Editor: `title` „Zur vollen Sicht — alle DATEV-Spalten“ / „Zur einfachen Sicht“ (im Diff Kontextzeile, im DOM gemessen); Lesegitter ohne `title`, vorher wie nachher (`git show HEAD:…/JournalEntryGrid.tsx`) · `ed--s5`: `keydown` mit `altKey`, `key: "v"` an das iframe-Dokument: „Voll · Alt+V“ → „Einfach · Alt+V“ → zurück; ebenso echter Tastendruck `Alt+KeyV` (Playwright) und Klick. An `document` gefeuert, wirft Storybooks eigener Vorschau-Handler `target.getAttribute is not a function` (Messartefakt); an `body` gefeuert bleibt die Konsole leer | ✓ |
| Kein px-Wert mehr im `style` des Sperrhinweises; `--space-2` = 8 px | `JournalEntryEditor.tsx:315` `marginBottom: locked.onAction ? "var(--space-2)" : 0`; `tokens.css:123` `--space-2:  8px`; Zweig ohne Story, gelesen wie in der Spec vorgesehen | ✓ |
| `.bse__top-end` direkt bei `.bse__top`; `check:classes` ohne neuen Fund | `v3.css:1944` `.bse__top`, `:1951` `.bse__top-end`, `:1953` `.bse__mode`; alte Stelle im Kapitel 0113 entfernt (Diff) · `pnpm check:classes` Exit 1 mit genau den vier Altfunden `v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`, kein `bse`; `--test` Exit 0; `.bse__mode` hat Regel und zwei Nutzer (`JournalEntryEditor.tsx:597`, `JournalEntryGrid.tsx:133`) | ✓ |
| `formatAmount` unverändert | `git diff --stat -- src/ui/v3/format.ts` leer | ✓ |

Vier Linsen: **Sprache** — nur Zeichen entfernt, kein Wort neu; „Voll“ und
„Einfach“ bleiben verständlich, sagen aber allein nicht, was voll ist (H1).
**Bedienung** — Trefferfläche jetzt 24 px hoch, Hover, Fokusring, Tab und
Alt+V gemessen. **Logik** — keine Prop, keine neue Interaktion, eine
CSS-Regel neu, eine an ihren Platz gerückt. **Darstellung** — kein
Unicode-Zeichen trägt mehr Bedeutung, der Rest bei 0 steht in Zahl und Farbe
(V7), Kopfzeile eine Zeile, 1,9 px höher wie in der Spec angekündigt.

Abgenommen von / am: fremder Agent, 2026-11-20 · Offene Punkte: keine.

- **H1** Vier-Wochen-Test „Voll“/„Einfach“: Ohne Pfeil bleibt der Wechsel als Handlung erkennbar (Linkfarbe, Unterstreichung beim Hover, im Editor „· Alt+V“). Was „voll“ heißt, sagt aber nur der `title`, und den erreichen Tastatur und Vorlesehilfe kaum (zugänglicher Name „Voll · Alt+V“). Das Adjektiv ist kein Imperativ mit Objekt, das ist Bestand von vor 0250, und der Pfeil hat es auch nicht gelöst. Ein Wort wie „Alle Spalten“ wäre ein neues Label, also eine Owner-Frage. Weil die Handlung folgenlos umkehrbar ist, ist das kein Mangel.
- **H2** `gr--in-use` (in den Stories der Spec „`InUse` oder `Full`“) zeigt keinen Wechsel, weil die Story kein `modeHref` setzt. „Voll“ im Lesegitter (einfache Sicht mit `modeHref`) zeigt keine Story; eine Probe mit geklontem Link misst 24,3 × 24,0 px, knapp über dem Maß.
- **H3** Die Ausnahme der Minus-Frage trägt als Zuschnitt: Sie steht nicht im Diff, `formatAmount` ist der zentrale Formatierer, 0100 hat das U+2212-Kriterium schon in der Freigabe gestrichen, und eine Änderung wäre ein Regelentscheid (CLAUDE.md §7). Die angekündigte „eigene Aufgabe“ gibt es in `docs/backlog/` aber nicht. Der Widerspruch CLAUDE.md („echtes Minus“) ↔ T7 („Vorzeichen“) ↔ `formatAmount` (U+002D) steht nirgends als benannte Ausnahme mit Owner und Datum (§3). Die Frage gehört auf die Todo-Liste an den Owner.
- **H4** Der CSS-Kommentar an `.bse__mode` verweist auf „(I8)“. I8 ist in `design-guidelines.md` „Formulare“, das 24-px-Maß steht in §9 (WCAG 2.5.8). Derselbe Verweis steht schon an `v3.css:4596` und `:4605`; beim nächsten Griff gemeinsam berichtigen.
- **H5** §9 schlägt für die 24 px einen negativen Rand vor, der die Höhe hält. Die Spec nimmt bewusst +1,9 px in Kauf. Beim Umschalten springt nichts, weil der Wechsel immer steht, wo es ihn gibt. Die Kopfzeilen der Familie messen jetzt aber 31,9 / 33,1 / 35,0 px (ohne Abzeichen / mit Abzeichen / mit Wechsel).
- **H6** `JournalEntryGrid.stories.tsx:73` schreibt in der Story-Beschreibung noch „Rest 0,00 ✓ (P50)“. Das ist Prosa, nicht die Oberfläche, passt aber nicht mehr zu ihr.
