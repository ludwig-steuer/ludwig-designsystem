# 0077 · StatusHeader — der Spaltenkopf, der sagt, welcher Status

| | |
|---|---|
| Status | fertig |
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

- **B1** — Sieben Dateien schreiben die Legende von Hand (`legend={[…]}`;
  eine achte, `configuration/integrationen/page.tsx`, ist mit dem
  Seiten-Rückbau vom 2026-09-05 weg): `admin/tenants/[tenantId]/page.tsx`,
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

Geprüft am 2026-09-05 gegen den Stand aus Commit `e256be1`, Storybook auf
`localhost:6107`, Browser Chrome. Story-IDs aus `localhost:6107/index.json`.

**Story-Deckung**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Jede Prop der Schnittstelle hat ihre Story | `axis` → `v3-patterns-prüfen-statusheader--filled` (das (i) öffnet die Legende der Achse `mirror_match`); `label` → `…--axes` (vier Achsen, vier Wörter). Beide Props sind in allen vier Stories gesetzt (`StatusHeader.stories.tsx:38, 62–65, 93, 132–133`) | ✓ |
| Alle vier Stories der Spec vorhanden, Titel in der Gruppe Prüfen | `curl -s localhost:6107/index.json` → `…statusheader--filled`, `--axes`, `--in-data-table`, `--in-use`, alle mit Titel `v3/Patterns/Prüfen/StatusHeader` — dieselbe Gruppe wie `StatusBadge` | ✓ |
| Jeder ausgeschlossene Zustand ist begründet | gefüllt ist die Regel; leer · lädt · Fehler entfallen mit Begründung in „Verhalten" (Z. 79–81) und in der Zeile unter der Story-Tabelle (Z. 93). Die Begründung („ein Spaltenkopf hat keinen Inhalt außer seinem Wort; eine unbekannte Achse ist ein Typfehler") deckt genau diese drei; „leer nach Filter" gibt es an einem Kopf nicht | ✓ |

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe; `pnpm build` → „Storybook build completed successfully"; beide im selben Lauf, Exit-Code 0 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/StatusHeader.tsx` und `src/ui/v3/patterns/StatusHeader.stories.tsx`; Titel `v3/Patterns/Prüfen/StatusHeader` (`StatusHeader.stories.tsx:10`); Stufe `patterns/`, Importe nur abwärts (`StatusInfoButton`, `status-registry`), kein Fachmodul | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | ein Export; Prop-Kommentare `StatusHeader.tsx:5–11`, Kopfkommentar `:14–34`, `@when`/`@instead` `:32–34` — alles englisch. Story-Exportnamen `Filled`/`Axes`/`InDataTable`/`InUse` englisch; die deutschen Story-JSDoc sind Hausbrauch des Sets (vgl. `Confidence.stories.tsx:22`, `Wizard.stories.tsx:20`, `Review.stories.tsx:34`) und kein Verstoß dieser Aufgabe | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `StatusHeader.tsx` enthält kein `style`, keine Zahl, keinen Statustext; das einzige Maß steht als Token in `src/styles/v3.css:2647–2651` (`gap: var(--space-1)`). Achse und Legende kommen über `StatusInfoButton` → `axisLegend()` aus `status-registry.ts` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe die drei Zeilen „Story-Deckung" | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Punkt für Punkt am Baustein: Stufe/Importe/kein Fachmodul ✓ · kein Hex/px ✓ · Text links, nichts zentriert ✓ · Kopfzeilenhöhe im Browser gemessen: 36,25 px **mit und ohne** das (i), also unverändert und ≤ `.v2tbl__row` (47,09 px) ✓ · keine Farbe hinzugefügt, kein farbiger Zustand ohne Wort (Badges aus der Registry) ✓ · Kontrast gemessen: Label `rgb(113,113,113)` auf Weiß = 4,88:1, das (i) effektiv `rgb(149,149,149)` = 3,00:1 (Grenzwert für Icons erfüllt) ✓ · Fokusring nach einem Tab sichtbar (Zoom auf den Kopf) ✓ · Hauptweg per Tastatur ✓ · Icon Lucide 1,75 Strich, kein Emoji, keine Versalien ✓ · Texte Sie/GLOSSARY ✓. Zwei Punkte gelten laut Skill der App und wurden übersprungen (v1-Ablösung `@deprecated`, §11). Ein Punkt reißt — siehe Zeile „Hover" unten | ✓ (mit Befund) |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle vier Stories in Chrome auf `localhost:6107/iframe.html` geöffnet und gesehen: `--filled` (Karte, Kopfzeile „Beleg · Gegenpartei · Abgleich ⓘ", drei Zeilen mit Badge), `--axes` (vier Köpfe mit (i), vier Badges), `--in-data-table` (sortierbarer Kopf mit Pfeil an „Beleg"), `--in-use` (zwei Status-Spalten, klickbare Zeilen). Alles gestylt, keine nackten Elemente | ✓ |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `axis` öffnet über das (i) den `StatusInfoDialog` mit allen Werten der Achse | `…--filled`: Klick auf das (i) → `[role=dialog]` = 1, Titel „DATEV-Abgleich", Herkunftszeile `client_datev_mirror_entries.match_state`, darunter **alle acht** Werte von `mirror_match` (`matched_ludwig`, `matched_split`, `matched_corrected`, `new_unprocessed`, `unclear`, `disappeared`, `disappeared_committed`, `unreconciled`) je mit Badge, DB-Wert und Bedeutung | ✓ |
| `label` steht wie übergeben; ohne `label` kompiliert es nicht | `…--axes` zeigt „Abgleich", „Verarbeitung", „Rückfrage", „Lauf" — genau die übergebenen Wörter, keines heißt „Status". `tsc` auf einen Aufruf ohne `label`: `error TS2741: Property 'label' is missing in type '{ axis: "mirror_match"; }' but required in type 'StatusHeaderProps'`; auf eine erfundene Achse: `error TS2322: Type '"not_an_axis"' is not assignable to type 'StatusAxis'` | ✓ |
| Im sortierbaren `ColumnDef` sortiert der Klick auf das (i) nicht | `…--in-data-table`: Mausklick auf das (i) → `[role=dialog]` = 1 und `location.hash` bleibt `""`. Mausklick auf das Wort „Abgleich" im selben Kopf → `#sort=match&dir=asc&page=1`. Der Pfeil sortiert, das (i) nicht | ✓ |
| Tastatur: Tab → (i), Enter öffnet, Esc schließt | `…--filled`: ein Tab aus dem Body → `document.activeElement` ist der Knopf „DATEV-Abgleich: Zustände erklären" (erster Tabstopp), Fokusring sichtbar; Enter → `[role=dialog]` = 1 und der Fokus liegt im Dialog; Esc → `[role=dialog]` = 0. Im sortierbaren Kopf sind Link und (i) zwei eigene Tabstopps | ✓ |
| Kein `legend`, kein `hint`, kein `only` — die drei Ausschlüsse stehen im Kopfkommentar | `StatusHeaderProps` (`StatusHeader.tsx:4–12`) kennt nur `axis` und `label`; die drei Ausschlüsse stehen mit Begründung in `:20–26`, der Entscheid Klick-statt-Hover in `:28–30` | ✓ |
| Barrel-Kopf führt `StatusHeader` nicht mehr als „bleibt draußen"; Export in der Gruppe Status neben `StatusBadge` | `src/ui/v3/index.ts:33–36` begründet, warum er drin ist; „Weiter draußen bleiben" (`:38`) nennt nur noch `Drawer`/`UrlDrawer`/`Tooltip`. Export `:373` direkt unter `StatusBadge` (`:372`) in der Gruppe `/* Status — die eine erlaubte Status-Darstellung (R1). */` (`:366`) | ✓ |
| Prüfliste §10 zeigt auf diesen Baustein | `docs/design-guidelines.md:231` — „Jede Status-Spalte `StatusHeader` (`@/ui/v3`, 0077 — Wort + (i), Legende aus der Registry) + `StatusBadge` …" | ✓ |
| offen (App): ersetzt `ui/components/primitives/StatusHeader.tsx` in 36 Dateien; `legend={axisLegend("x")}` wird `axis="x"`, `hint` entfällt; die acht Handlegenden gehen über L-51 | betrifft `ludwig/app`, in diesem Repo nicht prüfbar | offen (App) |

**Entscheide dieser Abnahme** (zu den beiden Befunden des Bauenden)

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Das (i) sitzt im sortierbaren Kopf im `<a>` von `.v2sortlink` — Mangel dieser Aufgabe oder Befund gegen `DataTable`? | Die Verschachtelung entsteht nicht in diesem Baustein, sondern in `headCell` (`src/ui/v3/patterns/DataTable.tsx:296–324`, Link in `:318`), das **jeden** `col.header` unverändert in den Sortier-Link nimmt; `StatusHeader` liefert für sich gültiges Markup (`span` + `button`) und kann daran nichts ändern. Der saubere Schnitt — nur Wort und Pfeil in den Link — ändert den Vertrag von `ColumnDef` und braucht eine eigene Aufgabe. Im Browser nachgemessen (`…--in-data-table`): Klick auf das (i) → Dialog, `location.hash` leer; Klick auf das Wort → `#sort=match&dir=asc&page=1`; Link und Knopf sind zwei Tabstopps. Der Befund ist aber schwerer als „formal unsauber": interaktiver Inhalt in einem `<a>` ist nach HTML-Inhaltsmodell ungültig und wird von Hilfsmitteln uneinheitlich ausgegeben — er gehört ins Befund-Register gegen `DataTable`, nicht in eine Fußnote dieser Spec | Befund gegen `DataTable`, **kein Mangel von 0077** |
| Story `Axes` nimmt `mirror_match`, obwohl die Spec die Achse `abgleich` nennt — trägt die Begründung? | `grep '"abgleich"' src/ui/v3/patterns/status-registry.ts` findet nichts; die Registry führt `mirror_match` („DATEV-Abgleich", `status-registry.ts:109`) und `abgleich_lauf` („Abgleich-Lauf", `:110`). `abgleich_lauf` ist der Lauf, nicht der Zustand je Beleg — für eine Beleg-Spalte ist `mirror_match` die richtige Achse. Die Story beschriftet den Kopf mit „Abgleich" und führt damit genau vor, wozu `label` von `axis` getrennt ist. Die Spec hat die Achse in Z. 89 nur illustriert, kein Kriterium hängt an ihrem Namen. Nebenbefund ohne Folge: der Dialog trägt den Registry-Titel „DATEV-Abgleich", der Kopf das kürzere „Abgleich" — spezifischer statt widersprüchlich | ✓ Begründung trägt |
| §9 „Jedes klickbare Element antwortet auf Hover" | Im Browser geprüft: auf den Knopf im (i) passt keine `:hover`-Regel (Suche über alle Stylesheets nach passenden `:hover`-Selektoren → leer), die Inline-Styles in `StatusInfoButton.tsx:40–50` setzen nur `cursor: pointer` und `opacity: 0.65`. Das ist die Gestaltung von `StatusInfoButton`, die 0077 unverändert wiederverwendet, und betrifft jedes (i) im Set gleichermaßen — `StatusHeader` bringt keine eigene Fläche mit und kann es nicht heilen | Befund gegen `StatusInfoButton`, **kein Mangel von 0077** |

Abgenommen von / am: Claude, Abnahme-Agent, 2026-09-05 · Offene Punkte: keiner
in diesem Repo. Mitzunehmen: (a) `DataTable.headCell` nimmt den ganzen
`col.header` in den Sortier-Link — eigene Aufgabe; (b) das (i) aus
`StatusInfoButton` antwortet nicht auf Hover (§9); (c) die Ablösung in der App
(Kriterium „offen (App)", Register L-51).

## Offene Fragen

1. Klick statt Hover — bleibt es dabei, obwohl die App 36-mal Hover kennt?
   *Ohne Antwort: ja, Klick → Dialog; eine Mechanik für „was heißt dieser
   Zustand" im ganzen Set.*
   **Entschieden (Bauender, 2026-09-05, Default):** Klick → Dialog. Eine
   Legende mit zwölf Zeilen ist im Tooltip für Tastatur und Screenreader
   nicht erreichbar; der Hover der App fällt beim Umzug weg. Steht im
   Kopfkommentar von `StatusHeader.tsx`.
2. Soll ein Wächter-Test verbieten, dass ein `ColumnDef.header` das nackte
   Wort „Status" trägt? *Ohne Antwort: nein — die Prüfliste §10 reicht, ein
   Test kommt, wenn es einmal durchrutscht.*
   **Entschieden (Bauender, 2026-09-05, Default):** kein Test. Die Prüfliste
   §10 zeigt jetzt auf diesen Baustein; ein Test kommt, wenn ein „Status"
   einmal durchrutscht.

## Befund beim Bauen

- **Achse `abgleich` gibt es nicht.** Die Spec nennt sie in Story `Axes`; die
  Registry führt `mirror_match` („DATEV-Abgleich") und `abgleich_lauf`
  („Abgleich-Lauf"). Die Stories nehmen `mirror_match` und beschriften den
  Kopf mit „Abgleich" — genau der Fall, für den `label` von der Achse
  getrennt ist.
- **Das (i) sitzt in einem sortierbaren Kopf im `<a>` von `.v2sortlink`.**
  Interaktives in einem Link ist formal unsauber; funktional stimmt es
  (`StatusInfoButton` stoppt Default und Propagation, Story `InDataTable`
  nachgesehen: Dialog auf, keine Sortierung). Sauber wäre, dass `headCell`
  nur das Label in den Link nimmt. Das ist eine Änderung an `DataTable`,
  nicht an diesem Baustein — offener Punkt für die Abnahme.
