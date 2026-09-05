# 0047 · RecordPager

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | ja — „Schadensfall 3 von 91" mit Vor/Zurück ist in jeder Sachbearbeitungs-App dasselbe |
| Quelle | Screenshot der Sachverhaltsansicht vom 2026-09-03 · `docs/seiten/sachverhalt-detail.md` Rang 9 |
| Ersetzt | die Kopfzeile „‹ Vorheriger · 1/117 · Nächster ›" in `modules/accounting-cases/ui/sachverhalt/parts.tsx` |
| Blockiert | 0050 `CaseDetailView` |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Durch einen Arbeitsvorrat blättern, ohne über die Liste zu gehen: die
Sachbearbeiterin bearbeitet 117 Sachverhalte hintereinander und darf zwischen
zwei Fällen keinen Umweg haben. Heute steht die Leiste handgebaut im
Sachverhalts-Screen; Belege, Klärungen und Batches brauchen dieselbe.

## Einordnung

- **Wiederverwenden:** `legacy/Pagination` blättert **Listenseiten** (Seite 2
  von 9) — eine andere Sache: hier steht ein Datensatz im Fokus, nicht eine
  Menge. `IconButton` (`href`-Variante, 0012) trägt die Pfeile, `Hotkeys` die
  Tasten. Es fehlt die Klammer aus Position, Gesamtzahl und Rückweg.
- **Neu, weil:** zwei Verwendungen belegt (Sachverhalt, Beleg), Muster steht
  im Screenshot.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** `IconButton`, `Link`, optional `Hotkeys` (`J`/`K`).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `position` | `number` | ja | 1-basiert, wie der Aufrufer zählt | `Filled` |
| `total` | `number` | ja | Größe des Vorrats, wie der Aufrufer sie kennt | `Filled` |
| `label` | `string` | nein | Was gezählt wird, Singular — „Sachverhalt". Standard: nur „3 von 117" | `Filled` |
| `back` | `{ href: string; label: string }` | nein | Der Weg zurück in den Vorrat, benannt | `Filled` |
| `prevHref` / `nextHref` | `string \| null` | nein | `null` oder fehlend = Ende erreicht: der Pfeil bleibt **sichtbar** und ist inaktiv | `FirstRecord`, `LastRecord` |
| `onPrev` / `onNext` | `() => void` | nein | Client-Variante; schließt `prevHref`/`nextHref` aus | `Interactive` |
| `hotkeys` | `boolean` | nein | `J`/`K` binden und als `Kbd` zeigen. Standard `false` | `Interactive` |

**Kann bewusst nicht:** springen („zu Nr. 42"), filtern, den Vorrat kennen,
die Gesamtzahl selbst ermitteln.

## Entscheidungen zu den offenen Fragen

1. **Der Pager zählt nichts selbst.** `position` und `total` kommen vom
   Aufrufer, und zwar so, wie der die Liste geladen hat. Fällt der Fall
   während der Bearbeitung aus dem Filter, ändert das den Pager nicht — er
   zeigt weiter die Stelle, an der der Bearbeiter eingestiegen ist. Alles
   andere wäre eine Zahl, die sich unter der Hand ändert, während jemand
   arbeitet. Wer den Vorrat neu zählen will, lädt neu, und der Server gibt
   neue Werte.
2. **Kein Slot in `PageHeader`.** `PageHeader` (0002) hat `back` und
   `actions`; ein Pager passt in `actions` und braucht dort keinen eigenen
   Platz. Wichtiger: der Pager steht auch **ohne** Seitenkopf — im Drawer, im
   Detailkopf, über einer Karte. Ein Slot hätte ihn an den Kopf gekettet.
   Trägt der Pager sein eigenes `back`, gibt der Seitenkopf sein `back` ab —
   zwei Rückwege nebeneinander sind einer zu viel.
3. **Klassenname:** `.v2pager*` — `grep -rn "v2pager\|v2pg" src/styles` war
   leer.

## Verhalten

- **Zwei Varianten, wie bei `Tabs`:** `prevHref`/`nextHref` sind Links und
  funktionieren ohne JavaScript; `onPrev`/`onNext` sind die Client-Variante.
  Beides zusammen ist ein Typfehler, nicht eine Vorrangregel.
- **Enden bleiben sichtbar.** Am ersten Datensatz ist „zurück" inaktiv
  (`aria-disabled`, gedämpft), nicht weg — ein Pfeil, der verschwindet, lässt
  die Leiste springen und nimmt die Auskunft „hier ist Anfang".
- **Tasten:** `hotkeys` bindet `K` (vorheriger) und `J` (nächster) und zeigt
  beide als `Kbd` neben den Pfeilen (V14: die Taste ist sichtbar). Ohne
  `hotkeys` steht kein `Kbd` da — eine Taste anzuzeigen, die nichts tut,
  wäre eine Lüge. Am Ende des Vorrats tut die Taste nichts, wie der Pfeil.
- **Zählung:** „3 von 117", Ziffern tabellarisch, damit die Zahl beim
  Blättern nicht wandert. Mit `label`: „Sachverhalt 3 von 117".
- Die Datei trägt `"use client"` — wegen `useHotkeys`. Die href-Variante
  rendert trotzdem reine Links.

## Stories

Titel `v3/Primitives/Navigation/RecordPager`. Abgeleitet nach §6: 1 Zustand +
0 Enum + 1 Layout (`back`) + 1 Callback + 1 „im Einsatz" + 2 Rand (erster und
letzter Datensatz) = 6.

| Story | Beweist |
|---|---|
| `Filled` | Mitten im Vorrat, mit `back` und `label` |
| `FirstRecord` | Rand: „zurück" inaktiv, sichtbar |
| `LastRecord` | Rand: „weiter" inaktiv, sichtbar |
| `WithoutBack` | Ohne Rückweg — im Drawer, wo der Rahmen den Rückweg trägt |
| `Interactive` | `onPrev`/`onNext` mit `hotkeys`: `J`/`K` laufen durch, Tasten sichtbar |
| `InUse` | Im `PageHeader` als `actions`, neben einem Titel |

Nicht anwendbar: `Empty` (kein Vorrat, kein Pager — der Aufrufer rendert ihn
nicht), `Loading`, `Error` (die Zahlen kommen fertig).

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` am Export
- [ ] Kein Hex, kein px im TSX
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Am Anfang und am Ende bleibt der jeweilige Pfeil **sichtbar** und ist
      `aria-disabled` (Stories `FirstRecord`, `LastRecord`, DOM-Probe)
- [ ] `href`- und Callback-Variante schließen sich im Typ aus (`tsc` bricht
      bei beidem — Nachweis: kurzer Testschnipsel im Abnahmeprotokoll)
- [ ] `hotkeys` zeigt `J`/`K` als `Kbd` und schaltet weiter; ohne `hotkeys`
      steht kein `Kbd` da (Story `Interactive` vs. `Filled`)
- [ ] Die Zahl steht tabellarisch (`tabular-nums`), springt beim Blättern
      also nicht (Story `Interactive`, mehrfach klicken)
- [ ] Der Pager kennt keinen Vorrat: keine Prop nimmt eine Liste, kein
      `useEffect` lädt etwas (`grep`)
- [ ] Neue Klassen tragen `.v2pager*`

## Befund beim Bauen (2026-09-03)

- **Der aktive Pfeil war zu blass.** `IconButton` steht auf
  `--color-text-muted`; neben dem inaktiven Pfeil (gedämpft) war der
  Unterschied kaum zu sehen — bei einer Leiste, die 117-mal bedient wird, ist
  das der falsche Ort zum Sparen. In der Pager-Leiste trägt der aktive Pfeil
  jetzt `--color-text`, der inaktive `--color-text-subtle` bei 0.35.
- **Tasten nur in der Callback-Variante.** `useHotkeys` läuft mit
  `enabled: hotkeys && !isLinks` — eine Taste kann keinem `href` folgen, und
  ein stiller Tastendruck wäre schlimmer als keiner. In der Link-Variante ist
  `hotkeys` deshalb im Typ gar nicht vorhanden.
- **Im Browser geprüft:** `J` zweimal gedrückt → Zählung 3 → 5, ohne dass die
  Leiste springt (Story `Interactive`). Am ersten und letzten Datensatz
  bleiben beide Pfeile stehen (`FirstRecord`, `LastRecord`).
- `PageHeader` hat den Pager als `actions` ohne Änderung aufgenommen — die
  Entscheidung gegen einen eigenen Slot hält (Story `InUse`).

## Neue Story-IDs

`v3-primitives-navigation-recordpager--filled` · `--first-record` ·
`--last-record` · `--without-back` · `--interactive` · `--in-use`
## Abnahme

Abgenommen gegen die Kriterien oben, von einem zweiten Agenten (nicht dem
Erbauer). Grundlage: Spec, Code, DOM-Proben und die sechs Stories im Browser
(Chromium, Storybook auf Port 6107).

**Story-Deckung** — sechs Stories abgeleitet, sechs vorhanden
(`http://localhost:6107/index.json`). Jede Prop hat ihre Story: `position`,
`total`, `label`, `back` in `--filled` · `prevHref`/`nextHref` als `null` in
`--first-record` und `--last-record` · ohne `back` in `--without-back` ·
`onPrev`/`onNext` und `hotkeys` in `--interactive` · im `PageHeader` in
`--in-use`. Die drei ausgeschlossenen Zustände sind in der Spec begründet
(`Empty`: kein Vorrat, kein Pager · `Loading`/`Error`: die Zahlen kommen
fertig) — die Begründung trägt: keine Prop nimmt eine Quelle entgegen.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` (= `tsc --noEmit`), Exit-Code 0, 2026-09-05 vor und nach der Abnahme | ✓ |
| `pnpm build` grün | Nicht erneut gelaufen (parallele Abnahmen auf demselben Stand). Zitiert wird der Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/RecordPager.tsx` + `RecordPager.stories.tsx`; Titel `v3/Primitives/Navigation/RecordPager` — Gruppe „Navigation" wie im Barrel (`src/ui/v3/index.ts:100`) | ✓ |
| Code englisch; `@when`/`@instead` am Export | `RecordPager.tsx:49–53` trägt beide Zeilen englisch; Props, Typen (`PagerLinkProps`, `PagerButtonProps`) und Kommentare englisch, deutsche Strings nur im UI („Vorheriger Datensatz", „von") | ✓ |
| Kein Hex, kein px im TSX | `grep -nE '#[0-9a-fA-F]{3,8}\|[0-9]+px' src/ui/v3/primitives/RecordPager.tsx` → keine Treffer | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories in Chromium gerendert, je ein Screenshot; `--filled` und `--first-record` zeigen Rückweg, Pfeile und Zählung in einer Zeile, `--in-use` den Pager rechts im `PageHeader` | ✓ |
| Am Anfang und am Ende bleibt der Pfeil sichtbar und ist `aria-disabled` | DOM-Probe `--first-record`: erstes Schritt-Element ist `<span class="v2ibtn v2ibtn--md v2pager__off" aria-disabled="true">`, Breite > 0, `opacity: 0.35`, `cursor: default`. `--last-record` spiegelbildlich am „weiter"-Pfeil. Kein Element verschwindet, die Leiste behält ihre Länge | ✓ |
| `href`- und Callback-Variante schließen sich im Typ aus | Testschnipsel `<RecordPager position={1} total={9} prevHref="/a" onNext={() => {}} />` → `tsc --noEmit`: `TS2322 … Types of property 'onNext' are incompatible. Type '() => void' is not assignable to type 'undefined'.` | ✓ |
| `hotkeys` zeigt `J`/`K` als `Kbd` und schaltet weiter; ohne `hotkeys` kein `Kbd` | `--interactive`: zwei `<kbd class="v2kbd">` mit „K" und „J"; `j` `j` → Zählung 3 → 5, `k` → 4; am Anfang (Position 1) wird der Rückwärts-Pfeil zum `v2pager__off` und `k` bleibt folgenlos. `--filled`, `--first-record`, `--last-record`, `--without-back`: 0 `Kbd` im DOM | ✓ |
| Die Zahl steht tabellarisch und springt beim Blättern nicht | `.v2pager__count` computed `font-variant-numeric: lining-nums tabular-nums`; über vier Tastendrücke (3 → 5 → 4 → 1) bleiben `x = 184.2` und `width = 134.3` unverändert — weder Zählung noch Pfeile wandern | ✓ |
| Der Pager kennt keinen Vorrat | `grep -nE "useEffect\|: *[A-Za-z]+\[\]\|Array<" src/ui/v3/primitives/RecordPager.tsx` → keine Treffer; die Schnittstelle nimmt nur Zahlen, Strings und Callbacks | ✓ |
| Neue Klassen tragen `.v2pager*` | `v3.css:2132–2151`: `.v2pager`, `.v2pager__back`, `.v2pager__count`, `.v2pager__step`, `.v2pager__off` — kein anderer Präfix hinzugekommen | ✓ |
| **Befund, kein Kriterium dieser Spec:** `text-align: center` an `.v2pager__count` (`v3.css:2140`) | V3 nennt Zentrierung „kein legitimer Fall". Hier hält `min-width: 6ch` + Zentrierung die Pfeile ruhig, während die Zahl wächst — dasselbe erreicht Linksbündigkeit im festen Kasten. §9 steht nicht unter den festen Kriterien dieser Spec, das zugehörige Kriterium („springt nicht") ist über `tabular-nums` + festes Kastenmaß erfüllt | Befund |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte:
`text-align: center` an `.v2pager__count` (V3) — gemeldet als Befund für das
Set, kein Kriterium dieser Spec.
