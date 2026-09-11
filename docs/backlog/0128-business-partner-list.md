# 0128 · Die Geschäftspartner-Liste als Szenarien

| | |
|---|---|
| Status | **in Arbeit** — fremd abgenommen 2026-09-11 mit zwei Mängeln, beide nachgearbeitet am selben Tag, Nachprüfung offen |
| Stufe | `src/showcase/partner/` (Seiten-Stories) — **keine** neue Komponente im Set |
| Klassen-Test | Die Seite gehört der App und lebt in `showcase/`, wie 0144, 0152, 0157. Die Liste selbst ist `DataTable` mit `businessPartnerColumns()`; beides ist gebaut |
| Quelle | Seitenprofil `docs/seiten/partner-liste.md` (`6490f97`, gegen die App geprüft von `ludwig-manager` am 2026-09-10) · Entitätsprofil `docs/entitaeten/business-partner.md` §Listen |
| Ersetzt | in `ludwig/app` `partners/page.tsx`: die vier Reiter, die Stat-Leiste (`Stat`, `getBusinessPartnerStats`), das rohe Filterformular mit Inline-`<select>`; dazu `AcceptCreditorForm` (Inline-Stile, Erfolg über `window.alert`) |
| Blockiert | nichts |
| Präzedenz | `src/showcase/account/` (0157): Szenario als Daten, Listenzustand im Hash |
| Spec von / am | Claude — angelegt 2026-09-08 (Skill `entitaet-analysieren` §9), neu gefasst 2026-09-10 nach dem Seitenprofil |

## Ziel

Die Seite, auf der die Sachbearbeiterin den Partner zu einer Kontonummer, einem
Namen oder einer USt-IdNr. findet, als Seiten-Stories: **eine** Liste statt
vier Reitern, die Sonderansicht „Vorschläge" mit dem Annahme-Rundlauf und drei
Leerfälle, die man auseinanderhält. Die App steht schon auf `DataTable` und
`businessPartnerColumns()`. Was fehlt, ist die Seite **um** die Liste — sie
wird hier zu Ende entwickelt, bevor die App sie nachzieht.

## Was sich gegenüber der ersten Fassung geändert hat

- **Keine Komponente `BusinessPartnerList`.** Die App hat die rohe `<table>`
  schon abgelöst. Eine Listen-Komponente trüge nichts, was `DataTable` nicht
  trägt; Kopfzeile, Filter und Pager gehören der Seite (`spec-schreiben` §3
  Regel 1: ein `@when` deckt den Fall).
- **L-15 ist für diese Liste erledigt.** Die App sortiert über
  `parsePageRequest(raw, PARTNER_SORT_KEYS)`, standardmäßig nach Nutzung
  absteigend, Name als zweiter Schlüssel (geprüft von `ludwig-manager`).
- **Der Job endet nicht mehr mit „statt einen zweiten anzulegen".** Die App hat
  keinen Anlegeweg; der einzige Schreibweg ist `acceptProposedCreditor`.
- **„Top Kreditoren" ist keine Abgrenzung mehr**, sondern gestrichen (L-228).

## Einordnung

- **Wiederverwenden:** `DataTable` (Pager, Sortierung, `filtered`, `empty`) ·
  `businessPartnerColumns()` (acht Spalten, sortierbar: Name, Reifegrad,
  Buchungen, letzte Buchung; `columns` wählt aus) · `FilterBar` mit `Input`
  und `Select` · `Tabs` · `ActionButton` mit `ask` (0121) für die Annahme ·
  `ToastHost`/`useToast` für die Rückmeldung · `AccountDrawer` (0068).
- **Neu im Set:** nichts. Die Annahme (DATEV-Nummer eines vorgeschlagenen
  Kreditors) ist eine fachliche Zusammensetzung und gehört dem Modul der App.
  Die Story baut sie aus `ActionButton` mit `ask` — als Vorlage für den Umbau
  von `AcceptCreditorForm` (Befund L-292).
- **Zuschnitt:** `PartnerList.stories.tsx` (`Seiten/Geschäftspartner/Liste`),
  `partner-list.tsx` (die Seite aus Daten, Zustand im Hash wie 0157),
  `fixtures.ts` um einen Listengenerator erweitert.

## Die Seite

| Zone | Inhalt | Baustein |
|---|---|---|
| Reiter | **Geschäftspartner** · **Vorschläge** mit Zähler | `Tabs` |
| Filter | Suche „Name, USt-IdNr. oder Kontonummer" (trifft auch den Kurznamen) · Rolle: alle · Kreditoren · Debitoren · ohne Personenkonto · Reifegrad: Wörter aus der Registry | `FilterBar`, `Input`, `Select` |
| Liste | Kopf „Geschäftspartner" mit Vorrat („6.396"; gefiltert „n von m"), acht Spalten, Sortierung Nutzung ↓, Pager 25/50 | `DataTable`, `businessPartnerColumns()` |
| Vorschläge | Partner, Kreditorkonto, Reifegrad, Ort — dazu die Spalte „Annehmen": der Knopf öffnet einen Dialog mit der vorbelegten 89xxxx-Nummer, die Erklärung steht als Text im Dialog (nicht im Tooltip), die Nummer muss 4–20 Ziffern haben | `DataTable` mit `columns`, `ActionButton ask` |
| Drawer | Kontonummer → Konto-Drawer; die Liste bleibt, wo sie war | `AccountDrawer` |

**Keine Stat-Leiste** (Seitenprofil, Zweifel 2).

## Szenarien (`Seiten/Geschäftspartner/Liste`)

| Export | Stand | Sieht | Tut | Beweist |
|---|---|---|---|---|
| `InUse` | großer Mandant, 6.396 Partner, in `AppShell` | Reiter mit „Vorschläge 7", einzeilige Filterleiste, Liste nach Nutzung ↓, „1–25 von 6.396" | blättert, sortiert nach Name | Reiter, Filter, Kopf und erste Zeilen ohne Scrollen bei 1280 und 1440 × 900 |
| `SearchByNumber` | Suche „10433" | genau eine Zeile, die Nummer in der Debitorspalte | klickt die Nummer → Konto-Drawer, `Esc` | Rang 1 und 6: die Suche trifft Kontonummern, der Drawer lässt die Liste stehen |
| `SameName` | Suche „Gebäudeservice" | drei gleichnamige „Musterfirma Gebäudeservice GmbH" mit verschiedenen Nummern und Orten | — | das Misslingen aus dem Profil tritt nicht ein: die Zeile unterscheidet |
| `WithoutAccount` | Rolle „ohne Personenkonto", mittlerer Mandant | 12 Abrechner, nur die Verrechnungsspalte gefüllt; Kopf „12 von 572", Zusammenfassung mit Zurücksetzen | setzt zurück | der Filter ersetzt die Stat-Leiste; die Abrechner erklären sich selbst |
| `NoResults` | Suche ohne Treffer | Leerfall **nach Filter**: was gefiltert ist, und der Weg zurück | — | ≠ Bestand leer |
| `EmptyStock` | Mandant ohne Import | „Für diesen Mandanten sind keine Geschäftspartner importiert." mit Weg zum Onboarding | — | der Bestand-Leerfall |
| `Proposals` | Sonderansicht, 18 Vorschläge | Spalte „Annehmen"; Dialog mit vorbelegter Nummer | nimmt an: gültig → die Zeile geht, der Zähler sinkt, Toast „Konto 70500 angelegt — 3 Buchungen umgezogen"; drei Ziffern → Knopf gesperrt; vergebene Nummer → Fehler im Dialog | der Annahme-Rundlauf mit seinem Fehlerweg |
| `ProposalsDone` | Sonderansicht ohne Vorschläge | Haken und „Keine Vorschläge offen." | — | der dritte Leerfall ist ein **Erfolg** |
| `LoadingAndError` | lädt · Fehler | Reiter und Filter stehen, die Liste als Skelett in Zeilenform; Fehler mit „Erneut laden" | — | V9 |
| `Narrow` | `InUse` bei 1024 px | die Tabelle scrollt in ihrer Karte, die Seite nicht | — | die Mindestbreite der Spalten (1.180 px) bricht die Seite nicht |

**10 Exporte.** Ausgeschlossen: keine eigene Story für die Sortierung
(`InUse` tut es), keiner für den USt-Profil-Filter (siehe Ausbau).

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build` und `check:language` grün
- [ ] Code englisch, Storybook-Titel deutsch; kein Hex, kein px, keine lokale Label-Map, Reifegrad nur über die Registry
- [ ] Fixtures synthetisch — kein Name, keine Nummer aus Staging
- [ ] Im Browser angesehen, gemessen bei 1280 und 1440 × 900

Variabel:

- [ ] Zwei Reiter, keine Stat-Leiste (Code-Probe: kein Stat-Aufruf in der Szenario-Datei)
- [ ] Vorratszähler im Kopf, gefiltert „n von m" (`InUse`, `WithoutAccount`)
- [ ] Die Suche trifft Name, Kurzname, USt-IdNr. und Kontonummer (`SearchByNumber`, `SameName`)
- [ ] Standardsortierung Nutzung ↓; der Kopf „Geschäftspartner" sortiert um (`InUse`)
- [ ] Drei Leerfälle mit drei verschiedenen Sätzen (`EmptyStock`, `NoResults`, `ProposalsDone`)
- [ ] Annahme: Nummer vorbelegt, 4–20 Ziffern, Fehler im Dialog, Erfolg: Zeile weg, Zähler −1, Toast (`Proposals`)
- [ ] Die Kontonummer öffnet den Konto-Drawer, `Esc` schließt, die Liste bleibt (`SearchByNumber`)
- [ ] Kein Querlauf der Seite bei 1280, 1440 und 1024 (`Narrow`)

## Offene Fragen

Beim Owner (vorgelegt von `ludwig-manager`, 2026-09-10); gebaut wird nach Default.

1. **„Vorgeschlagen" als Sonderansicht?** *Default: ja.*
2. **Fällt die Stat-Leiste?** *Default: ja.*
3. **Standardsortierung Nutzung ↓?** *Default: ja, wie die App.*

## Ausbau

| Was fehlt | Was es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Filter nach USt-Profil | `?vat=` kann der Loader schon (`parseBusinessPartnerFilter`) | eine Rolle fragt danach — heute bietet die Seite ihn nicht an, und kein Job braucht ihn |

## Befunde

App: **L-292** — die Annahme eines Vorschlags (`AcceptCreditorForm`) ist
Handarbeit neben dem Set. Nichts für den Spiegel.

## Gebaut (2026-09-10)

**Dateien:** `src/showcase/partner/partner-list.tsx` (`PartnerListPage`:
Reiter, Filter, Liste, Vorschläge mit Annahme, Konto-Drawer, Toast),
`PartnerList.stories.tsx` (10 Exporte), `fixtures.ts` um `partnerStock()` und
drei Bestände erweitert (6.396 · 572 · 544). `useHash` liegt seitdem in
`src/showcase/hash.ts`, geteilt mit der Kontoseite (0157). Im Set nichts
geändert.

**Eine Abweichung von der Spec:** eine vergebene Nummer fängt der Dialog
**vor** dem Absenden ab — Satz „Die Nummer … ist schon vergeben" und
gesperrter Knopf. Gemessen: ein Fehler, den die Aktion zurückgibt, schließt den
Dialog von `ActionButton ask`, und die Eingabe ist weg. **Seit 0159**
bleibt der Dialog auch bei einem Aktionsfehler offen und behält die Eingabe; die
Vorabprüfung ist damit Bequemlichkeit, nicht mehr Notwendigkeit — eine Nummer,
die zwischen Prüfung und Absenden vergeben wird, fängt der Dialog selbst.

## Messung (CDP, 1440 × 900, sofern nicht anders genannt)

| Kriterium | Ergebnis |
|---|---|
| `pnpm typecheck`, `check:language` | grün |
| alle 10 Exporte rendern, kein Querlauf | ✓ 0 px, auch bei 1280 und in `Narrow` (1024) |
| kein Text in 16 px | ✓ bis auf den Drawer-Titel des Set-Drawers und `sr-only` |
| zwei Reiter, keine Stat-Leiste | ✓ „Geschäftspartner · Vorschläge 7" |
| Vorratszähler, gefiltert „n von m" | ✓ „6.396 · meistgenutzte zuerst"; `WithoutAccount` „12 von 572" |
| Suche trifft Kontonummer und Name | ✓ „10433" → 1 Zeile; „Gebäudeservice" → 3 Gleichnamige mit verschiedenen Nummern |
| Sortierung | ✓ Standard Nutzung ↓; `#sort=legal_name&dir=asc` → „Beispiel Bau Aller GmbH" oben, der Kopf verliert „meistgenutzte zuerst" |
| drei Leerfälle | ✓ „keine Geschäftspartner importiert" · „Keine Treffer" (nach Filter) · „Keine Vorschläge offen." (Haken) |
| Annahme | ✓ vorbelegt 890571; „123" → Knopf gesperrt; „70001" → Satz im Dialog, Knopf gesperrt; „70500" → Dialog zu, Vorschläge 18 → 17, Toast „Konto 70500 angelegt — 3 Buchungen umgezogen." |
| Konto-Drawer | ✓ Nummer 10433 öffnet „Konto 10433", die Liste bleibt |
| erste Zeile ohne Scrollen | ✓ y = 352 in `AppShell` bei 1280 und 1440 |

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761 (für 0152/0157 bca4b7d); statische Checks alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: typecheck, build, check:language | Checks oben | ok |
| Code englisch, Titel deutsch, Reifegrad über Registry | `partner-list.tsx`: Registry-Wörter im Select („Entwurf · Vorgeschlagen · Bestätigt"), `check:language` 0 | ok |
| Fixtures synthetisch | `fixtures.ts` `partnerStock()` generiert („Beispielhandel …", „Musterfirma …") | ok |
| Gemessen bei 1280 und 1440 | `m0128.txt`, 10 Exporte × 2 | ok |
| Zwei Reiter, keine Stat-Leiste | Tabs „Geschäftspartner · Vorschläge 7"; `grep Stat partner-list.tsx` leer | ok |
| Vorratszähler, gefiltert „n von m" | `in-use` Kopf „6.396 · meistgenutzte zuerst"; `without-account` „12 von 572" | ok |
| Suche trifft Name, Kurzname, USt-IdNr., Kontonummer | `search-by-number` „10433" → 1 Zeile; `same-name` „Gebäudeservice" → 3 Gleichnamige (10901 / 11377 / 12260) | ok (Kurzname/USt-IdNr. nicht per Story belegbar — nur Code) |
| Standardsortierung Nutzung ↓, Kopf sortiert um | `in-use`: `aria-sort` Buchungen=descending; Klick auf „Geschäftspartner" → `#sort=legal_name&dir=asc`, aria-sort ascending, Kopf verliert „meistgenutzte zuerst" | ok |
| Drei Leerfälle, drei Sätze | „Keine Treffer für „Suche „Zeppelin"". Filter zurücksetzen" · „Für diesen Mandanten sind keine Geschäftspartner importiert. … Zum Onboarding" · „Keine Vorschläge offen. Jeder Kreditor hat seine DATEV-Nummer." | ok (Hinweis: doppelte Anführungszeichen „Suche „Zeppelin"" im Satz) |
| Annahme: vorbelegt, 4–20 Ziffern, Fehler im Dialog, Erfolg: Zeile weg, Zähler −1, Toast | `proposals`: Dialog „Beispiel Elektro Berg GmbH annehmen", **vorbelegt 890571 — aber sofort „Die Nummer 890571 ist schon vergeben." und Knopf gesperrt**; „123" → gesperrt ✓; „70001" → Satz, gesperrt ✓; „70500" → Dialog zu, 19→18 Zeilen, Reiter 18→17, Toast „Konto 70500 angelegt — 3 Buchungen umgezogen." ✓ | **Mangel** (Vorbelegung) |
| Kontonummer öffnet Konto-Drawer, Esc schließt, Liste bleibt | „10433" → `.v2drawer.is-open` „Konto 10433"; Esc → zu; Tabellen-HTML byte-gleich | ok |
| Kein Querlauf bei 1280, 1440, 1024 | 9 von 10 Exporten ✓. **`loading-and-error`: scrollW 1328 bei 1280 (+48 px) und bei 1024 (+304 px)** — `.v2stack` 1328 px breit (Skelett-/Fehler-Fassung) | **Mangel** |
| Kein Text 16 px | nur `sr-only` und AppShell-Hinweis | ok |
| Erste Zeile ohne Scrollen (InUse) | @1440 und @1280: Reiter 108–151, Filter 167–214, erste Datenzeile 301–340 | ok |

**Urteil: in Arbeit.** Mängel: (1) `seiten-geschäftspartner-liste--loading-and-error` @1280 scrollW 1328 (erwartet 1280), @1024 1328 (erwartet 1024); (2) `--proposals`: die vorbelegte Nummer 890571 gilt als „schon vergeben" (`partner-list.tsx:182` zählt die eigenen 89xxxx-Konten des vorgeschlagenen Partners zu `taken`) — die Vorbelegung ist damit nie annehmbar.

### Nacharbeit 2026-09-11 (durch den Bauenden, Nachprüfung offen)

| Mangel | Nacharbeit | Messung (6107) |
|---|---|---|
| `loading-and-error`: Querlauf 1328 px bei 1280 und 1024 | Ursache war der Story-Rahmen: ein Grid mit `auto`-Spalte wächst auf die Mindestbreite der Tabelle. Jetzt `gridTemplateColumns: minmax(0, 1fr)` | scrollW 1280 bei 1280, 1024 bei 1024 |
| `proposals`: vorbelegte 890571 gilt als „schon vergeben" | die eigenen Konten des Partners zählen in seinem Dialog nicht als vergeben (`AcceptCell`, `isTaken`) | Dialog: Wert 890571, kein Satz, Knopf frei; „Konto anlegen" → Dialog zu, Toast „Konto 890571 angelegt — 3 Buchungen umgezogen.", Reiter „Vorschläge 17" |
