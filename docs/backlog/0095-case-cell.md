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
| `cases` | `CaseLink[]` | ja | Die Sachverhalte dieser Zeile. **Leer heißt „noch keiner"** und ist der häufigste Fall im Kontoauszug (65 %) | `None`, `Single`, `Many` |
| `href` | `(caseId: string) => string` | ja | Das Ziel je Fall. Die Zelle baut keine URL — sie kennt weder Mandant noch Jahr | `Single` |
| `emptyHref` | `string` | nein | Wohin „offen" führt (der Zuordnungs-Reiter). Ohne die Prop ist „offen" ein Wort ohne Weg | `None` |
| `showState` | `boolean` | nein, Default `true` | Der Zustand als Punkt hinter dem Namen. `false`, wo die Zeile den Zustand schon in einer eigenen Spalte führt | `WithoutState` |

`CaseLink` ist die Teilmenge von `CaseListItem` (`src/ludwig/modules/accounting-cases/domain/case.ts`),
die diese Zelle braucht:

```ts
interface CaseLink {
  caseId: string;
  caseNumber: string | null;
  fiscalYear: number | null;
  title: string | null;
  kind: CaseKind;
  counterpartyName: string | null;
  lifecycleStatus: CaseLifecycle | null;
  /** Nur im Kontoauszug: der Teilbetrag, der auf diesen Fall entfällt. */
  amount?: number | null;
  currency?: string | null;
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
1 Rand = 6.

| Story | Beweist |
|---|---|
| `Single` | Ein Fall: Anzeigename, Nummer, Zustandspunkt, ein Link |
| `Many` | Drei Fälle in einem Stapel, je mit Teilbetrag — die Fassung aus dem Kontoauszug |
| `None` | Kein Fall: „offen" mit `emptyHref`, und daneben dieselbe Zelle ohne die Prop |
| `WithoutState` | `showState={false}` in einer Liste, die eine eigene Zustands-Spalte hat |
| `Fallbacks` | Rand: vier Zeilen, die die Kette durchspielen — mit `title`, ohne `title` (Art + Gegenpart), ohne beides (nur Art), ohne `caseNumber` (Kurz-ID) |
| `InUse` | In einer `Table` als Spalte „Sachverhalt" neben Beleg und Betrag — wie `documents/page` sie heute baut |

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
