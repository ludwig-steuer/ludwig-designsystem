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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

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
