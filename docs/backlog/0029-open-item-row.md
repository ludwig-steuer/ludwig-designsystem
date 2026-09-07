# 0029 · OpenItemRow — DATEV-Offene-Posten als Zeile und Altersgruppe

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/open-item/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, ein offener Posten ist Buchhaltung |
| Quelle | Soll-Katalog §11.7 Stufe 3 „DATEV-OPOS — fehlt (§3.2 Nr. 1)"; `ui-repraesentationen.md` §3.1/§3.2 |
| Ersetzt | die Tabelle inline in `app/(app)/clients/[clientSlug]/[year]/opos/page.tsx` (297 Zeilen, Zeile 175–215) |
| Blockiert | die Seite `[year]/opos`, den Dubletten-Blick der Kanzlei |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Kanzlei sieht, was am Stichtag offen ist — und **wie lange schon**. Heute
rendert die OPOS-Seite ihre Tabelle selbst, mit lokalen Formatierern und
lokaler Label-Map für die Art; die Alters-Gruppierung, die den Blick erst
nützlich macht, gibt es gar nicht. Wer wissen will, was über 90 Tage
überfällig ist, zählt selbst.

## Einordnung

- **Wiederverwenden:** `Row` und `AmountCell` sind die Bausteine, aber die
  Spaltenfolge, die Alters-Ableitung und die Ausgleichs-Aussage sind
  Entitätswissen und gehören nicht in jede Seite.
- **Neue Entitäts-Form, weil:** Regel 5 — `ui-repraesentationen.md` §3.1
  führt „DATEV-Offene-Posten" ohne jede Darstellung und §3.2 stellt sie an
  Platz 1.
- **Zuschnitt:** Familie in einer Datei — `OpenItemRow` (der Posten) und
  `OpenItemAgeGroup` (die Altersklasse als `GroupRow`). Sie ergeben nur
  miteinander Sinn.
- **Setzt auf:** `Row`, `GroupRow`, `AmountCell`, `Time`, `StatusBadge`
  (Achse Ausgleich), Mono-Zelle für Konto und Belegnummer.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `item` | `OpenItem` | ja | Ein Posten (Felder unten) | `Filled` |
| `currency` | `Currency` | nein | Währung der Beträge, Default `"EUR"` | `Filled` |
| `asOf` | `string` | ja | Stichtag — „offen" ist immer eine Aussage zu einem Datum | `Filled` |
| `onOpen` | `(id: string) => void` | nein | Sprung in den Sachverhalt; ohne die Prop ist die Zeile nicht klickbar | `Interactive` |

`OpenItemAgeGroup`: `bucket` (`"notDue" \| "d1_30" \| "d31_60" \| "d61_90" \| "d90plus"`),
`count`, `sum`, `currency`.

Felder aus `ludwig.client_datev_open_items`: `kind`, `personalAccount`,
`externalDocumentNumber`, `invoiceDate`, `dueDate`, `grossAmount`,
`openAmount`, `description`, `isCleared`, `dunningLevel`.
**Befund für `ludwig/app`:** in `src/ludwig/` gibt es dafür **keinen Typ** und
**keine Alters-Ableitung**. Beides gehört dorthin — ein `OpenItem`-Interface
und eine Funktion `openItemAgeBucket({ dueDate, asOf })`, analog zu
`expectationMaturity` in `modules/accounting-cases/domain/case.ts`. Die
Komponente rechnet die Klasse **nicht** selbst; bis die Funktion existiert,
nimmt sie den Bucket als Prop entgegen.

Was die Familie **nicht** kann: gruppieren (der Aufrufer sortiert und
gruppiert, sie stellt dar), Dubletten erkennen, mahnen.

## Verhalten

Server-Component ohne `onOpen`. Zahlen rechts mit `tnum`, Konto und
Belegnummer in `--font-mono`, Text links (V3). Der Ausgleichs-Stand kommt aus
der Registry, nie als lokaler Text (R1); „nach Stichtag ausgeglichen" ist ein
eigener Wert, kein Grauton von „offen". Ein Näherungswert (`amountApprox`)
trägt „≈" vor der Zahl und den Grund im `title`. Mit `onOpen` wird die Zeile
zur `ClickRow` mit Hover (I11).

## Stories

Titel `v3/Entitäten/Offene Posten/OpenItemRow`. Abgeleitet nach §6: 3 Zustände
(gefüllt, leer, Fehler) + 1 Callback + 1 „im Einsatz" + 1 Rand (lange
Buchungstexte, fehlende Felder) = 6.

| Story | Beweist |
|---|---|
| `Filled` | fünf Posten, Kreditor und Debitor gemischt |
| `Grouped` | vier Altersklassen mit Summe und Anzahl je Gruppe |
| `Empty` | „Keine offenen Posten zum 31.08.2026." |
| `Error` | Laden fehlgeschlagen, Wiederholen daneben |
| `Interactive` | Klick auf die Zeile öffnet den Sachverhalt |
| `Edges` | ohne Belegnummer, ohne Fälligkeit, Näherungsbetrag, langer Text |

Nicht anwendbar: `LeerNachFilter` — den Filter trägt die Seite (`FilterBar`, 0003).

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

- [ ] Beträge rechts mit `tnum`, Konto und Belegnummer mono (Story `Filled`, Regel V3)
- [ ] Der Ausgleichs-Stand kommt aus der Registry, kein lokaler Text (Blick in den Code, Regel R1)
- [ ] Die Altersklasse wird nicht in der Komponente gerechnet (Blick in den Code)
- [ ] Fehlende Felder zeigen „—", nie 0,00 € (Story `Edges`)
- [ ] Jede Gruppe nennt Anzahl **und** Summe (Story `Grouped`)
- [ ] Ersetzt die Tabelle in `opos/page.tsx` ohne Funktionsverlust

## Offene Fragen

1. Vier oder fünf Altersklassen? *Ohne Antwort: fünf — nicht fällig, 1–30,
   31–60, 61–90, über 90; das ist die DATEV-übliche Staffel.*
2. Gehört die Mahnstufe in die Zeile? *Ohne Antwort: ja, aber nur wenn > 0 —
   als Wort, nicht als Farbe.*
3. Zeigt die Gruppe auch die Zahl der Sachverhalte? *Ohne Antwort: nein,
   Anzahl Posten und Summe reichen.*

## Abnahme

**Urteil: zurück.** Ein blockierender Mangel (B1). Alles andere steht.

Gemessen am Dev-Server `http://localhost:6107` (Quelle, nicht `storybook-static`),
Chrome headless über CDP, Breiten 900 · 1100 · 1440, Story-Präfix
`v3-entitäten-offene-posten-openitemrow--`.

### Story-Deckung

Acht Stories, und acht sind es nach §6 auch: 4 anwendbare Zustände (`Filled`,
`Empty`, `Loading`, `Error`; „leer nach Filter" in der Spec mit Grund
ausgeschlossen — den Filter trägt `FilterBar`) + 1 Enum-Prop (`bucket` →
`Grouped`) + 1 Callback (`onOpen` → `Interactive`) + 1 „im Einsatz" (`InUse`)
+ 1 Rand (`Edges`) = 8, Obergrenze 10 eingehalten. Die sechs Stories der
Spec-Tabelle sind alle da; `Loading` ist der Nachtrag M6, `InUse` das von §6
geforderte „im Einsatz". Kein `console.error`/`warning` in keiner der acht
(Sweep `ab29-sweep.mjs`).

### Kriterien

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `tsc --noEmit`, exit 0 | ✅ |
| `pnpm build` grün | „Storybook build completed successfully", exit 0 | ✅ |
| `pnpm check:icons` grün | „in Ordnung. 53 Zeichen in der Registry" | ✅ |
| Datei nach der Familie benannt, Story daneben, Titel richtig | `entities/open-item/OpenItemRow.tsx` · `.stories.tsx` daneben · Titel `v3/Entitäten/Offene Posten/OpenItemRow`; Barrel `index.ts:427/433` exportiert Row, Group und die Typen | ✅ |
| Code englisch; `@when`/`@instead` an jedem Export | Bezeichner, Props, Kommentare englisch; `@when`/`@instead` an `OpenItemRow` und `OpenItemAgeGroup`. `open-item.ts` trägt keine — wie `datev-snapshot.ts` (Typdatei, kein Baustein). Story-JSDocs deutsch | ✅ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Kein Hex, kein px in `.tsx`; `AGE_BUCKET_LABEL` ist keine Status-Map — für die Altersklasse gibt es keine Achse, Präzedenz `SNAPSHOT_COUNT_LABEL`, `ACCOUNT_GROUP_LABEL` | ✅ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | siehe „Story-Deckung" | ✅ |
| Prüfliste `design-guidelines.md` §9 | Zeilenhöhe 47/47/47/47/46 px, `Loading` 36 px, kein Sprung · Kontrast Kopf 4.88, Zelle 13.77, `.v2muted` 6.69, Badge 4.78 (alle ≥ 4.5) · `docOver` 0 in allen acht Stories · Zahlen rechts, Text links, nichts zentriert. **Ein Punkt fällt: B1** | ❌ (B1) |
| Im Browser angesehen | Screenshots `ab29-filled-1440.png`, `ab29-edges-1440.png` | ✅ |
| Beträge rechts mit `tnum`, Konto und Belegnummer mono (`Filled`, V3) | `.v2num` = `text-align:right; font-variant-numeric: tabular-nums lining-nums` (v3.css:221) an Brutto, Offen und dem Näherungswert; `.v2mono` an Konto und Belegnummer; Köpfe „Brutto"/„Offen" tragen `v2num` | ✅ |
| Ausgleichs-Stand aus der Registry, kein lokaler Text (R1) | `StatusBadge axis="opos_ausgleich"` mit `offen` / `spaeter_ausgeglichen` (Registry 1629–1632); die Art über `resolveStatus("konto_typ", item.kind)` (1213–1219) — genau die `KIND_LABEL`, die `opos/page.tsx:58` heute lokal hält. Keine lokale Achse, kein `hint` | ✅ |
| Altersklasse wird nicht in der Komponente gerechnet | `OpenItemAgeGroupVM.bucket` kommt als Prop; kein Datums-Rechnen in `OpenItemRow.tsx`; L-05/L-73 im Kopf von `open-item.ts` vermerkt | ✅ |
| Fehlende Felder zeigen „—", nie 0,00 € (`Edges`) | Zeile 1 in `--edges`: Belegnummer, Datum, Fällig, Buchungstext, Mahnstufe, Brutto, Offen alle „—"; `AmountCell` prüft `=== null`, nicht falsy | ✅ |
| Jede Gruppe nennt Anzahl **und** Summe (`Grouped`) | vier `td[colspan=999]`: „noch nicht fällig · 1 Posten · 2.480,55 €", „1 bis 30 Tage überfällig · 1 Posten · 1.249,90 €", „31 bis 60 … 1 Posten · 1.800,00 €", „über 90 … 2 Posten · 852,00 €" | ✅ |
| Ersetzt die Tabelle in `opos/page.tsx` ohne Funktionsverlust | alle neun Spalten der Seite (Z. 159–197) sind gedeckt, Mahnstufe kommt hinzu; Feldnamen zeichengleich mit `OposStichtagItem` (`opos-stichtag-core.ts:61–83`); „≈" nur noch, wo ein Betrag steht — Verbesserung, kein Verlust | ✅ |
| Verhalten: Server-Component ohne `onOpen`, `ClickRow` mit (I11) | `--interactive`: drei `.v2rowbtn`, je in `td[0]`, `aria-label` „Personenkonto 70021 öffnen"; **null** verschachtelte Schaltflächen; Fokus + Enter → „Geöffnet: Personenkonto 70021"; Klick auf das (i) einer Zeile öffnet den Dialog **ohne** die Zeile zu öffnen; Hover über `.v2tbl__row:has(.v2rowbtn):hover` | ✅ |

### Mängel

**B1 — der Buchungstext kürzt nicht und läuft durch vier Spalten. Blockierend.**
`.v2oi__text` (v3.css:3284) setzt `overflow:hidden; text-overflow:ellipsis;
min-width:8ch` auf einen `<span>`, der `display:inline` bleibt — auf einer
Inline-Box wirkt keine der drei Angaben. Gemessen (`getComputedStyle` →
`display:"inline"`): in `--edges` ist der Span **1035 px** breit in einer
**182 px**-Zelle, Überlauf der Zelle **853 px**; in `--filled`, `--grouped`
und `--interactive` je zwei Zellen mit 103–201 px Überlauf. Der Screenshot
`ab29-edges-1440.png` zeigt die Folge: der Text läuft über Mahnstufe,
Ausgleich, Brutto und Offen, die Beträge „1.249,90 €" und „18,40 €" sind
unlesbar; in `ab29-filled-1440.png` klebt „…08/2026—" am Gedankenstrich der
Mahnstufe. Genau der Fall, den Story `Edges` beweisen soll („langer Text"),
fällt durch. — **Vorschlag:** `.v2oi__text` streichen und im Markup `.v2trunc`
verwenden. Die Klasse steht seit Abnahme 0096 in v3.css:3324 und ihr
Kommentar benennt exakt diese Falle („auf einer Inline-Box wirkt weder
`overflow` noch `text-overflow` noch `min-width`"). Gegenprobe: mit
eingespritztem `.v2oi__text{display:block;min-width:0}` fällt der maximale
Überlauf in `--edges` auf **0** bei 1440 **und** 900, die Zeilenhöhe bleibt
47/46 px, und der volle Text steht im `title`. Der gewünschte Boden von 8ch
gehört dann an die Spur (`minmax(8ch, 1fr)`), nicht an den Span.

**M2 — die Belegnummer-Spur ist gegen die Fixtures gemessen, nicht gegen den
Wertebereich.** 130 px, breitester Fixture-Wert „AR-2026-0338" = 90 px. Ein
Belegfeld 1 hat aber bis zu 36 Zeichen; gemessen in derselben Schrift:
17 Zeichen = 128 px (passt knapp), 18 Zeichen = **135 px** (läuft über), und
`MonoCell` kürzt so wenig wie B1 — der Wert läuft dann in Datum hinein.
Nicht blockierend, weil die heutigen Daten kurz sind. — **Vorschlag:** die
Spur auf 150 px, oder die Zelle wie den Buchungstext kürzen lassen (`title`
trägt den vollen Wert).

**M3 — jede Zeile trägt ein zweites (i).** Die Ausgleich-Spalte hat das (i)
im Kopf **und** in jeder Zelle (`StatusBadge` ohne `info={false}`; gemessen
2 Schaltflächen je Zeile in `--interactive`). Die Spaltensätze des Hauses
machen es andersherum: `case-columns.tsx:128/170`,
`source-document-columns.tsx:382/394/401/410`, `DataTable.stories.tsx:133/136`
setzen `info={false}`, sobald der Kopf das (i) trägt. Kostet hier zusätzlich
Platz in der engsten Spur (siehe M4). Nicht blockierend — Z3 verlangt das (i)
am Chip, Z4 am Kopf; welcher der beiden hier weicht, ist ein Entscheid.

**M4 — die Ausgleich-Spur hat 2 px Luft.** 190 px fest, der breiteste Wert
der Achse („nach Stichtag ausgeglichen" + Abstand + (i)) misst **188 px**.
Gemessen gegen den Wertebereich, nicht gegen die Fixtures — er passt also,
aber ein Zeichen mehr oder ein Schrift-Fallback sprengt ihn. Mit `info={false}`
aus M3 fiele der Wert auf rund 168 px. Nicht blockierend.

**M5 — der Spaltenkopf ist handgeschrieben statt `StatusHeader`.**
`OpenItemRow.stories.tsx:100–102` schreibt `<span>Ausgleich <StatusInfoButton
axis="opos_ausgleich" /></span>`. Die Freigabe nennt ausdrücklich
„`StatusHeader` auf der Ausgleich-Spalte", Z4 ebenso, und `.v2sth`
(v3.css:2864, inline-flex/baseline/gap) existiert genau dafür. Nicht
blockierend, aber es ist die Markup-Kopie, gegen die 0077 gebaut wurde. —
**Vorschlag:** `<StatusHeader axis="opos_ausgleich" label="Ausgleich" />`.

**M6 — die fünfte Altersklasse steht in keiner Story.** `Grouped` und `InUse`
zeigen `notDue`, `d1_30`, `d31_60`, `d90plus`; `d61_90` wird nirgends
gerendert. Die Spec-Tabelle sagt „vier Altersklassen", die Freigabe entschied
aber fünf, und §6 will die Werte einer Enum-Prop nebeneinander. Nicht
blockierend. — **Vorschlag:** eine fünfte Gruppe in `Grouped`.

**M7 — `currency` hat keinen Nachweis.** Die Schnittstellen-Tabelle nennt
`Filled`, dort wird die Prop nie gesetzt; alle acht Stories laufen auf dem
Default `"EUR"`. Nicht blockierend. — **Vorschlag:** ein Posten in `Edges`
mit `currency="CHF"`.

**M8 — zwei Aussagen im Code, die die Darstellung nicht hält.** (a) Der
JSDoc von `OpenItemRow` sagt, `asOf` stehe „in the empty state, in the group
heading and in the settlement column" — `OpenItemAgeGroup` kennt `asOf` gar
nicht, und der Leertext gehört dem Aufrufer; sichtbar trägt den Stichtag nur
der `title` des Chips. (b) `open-item.ts:31` schreibt, `0` und `null` bei
`dunningLevel` seien „not the same" — gerendert wird für beide „—"
(`item.dunningLevel ? … : —`). Der Freigabe-Entscheid 2 deckt nur „> 0" und
„null", also kein Verstoß, aber Kommentar und Code sagen Verschiedenes.
Nicht blockierend.

### Befund am Set (nicht an dieser Aufgabe)

**S1 — die Kürzungsregel wird ein zweites Mal erfunden.** `.v2trunc` steht
seit 0096 in v3.css und trägt im Kommentar die Messung, die diese Falle
erklärt; 0029 hat daneben `.v2oi__text` gestellt und ist in dieselbe Falle
gelaufen (B1). Das ist kein Fehler dieser Aufgabe allein — es fehlt der Satz
„eine kürzende Zelle bekommt `.v2trunc`, keine eigene Klasse" in der
Prüfliste. Vorschlag fürs Register: als Befund aufnehmen und in
`design-guidelines.md` §9 eine Zeile ergänzen.

Abgenommen von / am: designsystem-abnahme (fremd, ohne Bauauftrag), 2026-09-07
· Offene Punkte: **B1 blockiert**; M2–M8 nicht blockierend.

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Ist-Zustand exakt bestätigt (`opos/page.tsx` Z. 175–215, lokale `KIND_LABEL` und `AUSGLEICH_LEGEND`). Die Achse heißt **`opos_ausgleich`** und steht seit `ludwig/app` 700dbcb8 im Spiegel (hier gezogen mit 994fda2) — die Zeile baut die Spalte über `StatusBadge axis="opos_ausgleich"`, keine lokale Achse (0080). Die Wartebedingung dieser Aufgabe ist damit weg.

Entscheide: 1 fünf Klassen, Union zeichengleich in L-05: `notDue | d1_30 | d31_60 | d61_90 | d90plus` · 2 Mahnstufe als Wort nur > 0, bei `null` „—" · 3 keine Sachverhalts-Zahl in der Gruppe. Zuschnitt: Row + `OpenItemAgeGroup` bleiben (Gruppierung ist der Job, `DataTable` gruppiert nicht), `StatusHeader` auf der Ausgleich-Spalte; `openItemColumns` erst, wenn `opos/page` auf `DataTable` wandert.

Vor dem Bau in die Spec: L-66 zitieren mit Übergangsregel; `Blockiert` auf `[year]/opos` und den Dubletten-Blick kürzen, Schritt 5 raus (der steht auf Erwartungen, 0025); Feldliste berichtigen — `dunning_level` ist optional im VM `OpenItemLine`, `openAtStichtag`/`clearedAfterStichtag`/`amountApprox` sind Felder des Seiten-VMs `OposStichtagItem`; `Timestamp` → `Time`.

Befunde ins Register: **L-73** — L-05 gehört zu `datev-truth`, nicht `accounting-cases`, und das Modul braucht ein `domain/`; Bucket-Union wie oben festschreiben; L-66 um 0029 als Wartenden ergänzen.

## Nachtrag 2026-09-06, vor dem Bau

**Die Wartebedingung ist weg.** Die Achse heißt `opos_ausgleich` und steht im
Spiegel; die Zeile baut die Ausgleichs-Spalte über
`StatusBadge axis="opos_ausgleich"` und der Spaltenkopf über
`StatusInfoButton axis="opos_ausgleich"` — keine lokale Achse, kein `hint`.

**L-66 mit Übergangsregel.** Die übrigen neun Spaltenköpfe dieser Tabelle
haben keine Achse und tragen deshalb **kein** (i). Das ist die Regel, solange
L-66 offen ist: ein Kopf ohne Achse bekommt keinen Erklärtext, statt einen zu
erfinden. Sobald die Achsen da sind, wandern sie an dieselbe Stelle.

**Die Art kommt aus der Registry.** `Kreditor`/`Debitor` stehen in der Achse
`konto_typ`; die Zeile liest sie mit `resolveStatus("konto_typ", item.kind)`
statt einer lokalen Map — genau die Map, die `opos/page.tsx` heute hat (R1).

**Feldliste berichtigt.** Der Typ ist der Schnitt des Seiten-VMs
`OposStichtagItem` (`modules/datev-truth/application/opos-stichtag-core.ts`),
nicht der Zeilen-VM `OpenItemLine`: `openAtStichtag`, `amountApprox` und
`clearedAfterStichtag` sind Felder des Seiten-VMs, `dunningLevel` ist dort
optional. `Timestamp` gibt es im Set nicht — die Daten kommen über `Time`.

**Was der Typ hier soll und wie lange.** `open-item.ts` definiert `OpenItem`
und `OpenItemAgeBucket` lokal, weil `datev-truth` **kein** `domain/` hat —
Befund **L-73**. Die Union ist zeichengleich zur Freigabe:
`notDue | d1_30 | d31_60 | d61_90 | d90plus`. Die Altersklasse rechnet die
Komponente **nicht**; bis `openItemAgeBucket({ dueDate, asOf })` drüben
existiert (**L-05**), gibt der Aufrufer sie mit. Am Tag, an dem das Modul ein
`domain/` bekommt, wird diese Datei gelöscht und von dort importiert.

**Zuschnitt bestätigt:** `OpenItemRow` und `OpenItemAgeGroup` bleiben —
gruppieren ist der Job dieser Ansicht, und `DataTable` gruppiert nicht.
`openItemColumns()` erst, wenn `opos/page` auf `DataTable` wandert.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — die Zeile hatte keine Spalten mehr.** Sie übergab `Row` ein
**Komponenten-Element** (`<Cells … />`), und der Zellen-Wrapper aus 0106 kann
nicht in eine Komponente hineinsehen: die ganze Zeile landete in **einer**
`<td>` von 90 px mit 368 px Inhalt. Jetzt wird `Cells({...})` als Funktion
gerufen; gemessen 10 Kopfzellen gegen 10 Zeilenzellen, Kopf und Zeile enden
bei 1397 px, Überlauf 0. **Ein Durchlauf über alle Stories des Sets zeigt
keinen zweiten Fall dieser Art** — das war die einzige Stelle.

**M2 — verschachtelte Schaltflächen.** Mit M1 verschwunden: `.v2rowbtn`
umschließt jetzt nur die erste Zelle. Der Zeilenknopf heißt außerdem
„Personenkonto 70021 öffnen" statt der aneinandergehängten Zeile.

**M3 — `1fr` und ein zu kleines `minWidth`.** `minmax(0, 1fr)`, und `minWidth`
deckt jetzt die festen Spuren **plus** neun Lücken à 10 px und zweimal 18 px
Polster: 1090 + 90 + 36 → 1300.

**M4 — `onOpen` bekommt das Personenkonto.** Das bleibt so, aber die Prop sagt
es jetzt: ein offener Posten trägt **keine** Fall-Kennung, das VM der App
hat auch keine, und die OPOS-Seite navigiert über das Konto. Die Story-Keys
nehmen die Belegnummer, nicht das Konto.

**M5 — `"use client"` gestrichen.** `ClickRow` trägt die Grenze selbst.

**M6 — `Loading` ergänzt.** Fünf Zeilen in der Form der Tabelle, Köpfe bleiben.

**M7/M8** — toter Ternär raus, der Stichtag im Erklärtext formatiert.

## Nach der Abnahme (2026-09-07): der Text lief quer über vier Spalten

**B1 erledigt, und der Grund gehört ins Protokoll.** `.v2oi__text` trug
`overflow: hidden`, `text-overflow: ellipsis` und `min-width: 8ch` — auf einem
`<span>`, der `display: inline` blieb. Keine der drei Angaben wirkt dort.
Gemessen war der Span **1.035 px breit in einer 182-px-Zelle**: der
Buchungstext lief über Mahnstufe, Ausgleich, Brutto und Offen, und die Beträge
waren unlesbar. Ausgerechnet die Story `Edges`, die das beweisen soll, fiel
durch.

Die Klasse ist gestrichen. Die Zelle nimmt `.v2trunc` — die Regel, die seit der
Abnahme von 0062 im Set steht und deren Kommentar genau diese Falle benennt.
Gemessen: Box **182 px** in einer 182-px-Zelle, `display: block`, Zeilenhöhe
46/47 px unverändert; der Inhalt ist weiterhin 1.035 px breit, aber er steht
jetzt **hinter** der Kürzung statt neben ihr.

Im Kommentar an `.v2trunc` steht jetzt, dass sie nicht ein zweites Mal
erfunden wird — mit dieser Messung als Grund.

**Auch erledigt:**

- **M2** — die Belegnummer-Spur war gegen die Fixtures bemessen (max. 90 px),
  während Belegfeld 1 **36 Zeichen** trägt. Die Zelle kürzt jetzt ebenfalls
  (`.v2trunc`, voller Wert im `title`). Gemessen: 130 px, kein Überlauf.
- **M3** — jede Zeile trug ein eigenes (i) zur selben Legende. Zwanzig Zeilen
  hätten zwanzig Knöpfe zum selben Dialog gehabt; der Spaltenkopf trägt es,
  die Zeile nicht mehr (`info={false}`, wie in `case-columns`,
  `source-document-columns` und `DataTable`). Gemessen: **ein** (i) je Liste.
- **M6** — die fünfte Altersklasse `d61_90` stand in keiner Story. Sie steht
  jetzt in `InUse`; gemessen sind dort alle drei Gruppen mit ihrem Wort.
- **M7** — `currency` lief in allen acht Stories auf dem Default. Ein Posten
  in `InUse` steht jetzt in Franken. Gemessen: „412,00 CHF".
- **M8** — der Kommentar behauptete, `null` und `0` seien „zwei verschiedene
  Stillen"; die Zelle zeigt für beide „—". Der Kommentar sagt das jetzt und
  nennt den Grund: die Zeile hat für den Unterschied keinen Platz, und keine
  der beiden Lesarten ändert, was zu tun ist.

**Offen, mit Adresse:**

- **M4** — die Ausgleich-Spur hat gegen den breitesten Achsenwert 2 px Luft
  (190 gegen 188). Das hält, ist aber knapp; sobald die Achse ein längeres
  Wort bekommt, reißt es. Kein Mangel heute.
- **M5** — der Spaltenkopf ist handgeschrieben, obwohl `StatusHeader` dafür da
  ist und die Freigabe ihn nennt. Das ist ein eigener Umbau, kein Nachtrag:
  der Kopf trägt vier Spaltengruppen und eine Legende. **Gehört in eine eigene
  Aufgabe**, sonst fasse ich in einer Mängelrunde die halbe Liste an.
- **S1 (Befund am Set) ist mit dem Kommentar an `.v2trunc` abgetragen**, aber
  der Satz gehört zusätzlich in `design-guidelines.md` §9: „eine kürzende
  Zelle bekommt `.v2trunc`, keine eigene Klasse". Das ist eine Regeländerung
  und gehört dem, der die Regeln führt.
