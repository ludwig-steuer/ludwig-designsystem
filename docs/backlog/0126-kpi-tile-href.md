# 0126 · Die Kennzahl-Kachel führt irgendwohin

| | |
|---|---|
| Status | fertig — schlanke Abnahme 2026-09-08, M1–M3 nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
| Stufe | `primitives/KpiTile` — Prop-Erweiterung nach `spec-schreiben` §3 Regel 2 |
| Klassen-Test | unverändert: eine Zahl mit einer Beschriftung kennt kein Fachwort |
| Quelle | Befund 1 der DATEV-Seite (`ludwig-manager`, 2026-09-08): „`KpiTile` kennt kein `href`", und die Profil-Regel „eine Kachel ohne Weg ist eine Sackgasse mit Ziffern" |
| Ersetzt | den Link im Untertitel, den die App mangels dieser Prop gebaut hat (`ponytail:`-Notiz drüben) |
| Spec von / am | Claude, 2026-09-08 |

## Warum eine Prop und keine neue Komponente

§3 Regel 2: ein `@when` deckt den Fall zu vier Fünfteln, das Fehlende ist eine
Designentscheidung, die wiederkommt (jede Kachel, die eine Liste zählt), und
sie lässt sich in einem Halbsatz sagen.

**Die Regel gibt es auch schon** — sie heißt I11 und gilt bisher für die
Zeile: „Hat eine Listenzeile ein Detail, führt die **ganze** Zeile dorthin,
nicht nur ein Wort." Für die Kachel gilt dasselbe aus demselben Grund: ein
Link im Untertitel macht aus einer Ecke der Kachel einen zweiten Fokus-Stopp,
während die Fläche daneben tot bleibt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `href` | `string` | nein | Wohin die Zahl führt — die Liste, die sie zählt. **Ohne sie bleibt die Kachel ein Block**: nicht jede Zahl hat eine Seite hinter sich, und „Summe Haben" führt nirgendwohin | `Linked` |

**Was `href` den anderen Props auferlegt.** Mit gesetztem `href` liegen
`value` und `sub` **im** Anker. Dort darf kein Link, kein Knopf und nichts
Fokussierbares stehen — verschachtelte Anker sind ungültiges HTML und machen
aus einem Ziel zwei Fokus-Stopps. Das ist kein Gedankenspiel: die App trägt
ihren Link heute mangels dieser Prop im Untertitel, und wer beim Umbau `href`
danebensetzt, statt den alten zu entfernen, baut den verschachtelten Anker im
ersten Zug. Der Satz steht seit der Nacharbeit auch am Typ (`KpiTile.tsx`).

**Und wohin `href` zeigen muss.** Auf eine Liste, die **dieselbe** Ableitung
zählt wie die Kachel (**I12**, `design-guidelines.md` §8 — die Regel nennt
`KpiTile href` beim Namen). Eine Kachel, die 225 zeigt und eine Liste mit 180
öffnet, ist schlechter als eine Kachel ohne Weg: sie behauptet einen
Zusammenhang und bricht ihn im selben Klick.

**Kann bewusst nicht:**

- **Aus jeder Kachel einen Link machen.** Eine Kachel ohne Ziel bleibt ein
  `<div>` — ein Anker ohne Ziel wäre schlimmer als kein Anker.
- **Den Link woanders unterbringen.** Der Anker umschließt die Kachel; ein
  Link im Untertitel wäre genau das, was dieser Nachtrag abschafft.

## Verhalten

Mit `href` wird aus dem `<div class="v2kpi">` ein `<a class="v2kpi v2kpi--link">`.
Farbe und Unterstrich des Links werden zurückgenommen — die Kachel ist das
Ziel, nicht der Text darin. Hover färbt die ganze Fläche, der Fokusrahmen liegt
außen.

## Stories

Eine dazu: `Linked`. Nach §6 ist es ein Layout-Boolean, und die **drei**
bestehenden Stories (`SixColumns`, `ThreeColumns`, `WithoutValue`) decken die
Kachel ohne Ziel bereits. Mit `Linked` sind es vier.

## Abnahmekriterien (variabler Block)

- Mit `href` ist das äußere Element ein `<a>`, ohne `href` ein `<div>`
  (`Linked`, im DOM gemessen)
- Genau **ein** Fokus-Stopp je verlinkter Kachel, keiner bei einer ohne
  (`Linked`: drei Kacheln, zwei Anker, zwei Stopps)
- Der Untertitel bleibt Text — kein Link darin (`Linked`)
- Ersetzt die Untertitel-Lösung der DATEV-Seite ohne Funktionsverlust

## Gebaut 2026-09-08

Gemessen (`scripts/cdp.mjs`, Story `Linked`): drei Kacheln, davon zwei als
Anker mit `#buchungen` und `#offen`, eine als `<div>`, und **genau zwei**
Fokus-Stopps auf der ganzen Fläche.

`pnpm typecheck` und die fünf Wächter auf Exit 0. Das CSS
(`a.v2kpi--link`) steht in `v3.css` neben `.v2kpi`.

## Abnahme (2026-09-08) — schlanke Abnahme (Schnittstelle)

Von einem Agenten geprüft, der nicht gebaut hat, gegen Spec, Code und CSS.
**Kein Storybook, nichts gemessen**: Hover-Farbe, Fokusring und Trefferfläche
sind auf **0119** vertagt (Owner-Entscheid 2026-09-08). Die zwei Aussagen, die
sonst nur im Browser fallen — „ein `<a>`, sonst ein `<div>`" und „genau ein
Fokus-Stopp" — sind hier am Baum der Komponente nachgelesen, nicht gemessen.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `typecheck` und die Wächter grün | `pnpm typecheck` Exit 0; `check:icons`, `check:contrast`, `check:when`, `check:language`, `check:jobs`, `check:mirror` alle Exit 0 (`pnpm build` nicht gelaufen — schlanke Abnahme) | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `KpiTile.tsx` + `KpiTile.stories.tsx`, Titel `v3/Primitives/Fläche/KpiTile` (Story-Datei Z. 4); Barrel `src/ui/v3/index.ts:121` | ✓ |
| Code englisch, `@when`/`@instead` an jedem Export | `check:when`/`check:language` Exit 0; `KpiTile.tsx:15–16` und `:53–54` | ✓ |
| Kein Hex, kein px, keine Label-Map, Status nur über Registry | `KpiTile.tsx` trägt keinen Stil; das neue CSS steht in `src/styles/v3.css:722–730` und benutzt nur Tokens (`--color-border-strong`, `--color-bg-soft`, `--color-focus`) | ✓ |
| Alle Stories vorhanden, ausgeschlossene begründet | `Linked` steht (`KpiTile.stories.tsx:39`); die Spec rechnet aber mit „vier bestehenden" Stories, und es sind drei | **M2** |
| Prüfliste §9 | siehe unten | ✓ |
| Im Browser angesehen | beim Bau gemessen (Abschnitt „Gebaut"), in dieser Abnahme nicht | vertagt auf 0119 |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Mit `href` ist das äußere Element ein `<a>`, ohne `href` ein `<div>` (`Linked`) | `KpiTile.tsx:41–47` — genau eine Verzweigung; `Link` ist ein nacktes `<a href>` (`Link.tsx:25`). Der `div`-Zweig ist zeichengleich mit der Fassung vor dem Bau (`git show 183ce01 -- src/ui/v3/primitives/KpiTile.tsx`): dieselbe Klasse, dieselben drei Kinder — **die Kachel ohne `href` bleibt unverändert** | ✓ |
| Genau ein Fokus-Stopp je verlinkter Kachel, keiner bei einer ohne (`Linked`) | Der Anker ist das einzige fokussierbare Element: Label, Wert und Untertitel sind `<div>` (`KpiTile.tsx:32–34`), kein `tabIndex`, kein Knopf, kein zweiter Anker. In `Linked` (`KpiTile.stories.tsx:41–45`) sind `value` und `sub` reine Zeichenketten → zwei Anker, zwei Stopps, die dritte Kachel stumm. **Kein verschachtelter interaktiver Inhalt** — solange der Aufrufer keinen mitbringt, was nichts verhindert (**M1**) | ✓ |
| Der Untertitel bleibt Text — kein Link darin (`Linked`) | `KpiTile.stories.tsx:42–44` — drei `sub` als Zeichenkette; die Komponente rendert `sub` unverändert in `.v2kpi__sub` (`KpiTile.tsx:34`) | ✓ (nur in der Story, nicht im Vertrag — **M1**) |
| `href` verhält sich wie Zeile 1 der Schnittstelle | `KpiTile.tsx:28` — `href?: string`, optional, ohne Vorgabe; Nachweis-Story `Linked` vorhanden. Die drei geerbten Props (`label`, `value`, `sub`) stehen in keiner Backlog-Tabelle, was hier kein Mangel ist: 0126 ist ein Nachtrag, `KpiTile` selbst stammt aus F123 und hat nie eine Spec gehabt | ✓ |
| Ersetzt die Untertitel-Lösung der DATEV-Seite ohne Funktionsverlust | nicht Gegenstand dieses Repos (`docs/backlog/README.md`) | offen (App) |

**Prüfliste §9** (die zwei App-Punkte übersprungen, die gemessenen auf 0119)

Stufe `primitives/`, Import nur seitwärts auf `Link` (`KpiTile.tsx:2`), kein
Fachmodul · kein Hex, kein px, keine Label-Map · Zahlen rechts mit `tnum`
bringt `.v2kpi__val` schon mit (`v3.css:735–738`) · kein farbiger Zustand,
keine Registry nötig · kein Icon ohne Wort — die Kachel hat kein Icon, der
Anker trägt seinen eigenen Text (Label und Wert) und kein `aria-label` · jedes
klickbare Element antwortet auf Hover, und der Fokusring ist gesetzt
(`v3.css:729–730`) — die **Wirkung** ist auf 0119 vertagt · Texte T1–T5 nicht
berührt (die Kachel bringt keine eigenen).

**Story-Deckung.** §6 auf die gebaute Schnittstelle: 1 Layout-Schalter
(`href` ist formal ein `string`, wirkt aber als An/Aus) = 1 neue Story, und
`Linked` zeigt beide Seiten in einem Bild (zwei verlinkte Kacheln, eine ohne).
Richtig gebaut — die **Zahl im Text** stimmt nicht (**M2**).

### Mängel

**M1 — der Vertrag sagt nicht, was in einer verlinkten Kachel nicht stehen
darf.** `KpiTile.tsx:25–28`: `value: ReactNode` und `sub?: ReactNode` neben
`href?: string`. Sobald `href` steht, umschließt der Anker beides
(`KpiTile.tsx:41–43`) — ein Link oder Knopf darin ergibt `<a>` in `<a>`:
ungültiges HTML, ein zweiter Fokus-Stopp und ein Ziel, das der Browser selbst
auflöst. Die Komponente erzeugt das nie von sich aus (geprüft), sie kann es
aber auch nicht verhindern, und **keine Zeile sagt es**: nicht das JSDoc, nicht
„Kann bewusst nicht", nicht der Prop-Kommentar. Das ist kein theoretischer
Fall — die Ablösung besteht genau darin, dass die DATEV-Seite ihren Link aus
dem Untertitel nimmt; behält sie ihn und setzt `href` dazu, entsteht der
Fehler beim ersten Einbau. I11 nennt für die Zeile ausdrücklich „kein `<a>` in
`<a>`" und löst es dort anders (Deckschicht `v2rowlink`, Links darüber). Für
die Kachel ist der umschließende Anker die richtige Wahl — dann gehört der
Preis dazugeschrieben. Kleinster Weg: ein Satz am Prop und eine Zeile unter
„Kann bewusst nicht" („`value` und `sub` bleiben mit `href` Text — ein Link
darin wäre `<a>` in `<a>`").

**M2 — die Rechnung im Abschnitt „Stories" nennt eine Zahl, die es nicht
gab.** „die vier bestehenden Stories decken die Kachel ohne Ziel bereits" —
bestanden haben **drei** (`SixColumns`, `ThreeColumns`, `WithoutValue`,
nachgesehen in `git show 183ce01 -- src/ui/v3/primitives/KpiTile.stories.tsx`);
vier sind es erst **mit** `Linked`. Praktisch: wer die Story-Deckung nach §6
nachrechnet, sucht eine Story, die nie da war.

**M3 (klein) — die Regel, die diese Prop erst gefährlich macht, steht
nirgends an ihr.** `design-guidelines.md` §8 I12 („Die Zahl zählt, was hinter
ihrem Weg steht") nennt `KpiTile href` beim Namen: eine Kachel mit Weg muss
mit **derselben** Ableitung zählen wie die Liste dahinter, sonst zeigt die
Kachel 225 und der Klick 180. Die Spec und das JSDoc führen nur I11 an. Da die
Kachel die Zahl nicht selbst rechnet, ist das eine Pflicht des Aufrufers — und
Aufruferpflichten stehen im Set am Prop. Kleinster Weg: ein Halbsatz im
Kommentar zu `href` (`KpiTile.tsx:27`).

Abgenommen von / am: fremder Agent (Claude), 2026-09-08 · Offene Punkte: M1,
M2, M3 — keiner im Verhalten der gebauten Kachel; M1 ist eine fehlende Zusage,
M2 eine falsche Zahl in der Spec, M3 ein fehlender Verweis.

## Nacharbeit zur Abnahme, 2026-09-08

Drei Mängel, keiner im Verhalten. Die Verschachtelung, auf die die Abnahme
eigens angesetzt war, ist sauber: ein Anker, ein Fokus-Stopp, und die Kachel
ohne `href` ist zeichengleich mit der Fassung davor.

| Mangel | Wer gab nach | Was jetzt dasteht |
|---|---|---|
| **M1** nichts verbot einen Link in `value`/`sub` | **beide** | Der Satz steht in der Schnittstelle und am Typ (`KpiTile.tsx`) |
| **M2** „die vier bestehenden Stories" — es waren drei | Spec | Drei, namentlich, plus `Linked` |
| **M3** I12 nennt diese Prop, die Prop nannte I12 nicht | **beide** | Die Regel steht im JSDoc an `href` und in der Schnittstelle |

**Warum M1 den Code kostete und nicht nur einen Satz.** Die Spec verbot einen
Link im Untertitel bereits — unter „Kann bewusst nicht" und als
Abnahmekriterium. Nur stand das an keiner Stelle, an der jemand vorbeikommt,
der die Kachel benutzt: nicht am Typ. Wer `href` setzt, liest den Prop-Typ,
nicht den Backlog. Eine Regel, die nur in der Spec steht, ist für den
Aufrufer keine Regel.

**Warum I12 an die Prop gehört und nicht nur in die Regelliste.** I12 ist eine
Pflicht des *Aufrufers* — das Set kann sie nicht prüfen, es kennt die Liste
hinter dem `href` nicht. Genau solche Pflichten müssen dort stehen, wo der
Aufrufer hinsieht, sonst sind sie zwar geschrieben, aber nirgends wirksam.
