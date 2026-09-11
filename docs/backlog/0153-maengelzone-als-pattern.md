# 0153 · Die Mängel-Zone gehört den Patterns, nicht dem Beleg

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, Endstand c2a2761) |
| Stufe | `patterns/OpenPoints.tsx` |
| Quelle | `ludwig-cto` beim Sichten des Sachverhalts-Briefs (F196 §9, Verweis auf R21), 2026-09-10 · gebaut wurde die Zone mit 0150 |
| Ausgelöst von | 0152 — die Sachverhalts-Übersicht braucht dieselbe Zone, und damit sind es zwei Screens |
| Angelegt | Claude, 2026-09-10 |

## Auftrag

`SourceDocumentDefects` (0150) zeichnet „was ist an diesem Datensatz offen" —
Mängel mit je einem Weg hinaus, dazu die Rückfragen in derselben Box. Sie
steht heute in der **Belegfamilie**, weil es dort den ersten Fall gab.

Der Sachverhalt braucht dieselbe Zone: F196 §9 führt Guard-Warnung, Mängel und
Erwartung mit Eskalation als eigene Befunde. Eine zweite Kopie in
`entities/accounting-case/` wäre die Sorte Doppelung, die R21 verbietet — und
die 0150 gerade an drei handgebauten „Zu klären"-Karten abgeräumt hat.

## Warum noch nicht jetzt

**Eine Entität ist kein Muster.** Nach `spec-schreiben` §3 wird ein Pattern
gebaut, wenn eine Komposition auf **mindestens zwei** Screens vorkommt — heute
ist es einer. Der zweite entsteht mit 0152; erst dann steht fest, was die
beiden wirklich teilen und was nur der Beleg braucht.

Absehbar gemeinsam: die Reihenfolge (was aufhält, zuerst), der Weg je Mangel,
die leere Aussage („nichts offen" als Erfolg, nicht als leere Box), und dass
Klärungen und Mängel **eine** Box sind.

Absehbar belegspezifisch: die Wörter je `DocDefectKind` und die Karte der
Finding-Codes — die kommen aus `source-docs/domain/doc-defects.ts` und gehören
dem Beleg. Ein Pattern nimmt sie als Daten entgegen, es kennt sie nicht.

## Gebaut: `patterns/OpenPoints.tsx`

Die drei Fragen des Schnitts, beantwortet:

1. **Fertige Zeilen.** Das Pattern nimmt `OpenPoint[]` entgegen — Titel, Satz,
   Weg, Zustand, Rohtext. Was ein Mangel ist und wie er heißt, bleibt bei der
   Entität: `docDefects()` beim Beleg, die eigene Ableitung beim Sachverhalt.
2. **Der Name.** `OpenPoints` — „Mangel" ist ein Ludwig-Wort, und ein Pattern
   trägt keins. „Was ist an diesem Vorgang offen" ist die Frage, und sie gilt
   in jeder Anwendung mit Vorgängen.
3. **Die Abgrenzung** steht als Tabelle im JSDoc, damit sie nicht wieder
   verlorengeht:

| | zeigt | wenn leer |
|---|---|---|
| `OpenPoints` | nur, was an **diesem einen** Datensatz falsch ist | „nichts offen" — der gute Fall, in einer Zeile |
| `Checklist` | **jede** Prüfung mit ihrem Urteil, auch die grünen | nie leer; ein Gate, das nichts geprüft hat, ist eins, das nicht lief |
| `TodoList` | einen **Arbeitsvorrat** über viele Datensätze | „nichts zu tun", ein Arbeitszustand |

`SourceDocumentDefects` bleibt als Entitätsform bestehen und liefert die
Wörter; gezeichnet wird die Zone vom Pattern. **Zwei CSS-Präfixe sind dabei
gewandert:** `.v2docaside` heißt `.v2boxbody` (der Rumpf einer Box unter ihrem
Kopf — ein Fachwort in einer Regel, die keine Entität kennt, wäre falsch), und
`.v2docdef*` heißt `.v2open*`.

Gemessen an den Beleg-Stories: vier Punkte im Mangelfall, „An diesem Beleg ist
nichts offen." im guten, keine alte Klasse mehr im DOM.

## Was beim Schnitt zu klären war

1. Nimmt das Pattern eine **fertige Liste** von Zeilen (Titel, Satz, Weg)
   entgegen, oder eine Entitätsableitung je Aufrufer? Ersteres hält es frei
   von Fachwissen, letzteres spart dem Aufrufer die Übersetzung.
2. Wie heißt es? „Mangel" ist Ludwig-Wort; ein Pattern darf kein Fachwort
   tragen. `OpenPoints`, `ToDoZone`, `IssueList` — der Name entscheidet sich
   am GLOSSARY, nicht am Gefühl.
3. Verhältnis zu `TodoList` (0054) und `Checklist` (`patterns/Review.tsx`):
   drei Bausteine für „was ist noch zu tun" sind zwei zu viel. Der Schnitt
   muss sagen, was jeder von ihnen **nicht** ist.

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761; statische Checks (typecheck, check:language, check:when, check:contrast, check:icons, check:jobs, check:mirror, build) auf 6d58b58 und bca4b7d alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Pattern nimmt fertige Zeilen (`OpenPoint[]`) | `patterns/OpenPoints.tsx`; Aufrufer Beleg (`SourceDocumentAside.tsx`), Sachverhalt (`showcase/case/scenario.tsx`), Konto (`showcase/account/scenario.tsx`) | ok |
| Name ohne Fachwort, Abgrenzungstabelle im JSDoc | `OpenPoints.tsx:25–26` Tabelle `Checklist`/`TodoList`, `@instead :54` | ok |
| Alte Klassen weg (`.v2docaside` → `.v3boxbody`, `.v2docdef*` → `.v2open*`) | `grep -rn 'v2docaside\|v2docdef' src` leer; DOM der Beleg-Stories: 0 | ok |
| Beleg-Stories: vier Punkte im Mangelfall, „nichts offen" im guten | `beleg-rechnung--with-findings` 4 `.v3open__row`; `--clean` `.v3open__none` „An diesem Beleg ist nichts offen."; Sachverhalt „An diesem Sachverhalt ist nichts offen." | ok |
| Spec beschreibt das Gebaute | Abschnitt „Gebaut" stimmt; Kopfzeile „Stufe" nennt noch `entities/source-document/SourceDocumentAside.tsx` als Ort | Hinweis (Stufe-Zeile veraltet: heute `patterns/OpenPoints.tsx`) |

**Urteil: fertig.**
