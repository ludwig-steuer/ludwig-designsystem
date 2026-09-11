# 0148 · `CheckItems`: „nicht prüfbar" ist kein Befund

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, Endstand c2a2761) |
| Stufe | `patterns/` (`CheckItems` in `Review.tsx`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede Prüfliste hat Punkte, die durchfallen, und Punkte, die mangels Daten gar nicht laufen konnten |
| Quelle | Owner-Beobachtung 2026-09-09 an einem echten Journal-Satz: zwölf Prüfpunkte, alle „nicht vergleichbar" |
| Ersetzt | nichts — eine Unterscheidung, die dem gebauten Baustein fehlt |
| Spec von / am | Claude, 2026-09-09 |

## Der Anlass

Ein Buchungssatz aus echten Daten, zwölf Prüfpunkte, und **keiner** davon
konnte laufen:

> Stimmt der gebuchte Betrag mit dem Beleg überein? — *Kein Belegbetrag
> hinterlegt, nicht vergleichbar.*
> Stimmt die Belegnummer mit dem Beleg überein? — *Auf dem Beleg ist keine
> Nummer erkannt.*
> Was sagt der Judge zu diesem Satz? — *Kein Judge-Verdikt; ungeprüft ist
> nicht dasselbe wie unauffällig.*

`CheckItems` zeigt daraufhin **zwölf Zeilen**. Es fasst nur die **bestandenen**
zu einer Zeile zusammen (`state === "green"`); alles andere bekommt seine
eigene Zeile mit Frage und Begründung.

## Warum das falsch ist

Der Baustein wurde für „viele bestanden, wenige offen" entworfen. Die echten
Daten drehen das um: **keiner bestanden, zwölf offen** — und dann steht dort
eine Flut, in der ein wirklicher Befund untergehen würde.

Der Fehler ist aber nicht die Menge, sondern eine fehlende Unterscheidung.
`CheckItems` behandelt heute drei verschiedene Dinge gleich:

| Zustand | Was er sagt | Was er verdient |
|---|---|---|
| `red` | die Prüfung ist **durchgefallen** | eine eigene Zeile, immer |
| `yellow` | die Prüfung **warnt** | eine eigene Zeile, immer |
| `open` | die Prüfung **konnte nicht laufen** | eine Sammelzeile — sie ist kein Befund |

„Nicht prüfbar" ist keine Aussage über den Satz, sondern eine über die
**Datenlage**. Zwölf davon sagen dasselbe wie eine: es fehlt der Beleg. Sie
einzeln aufzuzählen macht aus einer Auskunft zwölf.

## Und die Zusammenfassung darf sie nicht mitzählen

Im gemeldeten Fall stand unter den zwölf Zeilen „✓ 12 Prüfpunkte in Ordnung".
Das kann `CheckItems` nicht geschrieben haben — es sagt „N von M **bestanden**"
—, aber die Zahl zeigt, wohin der Fehler führt: **ungeprüft wird als
unauffällig gezählt.** Einer der Punkte sagt das selbst.

Deshalb bekommt die Sammelzeile der offenen Punkte ihren **eigenen** Satz und
ihr eigenes Zeichen, und die bestandene Zeile zählt weiter nur die
bestandenen.

## Was gebaut wird

Drei Gruppen statt zwei:

1. **Bestanden** — eine Zeile: „N von M Prüfpunkten bestanden", mit den Codes.
   **Aufklappbar**, damit man nachsehen kann, welche.
2. **Nicht prüfbar** — eine Zeile: „N Prüfpunkte nicht prüfbar", mit den
   Codes. Ebenfalls aufklappbar, mit Frage und Begründung je Punkt.
3. **Rot und gelb** — wie bisher **einzeln**, nie zusammengefasst, nie
   eingeklappt. Ein Befund, der sich verstecken kann, ist keiner.

Die Reihenfolge bleibt: was zu tun ist, steht oben.

## Schnittstelle

Keine neue Prop. `CheckItem.state` kennt `open` bereits — die Aufgabe ist eine
**Verhaltensänderung** am selben Typ.

| Was | Vorher | Nachher |
|---|---|---|
| `green` | eine Sammelzeile, nicht aufklappbar | eine Sammelzeile, **aufklappbar** |
| `open` | je eine eigene Zeile | eine Sammelzeile, **aufklappbar** |
| `red`, `yellow` | je eine eigene Zeile | unverändert |

**Kann bewusst nicht:**

- **Einen roten Punkt einklappen.** Auch nicht, wenn es zwanzig sind: dann ist
  die Liste lang, weil zwanzig Dinge falsch sind, und das ist die Auskunft.
- **Entscheiden, was `open` heißt.** Ob eine Prüfung mangels Beleg oder mangels
  Judge nicht lief, sagt ihre `reason` — der Baustein zählt nur.

## Stories

| Story | Beweist |
|---|---|
| `CheckItemsAllOpen` | **Der gemeldete Fall**: zwölf Punkte, keiner prüfbar. Eine Zeile statt zwölf, aufgeklappt die zwölf mit ihren Begründungen |
| `CheckItemsMixed` | bestehend, um `open` erweitert: grün gesammelt, offen gesammelt, rot und gelb einzeln — die drei Gruppen nebeneinander |
| `CheckItemsAllGreen` | unverändert: eine Zeile, kein Scrollen durch zwölf Haken |
| `CheckItemsEmpty` | unverändert |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen

Variabel (aus dieser Spec):

- [ ] Zwölf `open`-Punkte ergeben **eine** Zeile, nicht zwölf
      (`CheckItemsAllOpen`, im DOM gezählt)
- [ ] Aufgeklappt stehen alle zwölf mit Frage und Begründung da
- [ ] `red` und `yellow` stehen **immer** einzeln, auch neben zwölf offenen
      (`CheckItemsMixed`)
- [ ] Die bestandene Zeile zählt **nur** die bestandenen — ein offener Punkt
      erhöht sie nicht (`CheckItemsMixed`, Zahl gegen die Daten)
- [ ] Die offene Sammelzeile trägt **nicht** das Haken-Zeichen der bestandenen
      (`CheckItemsAllOpen`) — ungeprüft ist nicht unauffällig

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761; statische Checks (typecheck, check:language, check:when, check:contrast, check:icons, check:jobs, check:mirror, build) auf 6d58b58 und bca4b7d alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Zwölf `open` → **eine** Zeile | `checklist--check-items-all-open`: 0 Einzelzeilen außerhalb `<details>`, eine Sammelzeile „12 Prüfpunkte nicht prüfbar P-BETRAG …" | ok |
| Aufgeklappt alle zwölf mit Frage und Begründung | `<details>` enthält 12 `.v2pp__q` + 12 `.v2pp__why` | ok |
| `red`/`yellow` immer einzeln | `--check-items-mixed`: außerhalb `v2pp__row--red`, `v2pp__row--yellow`; grün (3) und offen (2) gesammelt | ok |
| Bestandene Zeile zählt nur bestandene | Mixed: „3 von 7 Prüfpunkten bestanden P01 P02 P03" (nicht 5 von 7) | ok |
| Offene Sammelzeile ohne Haken | `summary` „nicht prüfbar": nur `lucide-chevron-right`, kein `.v2pp__ok` | ok |
| `CheckItemsAllGreen`, `CheckItemsEmpty` unverändert | „12 von 12 Prüfpunkten bestanden" (1 Sammelzeile, aufklappbar); „Keine Prüfpunkte für diesen Fall." | ok |
| Spec beschreibt das Gebaute | Tabelle „Vorher/Nachher" und Gebaut-Absatz (`Disclosure`) stimmen | ok |

**Urteil: fertig.**

## Gebaut 2026-09-09

Drei Gruppen statt zwei, eine neue Story, keine neue Prop.

**Aufgeklappt wird mit `Disclosure`, nicht mit Zustand.** Meine erste Fassung
nahm `useState` — und machte damit `"use client"` aus der ganzen Datei nötig,
also auch aus `Checklist`, `Messages` und `StateIcon`. Für ein Aufklappen, das
die Plattform mitbringt. `Disclosure` (0005) ist ein natives `<details>` und
löst Tastatur und Zugänglichkeit gleich mit; `Review.tsx` bleibt
Server-Komponente.

**Gemessen** (`scripts/cdp.mjs`, 900 px):

| Story | Einzelzeilen | Gruppen | Zeilen darin |
|---|---|---|---|
| `CheckItemsAllOpen` | **0** | „12 Prüfpunkte nicht prüfbar" | 12 |
| `CheckItemsMixed` | **2** (rot, gelb) | „3 von 7 Prüfpunkten bestanden" · „2 Prüfpunkte nicht prüfbar" | 5 |
| `CheckItemsAllGreen` | 0 | „12 von 12 Prüfpunkten bestanden" | 12 |

Die mittlere Zeile ist der eigentliche Nachweis: **drei** Gruppen nebeneinander,
und die bestandene Zeile sagt „3 von 7", nicht „5 von 7". Ein Punkt, der nicht
laufen konnte, erhöht sie nicht.

**Was der Fall gelehrt hat.** Der Baustein war nicht falsch gebaut, er war für
die falsche Verteilung gebaut: „viele bestanden, wenige offen". Bei einem
dünnen Satz ist es umgekehrt, und dann tut der Zusammenfassungs-Mechanismus
genau nichts — er fasst die leere Menge zusammen und zeigt den Rest einzeln.
Eine Demo, die nur den erwarteten Fall zeigt, kann das nicht aufdecken; dieser
hier stand in echten Daten und in keiner Story.
