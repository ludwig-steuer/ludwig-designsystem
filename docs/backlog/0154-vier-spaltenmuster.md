# 0154 · Die vier Spaltenmuster — ein Pattern statt vier Layouts

| | |
|---|---|
| Status | offen — vorgemerkt am 2026-09-10, geht 0152 voraus |
| Stufe | `patterns/` — Nachfolger bzw. Verallgemeinerung von `MasterDetail` (0116) |
| Quelle | **Owner-Entscheid 2026-09-10**, überbracht von `ludwig-cto`; Brief F196 §2, §5, §5a, §8 (`ludwig/app` staging `672665f8`) |
| Blockiert | 0152 (Sachverhalts-Szenarien) — deren Übersicht ist `list \| detail \| sidebar` |
| Berührt | `docs/detailseiten-standard.md` §1.2 („drei Layouts") · `docs/seiten/sachverhalt-detail.md` (D-L1-Entscheid vom 2026-09-08) · `patterns/DetailView.tsx` (0127) |
| Angelegt | Claude, 2026-09-10 |

## Auftrag, wörtlich aus dem Entscheid

> Der Content jedes Reiters ist **immer** eines von vier Spaltenmustern;
> Breiten dürfen nach Gewicht des Inhalts variieren, das Muster nicht:
>
> - `list | detail | sidebar`
> - `list | detail`
> - `50 | 50` (Infoboxen, Diagramme, Vergleiche)
> - `master | sidebar` (master = Content-Fläche)

Der Detailrahmen nimmt es als Content-Slot; Beleg, Konto, Partner und
Sachverhalt bauen aus denselben vier.

## Was das für den Bestand heißt

**Der Standard führt heute drei Layouts** (D-L1 Zonen untereinander, D-L2
Gegenüberstellung, D-L3 Randspalte) und beschreibt sie als Eigenschaft der
**Seite**. Der Entscheid dreht das um: das Muster ist eine Eigenschaft des
**Reiterinhalts**, und eine Seite kann je Reiter ein anderes tragen. §1.2 des
Standards muss das nachziehen — mit der Zuordnung:

| heute | wird | Anmerkung |
|---|---|---|
| D-L1 Zonen untereinander | eine Fläche ohne Spalten | bleibt der Normalfall; im neuen Vokabular kein Muster, sondern die Abwesenheit eines |
| D-L2 Gegenüberstellung | `50 \| 50` | der Beleg (Original gegen Extraktion) ist der Referenzfall |
| D-L3 Randspalte | `master \| sidebar` bzw. `list \| detail` | die zwei gemessenen Breiten (460, 960) sind Beispiele für „Breiten dürfen variieren" |
| — | `list \| detail \| sidebar` | **neu**, und der Grund für diese Aufgabe: die Sachverhalts-Übersicht |

## Was der Schnitt entscheiden muss

1. **Verhältnis zu `MasterDetail` (0116).** Es trägt heute `list`/`detail`,
   `detailBreit` und `minDetail`. Wird es das neue Pattern (dritte Spalte als
   optionaler Slot), oder tritt ein neues daneben und `MasterDetail` wird sein
   Aufrufer? Für ein Weiterbauen spricht, dass die erkämpften Breiten dort
   schon leben; dagegen, dass „Master" und „Liste" im neuen Vokabular zwei
   verschiedene Dinge sind.
2. **Wo die Breiten wohnen.** 460 px und 960 px sind in Abnahmen gegen
   gemessene Seiten entstanden. „Breiten dürfen nach Gewicht variieren" heißt
   nicht „jede Seite erfindet ihre eigene" — das Pattern braucht benannte
   Stufen oder die Pflicht, die Zahl im Seitenprofil zu begründen.
3. **`DetailView` (0127) trägt heute `aside` + `minDetail`.** Das ist
   `master | sidebar`, vorweggenommen. Wandert es ins neue Pattern, wird
   `DetailView` schmaler: er reicht nur noch einen Content-Slot durch, und das
   Muster steckt darin. Das ist die Änderung, die 0152 braucht.
4. **Was mit dem Umbruch passiert.** Drei Spalten auf 1280 px sind eng; das
   Muster muss sagen, welche Spalte zuerst weicht — und die Antwort ist nicht
   „die dritte", wenn dort die Rückfragen stehen.

## Warum nicht sofort

Diese Aufgabe ist der Träger für 0152, nicht dessen Nebenprodukt: wer die
Sachverhalts-Übersicht baut, ohne das Muster vorher zu schneiden, baut die
dritte Spalte einmal für den Sachverhalt und danach noch einmal für alle
anderen. Der Owner setzt die Reihenfolge.
