# 0116 · `MasterDetail` — die zwei Hälften und ihre Untergrenze

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Liste und Detail, kein Fachwort |
| Quelle | Bestand (0001, aus der App geholt) · Abnahmen 0063 und 0050 vom 2026-09-07, die beide an derselben Stelle hingen |
| Ersetzt | — (der Baustein steht seit der Erstbestückung) |
| Spec von / am | Claude, 2026-09-07 — **nachgeschrieben**, nicht vorausgeschrieben |

## Warum es diese Datei gibt

`MasterDetail` trägt zwei Ansichten des Sets (`CaseDetailView` 0050,
`LedgerAccountView` 0063) und hatte **keine Spec**. Beide Abnahmen sind am
selben Tag über dieselbe Stelle gestolpert — die Randspalte hält ihre 440 px
bis zu jeder Breite —, und beide Male gab es keinen Ort, an dem das Verhalten
festgeschrieben stand. Diese Datei hält den heutigen Stand fest und die zwei
Entscheidungen, die aus den Abnahmen kamen. Sie schreibt nichts Neues vor.

## Was der Baustein tut

Zwei Hälften nebeneinander, Auswahl links, Arbeit rechts (`@when Picking from
a list, working on the selected item on the right`). `detailBreit` dreht das
Gewicht um: schmale Randspalte links (440 px), breite Arbeitsfläche rechts —
für Schritte, in denen rechts gearbeitet und links nur ausgewählt wird.

## Die zwei Entscheidungen vom 2026-09-07

**1. Die Untergrenze gehört dem Aufrufer.** Ohne eine fiel die Randspalte nie
zurück, und eine breite Tabelle daneben verlor ihre rechten Spalten in den
Querlauf (0063: die Haben-Spalte stand bei keiner Breite im Bild). Eine feste
Schwelle war aber genauso falsch — mit 1.080 px kippte 0050 bei 1280 px
Fensterbreite in die Einspaltigkeit, obwohl seine Fakten bei 484 px lesbar
sind. Deshalb `minDetail` (Vorgabe **620**, die kleinste Tabelle des Sets);
0050 gibt **484**.

Der Umbruch läuft über den Flex-Sockel, nicht über eine Container-Abfrage:
eine Abfrage bräuchte die Schwelle als Literal, und genau das war der Fehler.

**2. Beim Umbruch steht die Arbeitsfläche oben.** Vorher stand die Randspalte
über der Arbeitsfläche: wer in der Kontoansicht die Buchungen suchte,
scrollte erst an den Fakten vorbei. `flex-wrap: wrap-reverse` dreht die
Zeilenfolge — nebeneinander ändert es nichts, im Umbruch kommt die
Arbeitsfläche nach oben.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `list` | `ReactNode` | ja | die Auswahl-Hälfte | `Filled` |
| `detail` | `ReactNode` | ja | die Arbeits-Hälfte | `Filled` |
| `detailBreit` | `boolean` | nein | dreht das Gewicht um: **440 px** links (ein CSS-Literal — der Aufrufer kann die Arbeitsfläche verschieben, die Randspalte nicht), der Rest rechts | `DetailBreit` |
| `minDetail` | `number` | nein | wie viel die Arbeitsfläche braucht, bevor die beiden umbrechen. **Nur mit `detailBreit`** — ohne wird der Wert stillschweigend verworfen. Ohne die Prop gilt die Vorgabe des Stylesheets (620, die kleinste Tabelle des Sets) | `DetailBreit` |
| `style` | `CSSProperties` | nein | steht im Bestand, **hat aber keinen Nutzer**: kein Aufrufer im Repo übergibt sie, keine Story zeigt sie. Sie bleibt, weil sie da ist; einen Zweck schreibt diese Spec ihr nicht zu | — |

Zwei weitere Exporte liegen in derselben Datei und gehören zur Familie:

| Export | Was er ist | Nachweis |
|---|---|---|
| `ListPane` | die linke Hälfte: Gruppen, Einträge, Auswahl, Leerfall (`groups`, `activeKey`, `onPick`, `empty`) | `Filled`, `Empty`, `EmptyAfterFilter` |
| `DetailPane` | die rechte Hälfte: Titel, Inhalt, Leerfall (`title`, `children`, `empty`) | `Filled`, `NothingSelected` |

**Was er bewusst nicht tut:** die Auswahl führen (das tut `ListPane`), etwas
laden, oder die Reihenfolge der Hälften umkehren — wer links arbeiten will,
tauscht die Inhalte, nicht den Baustein.

## Abnahme

Gemessen über CDP am Dev-Server (`localhost:6107`), headless Chrome, jede Zahl
aus `getBoundingClientRect()` am laufenden Baum. Jeder Messwert wurde
gegengeprüft, indem er auf eine Änderung reagieren musste: der Sockel zur
Laufzeit auf 484 / 620 / 900 gesetzt, Rahmen und Fenster in 1-px-Schritten
durchgefahren, bis die Kippkante fiel.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | Exit-Code beider Läufe `0` (geprüft über `$?`, nicht über die letzte Zeile). `pnpm check:icons` und `pnpm check:contrast` ebenfalls `0` | erfüllt |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` stehen an `MasterDetail`, `ListPane`, `DetailPane`. Englisch nur teilweise: `minDetail` und seine JSDoc sind englisch, `detailBreit`, dessen JSDoc und die Klasse `v2md--detail-breit` deutsch. `MasterDetail.tsx` wurde von `04ae1ad` nicht angefasst, damit greift die Ausnahme aus `CLAUDE.md` — Bestand wird nicht in Masse umbenannt | erfüllt (Bestand) |
| Kein Hex, kein px in der Komponente | Kein Hex. px doch: `minDetail = 620` und `` `${minDetail}px` `` stehen in `MasterDetail.tsx`, die Vorgabe 620 zusätzlich als `var(--v2md-min, 620px)` in `v3.css` — dieselbe Zahl an zwei Orten, der CSS-Sockel dabei tot, weil die Komponente die Variable immer setzt | offener Punkt 2 |
| Prüfliste `design-guidelines.md` §9 | Der Punkt aus derselben Abnahme-Welle sitzt: beide Flex-Kinder tragen `min-width: 0`, gemessen kein Überlauf (`scrollWidth − clientWidth = 0` an Rahmen, Arbeitsfläche und Tabellen-Scroller, 1280 und 1440, beide Aufrufer, kein Dokumentüberlauf). Zustände `lädt` und `Fehler` fehlen — der Baustein trägt keinen Inhalt, die Spec fordert sie nicht | erfüllt, Rest offener Punkt 5 |
| Umbruch ohne `minDetail` unter 1.080, mit `minDetail={484}` unter 944 | Story `DetailBreit`, Rahmen von 1400 in 1-px-Schritten abwärts. Vorgabe 620: bei 1080 nebeneinander (440 / 620), bei 1079 umgebrochen. 484: bei 944 nebeneinander (440 / 484), bei 943 umgebrochen. Gegenprobe 900: 1360 / 1359. Die Formel `440 + minDetail + 20` trifft dreimal, der Messwert reagiert also auf die Prop | erfüllt |
| Im Umbruch steht die Arbeitsfläche oben | `DetailBreit`, zweiter Fall (1.000er Rahmen): `detail.top` 344,8 gegen `list.top` 584,8. `LedgerAccountView --in-use` bei 1280 im `AppShell`: `detail.top` 725,7 gegen `list.top` 1040,2 — die Bewegungstabelle steht über den Fakten, nicht mehr darunter | erfüllt |
| Nebeneinander stehen beide oben bündig | Gleiche `top` bei ungleichen Höhen: `CaseDetailView --in-use` 1280 beide 464 (Höhen 302,4 / 372,8), 1440 beide 464 (302,4 / 331). `LedgerAccountView --in-use` 1440 beide 688,5 (217,6 / 294,5). `DetailBreit` im 1.100er Rahmen beide 58,4 | erfüllt |
| Ohne `detailBreit` bleibt das alte Verhalten | `Filled`, `NothingSelected`, `Empty`, `EmptyAfterFilter`, je bei 1280 und 1440: `display: grid`, `grid-template-columns` 808px 420px bzw. 968px 420px, Detail also konstant 420, Liste links breit. Detail `position: sticky`, `top: 16px`, `max-height: 868px`, `overflow-y: auto`; beide Hälften `top: 16`; kein Dokumentüberlauf | erfüllt |
| Die Untergrenze wirkt in beiden Aufrufern, ohne dass einer den anderen kippt | `CaseDetailView --in-use` (484): bei 1280 Rahmen 944 → nebeneinander 440 / 484; bei 1440 Rahmen 1104 → 440 / 644. `LedgerAccountView --in-use` (Vorgabe 620): bei 1280 Rahmen 976 → umgebrochen, die Tabelle über die vollen 976, Spalte `Haben` bei x 1125–1229 vollständig im Bild; bei 1440 Rahmen 1136 → nebeneinander 440 / 676, `Haben` bei 1285–1389 im Bild. Der Befund aus 0063 — die Haben-Spalte stand bei keiner Breite im Bild — ist bei beiden Breiten weg. Fenster-Kippkanten: 0050 bei 1280 / 1279, 0063 bei 1384 / 1383 | erfüllt, mit offenem Punkt 1 |

Beide Entscheidungen halten an der Wirkung, in der Story und in beiden
Aufrufern. Offene Punkte, keiner davon blockierend:

1. **0050 sitzt bei 1280 exakt auf der Kante, ohne einen Pixel Luft.** Der
   Rahmen misst dort 944 = 440 + 484 + 20; bei 1279 (Rahmen 943) bricht die
   Ansicht um. Gemessen wurde mit überlagernden Rollbalken
   (`innerWidth − clientWidth = 0`), und die Seite scrollt senkrecht — ein
   Browser mit platznehmenden Rollbalken verliert rund 15 px Seitenbreite und
   landet bei einem 1280er Fenster unter der Kante. Vorschlag für 0050 (nicht
   für diesen Baustein): `minDetail` ein Stück unter 484 setzen, damit die
   Ansicht bei 1280 Luft hat.
2. **Die Vorgabe 620 steht an zwei Orten.** `minDetail = 620` in
   `MasterDetail.tsx` und `var(--v2md-min, 620px)` in `v3.css`. Weil die
   Komponente die Variable immer setzt, ist der CSS-Sockel tot; zugleich ist
   das der einzige px-Wert im Baustein. Vorschlag: die Vorgabe aus der
   Signatur nehmen und die Variable nur setzen, wenn der Aufrufer einen Wert
   gibt — dann liegt die Zahl allein im Stil, und das Kriterium „kein px in
   der Komponente" trifft wieder zu.
3. **`start` ist tragend, `flex-start` wäre es nicht.** Unter `wrap-reverse`
   dreht sich die Kreuzachse; gemessen an `LedgerAccountView` bei 1440:
   `align-items: start` → beide Hälften oben bündig bei 688,5;
   `align-items: flex-start` → die kürzere Randspalte fällt auf 765,4 und hängt
   unten, genau wie mit `end`. Wer das Schlüsselwort später „vereinheitlicht",
   kippt das dritte Kriterium lautlos. Gehört als Satz in die Spec.
4. **Lesefolge und Sehfolge laufen im Umbruch auseinander.** Die DOM-Folge
   bleibt Randspalte → Arbeitsfläche (erstes Kind ist `.v2md__list`), die
   Sehfolge dreht sich um (gemessen an `LedgerAccountView` bei 1280). Tastatur
   und Vorlesen laufen also Fakten → Bewegungen, das Auge Bewegungen → Fakten.
   Das ist der Preis von `wrap-reverse` und in dieser Ansicht vertretbar; die
   Spec sollte ihn benennen.
5. **Zustände `lädt` und `Fehler` fehlen** (§9 verlangt fünf). Der Baustein
   trägt keinen Inhalt, insofern gehören sie zu den Hälften — die Spec sagt
   dazu nichts, weder fordernd noch freisprechend.

Getrennt gemeldet, gehört nicht zu 0116: bei `LedgerAccountView` und 1440
steht die Arbeitsfläche auf 676 px, und darin schrumpft `Buchungstext` auf
98,4 px und `Gegenkonto` auf 67,6 px — die Zeilen lesen sich als „B…",
„Schreibware…", „70001 B…". Alle Spalten sind im Bild, aber die Vorgabe 620
sichert nur, dass sie existieren, nicht dass sie tragen. Das ist ein Punkt für
0063.

Abgenommen von / am: Claude (fremde Abnahme, nicht der Bauende), 2026-09-07 ·
Offene Punkte: 1–5 oben, keiner blockierend.

## Nach der Abnahme (2026-09-07): freigegeben, vier Punkte nachgezogen

Die Abnahme hat **freigegeben** und beide Entscheidungen an der Wirkung
geprüft — den Rahmen in 1-px-Schritten durchgefahren und den Sockel zur
Laufzeit variiert, damit der Messwert nachweislich reagiert. Die Formel
`440 + minDetail + 20` trifft dreimal (620 → 1080/1079, 484 → 944/943,
Gegenprobe 900 → 1360/1359). Der 0063-Befund ist weg: die Haben-Spalte steht
bei beiden Breiten im Bild.

**Punkt 1 erledigt — 0050 saß auf der Kante, null Pixel Luft.** Bei einem
1280er Fenster hat die Seite genau 944 px, und die Schwelle lag mit
`minDetail={484}` bei exakt 944. Ein Browser mit **platznehmenden**
Rollbalken verliert rund 15 px und wäre unbemerkt umgebrochen. `CaseDetailView`
gibt jetzt **460**; gemessen steht die Ansicht bei 1260, 1280 und 1440
nebeneinander (Detail 464 / 484 / 644).

**Punkt 2 erledigt — die Vorgabe stand doppelt.** `minDetail = 620` in der
Signatur **und** `var(--v2md-min, 620px)` im Stylesheet; der CSS-Sockel war
tot, weil die Komponente die Variable immer setzte. Jetzt setzt sie die
Variable **nur**, wenn der Aufrufer einen Wert gibt — die Zahl lebt im
Stylesheet, wo px hingehören. Damit ist auch das feste Kriterium „kein px in
der Komponente" wörtlich erfüllt, das der einzige px-Wert des Bausteins
verletzt hatte.

**Punkt 3 als Satz in dieser Spec, weil er sonst lautlos kippt:**
`align-items: start` ist **nicht** dasselbe wie `flex-start`, sobald
`wrap-reverse` im Spiel ist. Gemessen: mit `start` stehen beide Hälften oben
bündig (688,5); mit `flex-start` fällt die Randspalte auf 765,4 und hängt
unten, genau wie mit `end`. Wer die Schlüsselwörter später „vereinheitlicht",
bricht Kriterium 3, ohne dass ein Test anschlägt.

**Punkt 4 benannt, nicht geändert:** im Umbruch stimmt die **Lesefolge** nicht
mit der Sehfolge überein. Das DOM bleibt Liste → Detail, sichtbar steht das
Detail oben. Tastatur und Vorlesehilfe laufen also erst durch die Fakten, das
Auge zuerst über die Arbeitsfläche. Das ist der Preis dafür, die Reihenfolge
mit `wrap-reverse` zu drehen statt im Markup — und die Alternative wäre
schlechter: im Markup gedreht stünde die Arbeitsfläche **nebeneinander**
rechts und im Umbruch oben, aber die Tastatur liefe dann immer zuerst durch
die Arbeitsfläche, auch wenn die Auswahl links daneben steht.

### Was die Abnahme an der nachgeschriebenen Spec gefunden hat

Die Datei sollte den Bestand festhalten und tat es nur halb:

- **`ListPane` und `DetailPane` fehlten ganz** — sie liegen in derselben
  Datei, tragen jede Story und werden hier sogar zitiert („das tut
  `ListPane`"). Sie stehen jetzt in der Schnittstelle.
- **`style` ist eine Prop ohne Nutzer** (null Aufrufer im Repo, keine Story).
  Sie steht im Bestand und bleibt; die Spec sagt das jetzt, statt ihr einen
  Zweck zuzuschreiben, den niemand ausübt.
- **`minDetail` ohne `detailBreit`** wird stillschweigend verworfen. Auch das
  steht jetzt da.
- **Die 440 sind ein CSS-Literal**: der Aufrufer kann die Arbeitsfläche
  verschieben, die Randspalte nicht.
- **`lädt` und `Fehler`** sind für einen reinen Rahmen nicht anwendbar — er
  bekommt beide Hälften als Knoten und zeigt, was er bekommt.
