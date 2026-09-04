# 0077 · StatusHeader — der Spaltenkopf, der sagt, welcher Status

| | |
|---|---|
| Status | spec |
| Stufe | `patterns/` — Gruppe Prüfen (neben `StatusBadge`, `StatusInfoButton`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald eine Tabelle mehr als eine Zustandsachse zeigt; kennt die Achse (Registry), keine Entität |
| Quelle | Owner-Entscheid 2026-09-04 (Antwort auf `ludwig/app` `docs/backlog/F147-luecken-fuer-design-agent.md` §2 Nr. 6) · Regel Z4 / R2 · Prüfliste `design-guidelines.md` §10 („Jede Status-Spalte `StatusHeader` + `StatusBadge`") |
| Ersetzt | `ui/components/primitives/StatusHeader.tsx` (88 Z.) samt Typ `StatusLegendItem` — 36 Dateien, 18 davon mit `legend={axisLegend(…)}`, 8 mit handgeschriebener Legende |
| Blockiert | den Grep-Zähler der App auf `@/ui/components` (ohne diesen Baustein wird er nie null); Spaltensätze mit Status-Spalte (0070, 0029) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Die Sachbearbeiterin liest über einer Spalte „Abgleich" oder „Verarbeitung",
nie „Status" — sobald eine Liste zwei Achsen zeigt, ist „Status" mehrdeutig
(R2). Und sie bekommt mit einem Klick gesagt, welche Zustände diese Spalte
annehmen kann und was sie bedeuten. Heute hat die App dafür ihren
`StatusHeader` mit Hover-Tooltip; das Design-System hat keinen, verlangt ihn
aber in seiner eigenen Prüfliste an jeder Status-Spalte. Der Baustein schließt
diese Lücke, indem er das vorhandene (i) des Sets an den Spaltenkopf setzt.

## Einordnung

- **Wiederverwenden:** `StatusInfoButton` („What can this status be? right
  next to the status itself") deckt die Legende vollständig — es öffnet
  `StatusInfoDialog` mit allen Werten der Achse, je Badge, DB-Wert und
  Bedeutung, gespeist aus `axisLegend()`. `Tooltip` trägt bewusst nur einen
  Satz (T8) und kommt als Legende nicht in Frage. Was fehlt, ist der Kopf
  selbst: das spezifische Wort neben dem (i), an 36 Stellen gleich.
- **Neu, weil:** `spec-schreiben` §3 Regel 2 — `StatusInfoButton` deckt vier
  Fünftel, das Fehlende (Label und Kopf-Kontext) ist eine Designentscheidung,
  die 36-mal wiederkommt. Streng nach §3 Regel 4 wäre das Markup an der
  Aufrufstelle (kein eigener Zustand). Der Export existiert trotzdem, weil
  Regel Z4 an einem **Namen** hängen muss: die Prüfliste nennt ihn, der
  Grep der App zählt ihn, und `header: <StatusHeader axis="abgleich"
  label="Abgleich" />` ist in einem `ColumnDef` auf einen Blick lesbar.
  Owner-Entscheid 2026-09-04.
- **Zuschnitt:** eine Datei, ein Export. `StatusLegendItem` kommt nicht mit —
  die Legende kommt aus der Registry, nie von Hand (Z2).
- **Setzt auf:** `StatusInfoButton` (damit `StatusInfoDialog`, `axisLegend`),
  `AXIS_LABEL` für den `aria-label` des (i).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `axis` | `StatusAxis` | ja | Die Achse, deren Werte die Spalte zeigt; speist das (i) und die Legende | `Filled` |
| `label` | `string` | ja | Das spezifische Wort im Kopf („Abgleich", „Verarbeitung"). Kein Default — ein fehlendes Label ist ein Typfehler, nicht „Status" | `Filled`, `Axes` |

Typen: `StatusAxis` aus der Registry (`patterns/status-registry.ts`; nach
0080 aus dem Spiegel). Keine Typen aus `src/ludwig/` darüber hinaus.

**Kann bewusst nicht:**

- **Eine Legende von Hand nehmen** (`legend`-Prop): acht App-Dateien
  schreiben heute ihre Legende selbst — das sind acht Achsen, die in der
  Registry fehlen (Z2, Befund unten). Der Baustein bietet den Weg nicht an.
- **Einen Halbsatz `hint` tragen:** 20 App-Stellen geben einen. Was für ein
  Status das ist, sagt der Dialog über `AXIS_LABEL` und `AXIS_SOURCE`; was
  darüber hinaus nötig ist, gehört in die Achsen-Beschreibung, nicht an den
  Aufrufer.
- **Eine Teilmenge zeigen** (`only`): die App nutzt `axisLegend(axis, only)`
  an 0 Stellen. Siehe Ausbau.
- **Beim Hover erklären:** das Set erklärt Zustände mit einer Mechanik —
  Klick auf das (i), Dialog. Eine Legende mit zwölf Zeilen im Tooltip ist
  für Tastatur und Screenreader nicht erreichbar.

## Verhalten

Server-Component; das (i) ist das Client-Island (`StatusInfoButton`).
Tastatur: Tab erreicht das (i), Enter öffnet den Dialog, Esc schließt ihn —
alles aus `StatusInfoButton`/`Dialog`, nichts Eigenes. Der Klick auf das (i)
stoppt die Propagation (bereits in `StatusInfoButton`), damit ein sortierbarer
Spaltenkopf im `DataTable` nicht sortiert, wenn jemand die Erklärung will.
Typografie: erbt die Kopfzeile (`HeadRow`), keine eigene Schriftgröße; das (i)
sitzt auf der Grundlinie des Labels mit `gap` aus den Tokens.

Zustände gefüllt · leer · lädt · Fehler gibt es nicht — ein Spaltenkopf hat
keinen Inhalt außer seinem Wort; eine unbekannte Achse ist ein Typfehler.

## Stories

Titel `v3/Patterns/Prüfen/StatusHeader`.

| Story | Beweist |
|---|---|
| `Filled` | In einer `HeadRow` neben zwei gewöhnlichen Köpfen: „Abgleich" mit (i); Klick öffnet den Dialog mit allen Werten der Achse |
| `Axes` | Vier Köpfe für vier Achsen nebeneinander (`abgleich`, `beleg`, `klaerung`, `lauf`) — jedes Wort spezifisch, kein „Status" |
| `InDataTable` | Als `header` eines sortierbaren `ColumnDef`: der Pfeil sortiert, das (i) öffnet nur den Dialog |
| `InUse` | Eine Liste mit Status-Spalte, Köpfe über `StatusHeader`, Zellen über `StatusBadge` — die Regel Z4 einmal komplett |

Nicht anwendbare Zustände: leer, lädt, Fehler (Begründung im Verhalten).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Nur die Werte erklären, die die Liste zeigen kann | `only?: readonly string[]` an `StatusInfoButton` durchgereicht | ein Spaltensatz (0070, 0029) filtert die Achse auf eine Teilmenge |

## Befunde für `ludwig/app`

- **B1** — Acht Dateien schreiben die Legende von Hand (`legend={[…]}`):
  `configuration/integrationen/page.tsx`, `admin/tenants/[tenantId]/page.tsx`,
  `admin/tenants/[tenantId]/clients/[clientId]/page.tsx`,
  `PaymentChannelActivitySection.tsx`, `VorsteuerTab.tsx`,
  `BridgeHealthStatus.tsx`, `AgentTokenManager.tsx`, `DatevExportSection.tsx`.
  Jede ist eine Achse, die in der Registry fehlt (Z2). Register: L-51.
- **B2** — 20 `hint`-Texte an `StatusHeader`-Aufrufen: prüfen, was davon
  `AXIS_LABEL`/`AXIS_SOURCE` nicht schon sagt, und den Rest in die
  Achsen-Doku der Registry nehmen. Teil von L-51.

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

- [ ] `axis` öffnet über das (i) den `StatusInfoDialog` mit allen Werten der Achse (Story `Filled`)
- [ ] `label` steht wie übergeben; ohne `label` kompiliert es nicht (Story `Axes`)
- [ ] Im sortierbaren `ColumnDef` sortiert der Klick auf das (i) nicht (Story `InDataTable`)
- [ ] Tastatur: Tab → (i), Enter öffnet, Esc schließt (Story `Filled`)
- [ ] Kein `legend`, kein `hint`, kein `only` — die drei Ausschlüsse stehen im Kopfkommentar
- [ ] Barrel-Kopf in `src/ui/v3/index.ts` führt `StatusHeader` nicht mehr als „bleibt draußen"; Export in der Gruppe Status neben `StatusBadge`
- [ ] Prüfliste §10 in `design-guidelines.md` zeigt auf diesen Baustein (Zeile „Jede Status-Spalte …")
- [ ] offen (App): ersetzt `ui/components/primitives/StatusHeader.tsx` in 36 Dateien; `legend={axisLegend("x")}` wird `axis="x"`, `hint` entfällt; die acht Handlegenden gehen über L-51

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Klick statt Hover — bleibt es dabei, obwohl die App 36-mal Hover kennt?
   *Ohne Antwort: ja, Klick → Dialog; eine Mechanik für „was heißt dieser
   Zustand" im ganzen Set.*
2. Soll ein Wächter-Test verbieten, dass ein `ColumnDef.header` das nackte
   Wort „Status" trägt? *Ohne Antwort: nein — die Prüfliste §10 reicht, ein
   Test kommt, wenn es einmal durchrutscht.*
