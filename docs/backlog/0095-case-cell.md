# 0095 · CaseCell — der Sachverhalt in einer fremden Zeile

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/accounting-case/` — Darstellungsfamilie des Sachverhalts, neben `CaseTimeline` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: die Rückfallkette und der Nullfall „offen" gehören diesem Vorgangsbegriff |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `CaseCell`; Ränge 1–3 |
| Ersetzt | `ui/case/CaseCell.tsx` (46 Z.) in `documents/page` und `StuckDocumentsTable` — **und** die Kopie in `KontoauszugView` (Z. 134–172) |
| Blockiert | `CaseRow` (0096), `CaseDrawer` (0098), `BankTransactionRow` (0100) — alle drei nennen den Sachverhalt über diese Zelle |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Eine fremde Liste — Belege, Kontoauszug, steckengebliebene Dokumente — nennt
den Sachverhalt, zu dem eine Zeile gehört. Heute steht dort eine
Mono-Nummer, und zwar an zwei Stellen aus einer geteilten Datei und an einer
dritten aus einer eigenen Kopie. Die Nummer allein beantwortet die Frage
nicht, die dort aufkommt: *gehört das schon irgendwohin, und ist das dort
noch offen?* Die Zelle trägt deshalb den Anzeigenamen, die Nummer und den
Zustand — und sagt, wenn es keinen Sachverhalt gibt.

## Einordnung

- **Wiederverwenden:** `MonoCell` trägt die Nummer, `StatusBadge` den
  Zustand, `Link` das Ziel. Keiner von ihnen kennt die Rückfallkette, und
  keiner weiß, was „noch keiner" heißt.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — `ui-repraesentationen.md`
  führt die Zelle für diese Entität, drei Listen brauchen sie, und keine
  vorhandene Form deckt sie ab. Präzedenz: `SourceDocumentCell` (0074) hat
  dieselbe Aufgabe für den Beleg, samt eigener Rückfallkette.
- **Zuschnitt:** eine Datei, ein Export. Kein zweiter für den Stapel-Fall —
  der ist eine Prop, kein zweiter Baustein (R17: zwei Zellen für dieselbe
  Entität sind in jedem Fall falsch).
- **Setzt auf:** `MonoCell`, `StatusBadge`, `Link`, `EntityIcon`
  (`accounting-case`, 0087).

## Die Rückfallkette ist der Kern

Rang 1 des Profils ist der **Anzeigename**, und er ist abgeleitet:

```
title  →  <Art>: <Gegenpart>  →  <Art>
```

`title` ist zu 53 % gefüllt, der Rückfall greift also bei fast jedem zweiten
Fall. Die Ableitung fehlt im Spiegel und wird in der App **viermal
verschieden** gebaut — Befund **L-52**. Das Set definiert sie deshalb **einmal**
in `entities/accounting-case/case-title.ts` als reine Funktion
`caseDisplayTitle({ title, kind, counterpartyName })`, strukturell
deckungsgleich mit dem, was L-52 drüben verlangt, und meldet sie als Befund.
Keine Komponente dieser Familie baut den Namen selbst zusammen.

Darunter die zweite Kette, für die **Kennung**: `caseNumber` → die ersten
acht Zeichen der `caseId`. `caseNumber` ist im Bestand zu 100 % gefüllt, der
Rückfall greift nur bei Fällen ohne Wirtschaftsjahr; er steht trotzdem, weil
die App ihn heute schon hat.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `cases` | `readonly CaseLink[]` | ja | Die Sachverhalte dieser Zeile. **Leer heißt „noch keiner"** und ist der häufigste Fall im Kontoauszug (65 %) | `None`, `Single`, `Many` |
| `href` | `(caseId: string) => string` | ja | Das Ziel je Fall. Die Zelle baut keine URL — sie kennt weder Mandant noch Jahr | `Single` |
| `emptyHref` | `string` | nein | Wohin „offen" führt (der Zuordnungs-Reiter). Ohne die Prop ist „offen" ein Wort ohne Weg | `None` |
| `showState` | `boolean` | nein, Default `true` | Der Zustand als Punkt hinter dem Namen. `false`, wo die Zeile den Zustand schon in einer eigenen Spalte führt | `WithoutState` |
| `layout` | `"inline" \| "stacked"` | nein, Default **`inline`** | Wie die Zelle sich anordnet. `inline` ist **eine Zeile** — Kennung, dann der Name mit Ellipse, dann der Zustand; das gilt in Zeilen, weil sich eine Liste über ihre Zeilenhöhe liest. `stacked` ist die zweizeilige Form für Karten und Faktentafeln, wo Platz ist und der Name der Punkt ist (Owner-Entscheid 2026-09-08, Nachtrag unten) | `Layouts` |

`CaseLink` ist die Teilmenge von `CaseListItem` (`src/ludwig/modules/accounting-cases/domain/case.ts`),
die diese Zelle braucht:

```ts
interface CaseLink {
  caseId: string;
  caseNumber: string | null;
  fiscalYear: number | null;
  title: string | null;
  /**
   * `null`, wo der Aufrufer die Art nicht kennt — eine fremde Liste, die nur
   * die **Nummer** trägt, darf keine erfinden. Der Belegkatalog hat genau das
   * getan (`kind: "incoming_invoice"` für jeden Beleg) und damit ein falsches
   * Abzeichen in die Zelle gesetzt; seit 0070 M2 ist das Feld nullbar, und
   * `caseDisplayTitle` fällt ohne Art auf „Sachverhalt" zurück.
   */
  kind: CaseKind | null;
  counterpartyName: string | null;
  lifecycleStatus: CaseLifecycle | null;
  /** Nur im Kontoauszug: der Teilbetrag, der auf diesen Fall entfällt. */
  amount?: number | null;
  /** `Currency`, nicht `string`: eine Zusicherung an der Aufrufstelle ist eine Behauptung, kein Typ (0098 M1). */
  currency?: Currency | null;
}
```

**Kann bewusst nicht:**

- **Eine URL bauen.** Mandant und Jahr kennt die Seite, nicht die Zelle.
  Deshalb `href` als Funktion und nicht als Muster.
- **Den Zustand erklären.** Kein (i) — das ist `StatusHeader` am Spaltenkopf
  (0077), einmal für die ganze Spalte statt einmal je Zeile.
- **Sortieren, filtern, zählen.** Sie zeigt, was sie bekommt.
- **Den Betrag rechnen.** `amount` je Fall kommt aus der Zuordnung
  (`allocatedSum` der Bankzeile), nicht aus dem Sachverhalt.

## Verhalten

Server-Component. Ein Fall: Name, Nummer mono, Zustandspunkt, alles in einem
Link. Mehrere Fälle: ein Stapel untereinander, je Zeile derselbe Aufbau plus
Teilbetrag rechts — das ist die Fassung, die `KontoauszugView` heute
handgeschrieben führt und die die geteilte Zelle bisher nicht konnte. Kein
Fall: das Wort **„offen"** als gedämpfte Pille, mit `emptyHref` als Link,
sonst als Text; nie ein nackter Gedankenstrich, denn „noch keiner" ist eine
Aussage und kein fehlender Wert.

Der Name kürzt mit Ellipse (p90 33 Zeichen bei gesetztem `title`, sonst
`<Art>: <Gegenpart>` mit p90 27 für den Gegenpart); der volle Name steht im
`title` (Z3). Die Nummer bricht nie um.

Zustände: gefüllt (ein Fall) · gefüllt (mehrere) · leer (kein Fall). Lädt und
Fehler gibt es nicht — die Zelle bekommt ihre Daten mit der Zeile.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseCell`. Abgeleitet nach §6: 3 anwendbare
Zustände + 1 Layout-Boolean (`showState`) + 0 Callbacks + 1 „im Einsatz" +
1 Rand = 6. Gebaut sind **8**: `NarrowColumn` kam als zweiter Rand dazu (ein
langer Name in einer schmalen Spur — der Fall, den ein weites Raster
verbirgt), und `Layouts` beweist die Prop `layout`, die es bei der Ableitung
noch nicht gab. Beide unter der Obergrenze von 10.

| Story | Beweist |
|---|---|
| `Single` | Ein Fall: Anzeigename, Nummer, Zustandspunkt, ein Link |
| `Many` | Drei Fälle in einem Stapel, je mit Teilbetrag — die Fassung aus dem Kontoauszug |
| `None` | Kein Fall: „offen" mit `emptyHref`, und daneben dieselbe Zelle ohne die Prop |
| `WithoutState` | `showState={false}` in einer Liste, die eine eigene Zustands-Spalte hat |
| `Fallbacks` | Rand: vier Zeilen, die die Kette durchspielen — mit `title`, ohne `title` (Art + Gegenpart), ohne beides (nur Art), ohne `caseNumber` (Kurz-ID) |
| `NarrowColumn` | Rand: ein langer Name in einer 200-px-Spalte, darunter der Stapel — der Fall, den ein weites Raster verbirgt (Abnahme 2026-09-06) |
| `InUse` | In einer `Table` als Spalte „Sachverhalt" neben Beleg und Betrag — wie `documents/page` sie heute baut |
| `Layouts` | Beide Anordnungen in **derselben** 200-px-Spur: `inline` einzeilig, `stacked` zweizeilig — der Unterschied, an dem der Owner-Entscheid vom 2026-09-08 hängt |

Nicht anwendbar: `lädt`, `Fehler` (Begründung im Verhalten), `leer nach
Filter` (eine Zelle filtert nicht).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Im Drawer nachschlagen statt die Seite wechseln | `onPeek?: (caseId: string) => void` — ohne den Callback gibt es den Weg nicht | `CaseDrawer` (0098) ist gebaut und eine Liste will ihn öffnen |
| Mehr als drei Fälle zusammenfassen („3 weitere") | `maxCases?: number` | eine Bankzeile im Bestand hängt an mehr als drei Sachverhalten (heute: nie) |

## Befunde für `ludwig/app`

- **B1 (L-52)** — Die Ableitung des Anzeigenamens fehlt im Spiegel und wird
  drüben viermal verschieden gebaut; eine davon (`buildCaseOverview`) liest
  `detail.title` gar nicht und macht damit einen vom Nutzer gesetzten Titel
  unsichtbar. Das Set definiert `caseDisplayTitle()` lokal und
  deckungsgleich.
- **B2 (L-54)** — Nur zwei der drei Listen rufen die geteilte Zelle;
  `KontoauszugView` Z. 134–172 hat eine eigene mit Stapel, Betrag und
  „offen"-Pille. Diese Spec nimmt die Kopie als Vorbild — der Umzug löst
  beide ab, nicht nur die geteilte.
- **B3** — `lifecycleStatus` fehlt in den Queries der Listen, die `CaseCell`
  zeigen. Ohne das Feld kann `showState` drüben nicht greifen.

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

- [ ] `caseDisplayTitle()` steht **einmal** in `case-title.ts` als reine Funktion; keine Komponente baut den Namen selbst (Story `Fallbacks`, dazu `grep`)
- [ ] Die Kette Anzeigename → Nummer → Kurz-ID greift in allen vier Fällen (Story `Fallbacks`)
- [ ] `cases={[]}` zeigt „offen", nie einen Gedankenstrich; mit `emptyHref` verlinkt, ohne nicht (Story `None`)
- [ ] Mehrere Fälle stehen als Stapel mit Teilbetrag je Zeile (Story `Many`)
- [ ] `showState={false}` lässt den Punkt weg und sonst alles stehen (Story `WithoutState`)
- [ ] Der Zustand kommt aus `StatusBadge axis="sachverhalt"`, nicht aus einer lokalen Map
- [ ] Die Zelle baut keine URL — `href` ist eine Funktion, `grep` findet kein `/clients/` in der Datei
- [ ] Kein (i) an der Zelle; die Erklärung sitzt am Spaltenkopf (0077)
- [ ] offen (App): ersetzt `ui/case/CaseCell.tsx` in `documents/page` und `StuckDocumentsTable` **und** die Kopie in `KontoauszugView`; die drei Queries nehmen `lifecycleStatus` auf (B3)

## Abnahme

Gemessen am 2026-09-06 im Browser (Storybook 6107, headless Chromium, 1440
breit). Gemessen wurde die Wirkung — `getBoundingClientRect`, `scrollWidth`
gegen `clientWidth`, `getComputedStyle`, der gerenderte Text —, nicht das,
was der Code selbst gesetzt hat.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` in dieser Abnahme nicht gelaufen (der Abnahme-Auftrag verbietet es) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/accounting-case/CaseCell.tsx` · `CaseCell.stories.tsx` daneben · Titel `v3/Entitäten/Sachverhalt/CaseCell` (Story-ID `v3-entitäten-sachverhalt-casecell`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `CaseCell.tsx` Z. 22–25, `case-title.ts` Z. 41–42 und Z. 56–57; Deutsch nur in „offen" und in den Story-Kommentaren | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -n "#[0-9a-f]\{3,6\}\|px" CaseCell.tsx case-title.ts` → nichts; Labels kommen aus der Registry (`StatusBadge axis="sachverhalt"`) | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `curl localhost:6107/index.json` → `--single`, `--many`, `--none`, `--without-state`, `--fallbacks`, `--in-use`; Ableitung §6: 3 Zustände + 1 Layout-Boolean + 1 „im Einsatz" + 1 Rand = 6; `lädt`/`Fehler`/`leer nach Filter` im Abschnitt „Verhalten" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | zwei Punkte reißen: der Inhalt der Zelle verlässt die Spalte (M1) und der Anzeigename wird bis zur Unlesbarkeit gestaucht (M2); alle übrigen Zeilen unten geprüft | ✗ |
| Im Browser angesehen | Screenshots `ab95-inuse-orig.png` (unverändert) und `ab95-inuse-p90.png` (Name in p90-Länge) | ✓ |
| `caseDisplayTitle()` steht einmal; keine Komponente baut den Namen selbst | `case-title.ts` Z. 44–46 reicht `caseDisplayTitle()` aus `@/ludwig/…/domain/case` durch — keine zweite Ableitung. `grep -rn "counterpartyName" src/ui/v3` findet in dieser Familie keine Zusammensetzung; `CASE_KIND_LABEL`/`caseKindLabel` kommt in `entities/accounting-case/` nirgends vor. Damit ist L-52 hier nicht wiederholt | ✓ |
| Die Kette Anzeigename → Nummer → Kurz-ID greift in allen vier Fällen | `--fallbacks`, gerenderte Texte: „Wartung der Klimaanlage" · „Eingangsrechnung: Bürobedarf Meier GmbH" · „Eingangsrechnung" · Kennung `c-d4f9e1` statt `2026-0412`; `title`-Attribut je Zeile gleich dem vollen Namen | ✓ |
| `cases={[]}` zeigt „offen", nie einen Gedankenstrich; mit `emptyHref` verlinkt, ohne nicht | `--none`: zwei `.v2case__none`, beide Text „offen"; erstes Kind `<a href="#zuordnen">`, zweites ein reiner Textknoten. `/[-‐-―]/.test(innerText)` → `false`. Pille: Radius 999px, Grund `rgb(244,246,248)`, Schrift `rgb(92,92,92)` → Kontrast 6,2:1. Fokus auf dem Link: `outline 2px solid rgb(59,143,196)` | ✓ |
| Mehrere Fälle stehen als Stapel mit Teilbetrag je Zeile | `--many`: `.v2case--stack` hat `display: grid`, die drei `.v2case__one` liegen bei y = 16 / 42 / 68 (untereinander), Beträge „812,50 €" · „96,20 €" · „341,20 €" | ✓ |
| Beträge rechts, `tnum`, nichts zentriert (V3) | `--many`: rechte Kanten aller drei Beträge bei x = 436 (gleich), `font-variant-numeric: lining-nums tabular-nums`, `text-align: right`; kein Element der Zelle hat `text-align: center` (nur Storybook-Knöpfe und die Storybook-Überschrift) | ✓ |
| Der Zustand kommt aus `StatusBadge axis="sachverhalt"` | `--many`: Chips `.bdg` mit „Zur Prüfung" · „Klärung offen" · „Verbucht" — die Labels der Registry-Achse `sachverhalt`; keine lokale Map in der Datei | ✓ |
| Kein (i) an der Zelle | `--single`, `--many`, `--in-use`: `document.querySelectorAll('button[aria-label*="erkl"]').length` → `0` (`StatusInfoButton` trägt „…: Zustände erklären"); `info={false}` in `CaseCell.tsx` Z. 68 | ✓ |
| `showState={false}` lässt den Punkt weg und sonst alles stehen | `--without-state`: `.bdg` → 0 Treffer, Text der Zelle bleibt „Wartung der Klimaanlage / 2026-0412" | ✓ |
| Die Zelle baut keine URL | `grep -n "clients/\|/clients" CaseCell.tsx case-title.ts` → kein Treffer (Exit 1); `href` ist `(caseId: string) => string`, Story liefert `#sachverhalt-…`, gerendertes `href="#sachverhalt-c-2026-0412"` | ✓ |
| Sie rechnet keinen Betrag und sortiert nicht | `grep -n "sort\|reduce\|filter\|Math\." CaseCell.tsx case-title.ts` → kein Treffer; `cases` wird in Eingangsreihenfolge gemappt, `amount` unverändert an `AmountCell` gereicht | ✓ |
| Kürzung: langer Name mit Ellipse **und** vollem Text im `title` | `title` trägt in jeder Story den vollen Namen (gemessen). Die Ellipse greift aber nur, wo das Elternteil den Kasten blockifiziert (`--fallbacks`, `--many`); in der schmalen Tabellenspalte nicht (M1) und im Stapel nur noch auf ein Zeichen (M2) | ✗ |
| Die Nummer bricht nie um | `--in-use`: `.v2case__no` hat `white-space: nowrap`, Höhe 17 px, `getClientRects().length` = 1 in allen vier Vorkommen | ✓ |
| Die Zelle in der Tabelle: stehen die Spaltenkanten? | `--in-use`: linke Kanten der vier Spalten in Kopfzeile und allen drei Zeilen identisch bei x = 35 / 165 / 507 / 777, auch neben einem Stapel und neben „offen"; die Spalte selbst steht also. Der **Inhalt** der Ein-Fall-Zeile steht nicht darin (M1) | ✓ |
| offen (App): ersetzt `ui/case/CaseCell.tsx` und die Kopie in `KontoauszugView`; die drei Queries nehmen `lifecycleStatus` auf (B3) | nicht in diesem Repo prüfbar | offen (App) |

**Urteil: zurück in Arbeit.** Die Kette, der Nullfall, der Stapel, der
Zustand und die Abstinenz (keine URL, kein Rechnen, kein (i)) stimmen. Es
reißt genau der Punkt, den die Spec unter „Verhalten" als eigenen Satz führt:
die Kürzung.

### Mängel

1. **Ein einzelner Fall kürzt nicht — er läuft aus der Spalte.**
   `src/styles/v3.css` Z. 2906: `.v2case { display: inline-flex; … }`. Ein
   Inline-Flex-Kasten ist shrink-to-fit und nimmt hier seine max-content-Breite;
   `text-overflow: ellipsis` auf `.v2case__link` (Z. 2912–2915) greift deshalb
   nie, solange die Zelle in einem Inline-Kontext steht.
   Beleg, Story `--in-use`, Zeile 1 (unverändert, Name 23 Zeichen): Spalte
   „Sachverhalt" endet bei x = 767, „Betrag" beginnt bei x = 777, `.v2case__one`
   reicht bis x = 854 — 87 px Überlauf; der Chip „Zur Prüfung" überdruckt
   „1.249,90 €" (`ab95-inuse-orig.png`). `.v2case__link`: `scrollWidth` 163 =
   `clientWidth` 163, also keine Kürzung.
   Mit einem Namen in p90-Länge (33 Zeichen — die Zahl steht in dieser Spec)
   wächst der Überlauf auf 163 px (`ab95-inuse-p90.png`).
   Gegenprobe zur Ursache: zur Laufzeit `display: flex` gesetzt → `.v2case__one`
   endet bei x = 767, `clientWidth` 76 gegen `scrollWidth` 163, die Ellipse
   greift.
   Warum die Stories es nicht zeigen: in `--fallbacks` und `--many` ist das
   Elternteil ein Grid, das den Kasten blockifiziert (`getComputedStyle` →
   `display: flex`) — genau dort greift die Ellipse, und genau dort steht keine
   schmale Tabellenspalte.

2. **Im Stapel greift die Ellipse, aber der Name verschwindet.**
   `src/styles/v3.css` Z. 2911–2915: `.v2case__one` verteilt die Breite ohne
   Untergrenze für den Namen, `.v2case__link` hat `min-width: 0`.
   Beleg, Story `--in-use`, Zeile 3 (unverändert, Spalte 260 px): Kennung 62 px
   + Chip 106 px + Betrag 60 px + drei Abstände à 8 px = 252 px; für den Namen
   bleiben 8 px. Gemessen `clientWidth` 8 / 8 / 23 bei `scrollWidth` 163 / 284 /
   213. Sichtbar sind „V", „E", „R…" — bei zwei der drei Zeilen fehlt sogar das
   Auslassungszeichen (`ab95-inuse-orig.png`).
   Der `title` trägt den vollen Namen, die Zelle zeigt ihn nicht mehr: Rang 1
   des Profils fällt in der Fassung aus, für die die Spec die Zelle gebaut hat.
   In `--many` (420 px, Grid-Elternteil) bekommt der Name 157–172 px und liest
   sich — die Story deckt den engen Fall nicht ab.

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-06 · Offene Punkte: M1, M2;
dazu die App-Zeile (Ersatz der drei Fassungen, `lifecycleStatus` in den
Queries) — offen (App).

## Offene Fragen

1. Trägt die Zelle den Anzeigenamen oder die Nummer voran? *Ohne Antwort:
   den Namen — er ist Rang 1 des Profils, und die Nummer steht mono daneben.
   In `documents/page` ist die Spalte schmal; wenn sie es bleibt, entscheidet
   die Seite über `showState`, nicht über die Reihenfolge.*
2. „offen" als Wort oder als Gedankenstrich? *Ohne Antwort: als Wort. Das
   Fehlen bedeutet hier etwas — die Zahlung wartet auf Zuordnung —, und
   `KontoauszugView` macht es heute schon so.*
3. Gehört der Teilbetrag in die Zelle oder in eine eigene Spalte? *Ohne
   Antwort: in die Zelle, weil er je Fall gilt und eine Spalte ihn bei
   mehreren Fällen nicht ausdrücken kann. Er erscheint nur, wenn `amount`
   gesetzt ist.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Profil-Treue vollständig (Ränge 1–3, Rückfallkette, Stapel 0/1/n). Entscheide: 1 Name voran · 2 „offen" als Wort · 3 Teilbetrag in der Zelle je Fall · `onPeek` bleibt Ausbau, 0098 `InUse` nutzt einen eigenen Auslöser.

Vor dem Bau in die Spec: (a) „Zustand als Punkt" → `StatusBadge axis="sachverhalt" info={false}` als Chip (V7, R1; das (i) sitzt am Spaltenkopf); (b) `CaseLink` und die Kennungs-Kette (`caseIdentifier()`, Nummer → Kurz-ID) in `entities/accounting-case/case-title.ts` exportieren — 0096 und 0101 nutzen dieselben; (c) L-56 nennen (Zeilentyp des Kontoauszugs mit Teilbetrag je Fall); (d) Musterwerte in den Stories nennen (Nummer `2026-0412`, Gegenpart).

## Vor dem Bau eingearbeitet und gebaut (2026-09-06)

**(a) Der Zustand ist ein Chip, kein Punkt.** `StatusBadge axis="sachverhalt"
info={false}` — Farbe steht nie allein (V7), und die Erklärung sitzt einmal am
Spaltenkopf (`StatusHeader`, 0077) statt einmal je Zeile (R1).

**(b) Name und Kennung liegen in `case-title.ts`**, damit 0096 und 0101
dieselben benutzen. Mit einer Änderung gegenüber der Freigabe: der
**Anzeigename kommt aus dem Spiegel**. `caseDisplayTitle()` ist seit
`ludwig/app` 44f9cd4e Kanon (L-52 erledigt), und `caseTitle()` hier ist eine
dünne Durchreiche — eine zweite Ableitung wäre genau das, wovon L-52 handelte.
Lokal bleibt nur, was drüben fehlt: die **Kennungs-Kette** (Nummer, sonst die
ersten acht Zeichen der Id).

Warum die Kurz-ID und kein Gedankenstrich: ein Fall ohne Nummer ist trotzdem
einer. Der Strich sagte „keine Kennung", und das wäre falsch.

**(c) L-56 steht in den Befunden** — der Teilbetrag je Fall kommt aus der
Zuordnung der Bankzeile, nicht aus dem Sachverhalt; die Zelle rechnet ihn
nicht, sie zeigt ihn.

**(d) Musterwerte:** Nummer `2026-0412`, Gegenparteien „Bürobedarf Meier
GmbH" und „Stadtwerke Musterstadt".

### Gemessen

| Story | Was |
|---|---|
| `Fallbacks` | die vier Stufen der Kette: „Wartung der Klimaanlage" · „Eingangsrechnung: Bürobedarf Meier GmbH" · „Eingangsrechnung" · Kennung `c-d4f9e1` statt der fehlenden Nummer |
| `None` | „offen" — mit `emptyHref` als Link, ohne sie als Wort; in keinem Fall ein Gedankenstrich |
| `Many` | drei Fälle im Stapel, je mit Teilbetrag rechts |

## Die zwei Mängel der Abnahme vom 2026-09-06 — behoben

Beide saßen an derselben Stelle, und der Prüfer hat auch gleich gesagt, warum
meine Stories sie nicht gefunden haben: sie legten die Zelle in ein **weites**
Raster, und dort greift die Kürzung von selbst. Die eine Story mit schmaler
Spalte hatte zu kurze Namen. Es fehlte die Kombination.

**M1 — die Zelle lief aus ihrer Spalte.** `.v2case` stand auf `inline-flex`,
und ein Inline-Kasten ist shrink-to-fit: `text-overflow: ellipsis` am Namen
hatte nie eine Grenze, an der es hätte greifen können. Gemessen lief die Zelle
87 px über ihre Spalte hinaus und der Zustands-Chip überdruckte den Betrag der
Nachbarspalte. Jetzt `flex` — als Block nimmt sie die Breite, die die Spalte
ihr gibt.

**M2 — im Stapel verschwand der Name.** Kennung (62), Chip (106), Betrag (60)
und drei Abstände belegten 252 der 260 px; für den Namen blieben **8 px**,
sichtbar war ein einzelner Buchstabe, zweimal ohne Auslassungszeichen. Der
Name ist Rang 1 des Profils — er behält jetzt mindestens acht Zeichen und
wächst in die freie Breite, und was daneben steht, rückt bei Bedarf in die
nächste Zeile.

**Die fehlende Story ist da:** `NarrowColumn` — ein langer Name in einer
200-px-Spalte, dazu der Stapel darunter. Gemessen: alle Namen 200 px breit
(`scrollWidth` 422 · 284 · 213, also gekürzt mit Ellipse), **null** Elemente
ragen über die Spalte hinaus. Dieselbe Messung in `InUse`: Spalte 507–767,
kein Überlauf in keiner der drei Zeilen.

**Nebenbefund mitgenommen:** `CaseLink.currency` ist jetzt `Currency | null`
statt `string | null`. Der Cast an der Aufrufstelle war eine Behauptung über
einen Wert, den der Typ nicht hergab.

**Nicht als Mangel gewertet und hier bestätigt:** die Stapelzeile ist mit
95 px höher als die 47 px der übrigen. Das folgt zwingend aus dem Stapel, den
die Spec verlangt — bei sechs Fällen an einer Zahlung ist eine hohe Zeile die
ehrliche Darstellung, und V1 spricht von Chips, die die Zeile nicht auftreiben
sollen, nicht von Inhalt, der mehrzeilig ist.

## Abnahmekriterien (Nachtrag)

- [ ] Die Zelle bleibt in ihrer Spalte, auch bei langem Namen (Story `NarrowColumn`, gemessen)
- [ ] Der Name kürzt mit Ellipse und behält mindestens acht Zeichen — auch im Stapel
- [ ] Kein Element überdruckt die Nachbarspalte (`InUse` und `NarrowColumn`)
- [ ] `CaseLink.currency` ist `Currency`, kein `string` mit Cast

## Abnahme — zweite Runde (2026-09-06)

Gemessen im Browser (Storybook 6107, headless Chromium, 1440 breit). Gemessen
wurde wieder die Wirkung — `getBoundingClientRect`, `scrollWidth` gegen
`clientWidth`, `getComputedStyle`, Canvas-Textmaß, Screenshot —, nicht das,
was der Code setzt. Zusätzlich zu den Stories wurde die Spalte **zur Laufzeit**
verengt (`--v2-cols` auf 160 / 140 / 120 / 100 / 80 / 60 px), um zu sehen, wo
es kippt.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` ist in diesem Abnahme-Auftrag untersagt und nicht gelaufen | ✓ |
| Die Zelle bleibt in ihrer Spalte, auch bei langem Namen (Nachtrag 1) | `--narrow-column`, Spalte 155–355 (200 px): rechte Kante von `.v2case` = 355 = Spaltenkante, **kein** Kind ragt hinaus (größter Überstand 0 px), auch nicht der Stapel. `--in-use`, Spalte 507–767 (260 px): 0 px Überstand in allen drei Zeilen — neben dem langen Namen, neben „offen", neben dem Stapel | ✓ |
| Wo kippt es? (Spalte zur Laufzeit verengt) | 160 / 140 / 120 px: weiterhin 0 px Überstand. Ab **100 px** kippt es, und zwar am Zustands-Chip, nicht am Namen: `.bdg` ist 90–114 px breit und schrumpft nicht — Überstand 6 px („Zur Prüfung"), 14 px („Klärung offen"); bei 80 px 10–34 px, bei 60 px 30–54 px. Name und Nummer bleiben auf jeder Stufe innerhalb der Spalte (Screenshot `ab95-narrow-100.png`). Der Chip ist ein unteilbarer Baustein — unter 120 px trägt ihn keine Zelle mehr; das ist die Grenze der Spalte, nicht der Zelle | ✓ mit Grenze |
| Der Name kürzt mit **sichtbarem** Auslassungszeichen | `--narrow-column`: `clientWidth` 200 gegen `scrollWidth` 422 / 284 / 213; Screenshot `ab95-narrow.png` zeigt „Wartung der Klimaanlage im …", „Eingangsrechnung: Stadtwer…", „Reinigungspauschale Septe…". `--in-use`: zweite Stapelzeile 260 gegen 284, sichtbar „Eingangsrechnung: Stadtwerke Muste…" (`ab95-inuse-r2.png`). Damit ist genau das behoben, was in Runde eins nur deklariert war: `clientWidth` war dort gleich `scrollWidth` | ✓ |
| Der Name behält mindestens acht Zeichen — auch im Stapel | `.v2case__link` hat `min-width: 8ch` = gemessen 69,69 px; die Untergrenze greift erst bei einer 60-px-Spalte (`clientWidth` 70 bei 60 px Spalte). Bei dieser Untergrenze passen für „Wartung der Klimaanlage" **sieben** Zeichen plus das Auslassungszeichen (Canvas: „Wartung" 57,7 px + Ellipse 12,3 px = 70 px) — `ch` misst die Ziffer Null, nicht den Buchstaben, deshalb sind es sieben und nicht acht. Ab 120 px Spalte bekommt der Name die volle Spaltenbreite. Der Fall aus Runde eins (8 px, einzelner Buchstabe, zweimal ohne Auslassungszeichen) ist damit ausgeschlossen | ✓ |
| Der Umbruch der Nebenteile macht nichts kaputt | Kindpositionen in `--narrow-column` (200 px), relativ zu `.v2case__one`: Name y 0 über volle Breite, Nummer y 32 links, Chip y 28 daneben, Teilbetrag y 58 rechtsbündig — keine Überlappung, nichts abgeschnitten, die drei Teilbeträge in `--in-use` schließen rechts bündig bei x = 767. **Kosten:** die Zeile wächst. `--in-use` misst 75 px für die Ein-Fall-Zeile (gegen 47 px der Zeile mit „offen"), 180 px für die Stapelzeile; `--narrow-column` 264 px. Damit trifft die Aussage im Abschnitt „behoben" nicht mehr zu, die Stapelzeile sei mit 95 px die einzige höhere: auch die **Ein-Fall**-Zeile ist jetzt 75 px hoch, weil der Chip in die zweite Zeile rückt. Das ist der bewusste Tausch (der Name behält seinen Platz), im CSS begründet — kein Mangel, aber die Zahl gehört richtig ins Protokoll | ✓ mit Korrektur |
| Kein Element überdruckt die Nachbarspalte | `--in-use` und `--narrow-column`: für jedes Kind der Zelle `right − Spaltenkante ≤ 0`. Screenshots bestätigen es — der Chip „Zur Prüfung" steht in Runde zwei innerhalb der Spalte, in Runde eins überdruckte er „1.249,90 €" | ✓ |
| `CaseLink.currency` ist `Currency`, kein `string` mit Cast | `case-title.ts` Z. 34: `currency?: Currency \| null`, importiert aus `@/ludwig/shared/money`. `grep -n "as Currency\|as unknown\| as string"` über `CaseCell.tsx`, `case-title.ts` und die Story → kein Treffer; `CaseCell.tsx` Z. 73 reicht `c.currency ?? "EUR"` ohne Cast durch. Story setzt `currency: "EUR"` als Literal | ✓ |
| Die Kette Anzeigename → Nummer → Kurz-ID greift weiter | `--fallbacks`, gerenderte Texte: „Wartung der Klimaanlage" · „Eingangsrechnung: Bürobedarf Meier GmbH" · „Eingangsrechnung" · Kennung `c-d4f9e1` statt `2026-0412`. `caseTitle()` bleibt die Durchreiche auf `caseDisplayTitle()`; keine zweite Ableitung in der Familie | ✓ |
| `cases={[]}` zeigt „offen", nie einen Gedankenstrich | `--none`: zwei `.v2case__none` mit Text „offen"; erstes Kind `<a href="#zuordnen">`, zweites ein Textknoten. Prüfung auf Gedankenstriche über den gerenderten Text aller sieben Stories → kein Treffer. Pille: Radius 999px, Grund `rgb(244,246,248)`, Schrift `rgb(92,92,92)`; Fokus auf dem Link `outline 2px solid rgb(59,143,196)` | ✓ |
| Mehrere Fälle als Stapel mit Teilbetrag je Zeile | `--many`: `.v2case--stack` ist `display: grid`, Beträge „812,50 €" · „96,20 €" · „341,20 €", rechte Kanten alle bei x = 436, `font-variant-numeric: lining-nums tabular-nums`, `text-align: right`; kein Element der Zelle zentriert | ✓ |
| Zustand aus `StatusBadge axis="sachverhalt"`, kein (i) | `--many`: Chips „Zur Prüfung" · „Klärung offen" · „Verbucht" — die Labels der Registry-Achse. `document.querySelectorAll('button[aria-label*="erkl"]')` → 0 in `--single`, `--many`, `--in-use`, `--narrow-column` | ✓ |
| `showState={false}` lässt den Punkt weg und sonst alles stehen | `--without-state`: `.bdg` → 0 Treffer; Text bleibt „Wartung der Klimaanlage / 2026-0412" | ✓ |
| Die Zelle baut keine URL, rechnet nichts, sortiert nicht | `grep -n "clients/\|/clients"` → kein Treffer; `grep -n "\.sort(\|\.reduce(\|\.filter(\|Math\."` über `CaseCell.tsx` und `case-title.ts` → kein Treffer. Gerendertes `href="#sachverhalt-c-2026-0412"` kommt aus der Story-Funktion | ✓ |
| Die Nummer bricht nie um | `--in-use` und `--narrow-column`: `.v2case__no` hat `white-space: nowrap`, `getClientRects().length` = 1 in allen Vorkommen | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--single`, `--many`, `--none`, `--without-state`, `--fallbacks`, `--narrow-column`, `--in-use`. Sieben statt der sechs aus §6 — die siebte ist `NarrowColumn`, die dieser Nachtrag verlangt; `lädt`/`Fehler`/`leer nach Filter` sind unter „Verhalten" begründet. Die Stories-Tabelle oben führt `NarrowColumn` noch nicht auf (Pflege, kein Mangel) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, Zahlen rechts mit `tnum`, nichts zentriert ✓ · kein Hex, kein px in `CaseCell.tsx`/`case-title.ts` (px nur in den Rastermaßen der Stories) ✓ · Status nur über die Registry, jeder farbige Zustand mit Wort ✓ · kein Icon ohne Wort, kein Emoji, keine Versalien ✓ · Fokusring 2 px sichtbar, Hover antwortet (`rgb(45,45,45)` → `rgb(26,58,92)` plus Unterstreichung) ✓ · Kontrast der „offen"-Pille 6,2:1 ✓ · Karte hat Rand statt Schatten ✓. **Eine Zeile bleibt bewusst offen:** „Zeilenhöhe ≤ `.v2tbl__row`" (V1) — 75 px bei einem Fall, 180 px beim Stapel gegen 47 px. Für den Stapel war das schon in Runde eins so und wurde nicht als Mangel gewertet; für den Ein-Fall-Fall ist es der Preis der Behebung von M1/M2 und im CSS begründet | ✓ mit Ausnahme |
| Im Browser angesehen | Screenshots `ab95-narrow.png`, `ab95-inuse-r2.png`, `ab95-narrow-100.png`; Konsole in `--in-use` und `--narrow-column` ohne Meldung (0 gesamt, keine Verschachtelungs-Warnung) | ✓ |
| offen (App): ersetzt `ui/case/CaseCell.tsx` und die Kopie in `KontoauszugView`; die drei Queries nehmen `lifecycleStatus` auf (B3) | nicht in diesem Repo prüfbar | offen (App) |

**Urteil: abgenommen.** Beide Mängel der ersten Runde sind behoben, und zwar
an der Ursache: `.v2case` steht auf `flex` statt `inline-flex`, deshalb hat
die Ellipse jetzt eine Grenze, an der sie greifen kann; und der Name hat mit
`min-width: 8ch` einen Boden, unter den ihn Kennung, Chip und Betrag nicht
mehr drücken. Gemessen ist beides, nicht nur deklariert.

Zwei Zahlen fürs Protokoll, keine Mängel: unter 120 px Spaltenbreite ragt der
Zustands-Chip aus der Spalte — er ist unteilbar, das ist die Grenze der
Spalte und nicht der Zelle; und die Ein-Fall-Zeile ist mit 75 px höher als
die 47 px einer gewöhnlichen Zeile, weil der Chip umbricht.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-06 · Offene Punkte: die
App-Zeile (Ersatz der drei Fassungen, `lifecycleStatus` in den Queries) —
offen (App).

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, ludwig-coordinator)

**Auftrag.** In einer **Zeile** ist die Zelle eine Zeile: Kennung mono, dann
der Name mit Ellipse und dem vollen Wert im `title`, dann der Zustands-Chip.
Die zweizeilige Form bleibt als Option für Karten und Faktentafeln. Neue Prop
`layout: "inline" | "stacked"`, Vorgabe `inline`.

**Grund.** Eine Liste liest sich über ihre Zeilenhöhe. Die zweizeilige Zelle
war so gebaut und so begründet („der Name behält seinen Platz", Abnahme 0095),
aber sie machte die Zeile, in der ein Sachverhalt steht, zum Ausreißer: im
Belegkatalog gemessen **71,7 px** zwischen Zeilen von 48. Ein Unterschied von
24 px ist ein Signal — hier eines ohne Bedeutung, also V7 rückwärts. Und die
Spurbreite half nicht: bei 232 px war die Zelle genauso hoch wie bei 170,
weil `flex-wrap: wrap` umbricht, **bevor** irgendetwas schrumpft.

**Gebaut.**

- `CaseCell` bekommt `layout`, Vorgabe `inline`. Die **Reihenfolge** ändert
  sich mit: die Kennung führt jetzt. Sie ist das, wonach gesucht und was am
  Telefon gesagt wird — und in einer Zeile ist sie der feste Teil, während der
  Name der ist, der nachgibt.
- `.v2case__one--inline` ist `nowrap`; alles außer dem Namen behält seine
  Breite (`flex-shrink: 0`), der Name kürzt und trägt den vollen Wert im
  `title`. `.v2case__one--stacked` ist die alte Regel, unverändert.
- `BankTransactionFacts` — die einzige Faktentafel mit dieser Zelle — setzt
  `layout="stacked"`. Die Listen (`source-document-columns`,
  `bank-transaction-columns`) bekommen die Vorgabe.
- Neue Story `Layouts`: beide Anordnungen in **derselben** 200-px-Spur, damit
  der Unterschied nicht behauptet, sondern gezeigt wird.

**Gemessen** (Dev-Server 6107, CDP, je 700 und 1400 px — beide Breiten mit
identischem Ergebnis):

| | Zeile | Zelle | `flex-wrap` | `title` |
|---|---|---|---|---|
| `Layouts`, `inline` | **48,0** px | 23,0 | `nowrap` | 61 Zeichen |
| `Layouts`, `stacked` | **100,8** px | 76,8 | `wrap` | 61 Zeichen |

Und die Wirkung dort, wo der Befund herkam — Belegkatalog `DocumentList`,
alle Zeilen bei 700 **und** 1400 px:

| | vorher | jetzt |
|---|---|---|
| Zeile mit Sachverhalt | **71,7** px | **48,0** px |
| Nachbarzeilen | 48,0 · 48,0 · 47,0 | 48,0 · 48,0 · 47,0 |

Die CaseCell-Zellen messen dort jetzt durchweg 20,9 px. In
`BankTransactionRow --in-use` ebenso (vier Zellen à 20,9); die eine 67,7-px-
Zeile dort ist die ausgeklappte Aufteilungszeile, nicht diese Zelle.
`NarrowColumn` hält: der Einzelfall 48,0 px, der Fall mit **mehreren**
Sachverhalten 96,9 px — die stehen untereinander (`--stack`), und das ist eine
andere Regel als `layout`.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0. Nicht gebaut (der Bau dieser Welle
läuft in einem eigenen Worktree, Entscheid vom 2026-09-07).

**Status: Abnahme** — gebaut habe ich, abnehmen muss ein anderer. Zu prüfen:
in **allen** Listen-Stories die Zeilenhöhe gleich der Nachbarzeilen, gemessen
bei 700 und 1400 px; die `stacked`-Form unverändert; und dass keine
Faktentafel oder Karte versehentlich auf `inline` gefallen ist.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

**Urteil: zurück.** Der Code ist sauber — alle sechs Wächter grün, alle acht
Stories rendern ohne Meldung, kein Fachtyp lokal nachgebaut, kein Cast, kein
Hex, kein px, keine Label-Map. Zurück geht es an der **Schnittstelle in der
Spec**: die Tabelle unter „Schnittstelle" führt die Prop `layout` nicht, und
der `CaseLink`-Block darüber ist in zwei von neun Feldern veraltet — genau in
den zweien, die spätere Abnahmen im Code korrigiert haben. Die App liest diese
beiden Stellen; beide Mängel kosten dort eine Aufrufstelle, beide kosten hier
drei Zeilen. Am Code ist nichts zu ändern.

**Prüftiefe.** Geprüft wurde die Schnittstelle, nicht die Darstellung
(Owner-Entscheid 2026-09-08, Skill `v3-komponente`, „Zwei Tiefen"). Spurbreiten,
Zeilenhöhen, Überläufe, Kontrastzahlen, Trefferflächen, Hover, Fokus und
Tastaturwege sind nach `0119-visuelle-pruefung-nachholen.md` vertagt. Damit ist
auch die Messung, die der Nachtrag vom 2026-09-07 selbst verlangt — Zeilenhöhe
gleich der Nachbarzeilen in allen Listen-Stories, bei 700 und 1400 px — **nicht**
Teil dieser Abnahme; sie gehört nach 0119.

### Geprüft

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| Jede Prop gegen die Schnittstelle (Typ, Pflicht, Vorgabe) | Code `CaseCell.tsx` Z. 26–52: `cases: readonly CaseLink[]` · `href: (caseId: string) => string` · `emptyHref?: string` · `showState?: boolean = true` · `layout?: "inline" \| "stacked" = "inline"`. Spec-Tabelle Z. 62–67 führt vier davon; `layout` fehlt (M1), `cases` ist dort ohne `readonly` (M4) | ✗ (M1) |
| `CaseLink` gegen den Code | Spec Z. 73–84 gegen `case-title.ts` Z. 23–42: sieben Felder gleich, **`kind`** ist in der Spec `CaseKind`, im Code `CaseKind \| null` (seit 0070 M2 nötig), **`currency`** ist in der Spec `string \| null`, im Code `Currency \| null` (Nebenbefund der Abnahme 2026-09-06, Z. 332, und Kriterium Z. 347) | ✗ (M2) |
| Typen aus `src/ludwig/`, keine lokale Neudefinition | `case-title.ts` Z. 1–6 zieht `caseDisplayTitle`, `CaseKind`, `CaseLifecycle` aus `@/ludwig/modules/accounting-cases/domain/case` und `Currency` aus `@/ludwig/shared/money`. `caseTitle()` ist die Durchreiche, keine zweite Ableitung (L-52). `CaseLink` ist der von der Spec bestellte Schnitt, kein Ansichtsmodell | ✓ |
| Keine `as`-Zusicherung auf einen Fachtyp | `grep -nE "\bas [A-Za-z]\|as unknown"` über `CaseCell.tsx`, `case-title.ts`, `CaseCell.stories.tsx` → zwei Treffer, beide das Wort „as" in englischer Prosa im JSDoc (Z. 23, Z. 38), kein Cast | ✓ |
| `@when`/`@instead` an jedem Export | `CaseCell.tsx` Z. 21–24; `case-title.ts` Z. 50–51 (`caseTitle`) und Z. 65–66 (`caseIdentifier`). `pnpm check:when` → Exit 0 (Konstanten und Typen sind nach der Regel des Wächters ausgenommen) | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `src/ui/v3/entities/accounting-case/CaseCell.tsx`, `CaseCell.stories.tsx` daneben, Titel `v3/Entitäten/Sachverhalt/CaseCell` | ✓ |
| Story je Prop | `cases` → `Single`/`Many`/`None`; `href` → jede; `emptyHref` → `None` (mit und ohne); `showState` → `WithoutState`; **`layout` → `Layouts`**, und die Story belegt beide Werte in derselben 200-px-Spur: gemessen trägt dort ein `.v2case__one` die Klasse `v2case__one--inline`, das andere `v2case__one--stacked` | ✓ |
| Die Vorgabe `inline` greift wirklich | Über alle Stories 19 `.v2case__one`; die 17 außerhalb von `Layouts` tragen ausnahmslos `v2case__one--inline`, obwohl keine von ihnen die Prop setzt | ✓ |
| Story-Zahl gegen `spec-schreiben` §6 | Heute acht: `Single`, `Many`, `None`, `WithoutState`, `Fallbacks`, `Layouts`, `NarrowColumn`, `InUse` (`index.json`). Ableitung mit der neuen Prop: 3 Zustände + 1 Enum-Prop (`layout`) + 1 Layout-Boolean (`showState`) + 0 Callbacks + 1 „im Einsatz" + 1 Rand = **7**, dazu der zweite Rand `NarrowColumn`, den Nachtrag 1 verlangt = **8**. Unter der Obergrenze 10. Die Spec rechnet Z. 116–118 noch „= 6" und ihre Tabelle Z. 120–128 führt `Layouts` nicht (M3) | ✗ (M3) |
| Ausgeschlossene Zustände begründet | `lädt`, `Fehler`, „leer nach Filter" — Begründung unter „Verhalten" (Z. 111–112) und Z. 130–131 | ✓ |
| Status nur über die Registry | `StatusBadge axis="sachverhalt" info={false}` (`CaseCell.tsx` Z. 84); `grep -niE "label\|record<"` über beide Dateien → kein Treffer. Gerendert in `--many`: „Zur Prüfung" · „Klärung offen" · „Verbucht" — die Wörter der Achse | ✓ |
| Kein Hex, kein px in der Komponente | `grep -nE '#[0-9a-fA-F]{3,8}\b'` und `grep -nE '[0-9]+px'` über `CaseCell.tsx` und `case-title.ts` → je kein Treffer | ✓ |
| Die Zelle baut keine URL, rechnet und sortiert nicht | `grep -n "clients/"` → kein Treffer; `grep -nE "\.sort\(\|\.reduce\(\|\.filter\(\|Math\."` → kein Treffer. Gerendert: `href="#sachverhalt-c-2026-0412"` aus der Story-Funktion | ✓ |
| Kein (i) an der Zelle | `document.querySelectorAll('button[aria-label*="erkl"]')` → 0 in allen acht Stories | ✓ |
| Die Aufrufstellen im Set setzen `layout` richtig | `grep -rn "CaseCell" src/` findet drei Aufrufer: `source-document-columns.tsx` Z. 371 und Z. 395 (Liste, Vorgabe `inline`), `bank-transaction-columns.tsx` Z. 264 (Liste, Vorgabe `inline`), `BankTransactionFacts.tsx` Z. 218 (`layout="stacked"`). Keine weitere Faktentafel und keine Karte komponiert die Zelle — die Aussage des Nachtrags stimmt, und keine ist auf `inline` gefallen | ✓ |
| Die sechs Wächter über den Exit-Code | `pnpm typecheck` (0 Zeilen Ausgabe) · `check:language` („2 angefasste Dateien geprüft") · `check:icons` („53 Zeichen in der Registry, 2 Datei(en) noch offen") · `check:contrast` („33 Angaben nachgerechnet") · `check:mirror` („8 Fälle", Spiegel gleich `f1c58c44`) · `check:when` — **je Exit 0**, je ein bis zwei Zeilen Gesamtausgabe, nichts abgeschnitten | ✓ |
| Selbstprüfungen der Wächter | `check-language.mjs --test` (8 Fälle) · `check-contrast.mjs --test` (16) · `check-when.mjs --test` (11) · `mirror-filter.mjs --test` (8) — je Exit 0. `check-icons.mjs` hat keine | ✓ |
| Ein Durchlauf über die Stories im Browser | Ein Skript über alle acht Story-IDs (`scripts/cdp.mjs` aus dem Repo, Dev-Server 6107). Jede Story rendert Text (`innerText` 11–445 Zeichen), jede zeigt die erwarteten Bausteine: `--single` 1 Zelle/1 Chip · `--many` 3 Fälle mit „812,50 €" · „96,20 €" · „341,20 €" · `--none` zweimal „offen", einmal als `<a href="#zuordnen">` · `--without-state` 0 Chips, Text bleibt · `--fallbacks` die vier Stufen inkl. Kennung `c-d4f9e1` · `--layouts` beide Anordnungen · `--narrow-column` und `--in-use` mit vollem `title` je Link. Kein Gedankenstrich in irgendeiner Story | ✓ |
| Konsole | 24 Meldungen über acht Stories = **je drei**, in jeder Story dieselben: `[vite] connecting…`, `[vite] connected.`, der React-DevTools-Hinweis. Keine Warnung, keine Ausnahme, nichts aus der Komponente | ✓ |
| offen (App): Ersatz der drei Fassungen, `lifecycleStatus` in den Queries (B3) | nicht in diesem Repo prüfbar | offen (App) |

### Mängel

1. **`layout` fehlt in der Schnittstellen-Tabelle.** — *Kriterium:* jede Prop
   des Codes steht in der Schnittstelle der Spec, mit Typ, Pflicht und Vorgabe.
   *Ort:* `docs/backlog/0095-case-cell.md` Z. 62–67 gegen `CaseCell.tsx` Z. 52.
   *Befund:* die Prop steht nur in der Prosa des Nachtrags (Z. 400, 412) — die
   Tabelle, aus der die App die Aufrufstelle abliest, kennt sie nicht, und
   damit auch keine Nachweis-Story. Das ist die Prop, deren Vorgabe still
   entscheidet: wer sie nicht kennt, bekommt in einer Faktentafel `inline` ohne
   Typfehler und ohne Hinweis — der Fall, für den der Nachtrag `stacked`
   überhaupt behalten hat. *Kleinster Weg:* eine Zeile in der Tabelle —
   `` `layout` | `"inline" \| "stacked"` | nein, Default `inline` | … | `Layouts` ``.
   **Blockiert.**

2. **Der `CaseLink`-Block nennt zwei Typen falsch.** — *Kriterium:* keine
   Abweichung zwischen dem Typ in der Spec und dem im Code. *Ort:* Spec Z. 78
   und Z. 83 gegen `case-title.ts` Z. 35 und Z. 41. *Befund:* `kind` steht in
   der Spec als `CaseKind`, im Code als `CaseKind | null` — die Lockerung aus
   0070 M2, ohne die der Belegkatalog eine Art erfinden müsste (er tat es, und
   das setzte ein falsches Abzeichen in die Zelle); `source-document-columns.tsx`
   Z. 382 übergibt heute `kind: null` und wäre gegen den Typ der Spec nicht
   übersetzbar. `currency` steht in der Spec als `string | null`, im Code als
   `Currency | null` — die Korrektur, die die Abnahme vom 2026-09-06 selbst als
   Nebenbefund notiert (Z. 332) und als Kriterium führt (Z. 347). Der Block ist
   das, was die App kopiert; er ist an beiden Stellen der Stand vor zwei
   Abnahmen. *Kleinster Weg:* zwei Zeilen im Block auf `CaseKind | null` und
   `Currency | null` setzen, mit dem Halbsatz, warum `kind` null sein darf.
   **Blockiert.**

3. **Die Stories-Tabelle und die §6-Rechnung sind vom Stand vor `Layouts`.** —
   *Kriterium:* jede Prop hat ihre Story, und die Zahl stimmt mit der Ableitung.
   *Ort:* Spec Z. 116–118 und Z. 120–128. *Befund:* die Rechnung endet auf „= 6"
   und kennt weder die Enum-Prop noch den zweiten Rand; die Tabelle führt sieben
   Zeilen, der Baum acht. Die Story `Layouts` **existiert** und belegt die Prop
   (oben gemessen) — es fehlt nur ihr Eintrag. *Kleinster Weg:* eine Zeile in
   der Tabelle und die Rechnung auf „3 + 1 Enum + 1 Layout-Boolean + 1 im
   Einsatz + 1 Rand = 7, dazu `NarrowColumn` aus Nachtrag 1 = 8". Blockiert
   nicht — es kostet drüben keine Aufrufstelle.

4. **`cases` ist im Code `readonly`, in der Spec nicht.** — *Kriterium:* Typ
   gleich. *Ort:* Spec Z. 64 (`CaseLink[]`) gegen `CaseCell.tsx` Z. 33
   (`readonly CaseLink[]`). *Befund:* die Erweiterung ist die richtige Richtung
   — der Aufrufer darf mehr übergeben, nicht weniger —, aber sie steht nicht
   geschrieben. *Kleinster Weg:* `readonly CaseLink[]` in die Tabelle. Blockiert
   nicht.

### Befunde am Set

Nicht gemessen, nur im Vorbeigehen gesehen; nichts davon ist ein Mangel dieser
Abnahme, mehreres gehört nach 0119.

- **Zwei rohe px im CSS der Zelle.** `src/styles/v3.css` Z. 3212
  (`.v2case--stack { gap: 2px }`) und Z. 3247 (`.v2case__none { padding: 1px … }`).
  Beide sind Haarlinien und älter als der Umbau vom 2026-09-07; die Abnahmen
  vom 2026-09-06 haben das Kriterium ausdrücklich auf die TSX-Dateien bezogen.
  Trotzdem: es sind die einzigen zwei Maße dieses Blocks, die kein Token sind.
- **Vier deutsche Kommentarzeilen in `CaseCell.tsx`** (Z. 80, 81, 86, 87 —
  „Der Zustand als Chip…", „Der Teilbetrag kommt aus der Zuordnung…"). Sie
  stammen aus dem ersten Bau (`d47ff29`); `check:language` prüft nach Absicht
  nur die geänderten Zeilen und meldet sie deshalb zu Recht nicht. Der Kommentar,
  den der Umbau vom 2026-09-07 dazugeschrieben hat, ist englisch. Wenn die Datei
  ohnehin nochmal angefasst wird, wären es vier Zeilen.
- **Die Tabelle unter „Schnittstelle" beschreibt `showState` noch als „Punkt"**
  (Z. 67), ebenso die Stories-Tabelle Z. 122 („Zustandspunkt"). Seit der
  Freigabe (a) ist es ein Chip. Reine Wortpflege.
- **Der Baum bewegte sich während der Prüfung.** `BankTransactionFacts.tsx`
  lag beim Lesen noch ungebunden im Arbeitsbaum (fremde Sitzung, mit
  `BankTransactionRow` und `bank-transaction-columns`); inzwischen ist die
  Fassung committet (`53a54f9`) und trägt `layout="stacked"` in Z. 218
  unverändert. Alle Zeilennummern dieses Abschnitts sind gegen den Stand
  `6b24684` nachgezogen, und die sechs Wächter sind auf diesem Stand ein
  zweites Mal gelaufen — wieder je Exit 0 (`check:language` meldet dort
  „nichts geändert", weil der Baum sauber war; der erste Lauf hatte zwei
  angefasste Dateien).
- **Zeilenhöhen, Ellipse, Fokus, Trefferflächen** in `Layouts`, `NarrowColumn`
  und `InUse` sind hier nicht gemessen worden — sie sind der Kern dessen, was
  der Nachtrag vom 2026-09-07 behauptet, und gehören nach
  `0119-visuelle-pruefung-nachholen.md`.

Geprüft von / am: Claude (Abnahme-Agent, schlanke Abnahme Schnittstelle),
2026-09-08 · Nicht gebaut, nichts geändert, nichts gestaged · Offene Punkte:
M1 und M2 (blockierend, je eine Zeile in dieser Spec), M3 und M4 (Pflege), die
visuelle Prüfung (0119) und die App-Zeile (offen).

## Nach der schlanken Abnahme (2026-09-08)

Urteil war **zurück** — und zwar an der **Spec**, nicht am Code. Genau das ist
der Wert dieser Prüftiefe: wer drüben gegen die Schnittstelle in der Spec
baut statt gegen die Datei, bekommt Typen, die es nicht mehr gibt.

**M1 (blockierend) — `layout` steht jetzt in der Schnittstelle.** Die Prop kam
mit dem Owner-Entscheid vom 2026-09-08 dazu und stand nur in der Prosa des
Nachtrags. Wer sie nicht kennt, bekommt in einer Faktentafel still `inline` —
ohne Typfehler, mit falschem Bild. Sie hat jetzt ihre Zeile samt Vorgabe und
Nachweis-Story.

**M2 (blockierend) — der `CaseLink`-Block war in zwei Feldern veraltet.**
`kind` stand als `CaseKind`, im Code ist es seit 0070 M2 `CaseKind | null` —
und der Belegkatalog übergibt heute `kind: null`, wäre gegen den Spec-Typ also
nicht übersetzbar. `currency` stand als `string | null` statt `Currency | null`
(0098 M1). Beide Korrekturen hatten frühere Abnahmen im **Code** längst
erzwungen; die Spec hat sie nicht mitbekommen.

**Die zwei kleinen dazu:** `cases` ist im Code `readonly`, die Spec sagte es
nicht; und die Story-Ableitung stand auf „= 6", gebaut sind **8**
(`NarrowColumn` als zweiter Rand, `Layouts` für die neue Prop). Beide Zeilen
sind nachgezogen, `Layouts` steht in der Tabelle.

Am Code war nichts zu ändern — er war in allen fünf Punkten der Stand, den die
Spec beschreiben sollte.

**Status: Abnahme** — die nächste Runde entscheidet.
