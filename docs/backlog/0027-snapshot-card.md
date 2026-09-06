# 0027 · SnapshotCard — der DATEV-Spiegelstand als Karte

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/datev-snapshot/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, ein DATEV-Snapshot ist Buchhaltung |
| Quelle | Soll-Katalog §11.7 Stufe 3 „DATEV-Snapshot — fehlt (§3.2 Nr. 5)" |
| Ersetzt | die Inline-Darstellung in `datev/page.tsx` und `reporting/page.tsx` |
| Blockiert | Abnahme-Schritt 1, die DATEV-Seite, den Onboarding-Abgleich |
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
- **Setzt auf:** `Card`/`CardHead`, `FieldList`, `Timestamp`, `StatusCallout`
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
