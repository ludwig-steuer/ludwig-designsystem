# 0194 · PeriodJump — über lange Zeiträume zu einem Monat springen

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-21, fremde Abnahme steht aus |
| Stufe | `primitives/` (Gruppe Navigation) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede lange, nach Datum sortierte, geblätterte Liste (Schäden, Beiträge, Journal) |
| Quelle | Owner 2026-09-21, wörtlich: „wenn wir oben eine möglichkeit hätten durch längere zeiträume zu einem bestimmten punkt zu scrollen, entweder über eine datumseingabe (springe zu) oder noch besser: über ein diagram, bei dem z.B. 12 monate … die anzahl der transaktionen, klickt man an den graph springt die tabelle zu dem punkt .. das problem: der punkt kann auch auf anderen seiten sein. Diese view ist aber eine komplexere sonderview die nur angezeigt werden soll wenn wir das explizit anfordern" · Nachsatz: „du solltest die daten bereits aggregiert aus der umgebung bekommen (also date + #transaktionen) liste" |
| Ersetzt | nichts — heute blättert man im Kontoauszug Seite für Seite (p90 251 Zeilen je Konto und Jahr, 0085) |
| Blockiert | nichts; Erstverwendung ist der Kontoauszug (0193, Vollansicht) |
| Spec von / am | Claude, 2026-09-21 |

## Ziel

Wer im Kontoauszug die Zahlung vom März sucht, sieht über der Liste zwölf
Monate als Säulen — die Höhe ist die Zahl der Zeilen — und springt mit einem
Klick auf die Seite, auf der der März beginnt. Wer das Datum kennt, gibt es
ein. Heute blättert man bis dorthin.

## Einordnung

- **Wiederverwenden:** `BarChart` (`@when` eine oder zwei Reihen über der
  Zeit) zeichnet in SVG mit `role="img"` — seine Säulen sind Bild, keine
  Links, und ihre Trefferfläche ist die Säulenhöhe (ein Monat mit 3 Zeilen
  wäre 2 px hoch). `Pagination` springt um Seiten, nicht zu einem Datum.
  `PeriodGrid` zeigt Abdeckung, nicht Menge, und führt nirgendwohin.
- **Neu, weil:** Regel 3 (neue Primitive) — kein `@when` passt, kein Fachwort,
  eine Vorlage (die Owner-Anfrage), und die Säulen als Links mit voller
  Spaltenhöhe als Trefferfläche sind keine 15 Zeilen an der Aufrufstelle.
- **Opt-in:** eine eigene Komponente, die der Aufrufer **über** die Liste
  stellt. `BankTransactionList` bekommt keine Prop dafür — die Sonderansicht
  erscheint nur, wo sie ausdrücklich eingebaut wird.
- **Zuschnitt:** eine Datei, zwei Exporte: die Komponente und die reine
  Rechnung `periodPage` (welche Seite zeigt diesen Monat?). Die Rechnung
  steht daneben, weil sie genau dieselben Zahlen liest.
- **Setzt auf:** `Field`, `Input`, `Button`; `formatCount`.

## Das Problem „der Punkt kann auf einer anderen Seite sein"

Die Monatszahlen reichen, um die Seite auszurechnen — ohne zweite Abfrage:
bei absteigender Sortierung nach Datum stehen vor dem März alle Zeilen der
Monate danach. Seite = ⌊(Σ Zeilen der späteren Monate) / Seitengröße⌋ + 1.
Das tut `periodPage`. Voraussetzung, die der Aufrufer zusichert: die Zahlen
sind **unter demselben Filter** gezählt wie die Liste, und die Liste ist
**nach Datum** sortiert. Ist sie nach Betrag sortiert, gibt es keinen „Punkt
März" — dann lässt der Aufrufer die Komponente weg.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `periods` | `readonly PeriodCount[]` (`{ date: string; count: number }`) | ja | je Monat der erste Tag (`YYYY-MM-DD` oder `YYYY-MM`) und die Zahl der Zeilen — **aggregiert vom Aufrufer**. Fehlende Monate zwischen dem ersten und letzten füllt die Komponente mit 0 auf (ein `GROUP BY` lässt leere Monate weg, die Zeitachse darf sie nicht verschlucken). Leer → rendert nichts | `Filled`, `Edge` |
| `href` | `(date: string) => string` | ja | wohin die Säule eines Monats führt; `date` ist `YYYY-MM`. Der Aufrufer baut die URL, meist mit `periodPage` | `Filled` |
| `current` | `{ from: string; to: string }` | nein | Datum der ersten und letzten Zeile der **aktuellen** Seite; jeder Monat dazwischen ist hervorgehoben und trägt `aria-current` | `Filled` |
| `unit` | `[one: string, other: string]` | nein | das Wort der Zeilen, Vorgabe `["Eintrag", "Einträge"]`; der Kontoauszug sagt `["Zahlung", "Zahlungen"]` | `Filled` |
| `dateForm` | `{ action: string; name: string; hidden?: Record<string, string>; defaultValue?: string }` | nein | das Feld „Springe zu": ein natives `<form method="get">` mit `<input type="date">`; `hidden` trägt Filter und Sortierung weiter. Welche Seite ein Tag hat, rechnet die App aus (siehe App-Teil) | `WithDateForm` |
| `ariaLabel` | `string` | nein | Name der Navigation, Vorgabe „Zu einem Monat springen" | `Filled` |

`periodPage(periods, date, { pageSize, dir })` → `number`: die Seite, auf der
der erste Eintrag des Monats `date` steht; `dir` ist die Sortierrichtung der
Liste (`"desc"`: neueste zuerst).

**Kann nicht (bewusst):** zählt nicht (die Zahlen kommen aggregiert) · lädt
nichts · kennt keine Wochen oder Tage — nur Monate (siehe Ausbau) · scrollt
nicht innerhalb der Seite zur Zeile (siehe Ausbau) · zeigt keine Beträge — die
Höhe ist die Zahl der Zeilen, nicht ihre Summe.

## Verhalten

- **Server-Component**, kein Zustand, kein JavaScript: jede Säule ist ein
  `<a>`, das Feld ein GET-Formular.
- Die Trefferfläche ist die **ganze Spalte** (Säule plus Beschriftung), nicht
  die Säulenhöhe. Ein Monat mit 0 Zeilen ist kein Link (dort gibt es nichts
  zu finden), steht aber auf der Achse.
- Jede Säule hat als Namen „März 2026: 18 Zahlungen" (`aria-label` und
  `title`) — die Zahl ist ohne Hovern für Vorleser da (V7, V10).
- Beschriftung: Monatskürzel; am ersten Monat und an jedem Januar mit Jahr.
- Tastatur: Tab von Säule zu Säule, Enter springt; Fokus sichtbar.
- Säulen in `text-subtle`, der aktuelle Bereich in `primary` — dieselben
  Farben wie `BarChart`. Kein Rot, keine Zahl in der Säule.
- Zustände: gefüllt ✓ · leer → rendert nichts (D7: kein leeres Element über
  einer Liste, die ihr eigenes Leer zeigt) · leer nach Filter → dasselbe ·
  lädt / Fehler entfallen: die Komponente zeigt fertige Zahlen, die der
  Aufrufer mit der Liste lädt.

## Stories

| Story | zeigt |
|---|---|
| `Filled` | zwölf Monate, aktuelle Seite hervorgehoben, Wort „Zahlungen" |
| `WithDateForm` | dazu das Feld „Springe zu" |
| `Edge` | Lücken in den Monaten (aufgefüllt) · ein Monat mit 0 · ein sehr großer Monat neben kleinen · 24 Monate |
| `InUse` (in `BankTransactionList.stories`, `JumpToMonth`) | über dem Kontoauszug, unter dem Filter, Links über `periodPage` |

Ableitung: Primitive-Untergrenze 3; Zustände gefüllt (leer rendert nichts,
lädt/Fehler entfallen, s. o.) + `dateForm` als Layout-Option + Rand + im
Einsatz = 4.

## Abnahmekriterien

**Fest:**

1. `pnpm typecheck` und die Wächter (`check:when`, `check:classes`,
   `check:language`, `check:icons`, `check:mirror`) grün über den Exit-Code.
2. `@when`/`@instead` an jedem Export; Titel `v3/Primitives/Navigation/PeriodJump`.
3. Jede Story im Browser angesehen, keine Konsolenmeldung.

**Variabel:**

4. Zwölf Monate ergeben zwölf Spalten; jede Spalte mit Zeilen ist ein Link auf
   `href("YYYY-MM")` (`Filled`).
5. Fehlt ein Monat in `periods`, steht er mit 0 auf der Achse und ist kein
   Link (`Edge`).
6. Die Säulenhöhe verhält sich wie `count / max`; ein Monat mit 1 Zeile ist
   sichtbar (nicht 0 px hoch) (`Edge`).
7. Die Monate zwischen `current.from` und `current.to` tragen `aria-current`
   und die Hervorhebung (`Filled`).
8. Der Link-Name lautet „<Monat Jahr>: <n> <Wort>" mit Einzahl bei 1 (`Edge`).
9. `periodPage` liefert bei `desc`, Seitengröße 25 und den Zahlen aus `Filled`
   für jeden Monat die Seite seines ersten Eintrags — ablesbar an den Links
   der Säulen (`#seite-n`); bei `asc` spiegelbildlich (nachgerechnet, das Repo
   hat keinen Testlauf).
10. Das Formular sendet per GET `name=<Datum>` plus alle `hidden`-Felder an
    `action` (`WithDateForm`).
11. `periods: []` rendert nichts.
12. Die Trefferfläche einer Säule ist so hoch wie die Spalte, auch bei einem
    Monat mit 1 Zeile (`Edge`, gemessen).

## App-Teil (für `acto`)

- Monatszahlen: `SELECT date_trunc('month', posting_date), count(*) … GROUP BY 1`
  unter **demselben Filter** wie die Liste; Zeitraum: die letzten 12 Monate
  oder das Wirtschaftsjahr.
- `href`: `listHref({ page: periodPage(periods, date, { pageSize, dir }) })`.
- Nur bei Sortierung nach Buchungsdatum einblenden.
- `dateForm`: die Seite zu `?ab=<Datum>` rechnet der Server aus (Zeilen neuer
  als das Datum zählen → Seite) und leitet auf `?page=` um.

## Offene Fragen

1. **Zeitraum, wenn der Aufrufer nichts sagt?** Ohne Antwort: genau die Monate
   von `periods`, aufgefüllt — die Komponente schneidet nicht auf zwölf.
2. **Soll der Sprung auf der Seite zur ersten Zeile des Monats scrollen?**
   Ohne Antwort: nein, die Seite reicht (25 Zeilen ≈ ein Bildschirm).

## Ausbau

- **Wochen oder Tage** für kurze Zeiträume: Prop `granularity`, Auslöser:
  eine Liste, deren Zeitraum unter drei Monaten liegt.
- **Zur Zeile scrollen**: `DataTable` bräuchte ein `id` je Zeile
  (`rowAnchor`), `href` hängt `#…` an. Auslöser: Owner sagt „die Seite
  reicht nicht".

## Stand des Baus (2026-09-21)

`src/ui/v3/primitives/PeriodJump.tsx` (`PeriodJump`, `periodPage`,
`PeriodCount`), über den Barrel exportiert; Stil `.v3jump*` in `v3.css`;
Stories `v3/Primitives/Navigation/PeriodJump` (`Filled`, `WithDateForm`,
`Edge`) und `BankTransactionList` → `JumpToMonth`.

Im Browser nachgesehen:

- `Filled` (900 px): zwölf Spalten, zwölf Links; die Links lauten von Mai bis
  April `#seite-9 8 7 7 6 5 4 3 3 2 1 1` — nachgerechnet: vor dem Februar
  stehen 33 Zeilen → Seite 2, vor dem Januar 52 → Seite 3. Dez, Jan, Feb
  hervorgehoben, drei `aria-current`.
- `Edge`: der fehlende März steht mit 0 auf der Achse, wie der Mai kein Link
  (6 Spalten, 4 Links); der Februar mit 1 Zeile ist 2 px hoch neben 140 im
  April (47 px); Name „Februar 2026: 1 Zahlung". 24 Monate: jede zweite
  Beschriftung leer, Januar mit Jahr. `periods: []` rendert nichts.
- Trefferfläche: alle Spalten gleich hoch (84 px), auch die ohne Jahreszahl.
- `WithDateForm`: das Formular sendet
  `id=…&viewMode=story&ab=2026-03-15`, `min` 2025-05-01, `max` 2026-04-30;
  Unterkante bündig mit der Achse.
- `JumpToMonth` (1460 px): unter dem Filter, über der Karte, April
  hervorgehoben. Keine Konsolenmeldung außer dem React-DevTools-Hinweis.

`periodPage` bei `asc` und `desc` mit einer Selbstprüfung außerhalb des Repos
nachgerechnet (Lücken, Tagesdatum statt Monat, leere Liste).
