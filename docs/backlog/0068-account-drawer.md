# 0068 · `AccountDrawer` — das Konto nachschlagen, ohne die Arbeit zu verlassen

| | |
|---|---|
| Status | spec |
| Stufe | `entities/account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → das **Zonen-Schema** ja (steht als Regel in 0052), der **Drawer** nein: er zeigt ein Ludwig-Konto → `entities/` |
| Quelle | Entitätsprofil `docs/entitaeten/account.md` (Status `geprüft`), Formen-Zeile `AccountDrawer` (§7 Grund 5) · Anfrage Owner 2026-09-04 („next step: drawer für Konto, z.B. 1210") mit drei Entscheiden vom selben Tag · Zonen-Schema aus 0052 · `design-guidelines.md` A10 |
| Ersetzt | `AccountLedgerDrawerProvider` in `ludwig/app` (`ui/drawers/AccountLedgerDrawer.tsx`, 365 Zeilen) — einer der sechs Drawer, die 0052 ablöst |
| Blockiert | die 5 `<AccountRef>`-Stellen und 13 Context-Dateien der App, die heute auf den alten Drawer zeigen · 0013 (das Kontenblatt-Icon von `AccountField` bekommt endlich ein Ziel) |
| Setzt voraus | 0042 `Drawer` (fertig) · 0066 `AccountFacts` (Zone 3) · 0067 `AccountEntryList` (Zone 3b) |
| Spec von / am | Claude, 2026-09-04 |

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
| `DocumentDrawer` (0052) | Der Schwesterdrawer und die Vorlage für das Zonen-Schema. Andere Entität, und Zone 2 (Original) entfällt hier ersatzlos. |
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
| `facts` | `AccountFactsVM \| null` | ja | Zone 3; `null` während des Ladens oder wenn es das Konto im Jahr nicht gibt | `Geoeffnet`, `NichtGefunden` |
| `entries` | `readonly AccountEntry[]` | ja | Zone 3b, fertig vereinigt und sortiert | `Geoeffnet` |
| `total` | `number` | nein | Vorratszähler für „Mehr laden" | `Geoeffnet` |
| `onShowMore` | `() => void` | nein | an `AccountEntryList` durchgereicht | `Geoeffnet` |
| `year` | `number` | ja | Das gezeigte Wirtschaftsjahr | `Geoeffnet` |
| `years` | `readonly number[]` | ja | Die wählbaren Jahre. Ein Element → der Schalter erscheint nicht | `Geoeffnet`, `EinJahr` |
| `onYearChange` | `(year: number) => void` | ja | **Wirkt nur im Drawer** (Owner 2026-09-04) — die Seite dahinter behält ihr Jahr | `Geoeffnet` |
| `onOpenFull` | `() => void` | ja | Zone 5. Pflicht, nicht optional: ein Drawer ohne diesen Weg ist nach A10 unfertig | `Geoeffnet` |
| `accountHref` | `(number: string) => string` | nein | Gegenkonten klickbar — im Drawer der Kontowechsel | `ImKontext` |
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
| `NichtGefunden` | `facts: null`, `entries: []` im Jahr 2024 — `EmptyState inline`, Jahresschalter weiter bedienbar |
| `EinJahr` | `years: [2026]` — kein Schalter, das Jahr steht als Text in der `meta`-Zeile |
| `ImKontext` | Der Drawer über einer Buchungszeile: Klick auf ein Gegenkonto **ersetzt** den Inhalt (kein zweiter Drawer), die Zeile dahinter bleibt sichtbar — wie auf der Seite |

Sechs Stories: 5 Zustände (gefüllt, lädt, Fehler, nicht gefunden, leer — der
Leerfall der Liste steckt in `NichtGefunden`) + 1 Layout-Zweig (`years.length`)
+ 1 „im Einsatz". Die Callbacks laufen alle in `Geoeffnet` zusammen, statt je
eine Story zu bekommen — sie sind ein Rundlauf, nicht vier.

Nicht anwendbare Zustände: „leer nach Filter" (filtert nicht), „ungültig"
(schreibt nicht).

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
- [ ] Fuß leer in `Laedt`, `Fehler`, `NichtGefunden` — und dann unsichtbar (`.v2drawer__foot:empty` aus 0042)
- [ ] Der Jahresschalter steht im **Kopf**, nicht im Fuß (Story `Geoeffnet`, DOM: innerhalb `.v2drawer__h`)
- [ ] `onYearChange` wirkt nur im Drawer: die Story-Umgebung hinter dem Drawer ändert sich nicht (Story `ImKontext`)
- [ ] `years.length === 1` zeigt keinen Schalter (Story `EinJahr`)
- [ ] Ein Jahreswechsel setzt die sichtbare Zeilenzahl zurück (Story `Geoeffnet`)
- [ ] `NichtGefunden` lässt den Jahresschalter bedienbar — er ist der Ausweg (Story `NichtGefunden`)
- [ ] Ladefläche hat die Form des Inhalts: zwei Bereiche, nicht ein Kasten (Story `Laedt`, Höhen nachgemessen gegen `Geoeffnet`)
- [ ] Klick auf ein Gegenkonto ersetzt den Inhalt, es entsteht **kein** zweiter Drawer (Story `ImKontext`, DOM: genau ein `[popover]`/Scrim)
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
