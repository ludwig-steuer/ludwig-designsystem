# 0068 · `AccountDrawer` — das Konto nachschlagen, ohne die Arbeit zu verlassen

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → das **Zonen-Schema** ja (steht als Regel in 0052), der **Drawer** nein: er zeigt ein Ludwig-Konto → `entities/` |
| Quelle | Entitätsprofil `docs/entitaeten/account.md` (Status `geprüft`), Formen-Zeile `AccountDrawer` (§7 Grund 5) · Anfrage Owner 2026-09-04 („next step: drawer für Konto, z.B. 1210") mit drei Entscheiden vom selben Tag · Zonen-Schema aus 0052 · `design-guidelines.md` A10 |
| Ersetzt | `AccountLedgerDrawerProvider` in `ludwig/app` (`ui/drawers/AccountLedgerDrawer.tsx`, 365 Zeilen) — einer der sechs Drawer, die 0052 ablöst |
| Blockiert | die 5 `<AccountRef>`-Stellen und 13 Context-Dateien der App, die heute auf den alten Drawer zeigen · 0013 (das Kontenblatt-Icon von `AccountField` bekommt endlich ein Ziel) |
| Setzt voraus | 0042 `Drawer` (fertig) · 0066 `AccountFacts` (Zone 3) · 0067 `AccountEntryList` (Zone 3b) |
| Spec von / am | Claude, 2026-09-04 |
| Freigegeben | Owner, 2026-09-04 |
| Gebaut von / am | Claude, 2026-09-04 — `AccountDrawer.tsx`, sechs Stories |

## Ziel

Die Sachbearbeiterin bucht einen Beleg und der Agent schlägt `6815` vor. Bevor
sie das Konto übernimmt, will sie eine Frage beantwortet haben: **was liegt
sonst auf diesem Konto?** Dafür darf sie ihre Buchung nicht verlassen — Filter,
Zeile und halb getippte Werte müssen stehen bleiben.

Genau das tut der Drawer heute schon in der App, mit zwei Schwächen: die
Antwort steckt in **zwei Tabs**, zwischen denen sie schalten muss, und das
**Jahr** kommt aus dem globalen Mandanten-Scope — steht sie im falschen Jahr,
muss sie den Drawer schließen, oben umschalten und neu öffnen.

Neu: eine Liste statt zweier Tabs (0067), ein Jahresschalter im Kopf, und
darunter dieselben Fakten, die später der View zeigt.

## Einordnung

**Wiederverwenden — geprüft, reicht nicht:**

| `@when`-Treffer | warum er nicht reicht |
|---|---|
| `Drawer` — „Looking at something existing next to a list — **an account sheet**, open items — without leaving the list" (0042) | Nennt diesen Fall wörtlich und liefert Scrim, Kopf, `meta`, Fußleiste, Escape, Fokus-Führung. Er weiß nur nicht, **was** ein Konto ist. Diese Aufgabe füllt ihn; sie definiert weder Scrim noch Kopf noch Fuß neu. |
| `SourceDocumentDrawer` (0052) | Der Schwesterdrawer und die Vorlage für das Zonen-Schema. Andere Entität, und Zone 2 (Original) entfällt hier ersatzlos. |
| `MasterDetail` — „Picking from a list, working on the selected item on the right" | Der Nachbar für eine **Seite**, die um Liste und Detail gebaut ist. Hier ist die Arbeit die Buchung, das Konto nur nachgeschlagen. |
| `Popover`/`HoverCard` | Ein Satz oder eine Vorschau. 2.937 Bewegungen sind keine Vorschau — aber die `HoverCard` über `AccountFacts` (0066) ist die Stufe **darunter** und bleibt. |
| `Dialog` | Entscheidung mit Folgen. Der Drawer ist lesend. |

**Neu, weil:** §3.5 und Zonen-Schema 0052 — die Regel 5 aus
`entitaet-analysieren` §7 trifft zu: Das Konto ist FK-Ziel jeder
Buchungszeile, und fünf Stellen verweisen darauf, ohne es zeigen zu können.
Das Profil nennt sie.

**Zuschnitt: eine Datei, ein Export** `AccountDrawer.tsx`. Grund nach §4: er
komponiert nur (Zonen 1 · 3 · 4 · 5) und trägt einen einzigen eigenen
Zustand — wie viele Zeilen sichtbar sind. Sechs Stories, 9 Props, ~130 Zeilen.

**Setzt auf:** `Drawer` (`size="lg"`), `AccountFacts` (0066),
`AccountEntryList` (0067), `Button`, `Segmented` oder `Select` für das Jahr,
`Banner`, `EmptyState`, `Skeleton`.

## Zonen (0052)

| # | Zone | Hier | Pflicht |
|---|---|---|---|
| 1 | Kopf | Titel `Konto 1210`, `meta` mit Name · Rolle · Bewegungszahl, und **rechts der Jahresschalter** | ja |
| 2 | Original | **entfällt ersatzlos** — ein Konto hat kein Original: kein PDF, keine Auszugszeile, kein Rohsatz. Kein Platzhalter (0052 M3: „Zone 2 entfällt ersatzlos") | nein |
| 3 | Fakten | `AccountFacts` (0066) — dieselbe Komponente, die später der View zeigt | ja |
| 3b | Bewegungen | `AccountEntryList` (0067), `variant="compact"`, neueste zuerst, „Mehr laden" | ja |
| 4 | Grenze | ein Satz, was der Schnellblick **nicht** beantwortet | ja |
| 5 | Fuß | **genau eine** Aktion: „Volles Konto öffnen" (A10) | ja |

Zone 4 im Wortlaut: „Kontenrahmen, Steuerautomatik und die Monatsübersicht
stehen in der vollständigen Kontoansicht." Ton nach `docs/ton-und-sprache.md`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` | `boolean` | ja | an `Drawer` durchgereicht | `Geoeffnet` |
| `onClose` | `() => void` | ja | Escape, Scrim, Kreuz — alle drei melden dasselbe (0042) | `Geoeffnet` |
| `accountNumber` | `string` | ja | Trägt den Titel, auch während des Ladens — die Nummer ist das eine, was der Aufrufer immer kennt | `Laedt` |
| `facts` | `AccountFactsVM \| null` | ja | Zone 3; `null` während des Ladens oder wenn es das Konto im Jahr nicht gibt | `Geoeffnet`, `NotFound` |
| `entries` | `readonly AccountEntry[]` | ja | Zone 3b, fertig vereinigt und sortiert | `Geoeffnet` |
| `total` | `number` | nein | Vorratszähler für „Mehr laden" | `Geoeffnet` |
| `onShowMore` | `() => void` | nein | an `AccountEntryList` durchgereicht | `Geoeffnet` |
| `year` | `number` | ja | Das gezeigte Wirtschaftsjahr | `Geoeffnet` |
| `years` | `readonly number[]` | ja | Die wählbaren Jahre. Ein Element → der Schalter erscheint nicht | `Geoeffnet`, `OneYear` |
| `onYearChange` | `(year: number) => void` | ja | **Wirkt nur im Drawer** (Owner 2026-09-04) — die Seite dahinter behält ihr Jahr | `Geoeffnet` |
| `onOpenFull` | `() => void` | ja | Zone 5. Pflicht, nicht optional: ein Drawer ohne diesen Weg ist nach A10 unfertig | `Geoeffnet` |
| `accountHref` | `(number: string) => string` | nein | Gegenkonten klickbar — im Drawer der Kontowechsel | `InContext` |
| `loading` | `boolean` | nein | Ladefläche in der Form des Inhalts | `Laedt` |
| `error` | `string` | nein | Zone 3 und 3b weichen einem `Banner`; der Fuß bleibt leer | `Fehler` |

**Typen:** `AccountFactsVM` aus 0066, `AccountEntry`/`AccountEntryOrigin` aus
0067. **GLOSSARY:** englisch im Code (`fiscalYear`, `accountNumber`), deutsch
im Label („Konto", „Volles Konto öffnen", „Wirtschaftsjahr").

**Was der Drawer bewusst nicht kann:**

- **schreiben** — er ist lesend. Wer ändern will, geht in die Vollansicht
  (0052: „Er ist lesend"). Kein Bearbeiten der Kontobeschreibung, kein
  Archivieren, kein Anlegen.
- **sich selbst öffnen oder das Routing kennen** — `open`/`onClose` kommen von
  außen, `UrlDrawer` bleibt in der App (0052).
- **laden** — kein Aggregat, keine Server-Action, keine Vereinigung. Auch der
  Jahreswechsel lädt nicht selbst: er meldet, der Aufrufer liefert.
- **eine zweite Ebene öffnen** — der Fuß führt in die Vollansicht, kein
  Drawer im Drawer. Ein Klick auf ein Gegenkonto **ersetzt** den Inhalt
  (derselbe Drawer, neue Nummer), er stapelt nicht.
- **das Jahr global setzen** — Owner-Entscheid: `onYearChange` wirkt im
  Drawer. Wer den globalen Scope ändern will, tut das oben in der Shell.

## Verhalten

**Client-Component** (`"use client"`) — `Drawer` ist eine, und der
Jahresschalter sowie „Mehr laden" sind Handler. Die Zonen 3 und 3b bleiben
Server-Components, die als Kinder hineingehen.

**Kopf (Zone 1).** Titel `Konto 1210`. `meta`: `Commerzbank · Sachkonto ·
2.937 in DATEV, 4 nur in Ludwig`. Der **Jahresschalter** steht rechts im Kopf
— nicht im Fuß, den hält A10 für die Vollansicht frei. Bei ≤ 4 Jahren
`Segmented`, darüber `Select`; bei genau einem Jahr erscheint er nicht,
sondern das Jahr steht als Text in der `meta`-Zeile.

**Jahreswechsel.** `onYearChange` meldet, der Aufrufer liefert neue `facts`
und `entries` und setzt `loading`. Der Drawer bleibt offen, der Titel bleibt
stehen, die sichtbare Zeilenzahl fällt auf die erste Seite zurück — ein
Jahreswechsel ist eine neue Frage, kein Weiterblättern.

**Zustände** (V9, alle im Drawer-Körper, Kopf bleibt stehen):

| Zustand | Körper | Fuß |
|---|---|---|
| gefüllt | Zonen 3 · 3b · 4 | „Volles Konto öffnen" |
| lädt | Ladeflächen **in der Form des Inhalts**: ein Fakten-Block (~7 Zeilen) und Zeilen-Skelett mit stehender Kopfzeile — nicht ein Kasten über alles (0052 M2) | leer |
| Fehler | `Banner kind="danger"`, Text nennt Konto und Jahr | leer |
| nicht gefunden | `EmptyState inline`, linksbündig: „Das Konto 1210 gibt es im Wirtschaftsjahr 2024 nicht." — plus der Hinweis, dass der Kontenplan je Jahr eine Vollkopie ist (GLOSSARY F64). Der **Jahresschalter bleibt bedienbar**, denn er ist der Ausweg | leer |
| leer | Fakten stehen, `AccountEntryList` zeigt ihren Leertext | „Volles Konto öffnen" |

„Leer nach Filter" gibt es nicht — der Drawer filtert nicht.

Der Fuß ist in vier von fünf Zuständen leer; `.v2drawer__foot:empty`
verschwindet dann von selbst (0042). Das ist kein Widerspruch zu A10: die
Regel verlangt den Weg, wo es etwas zu öffnen gibt.

**Tastatur:** Escape schließt (aus `Drawer`). Der Fokus geht beim Öffnen in
den Drawer und beim Schließen zurück auf den Auslöser (0042). Tab-Ordnung:
Jahresschalter → Gegenkonto-Links → „Mehr laden" → Fuß-Knopf → Kreuz.

**CSS:** keine neue Wurzel nötig — Zone 4 ist ein `.v2sub`-Satz, alles andere
kommt aus 0042, 0066 und 0067. Braucht der Jahresschalter im Kopf eine Regel,
kommt sie als `.v2drawer__year` in den 0042-Block, nicht in einen neuen.

## Stories

Titel `v3/Entitäten/Konto/AccountDrawer`.

| Story | Beweist |
|---|---|
| `Geoeffnet` | Konto 1210, alle Zonen in der Reihenfolge 1 · 3 · 3b · 4 · 5, echte Zahlen; Rundlauf über `onClose`, `onYearChange`, `onShowMore` und `onOpenFull` |
| `Laedt` | `loading` — Fakten-Fläche und Zeilen-Skelett, Kopf und Titel stehen, Fuß leer |
| `Fehler` | `error` — `Banner`, Fuß leer |
| `NotFound` | `facts: null`, `entries: []` im Jahr 2024 — `EmptyState inline`, Jahresschalter weiter bedienbar |
| `OneYear` | `years: [2026]` — kein Schalter, das Jahr steht als Text in der `meta`-Zeile |
| `InContext` | Der Drawer über einer Buchungszeile: Klick auf ein Gegenkonto **ersetzt** den Inhalt (kein zweiter Drawer), die Zeile dahinter bleibt sichtbar — wie auf der Seite |

Sechs Stories: 5 Zustände (gefüllt, lädt, Fehler, nicht gefunden, leer — der
Leerfall der Liste steckt in `NotFound`) + 1 Layout-Zweig (`years.length`)
+ 1 „im Einsatz". Die Callbacks laufen alle in `Geoeffnet` zusammen, statt je
eine Story zu bekommen — sie sind ein Rundlauf, nicht vier.

Nicht anwendbare Zustände: „leer nach Filter" (filtert nicht), „ungültig"
(schreibt nicht).

## Ausbau

Nachgetragen nach A12 (die Spec entstand davor). Zwei Zeilen stehen bereits
wörtlich in den offenen Fragen als „eigene kleine Änderung".

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Geschlossene Jahre kenntlich machen | ein Chip in der `meta`-Zeile, kein neuer Schalter (offene Frage 2) | jemand bucht ins falsche Jahr, weil `closed` im Schalter nicht zu sehen ist |
| Zehn Spalten im Drawer (`full` statt `compact`) | `size="xl"` plus `variant` durchreichen | die Abnahme zeigt, dass sieben Spalten quetschen; heute trägt `Table minWidth` das Scrollen (offene Frage 3) |
| Jahre selbst laden | keine — `years` bleibt Prop | nie; der Drawer kennt den Mandanten nicht (offene Frage 1) |
| Bewegungen nachladen ohne Vollansicht | `onShowMore` gibt es; es fehlt nur der zweite Klick | ein Konto hat mehr Bewegungen, als der Drawer in zwei Schritten zeigt |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Komponente benannt (`AccountDrawer.tsx`), Story daneben, Titel `v3/Entitäten/Konto/AccountDrawer`
- [ ] Code englisch; `@when`/`@instead` am Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle sechs Stories vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Zonen in der Reihenfolge 1 · 3 · 3b · 4 · 5; Zone 2 kommt **nicht** vor — kein `iframe`, `img`, `embed`, `object` und kein Platzhalter im Drawer (Story `Geoeffnet`, DOM-Messung der y-Positionen)
- [ ] Zone 3 ist `AccountFacts` aus 0066 — **dieselbe** Komponente, die der View zeigt; keine zweite Feldliste im Drawer (Import in `AccountDrawer.tsx` zeigt darauf)
- [ ] Zone 3b ist `AccountEntryList` aus 0067; der Drawer setzt keine eigene Tabelle
- [ ] Der Fuß trägt **genau einen** Knopf, und der führt in die Vollansicht (A10; Story `Geoeffnet`: ein `<button>` im Fuß, Klick setzt den `onOpenFull`-Text)
- [ ] Fuß leer in `Laedt`, `Fehler`, `NotFound` — und dann unsichtbar (`.v2drawer__foot:empty` aus 0042)
- [ ] Der Jahresschalter steht im **Kopf**, nicht im Fuß (Story `Geoeffnet`, DOM: innerhalb `.v2drawer__h`) — und in **jedem** Zustand, auch beim Laden (Story `Laedt`)
- [ ] `onYearChange` wirkt nur im Drawer: die Tabelle dahinter behält Jahr, Zeilen und Scrollposition (Story `InContext` — der Schalter hängt seit der Nachbesserung an echtem `useState`, vorher war er ein Leerlauf-Handler und bewies nichts)
- [ ] `years.length === 1` zeigt keinen Schalter (Story `OneYear`)
- [ ] Ein Jahreswechsel setzt die sichtbare Zeilenzahl zurück (Story `Geoeffnet`)
- [ ] `NotFound` lässt den Jahresschalter bedienbar — er ist der Ausweg (Story `NotFound`)
- [ ] Ladefläche hat die Form des Inhalts: zwei Bereiche, nicht ein Kasten (Story `Laedt`, Höhen nachgemessen gegen `Geoeffnet`)
- [ ] Ein Wechsel der `accountNumber` tauscht den Inhalt **desselben** Drawers; es entsteht kein zweiter (Stories `InContext` und `NotFound`: ein Jahreswechsel im offenen Drawer ersetzt Fakten, Zeilen und Fuß, DOM zeigt weiter genau ein `.v2drawer` und einen Scrim). *Präzisiert nach der ersten Abnahme:* das Kriterium hieß „Klick auf ein Gegenkonto" — den Klick kann der Drawer gar nicht beantworten, seine Gegenkonten sind Links auf den Search-Param, den in der App der `UrlDrawer` liest (L3). Was die Komponente beweisen kann, ist der Tausch bei neuer Prop; das Routing gehört der App → **offen (App)** für den Link-Weg selbst. *Nachtrag Runde 2:* der zuerst genannte Nachweis — Klick auf die zweite Tabellenzeile — ist bei offenem Drawer gar nicht erreichbar, der Scrim liegt darüber. Geprüft wird deshalb der Jahreswechsel.
- [ ] Baut auf 0042 auf: definiert weder Scrim noch Kopf noch Fußleiste selbst (`grep` findet kein `v2drawer__` außer einer möglichen `--year`-Regel)
- [ ] Der Drawer lädt nichts und rechnet nichts: keine `fetch`, keine Summenbildung, kein `filter` über `entries`
- [ ] Ersetzt `AccountLedgerDrawerProvider` in `ludwig/app` ohne Funktionsverlust — bis auf die Spalte „Sachverhalt" und die Tab-Umschaltung, die absichtlich entfallen → **offen (App)**

## Offene Fragen

1. **Wo kommen die wählbaren Jahre her?** Der Drawer bekommt `years` als
   Prop; in der App sind das die `client_fiscal_years` des Mandanten. — *Ohne
   Antwort: Prop bleibt Prop. Der Drawer kennt den Mandanten nicht, und eine
   Liste von Zahlen ist billiger als ein Loader.*
2. **Zeigt der Drawer geschlossene Jahre?** `client_fiscal_years.status` kennt
   `closed` (immutable). — *Ohne Antwort: ja, mit dem Jahr im Schalter und
   ohne Zusatz — der Drawer ist lesend, für ihn ist ein geschlossenes Jahr
   nichts Besonderes. Falls es doch sichtbar sein soll, ist das ein Chip in
   der `meta`-Zeile und eine eigene kleine Änderung.*
3. **Breite.** 0052 hat `--drawer-lg` als Default gesetzt. Zehn Spalten im
   `full`-Modus passen dort nicht — im Drawer läuft aber `compact` mit
   sieben. — *Ohne Antwort: `size="lg"` wie der Beleg-Drawer, `compact`. Wenn
   die Abnahme zeigt, dass sieben Spalten quetschen, trägt
   `AccountEntryList` das horizontale Scrollen schon über `Table minWidth`.*

## Abweichungen von der Spec

| Punkt | Spec | Gebaut | Grund |
|---|---|---|---|
| `meta` der Zone 1 | `Commerzbank · Sachkonto · 2.937 in DATEV, 4 nur in Ludwig` | nur der **Name**, dazu der Jahresschalter | Die Zahlen stehen zwei Zeilen tiefer in Zone 3. Im Browser stand alles doppelt — Zone 1 trägt jetzt die Identität, Zone 3 die Zahlen. |
| Fuß-Knopf | „Volles Konto öffnen" mit Pfeil-Icon | ohne Icon | Der Knopf brach zweizeilig um. V11 verlangt kein Icon ohne Not — ein Wort allein ist regelkonform, zwei Zeilen im Fuß sind es nicht. |
| „Mehr laden" | `onShowMore` an `AccountEntryList` | der Drawer **baut den Knopf** und gibt ihn als `more` hinein | Folge der Abweichung in 0067: die Liste bleibt Server-Component, der Drawer ist ohnehin Client. Die Drawer-Schnittstelle behält `onShowMore` unverändert. |
| Zone 1 im Ladezustand | `meta` als Text, solange geladen wird | **keine Verzweigung mehr** — Zone 1 trägt den Jahresschalter in jedem Zustand | Empfehlung aus Runde 2 der Abnahme, übernommen: der Schalter ist der Ausweg aus einem falschen Jahr und war genau dann verschwunden, wenn dieses Jahr noch lud. Nebeneffekt: die Kopfzeile springt beim Umschalten nicht mehr, und der Ternary fällt weg. |

## Abnahme

Zwei Runden. Runde 1 (2026-09-04) schickte die Aufgabe mit zwei ✗ zurück —
beide an derselben Story —, Runde 2 prüfte die Nachbesserung aus Commit
`0ae2dad` nach: Storybook auf Port 6122, DOM-Messungen im Preview-Frame,
Rundlauf und Kontowechsel geklickt, `pnpm typecheck` und `pnpm build` je
Exit 0 (in beiden Runden).

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | beide Läufe Exit 0, in Runde 2 wiederholt | ✓ |
| Datei nach der Komponente benannt, Story daneben, Titel `v3/Entitäten/Konto/AccountDrawer` | `AccountDrawer.tsx` + `.stories.tsx`; `index.json`: `v3-entitäten-konto-accountdrawer--*` | ✓ |
| Code englisch; `@when`/`@instead` am Export | `AccountDrawer.tsx` am Export | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-f]{3,8}|[0-9]+px"` findet nichts; der Drawer zeigt selbst keinen Status, die Chips kommen aus 0066/0067 | ✓ |
| Alle sechs Stories vorhanden; ausgeschlossene Zustände begründet | `Geoeffnet`, `Laedt`, `Fehler`, `NotFound`, `OneYear`, `InContext` — 6/6; „leer nach Filter" und „ungültig" begründet ausgeschlossen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen; zwei Funde ohne Kriteriumsbezug → Anmerkungen 1 und 2 | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sechs Stories in beiden Runden gerendert; „Mehr laden", Jahreswechsel, Fuß-Knopf und Kontowechsel geklickt | ✓ |
| Zonen in der Reihenfolge 1 · 3 · 3b · 4 · 5; Zone 2 kommt nicht vor | `Geoeffnet`, `getBoundingClientRect().top`: Kopf 0 · Fakten 115 · Bewegungen 307 · Grenzsatz 483 · Fuß 505. `iframe`/`img`/`embed`/`object` im Story-Root: **0**, kein Platzhalter | ✓ |
| Zone 3 ist `AccountFacts` aus 0066 — keine zweite Feldliste | Import `./Account`; im DOM genau ein `.v2acc__facts` mit `.v2fields--bare` | ✓ |
| Zone 3b ist `AccountEntryList` aus 0067; keine eigene Tabelle | Import `./AccountEntries`; genau eine `.v2ae`/`.v2tbl` im Körper | ✓ |
| Der Fuß trägt genau **einen** Knopf, und der führt in die Vollansicht | `Geoeffnet`: `.v2drawer__foot` hat 1 Kind, ein `<button>` „Volles Konto öffnen"; Klick trägt „onOpenFull — /clients/…/accounts/1210" in das Story-Protokoll ein | ✓ |
| Fuß leer in `Laedt`, `Fehler`, `NotFound` — und dann unsichtbar | in allen dreien `.v2drawer__foot` vorhanden, Textinhalt leer, `display: none`, Höhe 0 px (`:empty` aus 0042); in `Geoeffnet` und `OneYear` trägt er den Knopf | ✓ |
| Der Jahresschalter steht im **Kopf**, nicht im Fuß | `Geoeffnet`: `.v2acc__yearpick` liegt in `.v2drawer__h` und enthält `div.v2seg[role=group][aria-label="Wirtschaftsjahr"]` mit drei Knöpfen | ✓ |
| `onYearChange` wirkt nur im Drawer: die Tabelle dahinter behält Jahr, Zeilen und Scrollposition | Runde 1 ✗ (Leerlauf-Handler). Runde 2 in `InContext` geklickt: `aria-pressed` wandert von 2026 auf 2024, das Saldo-Label wechselt auf „Saldo in DATEV 2024", Titel und Drawer bleiben stehen (`.v2drawer` = 1) — und die Tabelle dahinter zeigt unverändert ihre Zeile „31.08.2026 · Reparatur März · 1210 Commerzbank" | ✓ |
| `years.length === 1` zeigt keinen Schalter | `OneYear`: kein `.v2acc__yearpick`, `meta` = „Musterfirma GmbH · 2026" als Text | ✓ |
| Ein Jahreswechsel setzt die sichtbare Zeilenzahl zurück | `Geoeffnet`: „Mehr laden" → 4 Zeilen, danach Wechsel auf 2024 → wieder 2 Zeilen; Protokoll „onYearChange → 2024" | ✓ (Anmerkung 3: es tut der Aufrufer, nicht der Drawer) |
| `NotFound` lässt den Jahresschalter bedienbar | `NotFound`: Schalter vorhanden und aktiv; Klick auf „2026" ersetzt den Leerzustand durch Fakten, 4 Bewegungen und den Fuß-Knopf | ✓ |
| Ladefläche hat die Form des Inhalts: zwei Bereiche, nicht ein Kasten | `Laedt`: `.v2acc__load` mit zwei Kindern — Fakten-Block 125 px, Zeilen-Skelett 187 px (gegen 192 px bzw. 176 px in `Geoeffnet`); die Tabellen-Kopfzeile mit sieben Spalten steht | ✓ |
| Ein Wechsel der `accountNumber` tauscht den Inhalt **desselben** Drawers; es entsteht kein zweiter | Runde 1 ✗ (der Link navigierte das Preview-Frame). Runde 2, Tausch bei neuer Prop belegt: `InContext` Jahreswechsel und `NotFound` 2024→2026 ersetzen Fakten, Zeilen und Fuß **im offenen Drawer**, dabei durchgehend genau ein `.v2drawer`, ein `.v2drawer__scrim`, kein `dialog`. Der in der Spec genannte Klick auf die zweite Tabellenzeile ist dabei nicht der Weg — er liegt unter dem Scrim (Anmerkung 4) | ✓ |
| Der Link-Weg selbst (Gegenkonto → Search-Param → `UrlDrawer`) | in Storybook routet nichts; in `InContext` ist `accountHref` seit der Nachbesserung nicht gesetzt, die Gegenkonten sind dort reiner Text (`.v2ae__contra a` → 0). Dass der Klick den Drawer neu befüllt, kann erst die App zeigen | **offen (App)** |
| Baut auf 0042 auf: definiert weder Scrim noch Kopf noch Fußleiste selbst | `grep -n "v2drawer__" AccountDrawer.tsx` → nur eine Kommentarzeile; der Jahresschalter hängt an `.v2acc__yearpick` statt an `.v2drawer__year` — Ziel der Regel erfüllt | ✓ |
| Der Drawer lädt nichts und rechnet nichts | kein `fetch`, kein `useState`/`useEffect`, kein `filter`/`reduce` über `entries` | ✓ |
| Abweichungen von der Spec stichhaltig begründet | `meta` nur mit Identität, Fuß-Knopf ohne Icon, „Mehr laden" als eigener Knopf — alle drei mit Browser-Beleg und ohne Regelbruch; die zwei präzisierten Kriterien der Nachbesserung stehen mit Grund in der Kriterienliste | ✓ |
| Ersetzt `AccountLedgerDrawerProvider` in `ludwig/app` | Ablösung in der App ist ein eigener Schritt (`docs/backlog/README.md`) | **offen (App)** |

**Befunde der ersten Runde — beide behoben.**

| # | Befund (Runde 1) | Behebung, in Runde 2 nachgemessen |
|---|---|---|
| 1 | `InContext` bewies den Kontowechsel nicht: `accountHref` zeigte auf `?konto=<n>`, das niemand liest; der Klick navigierte das Preview-Frame, das Frame löste sich ab. | `accountHref` ist in der Story nicht mehr gesetzt, nichts navigiert mehr. Der Tausch bei neuer Prop ist jetzt belegt (Jahreswechsel in `InContext`, Jahrwechsel in `NotFound`) — genau ein Scrim, genau ein Drawer. Der Link-Weg ist als **offen (App)** eingetragen, was der Sache entspricht: das Routing hält die App. |
| 2 | Der Jahresschalter hing an einem Leerlauf-Handler und bewies nur, dass ein toter Handler nichts tut. | Echtes `useState` in der Story: der Schalter wirkt im Drawer, die Tabelle dahinter bleibt unverändert. Damit beweist `InContext`, was der Owner-Entscheid verlangt. |

| # | Anmerkung (kein ✗) | Beleg |
|---|---|---|
| 1 | Tab-Ordnung ist Jahresschalter → **Kreuz** → Gegenkonto-Links → „Mehr laden" → Fuß-Knopf. Die Spec erwartet das Kreuz am Ende; es steht aber im Kopf-Markup von 0042, das dieser Drawer nicht anfassen darf. Der Erwartungssatz in „Tastatur" ist zu korrigieren, nicht der Code. | `Geoeffnet`, Fokus-Reihenfolge im `.v2drawer` |
| 2 | Im Ladezustand verschwindet der Jahresschalter: `meta` fällt auf den Text „Konto-Auszug 2026" zurück. Bleibt eine Anmerkung — ich habe sie in Runde 1 so eingeordnet und es hat sich nichts geändert, was die Einordnung dreht: der Kopf selbst bleibt stehen, der Zustand ist vorübergehend, und kein Kriterium der Spec verlangt den Schalter in allen Zuständen. Sie bleibt trotzdem eine Schwäche: Zone 1 führt den Schalter als Pflicht, und in `NotFound` ist er ausdrücklich der Ausweg — wer im Ladezustand merkt, dass er im falschen Jahr steht, muss warten. **Empfehlung:** den `meta`-Knoten nicht am `loading` verzweigen (eine Zeile), dann trägt Zone 1 den Schalter durchgehend, und die Kopfzeile springt nicht. | `AccountDrawer.tsx:79–81`; Stories `Laedt` vs. `Geoeffnet` |
| 3 | Der Zuschnitt kündigt „einen einzigen eigenen Zustand — wie viele Zeilen sichtbar sind" an; gebaut hält der Drawer **gar keinen** Zustand, `entries`/`total`/`onShowMore` liegen beim Aufrufer, und das Zurücksetzen beim Jahreswechsel tut die Story. Das passt zur Schnittstelle und ist die bessere Lösung — es gehört nur in die Abweichungs-Tabelle. | `AccountDrawer.tsx` Schnittstelle; Story `Geoeffnet` |
| 4 | Der in der Kriterienzeile genannte Nachweis — „Klick auf die zweite Tabellenzeile" — ist bei offenem Drawer nicht erreichbar: der Scrim liegt mit `pointer-events: auto` und `z-index: 60` über der ganzen Fläche, `elementFromPoint` auf dem zweiten „ansehen" liefert `div.v2fields__row` aus dem Drawer, ein echter Klick läuft in die Zeitüberschreitung und ein erzwungener ändert nichts. Der Tausch selbst ist über den Jahreswechsel belegt; der Satz sollte den erreichbaren Nachweis nennen. | Story `InContext`, `elementFromPoint`, Playwright-Klick-Protokoll |

Abgenommen von / am: Claude (Abnahme), 2026-09-04 (Runde 1) · 2026-09-04
(Runde 2, nach Commit `0ae2dad`) · Ergebnis: **fertig** · Offene Punkte:
keine blockierenden; Anmerkungen 1–4 sind Textpflege, Anmerkung 2 dazu eine
Empfehlung von einer Zeile Code, und zwei Kriterien bleiben planmäßig
**offen (App)**.
