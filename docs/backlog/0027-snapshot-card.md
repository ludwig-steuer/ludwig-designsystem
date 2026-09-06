# 0027 · SnapshotCard — der DATEV-Spiegelstand als Karte

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/datev-snapshot/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, ein DATEV-Snapshot ist Buchhaltung |
| Quelle | Soll-Katalog §11.7 Stufe 3 „DATEV-Snapshot — fehlt (§3.2 Nr. 5)" |
| Ersetzt | den KPI-Block „letzter Abzug" und den Kopf der Abgleich-Historie in `datev/page.tsx` (`reporting` ist gelöscht) |
| Blockiert | die DATEV-Seite, den Onboarding-Abgleich |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Bevor jemand einen Stapel abnimmt, muss klar sein, **gegen welchen Stand**
geprüft wird: Stichtag, Wirtschaftsjahr, was im Import enthalten war und ob
der Abgleich sauber war. Heute steht das auf zwei Seiten inline, in zwei
Formen, und im Abnahme-Schritt 1 gar nicht.

## Einordnung

- **Wiederverwenden:** `KpiTile` zeigt eine Zahl, nicht einen Stand mit
  Herkunft. `FieldList` zeigt Schlüssel und Wert, aber ohne Kopf und ohne die
  Aussage „das ist die Vergleichswahrheit".
- **Neue Entitäts-Form, weil:** Regel 5 — `ui-repraesentationen.md` §3.1
  führt „DATEV-Snapshot" ohne Darstellung, §3.2 an Platz 5, und die Karte
  wird an zwei Orten gebraucht (Abnahme-Schritt 1, DATEV-Seite).
- **Zuschnitt:** eine Datei, ein Export. Der Abgleichs-Befund gehört hinein,
  nicht daneben — er ist die Aussage über denselben Stand.
- **Setzt auf:** `Card`/`CardHead`, `FieldList`, `Time`, `StatusCallout`
  für das Abgleichs-Ergebnis, `Badge` für den Umfang.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `snapshot` | `DatevSnapshot` | ja | Der Stand (Felder unten) | `Filled` |
| `title` | `string` | nein | Überschrift der Karte, Default „DATEV-Stand" | `Filled` |
| `onOpen` | `() => void` | nein | Sprung in den Spiegel; ohne die Prop nur Anzeige | `Interactive` |

Felder aus `ludwig.client_datev_snapshots`: `asOf`, `fiscalYear`, `contents`
(Umfang als Liste), `counts` (Stückzahlen je Art), `reconciliationReport`,
`baselineLevel` (`"opos" \| "journal_opos" \| "journal"`), `importedAt`.

**Befund für `ludwig/app`:** in `src/ludwig/` fehlt der Typ. Ein
`DatevSnapshot`-Interface samt `BaselineLevel`-Union gehört dorthin; die
Wortwahl für die drei Stufen steht im GLOSSARY, nicht in der Komponente.

Was die Karte **nicht** kann: importieren, vergleichen (sie zeigt das
Ergebnis, das der Abgleich geliefert hat) und den Umfang interpretieren.

## Verhalten

Server-Component ohne `onOpen`. Rand **oder** Schatten, nicht beides (§2).
Stichtag und Importzeitpunkt stehen absolut (T7) und nebeneinander — sie
werden regelmäßig verwechselt, deshalb beide beschriftet. Stückzahlen rechts
mit `tnum`. Das Abgleichs-Ergebnis erscheint als `StatusCallout` in der Karte:
sauber, mit Abweichungen oder gar nicht durchgeführt — drei Aussagen, nie
„keine Nachricht ist eine gute Nachricht". Fehlt ein Snapshot ganz, zeigt die
Karte das als Leerzustand mit Ausweg („Spiegel importieren"), nicht als leere
Fläche (V9, T6).

## Stories

Titel `v3/Entitäten/DATEV-Snapshot/SnapshotCard`. Abgeleitet nach §6:
3 Zustände (gefüllt, leer, Fehler) + 1 Enum (`baselineLevel`) + 1 Callback
+ 1 „im Einsatz" = 6.

| Story | Beweist |
|---|---|
| `Filled` | Stichtag, WJ, Umfang, Stückzahlen, sauberer Abgleich |
| `WithDeviations` | Abgleich mit Abweichungen — als Callout, mit Zahl |
| `Levels` | `opos`, `journal_opos`, `journal` nebeneinander |
| `Empty` | kein Snapshot vorhanden, mit Ausweg |
| `Error` | Laden fehlgeschlagen |
| `Interactive` | `onOpen` und `onImport` — der Rundlauf, den die Seite verdrahtet |
| `InGrid` | zwei Karten nebeneinander auf der DATEV-Seite |

Nicht anwendbar: `LeerNachFilter`, `Laedt` (der Aufrufer zeigt `Skeleton`, 0016).

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

- [ ] Stichtag und Importzeitpunkt sind beide beschriftet und absolut (Story `Filled`, Regel T7)
- [ ] „Abgleich nicht durchgeführt" ist eine eigene, sichtbare Aussage (Story `Empty`, Regel V9)
- [ ] Karte hat Rand oder Schatten, nicht beides (Story `Filled`, Regel §2)
- [ ] Stückzahlen rechtsbündig mit `tnum` (Story `Filled`, Regel V3)
- [ ] Ersetzt die Inline-Darstellung in `datev/page.tsx` ohne Funktionsverlust

## Offene Fragen

1. Gehören die Stückzahlen vollständig in die Karte? *Ohne Antwort: die drei
   größten Arten plus Summe; der Rest steht im Spiegel.*
2. Soll die Karte den Stichtag ändern lassen? *Ohne Antwort: nein — das ist
   eine Handlung der Seite, keine Darstellungsform.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Kern stimmt (`Card`, `FieldList`, `StatusCallout`, drei Werte von `baseline_level`). `reporting` ist gelöscht; der Bildschirm ist die `datev`-Seite (W2). Das App-VM `SnapshotRun` trägt fünf Abgleich-Zähler `reconcile.{matchedLudwig, matchedSplit, matchedCorrected, newUnprocessed, unclear}` und `counts` mit zwei Schlüsseln.

Entscheide: 1 **alle `counts` beschriftet zeigen** (Buchungen, Offene Posten), keine Top-3-Logik · 2 Stichtag nicht änderbar.

Vor dem Bau in die Spec: (a) `reconcile` als fünf Zähler über die Achse `mirror_match` in die Schnittstelle; (b) Story `Interactive` ergänzen oder `onOpen` streichen; (c) `reporting` raus, `Ersetzt` auf den KPI-Block „letzter Abzug" und die Abgleich-Historie der `datev`-Seite; (d) `Levels` zeigt den rohen Wert von `baseline_level` in `MonoCell`, bis das GLOSSARY Wörter hat (keine lokale Map); (e) `Timestamp` → `Time`; (f) Hinweis an 0040: `DatevHistoryCard` ist eine Liste je Fall, kein Snapshot-Kopf.

Befunde ins Register: **L-72** — GLOSSARY-Wörter für die drei `baseline_level`-Stufen und ihr Label in der Domäne (B); L-04 präzisieren: `datev-mirror` und `datev-truth` haben kein `domain/`, der Spiegel nimmt aus beiden Modulen nichts.

## Nachtrag 2026-09-06, vor dem Bau

**Der Abgleich sind fünf Zähler, nicht ein Ja/Nein.** `reconcile` trägt
`matchedLudwig`, `matchedSplit`, `matchedCorrected`, `newUnprocessed` und
`unclear`; sie bilden eins zu eins auf die Achse `mirror_match` ab — dieselben
Wörter, die der Spiegel je Zeile benutzt, hier als Summe. Der Callout nennt
die Zahl der **ungeklärten** (Fremdbuchung plus unklar), die fünf Zähler
darunter sagen, welcher Zustand wie oft vorkommt.

**Drei Aussagen, nie zwei.** `reconcile === null` heißt „kein Abgleich
durchgeführt" — das gibt es nur bei `opos`-Läufen, und es steht als eigener,
sichtbarer Satz. Ein Lauf, der nicht stattgefunden hat, sieht sonst genauso
aus wie ein sauberer.

**Tiefe roh und mono.** Die drei Werte von `baseline_level` haben im GLOSSARY
keine Wörter (Befund **L-72**); bis es sie gibt, steht der Rohwert in
`MonoCell`. Eine Übersetzung hier wäre die lokale Map, die R1 verbietet.

**Alle `counts` beschriftet**, keine Top-3-Logik: der Datensatz hat zwei
Schlüssel (`mirror_entries`, `open_items`), und beide bekommen ihr Wort aus
`SNAPSHOT_COUNT_LABEL` — kein Status, sondern die Beschriftung einer Anzahl.

**`reporting` ist gelöscht**; der Bildschirm ist die `datev`-Seite. Ersetzt
werden dort der KPI-Block „letzter Abzug" und der Kopf der Abgleich-Historie.

**`Timestamp` gibt es im Set nicht** — die beiden Daten kommen über `Time`,
beide beschriftet und absolut (T7); sie werden regelmäßig verwechselt.

**Hinweis an 0040:** `DatevHistoryCard` ist eine Liste je Fall, kein
Snapshot-Kopf — die beiden Formen überschneiden sich nicht.

**Der Typ liegt lokal** in `datev-snapshot.ts`, weil weder `datev-truth` noch
`datev-mirror` ein `domain/` hat (**L-04**, präzisiert). Die Namen sind die
der App, damit der Umzug ein Import-Tausch bleibt.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — Icons an der Registry vorbei.** `pnpm check:icons` schlug fehl. Die
drei Zeichen kommen jetzt aus `StateIcon` — dort wohnen Zustände —, und die
zwei älteren Verstöße derselben Sitzung (`CaseDrawer`, `BankTransactionDrawer`)
sind gleich mit erledigt: `ActionIcon action="open"` für den Ausgang,
`ActionIcon action="alert"` für „nicht gefunden". `check:icons` ist grün.

**M2 — `onImport` und der `null`-Fall fehlten in der Schnittstelle.**

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `snapshot` | `DatevSnapshot \| null` | ja | Der Stand. `null` = **kein Stand vorhanden**, ein eigener Zustand, keine leere Fläche | `Filled`, `Empty` |
| `onImport` | `() => void` | nein | Der Ausweg des Leerzustands. Ohne ihn nennt der Leertext den Weg, aber kein Knopf führt ihn | `Empty`, `Interactive` |
