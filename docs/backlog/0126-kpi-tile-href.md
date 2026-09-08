# 0126 · Die Kennzahl-Kachel führt irgendwohin

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-08, fremde Abnahme steht aus |
| Stufe | `primitives/KpiTile` — Prop-Erweiterung nach `spec-schreiben` §3 Regel 2 |
| Klassen-Test | unverändert: eine Zahl mit einer Beschriftung kennt kein Fachwort |
| Quelle | Befund 1 der DATEV-Seite (`ludwig-manager`, 2026-09-08): „`KpiTile` kennt kein `href`", und die Profil-Regel „eine Kachel ohne Weg ist eine Sackgasse mit Ziffern" |
| Ersetzt | den Link im Untertitel, den die App mangels dieser Prop gebaut hat (`ponytail:`-Notiz drüben) |
| Spec von / am | Claude, 2026-09-08 |

## Warum eine Prop und keine neue Komponente

§3 Regel 2: ein `@when` deckt den Fall zu vier Fünfteln, das Fehlende ist eine
Designentscheidung, die wiederkommt (jede Kachel, die eine Liste zählt), und
sie lässt sich in einem Halbsatz sagen.

**Die Regel gibt es auch schon** — sie heißt I11 und gilt bisher für die
Zeile: „Hat eine Listenzeile ein Detail, führt die **ganze** Zeile dorthin,
nicht nur ein Wort." Für die Kachel gilt dasselbe aus demselben Grund: ein
Link im Untertitel macht aus einer Ecke der Kachel einen zweiten Fokus-Stopp,
während die Fläche daneben tot bleibt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `href` | `string` | nein | Wohin die Zahl führt — die Liste, die sie zählt. **Ohne sie bleibt die Kachel ein Block**: nicht jede Zahl hat eine Seite hinter sich, und „Summe Haben" führt nirgendwohin | `Linked` |

**Kann bewusst nicht:**

- **Aus jeder Kachel einen Link machen.** Eine Kachel ohne Ziel bleibt ein
  `<div>` — ein Anker ohne Ziel wäre schlimmer als kein Anker.
- **Den Link woanders unterbringen.** Der Anker umschließt die Kachel; ein
  Link im Untertitel wäre genau das, was dieser Nachtrag abschafft.

## Verhalten

Mit `href` wird aus dem `<div class="v2kpi">` ein `<a class="v2kpi v2kpi--link">`.
Farbe und Unterstrich des Links werden zurückgenommen — die Kachel ist das
Ziel, nicht der Text darin. Hover färbt die ganze Fläche, der Fokusrahmen liegt
außen.

## Stories

Eine dazu: `Linked`. Nach §6 ist es ein Layout-Boolean, und die vier
bestehenden Stories decken die Kachel ohne Ziel bereits.

## Abnahmekriterien (variabler Block)

- Mit `href` ist das äußere Element ein `<a>`, ohne `href` ein `<div>`
  (`Linked`, im DOM gemessen)
- Genau **ein** Fokus-Stopp je verlinkter Kachel, keiner bei einer ohne
  (`Linked`: drei Kacheln, zwei Anker, zwei Stopps)
- Der Untertitel bleibt Text — kein Link darin (`Linked`)
- Ersetzt die Untertitel-Lösung der DATEV-Seite ohne Funktionsverlust

## Gebaut 2026-09-08

Gemessen (`scripts/cdp.mjs`, Story `Linked`): drei Kacheln, davon zwei als
Anker mit `#buchungen` und `#offen`, eine als `<div>`, und **genau zwei**
Fokus-Stopps auf der ganzen Fläche.

`pnpm typecheck` und die fünf Wächter auf Exit 0. Das CSS
(`a.v2kpi--link`) steht in `v3.css` neben `.v2kpi`.
