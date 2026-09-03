# 0050 · CaseDetailView

| | |
|---|---|
| Status | spec — **blockiert**, siehe Voraussetzung |
| Stufe | `entities/accounting-case/` |
| Klassen-Test | nein — die Reihenfolge Kopf → nächste Aktion → Strang → Detail ist die Sachverhaltslogik, keine allgemeine Form |
| Quelle | Screenshot der Sachverhaltsansicht vom 2026-09-03 · `docs/seiten/sachverhalt-detail.md` |
| Ersetzt | `SachverhaltScreen.tsx` (1815 Z.) + `parts.tsx` (522 Z.) in `modules/accounting-cases/ui/sachverhalt/` — das Gerüst, nicht die Datenbeschaffung |
| Blockiert | die Ablösung der Sachverhaltsansicht in `ludwig/app` |
| Voraussetzung | 0047 `RecordPager` ✓ · 0048 `EntityHeader` ✓ · 0049 ✓ (alle drei am 2026-09-03 gebaut) · **Entitätsprofil `docs/entitaeten/accounting-case.md` — fehlt** |
| Blocker | Owner-Entscheid vom 2026-09-03: **erst das Entitätsprofil, dann bauen.** `docs/entitaeten/` enthält nur `TEMPLATE.md`. Diese Aufgabe steht sonst vollständig entschieden bereit — es ist keine Frage mehr offen, nur die Analyse fehlt. |
| Spec von / am | Claude, 2026-09-03 (Entscheidungen getroffen, nicht gebaut) |

## Ziel

Das Gerüst der Sachverhaltsansicht als ein Baustein mit Slots, damit die
Reihenfolge der Antworten (Seitenprofil, Rang 1–9) im Set steht und nicht in
einer 1815 Zeilen langen Screen-Datei. Die View holt keine Daten und kennt
keine Server-Actions — sie ordnet.

## Einordnung

- **Wiederverwenden:** `MasterDetail`/`ListPane`/`DetailPane` trägt die
  Zweispaltigkeit, `CaseTimeline` (0040) den Strang, `Tabs` die Reiter,
  `AppShell` die Seite. Es fehlt die Klammer, die sie in der richtigen
  Reihenfolge hält.
- **Zuschnitt:** eine Datei, ein Export mit Slots (`pager`, `header`,
  `nextAction`, `tabs`, `children`), keine Datenprops.
- **Entscheidungen, die die Spec treffen muss** (aus dem Seitenprofil,
  „Zweifel am heutigen Format"):
  - Reiter ohne Inhalt: ausblenden, dämpfen oder stehen lassen?
  - Zweispalter erst ab zwei Ereignissen? (Bei einem Ereignis ist die
    Timeline-Karte ein Drittel Breite für eine Zeile.)
  - Wo lebt die Zustandsanzeige — am Fall, am Ereignis oder an beidem?

## Entscheidungen (2026-09-03) — die drei offenen Fragen sind beantwortet

1. **Reiter ohne Inhalt: die View blendet nichts aus.** Sie bekommt `tabs`
   als fertigen Knoten und kennt den Inhalt dahinter nicht — eine View, die
   Reiter versteckt, müsste zählen, was in ihnen steht, und wäre damit keine
   Klammer mehr. Die Regel gehört an die Aufrufstelle und lautet: **ein
   Reiter ohne Inhalt wird nicht übergeben.** Was zählbar ist, trägt seinen
   Zähler (`Tabs count`), was da ist, aber nicht zählbar, den Punkt
   (`Tabs dot`, 0049). Eine Story zeigt beides.
2. **Der Zweispalter entsteht aus den Slots, nicht aus einer Zahl.** Es gibt
   `aside` (der Strang) und `children` (das Detail). Ist `aside` leer, ist
   die View einspaltig — kein `split`-Prop, keine Schwelle im Baustein. Der
   Aufrufer entscheidet nach seinen Ereignissen: bei einem Ereignis gibt er
   `aside` nicht, weil eine Karte mit einer Zeile kein Drittel Breite wert
   ist (Seitenprofil, Zweifel 6). So steht die Schwelle dort, wo die Zahl
   bekannt ist.
3. **Die Zustandsanzeige lebt am Gegenstand, den sie betrifft.** Die View
   zeigt **keinen** Zustand von sich aus: der Fall-Zustand steht im
   `header` (0048: genau einer, die führende Achse), die Ereignis-Zustände
   im Strang, die der Klärung an der Klärung. Damit ist Zweifel 2 des
   Seitenprofils („Frage 2 wird viermal beantwortet") auf Ebene der View
   erledigt — sie kann es nicht mehr viermal tun.

## Schnittstelle

Ein Export, fünf Slots, keine Datenprops.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `pager` | `ReactNode` | nein | Ganz oben, über allem: `RecordPager` (0047) — der Vorrat ist der Rahmen | `Filled` |
| `header` | `ReactNode` | ja | Die Akte: `EntityHeader` (0048) | `Filled` |
| `nextAction` | `ReactNode` | nein | Die eine nächste Handlung: `StatusCallout` mit `icon` (0049). Entfällt, wenn der Fall auf jemand anderen wartet | `Filled`, `Waiting` |
| `tabs` | `ReactNode` | nein | Die Reiterleiste: `Tabs` (0049). Ohne Reiter entfällt die Zeile | `SingleEvent` |
| `aside` | `ReactNode` | nein | Der Strang links: `CaseTimeline` (0040). Leer → einspaltig | `SingleEvent` |
| `children` | `ReactNode` | ja | Der Inhalt des aktiven Reiters | `Filled` |

**Kann bewusst nicht:** Daten holen, Server-Actions kennen, den aktiven
Reiter verwalten (das tut der Aufrufer über die URL), Reiter ausblenden,
einen Zustand anzeigen, die Timeline füllen.

## Verhalten

- **Reihenfolge, fest:** `pager` · `header` · `nextAction` · `tabs` ·
  (`aside` | `children`). Sie ist die Rangfolge 1–9 aus dem Seitenprofil und
  der Grund, warum diese View existiert — deshalb ist sie **keine** Prop.
- **Jede leere Zeile entfällt samt Abstand**, wie bei 0048.
- **Zweispaltig** über `MasterDetail`, sobald `aside` gesetzt ist; sonst
  füllt `children` die Breite.
- Rang 1–4 (Kopf, Zustand, nächste Aktion, Strang) müssen **ohne Scrollen**
  beantwortet sein: die View setzt darum keine eigene Höhe und keinen
  eigenen Scroll-Container um die oberen drei Slots.
- Server-Component: keine Interaktion, kein Zustand.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseDetailView`. Abgeleitet nach §6:
2 Zustände + 0 Enum + 2 Layout (einspaltig, ohne Reiter) + 0 Callback +
1 „im Einsatz" + 1 Rand = 6.

| Story | Beweist |
|---|---|
| `Filled` | Der volle Fall: Pager, Kopf, nächste Aktion, acht Reiter, Strang links, Detail rechts |
| `SingleEvent` | Ein Ereignis: kein `aside`, einspaltig — die Timeline-Karte ist kein Drittel Breite wert |
| `Waiting` | Der Fall wartet auf den Mandanten: keine `nextAction`, dafür der Zustand im Kopf |
| `WithoutTabs` | Ohne Reiter — der einfache Fall, eine Fläche |
| `TabsWithCountAndDot` | Die Regel aus Entscheidung 1: Zähler, Punkt, und ein Reiter, der gar nicht übergeben wird |
| `InUse` | In der `AppShell`, mit Sidebar — die ganze Seite, wie die App sie zeigt |

Nicht anwendbar: `Loading`, `Error`, `Empty` (die View ordnet nur; Ladezeit
und Fehler gehören in die Slots), `LeerNachFilter` (kein Filter).

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` am Export
- [ ] Kein Hex, kein px im TSX; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Kein Prop nimmt Daten: die Schnittstelle besteht aus `ReactNode`-Slots
      (Code-Probe)
- [ ] Die Reihenfolge der Slots ist nicht konfigurierbar (`grep`: kein
      `order`-Prop, kein Array von Slots)
- [ ] Ohne `aside` ist die View einspaltig, ohne leere zweite Spalte
      (Story `SingleEvent`, DOM-Probe)
- [ ] Die View zeigt keinen Zustand aus eigenem Antrieb: kein `StatusBadge`,
      kein `resolveStatus` in der Datei (`grep`)
- [ ] Sie blendet keinen Reiter aus: kein Filter über `tabs` (Code-Probe)
- [ ] Rang 1–4 stehen ohne Scrollen: bei 900 px Höhe ist die nächste Aktion
      sichtbar (Story `Filled`, gemessen)
- [ ] Server-Component: keine `"use client"`-Direktive (`grep`)

## Nicht in dieser Aufgabe

Rückfragen-Formular, Buchungsmaske, Plausibilitätsprüfung, DATEV-Wahrheit.
Das sind eigene Bausteine hinter den Reitern; die View kennt nur ihre Slots.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
