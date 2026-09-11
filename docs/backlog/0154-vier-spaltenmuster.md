# 0154 · Die vier Spaltenmuster — ein Pattern statt vier Layouts

| | |
|---|---|
| Status | **gebaut 2026-09-10** — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `patterns/Columns.tsx` — **neben** `MasterDetail` (0116), nicht als dessen Nachfolger; die beiden haben verschiedene `@when` |
| Quelle | **Owner-Entscheid 2026-09-10**, überbracht von `ludwig-cto`; Brief F196 §2, §5, §5a, §8 (`ludwig/app` staging `672665f8`) |
| Blockiert | 0152 (Sachverhalts-Szenarien) — deren Übersicht ist `list \| detail \| sidebar` |
| Berührt | `docs/detailseiten-standard.md` §1.2 („drei Layouts") · `docs/seiten/sachverhalt-detail.md` (D-L1-Entscheid vom 2026-09-08) · `patterns/DetailView.tsx` (0127) |
| Angelegt / gebaut | Claude, 2026-09-10 |

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
   `detailWide` und `minDetail`. Wird es das neue Pattern (dritte Spalte als
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

## Beantwortet von `ludwig-cto` (2026-09-10)

| Frage | Antwort |
|---|---|
| Freie Zahlen oder benannte Stufen? | **Benannte Stufen.** „Nach Gewicht variieren" heißt: die Seite wählt eine Stufe, sie erfindet keine Zahl. Die gemessenen 460 und 960 sind die ersten beiden; eine dritte für die schmale Notizspalte wird an der Sachverhalts-Übersicht **gemessen**, nicht geschätzt |
| Was weicht beim Umbruch? | **Die dritte Spalte fällt unter die zweite, die erste nie.** Tragend ist der Strang, nicht die Notiz (Brief §5; Vorschlag an den Owner, noch nicht bestätigt — Alternative: Strang einklappbar) |
| DATEV-Eintrag in der Timeline | Gleichrangig in der **Reihenfolge**, sichtbar verschieden in der **Zeile**: der Eintrag trägt das Wort „DATEV" als Quelle, Ludwig-Einträge ihren Buchungszustand aus der Achse `buchung`. Kein Icon allein (V7). In Spalte 2 hat der DATEV-Eintrag keine Handlungen |

## Gebaut: `patterns/Columns.tsx`

Vier Muster, zwei benannte Stufen, ein Umbruch — und `MasterDetail` bleibt,
wo es ist. **Es wird nicht abgelöst:** es trägt „Liste mit Detail daneben"
außerhalb eines Reiterrumpfs (Auswahl in einem Dialog, ein Log-Browser), und
das ist eine andere Frage als „wie ist dieser Reiter geschnitten". Zwei
Bausteine mit verschiedenen `@when`, kein Nachfolger.

**Alle Spalten wachsen** (`flex-grow ≥ 1`), auch die schmalen — sonst bleibt
eine umgebrochene Spalte schmal oben stehen, statt die Zeile zu nehmen.
Gemessen 2026-09-10 bei 1100 px: mit `grow: 0` stand die Begleitspalte unter
der Arbeitsfläche und war 360 statt 1068 px breit. Das Verhältnis machen die
**Gewichte** (1 zu 2), nicht das Wachstumsverbot.

### Messung (Spaltenbreiten in px)

| Muster | 1440 | 1100 | 820 |
|---|---|---|---|
| `list-detail-aside` | 462 · 544 · 362, eine Zeile | 476 · 572, Notizen darunter über die **volle** Breite (1068) | drei Zeilen à 788 |
| `split` | 694 · 694 | 524 · 524 | 384 · 384 |
| `main-aside` (`table`) | 1005 · 383 | 1068, Begleiter darunter (1068) | 788 · 788 |

Die dritte Spalte weicht also nach unten und **verschwindet nicht**, und die
erste bleibt in jeder Breite stehen — wie im Brief verlangt.

## Was 0152 noch braucht

- **Die dritte Stufe** für die schmale Notizspalte — sie wird an der
  Sachverhalts-Übersicht gemessen, sobald es dort echte Inhalte gibt.
- **`DetailView` schmaler machen:** `aside` und `minDetail` gehören künftig
  ins Muster, nicht in den Rahmen. Solange nur der Partner ihn nutzt (und der
  braucht keine Randspalte), kostet das nichts — es soll aber passieren,
  bevor die zweite Seite eine Randspalte über den Rahmen setzt.
- **Standard §1.2 und `docs/seiten/sachverhalt-detail.md` nachziehen.** Steht
  noch aus: solange 0152 nicht gebaut ist, wäre die neue Regel im Standard
  eine Ankündigung ohne zweiten Fall.

## Nachtrag 2026-09-11 — `main-aside` bricht die Randspalte nach oben

Owner-Entscheid zur Kontoseite (0157): beim Umbruch steht die Randspalte
**über** der Arbeitsfläche, nicht darunter — dort sind es die Stammdaten,
gegen die die Bewegungen gelesen werden, und unter 25 Zeilen findet sie
niemand. Umgesetzt als `flex-wrap: wrap-reverse` an `.v3cols--main-aside`;
die Reihenfolge im DOM bleibt Fläche, dann Randspalte. Die übrigen drei
Muster brechen wie bisher (die dritte Spalte fällt nach unten). Aufrufer von
`main-aside` sind heute nur die Kontoseite und die Stories dieses Musters;
breaking: nein.
