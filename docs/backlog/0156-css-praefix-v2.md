# 0156 · 664 CSS-Klassen heißen `v2*`, das Set heißt v3

| | |
|---|---|
| Status | offen — Entscheid des Owners nötig, **kein** Bau ohne ihn |
| Stufe | `src/styles/v3.css` und jede Komponente, die eine Klasse schreibt |
| Quelle | Owner, 2026-09-10: „ich frage mich, warum du `v2` als Präfix nimmst — das ganze Designsystem ist eigentlich v3" |
| Angelegt | Claude, 2026-09-10 |

## Der Befund

**664 verschiedene Klassennamen beginnen mit `.v2`, kein einziger mit `.v3`** —
in einer Datei, die `v3.css` heißt, in einem Ordner, der `ui/v3/` heißt.

## Warum das so ist (und warum es niemand entschieden hat)

Es ist Herkunft, kein Entwurf. Das Set ist aus `ludwig/app` geholt worden
(Skill `aus-app-holen`), und dort hieß die Generation **v2**:
`apps/web/src/ui/v2` und `src/styles/v2.css`. Beim Holen wurde die Datei
umbenannt und der Ordner neu benannt — die **Klassennamen nicht**, weil jede
mitgenommene Komponente sonst sofort ungestylt gerendert hätte.

Das war beim ersten Baustein richtig. Nur ist daraus nie eine Entscheidung
geworden: jeder neue Baustein seither erbt ein Präfix aus einer Generation,
die dieses Repo gerade ablöst. Die Kommentare in der CSS zeigen, dass der
Zustand längst reibt — zwei Beispiele wörtlich:

> „Präfix `v2rr`: `v2r*` war vergeben (v2radio, v2raw, v2rowlink), `v2rr` frei."

> „Präfix `v2doc` gehört der Entität und ist mit 0052 vergeben."

Das heißt: der Namensraum ist so voll, dass neue Bausteine sich Kürzel suchen
müssen — und die Notiz dazu steht in einer Memory („kurze `v2*`-Präfixe sind
vergeben; vor dem Benennen greppen"). Der Preis wird bei jedem Baustein neu
bezahlt.

## Was dagegen spricht, es einfach zu tun

- **664 Klassen sind ein Massenumbau.** Er berührt jede Komponente, jede
  Story und jede Messung, die auf eine Klasse zeigt — und dieses Repo misst
  im Browser gegen Klassennamen.
- **Die App rendert dieselben Klassen.** Solange sie ihr eigenes `v2.css`
  fährt und Bausteine von hier einzieht, wären zwei Namensräume gleichzeitig
  unterwegs. Die Migration ist Owner-Sache (Entscheid 2026-09-07: erst das
  Set fertig, dann ein Zug).
- **Der Nutzen ist Klarheit, nicht Funktion.** Nichts ist kaputt; es liest
  sich nur falsch.

## Drei Wege

| Weg | Was passiert | Preis |
|---|---|---|
| **A · Alles umbenennen** | `.v2*` → `.v3*`, mechanisch, ein Commit, danach Messungen nachziehen | Ein Tag Arbeit, ein großer Diff, und er kollidiert mit jeder offenen Welle. Muss mit der App-Migration abgestimmt sein |
| **B · Neues heißt `v3`, Altes bleibt** | Ab sofort trägt jeder neue Baustein `.v3*`; die 664 bleiben, bis sie ohnehin angefasst werden | Billig und sofort. Preis: eine Zeit lang **zwei** Präfixe nebeneinander, und man muss erklären können, warum |
| **C · Nichts tun, aber aufschreiben** | Ein Satz in `docs/design-guidelines.md`: das Präfix ist historisch, es heißt `v2`, und das bleibt so | Kostet nichts. Preis: der Name lügt weiter, und jeder neue Mitleser fragt dasselbe |

**Empfehlung: B — aber erst nach der laufenden Welle.** Ein neues Präfix für
Neues ist der einzige Weg, der den Namensraum entlastet, ohne einen
Massenumbau mitten in offene Aufgaben zu legen. Und er macht die Grenze
sichtbar: was `v3` heißt, ist in diesem Repo entstanden; was `v2` heißt, kam
aus der App und wartet auf seinen Zug.

Gegen A spricht nicht die Arbeit, sondern der Zeitpunkt: solange 0152 und die
Sachverhaltsseite offen sind, würde ein 664-Klassen-Diff jede Abnahme
überdecken.

## Was der Owner entscheiden muss

1. **Welcher Weg** — A, B oder C.
2. Bei B: **gilt das Präfix auch für neue Klassen an alten Bausteinen?**
   Vorschlag: nein. Eine Datei behält ihr Präfix, sonst stehen zwei in einer
   Komponente.
3. Bei A: **wann** — vor oder nach der App-Migration. Vorher heißt: die App
   muss beim Einziehen mitziehen.

## Nicht Teil dieser Aufgabe

Die **Story-Titel** (`v3/Primitives/…`) und die Ordner (`ui/v3/`) sind bereits
richtig; hier geht es allein um die CSS-Klassennamen.
