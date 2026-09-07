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
- [ ] „Abgleich nicht durchgeführt" ist eine eigene, sichtbare Aussage (Story `Levels`, linke Karte, Regel V9) — **Nachweis berichtigt am 2026-09-07**, siehe „Nach der Abnahme"
- [ ] Karte hat Rand oder Schatten, nicht beides (Story `Filled`, Regel §2)
- [ ] Stückzahlen rechtsbündig mit `tnum` (Story `Filled`, Regel V3)
- [ ] Ersetzt die Inline-Darstellung in `datev/page.tsx` ohne Funktionsverlust

## Offene Fragen

1. Gehören die Stückzahlen vollständig in die Karte? *Ohne Antwort: die drei
   größten Arten plus Summe; der Rest steht im Spiegel.*
2. Soll die Karte den Stichtag ändern lassen? *Ohne Antwort: nein — das ist
   eine Handlung der Seite, keine Darstellungsform.*

## Abnahme

**Urteil: zurück.** Zwei Mängel blockieren, beide in derselben Funktion und
beide vom bekannten Typ „gegen die Fixture gemessen, nicht gegen den
Wertebereich": die Stückzahlen tragen keine Tausenderpunkte, und der
Hauptsatz des Abgleichs kennt keinen Singular. Alles andere steht.

Gemessen wurde am laufenden Dev-Server (`localhost:6107`, Quelle, nicht
`storybook-static`) über CDP: je Schritt ein eigenes `Runtime.evaluate`,
Klicks über `el.click()` auf der Eingabeschicht. Story-URL-Muster
`http://localhost:6107/iframe.html?viewMode=story&id=v3-entit%C3%A4ten-datev-snapshot-snapshotcard--<story>`.

### Story-Deckung

Sieben Stories, genau die der Spec-Tabelle, Exportnamen englisch:
`Filled`, `WithDeviations`, `Levels`, `Empty`, `Error`, `Interactive`,
`InGrid`. Ableitung nach §6: 3 Zustände + 1 Enum (`baselineLevel`) +
1 Rundlauf (`onOpen` **und** `onImport` in einer Story) + 1 „im Einsatz"
+ 1 Rand (`WithDeviations`) = 7, unter der Obergrenze 10. Der Fließtext der
Spec rechnet 6 und ihre eigene Tabelle listet 7 — der Bau folgt der Tabelle,
das ist die Spec-Inkonsistenz, nicht die des Baus. Jede Prop hat ihre Story:
`snapshot` (`Filled`, `Empty`), `title` (Default in `Filled`, gesetzt in
`Levels`/`InGrid`), `onOpen` (`Interactive`, `InGrid`), `onImport` (`Empty`,
`Interactive`). `LeerNachFilter` und `Laedt` sind in der Spec mit Grund
ausgeschlossen (Aufrufer zeigt `Skeleton`, 0016). `Error` zeigt den Satz des
**Aufrufers** ohne die Karte — Präzedenz im Set (`Expectation.stories.tsx`),
und die Schnittstelle hat bewusst keine `error`-Prop.

### Fester Block

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → exit 0; `pnpm build` → „Storybook build completed successfully", exit 0 | erfüllt |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/datev-snapshot/{SnapshotCard.tsx, SnapshotCard.stories.tsx, datev-snapshot.ts}`; Titel `v3/Entitäten/DATEV-Snapshot/SnapshotCard`; Barrel `src/ui/v3/index.ts:442–448` unter dem Kommentar `/* DATEV-Snapshot */` | erfüllt |
| Code englisch; `@when`/`@instead` an jedem Export | Props, Bezeichner, Kommentare in `SnapshotCard.tsx` und `datev-snapshot.ts` englisch; Story-JSDocs deutsch; `@when`/`@instead` an `SnapshotCard`. Das reine Typ-/Konstanten-Modul trägt keine — Hauskonvention (`bank-transaction.ts`, `open-item.ts`, `document-number-labels.ts` ebenso) | erfüllt |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Kein Hex und kein px in `SnapshotCard.tsx`; im Browser trägt nur der Story-Rahmen `max-width: 520px` (Hauskonvention, 36 Story-Dateien). R1: die fünf Zähler-Wörter kommen aus `resolveStatus("mirror_match", …)` — gemessen „mit Ludwig gematcht / aufgeteilt (Kanzlei) / von der Kanzlei geändert / DATEV-Fremdbuchung / unklar", identisch mit `status-registry.ts:1902–1929`; das (i) öffnet die Legende derselben Achse (Klick gemessen, Dialog mit allen Ausprägungen). `baseline_level` hat **keine** Achse in der Registry — der Rohwert steht in `MonoCell`, keine Übersetzung (Befund L-72, wie im Nachtrag verlangt). `SNAPSHOT_COUNT_LABEL` ist eine lokale Map, aber vom Nachtrag ausdrücklich angeordnet („kein Status, sondern die Beschriftung einer Anzahl") | erfüllt |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | erfüllt |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Rand ohne Schatten · Zahlen rechts mit `tnum` · Farbe nur als Stufe, Rot nirgends · jeder farbige Zustand mit Wort **und** Icon (`aria-label` „erledigt" / „Warnung" / „nicht durchgeführt") · Kontrast gemessen auf Weiß: Feld-Label 6.69:1, Zähler-Wort 6.69:1, Zahl 13.77:1, „Zustände" 4.88:1, Callout-Kicker/Unterzeile 5.52:1, Callout-Rand 5.52:1 — alle über der Schwelle · Fokusring am Ausweg-Knopf sichtbar (`outline 2px solid rgb(59,143,196)`, Offset 2px) · Icons über `StateIcon`/`ActionIcon`, `pnpm check:icons` grün („53 Zeichen in der Registry") · keine Emoji, keine Versalien. **Ein offener Punkt:** letzte Zeile der Prüfliste („In §11 auf v2 gesetzt") — `docs/design-guidelines.md:543` führt „DATEV-Snapshot" weiter als „fehlt (0027, §3.2 Nr. 5)" | erfüllt bis auf §11 (Mangel 3) |
| Im Browser angesehen (Storybook), nicht nur gebaut | Screenshots `Filled` (900 px), `Levels` (1200 px), `Empty` (900 px), `InGrid` (1200 px), CDP `Page.captureScreenshot`, DPR 2 | erfüllt |

### Variabler Block

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Stichtag und Importzeitpunkt sind beide beschriftet und absolut (Story `Filled`, T7) | `…--filled`, ausgelesene Zeilen: `Stichtag = 31.08.2026`, `Importiert = 01.09.2026, 06:12` — beide beschriftet, beide absolut, kein „vor 3 Tagen"; Europe/Berlin (Quelle `2026-09-01T06:12:00+02:00`) | erfüllt |
| „Abgleich nicht durchgeführt" ist eine eigene, sichtbare Aussage (Story `Empty`, V9) | `…--levels`, linke Karte (`baselineLevel: "opos"`, `reconcile: null`): `.v2callout--warning` mit Kicker „Abgleich", Titel „Für diesen Stand wurde kein Abgleich durchgeführt.", Unterzeile „Der Abgleich läuft nur bei Journal-Läufen. …", Icon `aria-label="nicht durchgeführt"`, **0** Zähler-Zeilen. Die drei Aussagen sind damit unterscheidbar: `Filled` neutral/„Alle DATEV-Buchungen sind zugeordnet.", `WithDeviations` warning/„48 Buchungen sind ungeklärt.", `Levels` warning/„kein Abgleich". Nachweis liegt in `Levels`, nicht in `Empty` — `…--empty` enthält gemessen **0** Callouts (Mangel 4) | erfüllt (Nachweis-Story verschoben) |
| Karte hat Rand oder Schatten, nicht beides (Story `Filled`, §2) | `…--filled`, `getComputedStyle('.v2card')`: `border: 1px solid rgb(221,226,232)`, `box-shadow: none` | erfüllt |
| Stückzahlen rechtsbündig mit `tnum` (Story `Filled`, V3) | `…--filled`: Wert-Span und `.v2num` haben `font-variant-numeric: lining-nums tabular-nums`, `text-align: right`; gemessene rechte Kanten aller sechs Feldzeilen und aller fünf Zähler exakt 491 px, Abstand zur Zeilenkante 0. Bei 1440 px Seitenbreite (Karte 1360 px) alle rechten Kanten 1379 px. Ausrichtung und `tnum` **erfüllt** — die Zahlen selbst sind jedoch ungruppiert (Mangel 1) | erfüllt (Ausrichtung), verletzt (Zahlbild) |
| Ersetzt die Inline-Darstellung in `datev/page.tsx` ohne Funktionsverlust | Abgeglichen gegen `ludwig/app`, `apps/web/src/app/(app)/clients/[clientSlug]/[year]/datev/page.tsx`: KPI „Letzter Abgleich" (`importedAt` + „Stichtag" `asOf`, Z. 592–597) und der Snapshot-Teil der Abgleich-Historie (Z. 757–786: Zeitpunkt, Stichtag, Inhalte, Sätze, OPOS, Reconcile-Fazit, Baseline) sind vollständig abgedeckt; der Typ ist die 1:1-Kopie von `SnapshotRun` (`snapshot-history-queries.ts:16–34`, einziger Unterschied: `createdBy` hier optional). **Aber:** die Seite formatiert jede dieser Zahlen mit `fmtCount` („4.812"), die Karte gibt sie roh aus („4812") — auf derselben Seite stünden beide Schreibweisen nebeneinander. Das ist der Funktionsverlust (Mangel 1). Nicht übernommen und richtig so: Dauer, Auslöser, Snapshot-ID — sie gehören zum Lauf, nicht zum Stand | verletzt |

### Weitere Messungen

- **Breite auf der Seite, nicht nur im Story-Rahmen.** `Filled` mit
  entferntem `max-width` bei 1440 / 760 / 420 / 320 px: kein Überlauf
  (`scrollWidth - clientWidth = 0`), Zeilen brechen sauber, Zähler bleiben
  einzeilig bis 240 px Kartenbreite. `InGrid` ohne `max-width` bei 1440 px:
  zwei Karten à 670 px, kein Überlauf. Bei voller Seitenbreite reißt
  `FieldList` Label und Wert 498 px auseinander — Verhalten des Primitivs,
  nicht der Karte, und `InGrid` zeigt die vorgesehene Spaltenbreite.
- **Wertebereich statt Fixture.** Injiziert: 7-stellige Zahl, 60-Zeichen-Wort
  im Zähler, neun Umfangs-Badges. Layout hält (kein Kartenüberlauf bei
  1440 px, Zähler-Zeile wächst bei 420 px auf zwei Zeilen). Was **nicht**
  hält, ist das Zahlbild und der Singular — Mängel 1 und 2.
- **Rundlauf `Interactive`** (Klicks je in eigenem `Runtime.evaluate`):
  Start = Leerzustand, ein Knopf „Spiegel importieren" → nach Klick Karte
  gefüllt, Kopfknopf „Spiegel öffnen" erscheint, Log „Import angestoßen" →
  nach Klick auf „Spiegel öffnen" Log „Import angestoßen · Spiegel geöffnet"
  → Klick auf das (i) öffnet den `StatusInfoDialog` der Achse
  `mirror_match` mit allen Ausprägungen.
- **`Empty`**: `EmptyState` `inline` in der Karte, Titel „Kein DATEV-Stand
  vorhanden", Grund + Weg in der Beschreibung, primärer Knopf „Spiegel
  importieren"; ohne `onImport` nennt der Text den Weg, ohne Knopf (Code
  geprüft, `SnapshotCard.tsx:63–67`).

### Mängel

**1 · Stückzahlen ohne Tausenderpunkte — blockiert.**
Kriterium: „Stückzahlen rechtsbündig mit `tnum`" (V3) und „ersetzt die
Inline-Darstellung … ohne Funktionsverlust".
Messung: `…--filled` zeigt `Buchungen = 4812` und `mit Ludwig gematcht =
4520`; im selben Dokument liefert `new Intl.NumberFormat("de-DE")` für
denselben Wert `4.812`. Das Set hat dafür `formatCount`
(`src/ui/v3/format.ts:83`) mit neun Aufrufstellen, und sein JSDoc nennt
genau diesen Fall als Befund **L-97** aus der Abnahme von 0063. Die Seite,
die ersetzt wird, benutzt an diesen Stellen `fmtCount`.
Vorschlag: `formatCount` importieren und an drei Stellen anwenden —
`SnapshotCard.tsx:118` (`{n}`), `:178` (`{reconcile[key]}`) und `:161`
(`${open} Buchungen …`).

**2 · Der Hauptsatz kennt keinen Singular — blockiert.**
Kriterium: fester Block, Texte nach T1–T5 (§9).
Messung/Code: `SnapshotCard.tsx:159–163` bildet
`` `${open} Buchungen sind ungeklärt.` ``; `open = newUnprocessed + unclear`
ist regelmäßig 1. Der Satz lautet dann „1 Buchungen sind ungeklärt." Das
Set löst das anderswo (`InvoiceLineList.tsx:109`,
`BankTransactionWorklist.tsx:134`).
Vorschlag: `${formatCount(open)} ${open === 1 ? "Buchung ist" : "Buchungen
sind"} ungeklärt.`

**3 · Inventar nicht nachgezogen — blockiert nicht.**
Kriterium: fester Block, Prüfliste §9, letzte Zeile.
Messung: `docs/design-guidelines.md:543` — „| DATEV-Snapshot | Card (Datum,
WJ, Umfang, Ergebnis) | — | fehlt (0027, §3.2 Nr. 5) |".
Vorschlag: Zeile auf v3 setzen, sobald 1 und 2 behoben sind.

**4 · Nachweis-Story der dritten Aussage — blockiert nicht.**
Kriterium: „„Abgleich nicht durchgeführt" … (Story `Empty`)".
Messung: `…--empty` enthält 0 Callouts; die Aussage steht in `…--levels`,
linke Karte. Inhaltlich erfüllt, der Zeiger stimmt nicht.
Vorschlag: entweder in `Empty` eine zweite Karte mit `reconcile: null`
zeigen, oder — schlanker — die Spec-Zeile auf `Levels` umschreiben. Eine
Abnahme ändert keine Kriterien, deshalb steht das hier als Vorschlag.

**5 · Graues Zeichen im gelben Callout — blockiert nicht.**
Kriterium: §9, „Jeder farbige Zustand hat Wort oder Icon" (V7) — formal
erfüllt, das Wort steht.
Messung: `…--levels`, linke Karte: `.v2callout--warning` mit Rand und Text
in `rgb(140,96,30)`, das Zeichen daneben strichelt in
`var(--color-text-subtle)` (`StateIcon state="skipped"` → Ton `muted`). Die
beiden anderen Aussagen tragen tonrichtige Zeichen (grün / orange).
Vorschlag: für den nicht-durchgeführten Lauf `state="question"` oder
`"warning"`, oder `StateIcon` einen Ton-Parameter geben — Entscheidung
gehört zum Set, nicht zu dieser Karte.

Abgenommen von / am: designsystem-abnahme (fremde Abnahme, ohne Bauanteil),
2026-09-07 · Offene Punkte: Mängel 1 und 2 blockieren; 3, 4 und 5 sind
notiert.

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

## Nach der Abnahme (2026-09-07): zwei Mängel, beide blockierend, beide Einzeiler

Die Abnahme hat die Karte im Übrigen durchgewinkt — R1 hält (die Zählwörter
kommen aus `resolveStatus("mirror_match", …)`, `baseline_level` steht roh in
`MonoCell`, weil es keine Achse hat), Rand ohne Schatten, Kontraste 4,88–13,77,
und das Layout hält bis 240 px Kartenbreite. Zurück kam sie an zwei Stellen,
die beide derselbe Fehler sind: **gegen die Fixture gemessen, nicht gegen den
Wertebereich.**

- **M1 erledigt — die Stückzahlen standen ohne Tausenderpunkte da.** Gemessen
  war „4812", während dieselbe Zahl auf der abzulösenden Seite als „4.812"
  steht: auf einem Bildschirm hätten zwei Schreibweisen nebeneinander
  gestanden. Alle drei Stellen laufen jetzt über `formatCount`, dessen JSDoc
  genau diesen Fall als **L-97** trägt. Gemessen: `4.812`, `4.520`, `137`.
- **M2 erledigt — es gab keinen Singular.** Bei genau einer offenen Buchung
  stand „1 Buchungen sind ungeklärt." Der Satz beugt sich jetzt, und die
  Fixture von `InGrid` hat **genau eine** offene Buchung, damit der Fall eine
  Story hat statt nur eine Behauptung. Gemessen: „1 Buchung ist ungeklärt."
- **M3 erledigt** — `docs/design-guidelines.md` führte den DATEV-Snapshot noch
  als „fehlt (0027)". Die Zeile nennt jetzt `SnapshotCard`.

**Was ich nicht geändert habe, mit Grund:**

- **M4 — der Zeiger im Kriterium, nicht die Sache.** Das Kriterium nennt für
  „Abgleich nicht durchgeführt" die Story `Empty`; die Aussage steht sichtbar
  und richtig in `Levels` (linke Karte, `reconcile: null`). Die Substanz ist
  erfüllt, der Zeiger falsch — **ein Kriterium ändert weder der Bauende noch
  der Abnehmende.** Vorschlag an den Auftraggeber: im Kriterium `Empty` durch
  `Levels` ersetzen.
- **M5 — das graue Zeichen im gelben Callout.** `StateIcon state="skipped"`
  zeichnet in `--color-text-subtle`, während Rand und Text des Callouts in
  `rgb(140,96,30)` stehen. Der Zustand ist richtig benannt — „übersprungen"
  ist nicht „Warnung" —, und die Farbe des Zeichens ist eine Frage des
  Callout-Designs, nicht dieser Karte. Gehört als Befund ans Set, nicht in
  einen schnellen Griff hier.
- **Befund am Set:** `.v2num` richtet **außerhalb** von `.v2tbl` und
  `.v2fields` nicht aus — auf einer Inline-Box wirkt `text-align` nicht. In
  `.v2snap__reccount` kommt die rechte Kante aus `justify-content:
  space-between`, hier also ohne Folge. Die Klasse verspricht mehr, als sie
  außerhalb der zwei Container hält; dieselbe Falle hat die Abnahme von 0072
  an einer anderen Stelle gefunden. Das gehört in eine eigene Aufgabe.
- **Typ-Abweichung ohne Folge:** `createdBy` ist hier optional, im App-VM
  `SnapshotRun` Pflicht. Kein Mangel — das Set darf weniger verlangen als die
  App liefert.

## Nach der Abnahme — ein Nachweis berichtigt (2026-09-07)

**Geändert im Auftrag des Owners, designsystem-f0.** Nicht vom Bauenden und
nicht vom Abnehmenden: die Sache stimmt, nur der Zeiger war falsch.

Das Kriterium „‚Abgleich nicht durchgeführt' ist eine eigene, sichtbare
Aussage" nannte als Nachweis die Story `Empty`. Dort steht sie nicht —
`…--empty` enthält gemessen **null** Callouts. Sie steht in **`Levels`**,
linke Karte (`reconcile: null`): Kicker „Abgleich", Titel „Für diesen Stand
wurde kein Abgleich durchgeführt.", Warnton, null Zähler-Zeilen. Damit sind
die drei Aussagen unterscheidbar — `Filled` neutral, `WithDeviations` mit
Zahl, `Levels` ohne Abgleich.

## Wiederabnahme (2026-09-07): die zwei Blocker sind weg, einer steht eine Zeile tiefer

**Urteil: zurück.** M1, M2 und M3 sind nachgeprüft und erledigt, der
berichtigte Nachweis stimmt, und nichts von dem, was vorher hielt, ist
zerbrochen. Es blockiert **ein** Mangel, und er ist der Preis der Nacharbeit:
der Hauptsatz beugt sich jetzt, die Unterzeile zwei Zeilen darunter nicht — und
die Fixture, die der Bau für den Nachweis von M2 auf **genau eine** offene
Buchung gesetzt hat, stellt den Bruch jetzt dauerhaft auf den Bildschirm.

Gemessen am laufenden Dev-Server (`localhost:6107`, Quelle, nicht
`storybook-static`) über CDP, je Schritt ein eigenes `Runtime.evaluate`, Klicks
über `el.click()`. Kein Wert aus der Spec zurückgelesen; jede Zahl unten kommt
aus `getComputedStyle`/`getBoundingClientRect`/`innerText` des Browsers oder aus
einer Datei, die dabei offen lag. Vier Screenshots (`Filled`, `Levels`, `Empty`,
`InGrid`, 1200 px, DPR 2).

### Die Werkzeuge

| Lauf | Ergebnis |
|---|---|
| `pnpm typecheck` | exit 0 |
| `pnpm build` | „Storybook build completed successfully", exit 0 — **in drei von vier Läufen**, siehe „Aus einer anderen Aufgabe" |
| `pnpm check:icons` | exit 0, „53 Zeichen in der Registry, 2 Datei(en) noch offen" |
| `pnpm check:contrast` | exit 0, „11 Angaben nachgerechnet" |

### Die Nacharbeit, nachgeprüft

| Punkt | Messung | Ergebnis |
|---|---|---|
| **M1 Tausenderpunkte** | `…--filled`: `Buchungen 4.812`, `Offene Posten 137`, Zähler `4.520 / 88 / 204 / 0 / 0`. `…--in-grid` rechte Karte: `4.390 / 152`, Zähler `4.102 / 74 / 190 / 1 / 0`. `…--levels`: `4.812 / 137`. In keiner Story steht noch eine ungruppierte vierstellige Zahl. Alle drei Stellen laufen über `formatCount` (`SnapshotCard.tsx:122, 167, 183`) | erledigt |
| **M2 Singular** | `…--in-grid`, rechte Karte (`newUnprocessed: 1`): „**1 Buchung ist** ungeklärt." · `…--with-deviations` (48): „48 **Buchungen sind** ungeklärt." Der Fall hat jetzt eine Story statt einer Behauptung | erledigt — **aber nur der Hauptsatz**, siehe Mangel 1 |
| **M3 Inventar** | `docs/design-guidelines.md:544`: „\| DATEV-Snapshot \| Card … \| `SnapshotCard` \| **gebaut (0027)** …" | erledigt |
| **Berichtigter Nachweis** | Der Zeiger stimmt jetzt: `…--levels` linke Karte hat `.v2callout--warning`, Kicker „Abgleich", Titel „Für diesen Stand wurde kein Abgleich durchgeführt.", Zeichen mit `aria-label="nicht durchgeführt"` und **0** Zähler-Zeilen; `…--empty` hat gemessen **0** Callouts | trägt |

### Was vorher hielt und weiter hält

- **R1 über die Registry.** Die fünf Zählwörter kommen aus
  `resolveStatus("mirror_match", …)` und lauten im Browser „mit Ludwig
  gematcht / aufgeteilt (Kanzlei) / von der Kanzlei geändert /
  DATEV-Fremdbuchung / unklar" — zeichengleich mit `MIRROR_MATCH` in
  `src/ludwig/ui/status/status-registry.ts:1902–1929`. Das (i) öffnet den
  `StatusInfoDialog` derselben Achse; gemessen mit allen Ausprägungen und der
  Herkunft „`client_datev_mirror_entries.match_state` (NULL = nicht
  abgeglichen)". `baseline_level` steht weiter roh in `MonoCell` (`opos`,
  `journal_opos`, `journal`), keine lokale Übersetzung.
- **Rand ohne Schatten.** `…--filled`, `.v2card`: `border: 1px solid
  rgb(221, 226, 232)`, `box-shadow: none`.
- **Zahlen rechts mit `tnum`.** `font-variant-numeric: lining-nums
  tabular-nums` an allen sieben Zahl-Spans. Rechte Kanten: bei 472 px Karte
  alle sechs Feldzeilen und alle fünf Zähler exakt **491 px**, bei 520 px
  exakt **515 px** — eine Kante, keine zwei.
- **Kontraste** (gemessen, auf Weiß): Feld-Label 6.69:1 · Feldwert 13.77:1 ·
  Zähler-Wort 6.69:1 · Zähler-Zahl 13.77:1 · „Zustände" 4.88:1 ·
  Callout-Titel 11.64:1 · Callout-Kicker, -Unterzeile und -Rand im Warnton
  (`rgb(140, 96, 30)`) 5.52:1. Alle über der Schwelle. Fokusring am Kopfknopf
  `outline: rgb(59, 143, 196) solid 2px`, Offset 2px.
- **Layout bis 240 px Kartenbreite.** `Filled` ohne den `max-width` des
  Story-Rahmens bei 1440 / 320 / 240 px: `scrollWidth − clientWidth = 0` an
  Karte und Dokument, Zähler-Zeilen einzeilig (19 px) bis hinunter auf 240 px.
  Erst bei 200 px Karte 7 px Überlauf — unterhalb der zugesagten Grenze, also
  kein Rückschritt.
- **Wertebereich statt Fixture.** Zähler auf `1.234.567`, Feldwerte auf
  `9.876.543` gesetzt: bei 240 px kein Überlauf, die Zähler brechen sauber auf
  zwei Zeilen; bei 520 px stehen alle rechten Kanten weiter bei 515 px. Die
  Gruppierung kostet das Layout nichts.
- **Rundlauf `Interactive`** (Klicks je in eigenem `Runtime.evaluate`):
  Leerzustand mit einem Knopf → Klick „Spiegel importieren" → Karte gefüllt,
  Kopfknopf „Spiegel öffnen" da, Log „Import angestoßen" → Klick → Log „Import
  angestoßen · Spiegel geöffnet" → Klick auf das (i) öffnet den Dialog der
  Achse.
- **Kein Hex, kein px** in `SnapshotCard.tsx` und `datev-snapshot.ts` (grep
  leer). Sieben Stories wie vorher, Exportnamen englisch, Barrel unverändert
  (`src/ui/v3/index.ts:443–448`).

### Die zwei Begründungen — tragen sie?

- **`.v2num` richtet außerhalb von `.v2tbl`/`.v2fields` nicht aus — trägt.**
  Nachgerechnet: `.v2num` setzt nur `text-align: right` und
  `font-variant-numeric` (`v3.css:221`); auf einer Inline-Box ohne eigene
  Breite bewirkt `text-align` nichts. Die Kante kommt in der Feldzeile aus
  `.v2fields__row > span:last-child { text-align: right }` (`v3.css:750`) und
  in `.v2snap__reccount` aus `justify-content: space-between` (`v3.css:3420`)
  — der Span ist dort als Flex-Kind zwar blockifiziert (gemessen `display:
  block`), schrumpft aber auf seinen Inhalt, `text-align` bleibt folgenlos. In
  dieser Karte hält die Klasse also, was sie verspricht, nur nicht durch sich
  selbst. Eigene Aufgabe, richtig so.
- **Das graue Zeichen im gelben Callout — trägt, aber nicht mit dem genannten
  Grund.** Gemessen: Rand, Kicker und Unterzeile stehen in `rgb(140, 96, 30)`,
  das Zeichen erbt zwar diese `color`, zeichnet aber mit `stroke: rgb(113,
  113, 113)` — dem Ton `muted` aus `StateIcon` (`Review.tsx:51`). Auf Weiß
  sind das 4.88:1, über der 3:1-Schwelle für Grafik; ein Kontraktmangel ist es
  nicht. Das **Wort** heißt aber gar nicht „übersprungen": die Karte
  überschreibt es bereits mit `title="nicht durchgeführt"` (gemessen als
  `aria-label`). Die Namens-Begründung trägt deshalb allein nicht. Was trägt,
  ist die Kopplung darunter: `state` wählt in `StateIcon` Glyphe **und** Ton
  zusammen — `"warning"` gäbe den richtigen Ton, aber das Warndreieck, und das
  sagt „Warnung", wo „nicht gelaufen" gemeint ist. Ohne einen Ton-Parameter am
  `StateIcon` gibt es hier keinen richtigen Griff. Also: Befund ans Set,
  blockiert nicht — die Begründung sollte nur den Ton nennen, nicht das Wort.

### Mängel

**1 · Die Unterzeile beugt sich nicht mit — blockiert.**
Kriterium: fester Block, „Texte nach T1–T5" (§9) — derselbe, an dem M2 hing.
Messung: `…--in-grid`, rechte Karte, gelesen aus dem Browser und im Screenshot
sichtbar:

> **1 Buchung ist ungeklärt.**
> Sie stehen im Spiegel, jede mit ihrem Zustand — Fremdbuchung oder unklar.

Zwei aufeinanderfolgende Zeilen, zwei Numeri. Der Bau hat den Hauptsatz
gebeugt (`SnapshotCard.tsx:167`) und die Unterzeile vier Zeilen tiefer
(`:170–174`) unangetastet gelassen. Vor der Nacharbeit stand der Bruch nicht
auf dem Bildschirm (`InGrid` hatte `newUnprocessed: 18, unclear: 6`); die
Fixture-Änderung, die M2 belegen soll, hat ihn erst sichtbar gemacht. Das ist
derselbe Fehlertyp wie M2 und in derselben Aussage — deshalb dieselbe Stufe.
Vorschlag:

```
sub={
  open === 0
    ? undefined
    : open === 1
      ? "Sie steht im Spiegel, mit ihrem Zustand — Fremdbuchung oder unklar."
      : "Sie stehen im Spiegel, jede mit ihrem Zustand — Fremdbuchung oder unklar."
}
```

**2 · Der dritte `formatCount`-Aufruf hat keine Story — blockiert nicht.**
Kriterium: „Stückzahlen rechtsbündig mit `tnum`" (V3), Nachweis-Teil.
Messung: die Gruppierung ist an den `counts` und den fünf Zählern belegt
(4.812, 4.520, 4.102). Im Hauptsatz des Callouts steht in **keiner** Story
eine Zahl über 999 — `WithDeviations` zeigt 48, `InGrid` zeigt 1.
`formatCount(open)` (`SnapshotCard.tsx:167`) ist damit gebaut, aber nicht
gezeigt; genau das war der Vorwurf an M1.
Vorschlag: `WithDeviations` auf einen vierstelligen Wert heben (etwa
`newUnprocessed: 1197, unclear: 7` → „1.204 Buchungen sind ungeklärt.") —
`InGrid` bleibt dann der Singular-Nachweis.

**3 · `ui-repraesentationen.md` führt die Karte weiter als inline — blockiert
nicht.**
Kriterium: keins — §9 verlangt nur den Eintrag in §11 der
`design-guidelines.md`, und der ist nachgezogen. Der Vollständigkeit halber:
`docs/ui-repraesentationen.md:505` sagt weiter „inline in `datev/page.tsx` und
`reporting/page.tsx`", und `reporting` ist laut Freigabe gelöscht — die Zeile
ist doppelt veraltet. Gehört in die Aufgabe, die dieses Register pflegt, nicht
hierher.

### Aus einer anderen Aufgabe: `pnpm build` flackert

Von vier Läufen brach einer mit Exit-Code 1 ab, ohne dass die letzte
Log-Zeile den Grund nennt:

```
Error: ENOENT: no such file or directory, chmod
'./storybook-static/reference/design-system-v2/PROGRESS.md'
  at async copyDir (node:internal/fs/cp/cp:320:19)
```

Der Fehler fällt beim Kopieren der `staticDirs` (`.storybook/main.ts:21`,
`{ from: "../reference", to: "/reference" }`); die Quelldatei existiert, das
Ziel wird währenddessen aufgeräumt. Drei weitere Läufe — einer davon nach
`rm -rf storybook-static`, zwei mit vorhandenem Verzeichnis — liefen grün
durch. Betrifft jeden Bau in diesem Repo und keine Zeile dieser Karte; hier
nur notiert, damit die nächste Abnahme den Exit-Code nicht der Komponente
anlastet.

Abgenommen von / am: designsystem-abnahme (fremde Abnahme, ohne Bauanteil),
2026-09-07 · Offene Punkte: Mangel 1 blockiert; 2 und 3 sind notiert. M1, M2,
M3 und der berichtigte Nachweis sind erledigt.

## Nach der Wiederabnahme (2026-09-07): der halb gebeugte Satz

**Der Blocker erledigt — und er war die Folge meiner eigenen Nacharbeit.** Ich
hatte den Hauptsatz beugen lassen („1 Buchung **ist** ungeklärt.") und die
Unterzeile vier Zeilen tiefer stehen gelassen: „**Sie stehen** im Spiegel,
jede mit ihrem Zustand." Vor der Nacharbeit stand der Bruch nicht auf dem
Bildschirm — erst die Fixture, die den Singular belegen sollte, hat ihn
sichtbar gemacht. Gleicher Fehlertyp, gleiche Aussage, eine Zeile tiefer.

Gemessen: `InGrid` zeigt „1 Buchung ist ungeklärt." mit „Sie **steht** im
Spiegel, mit ihrem Zustand", `WithDeviations` den Plural.

**Punkt 2 erledigt** — `formatCount` im Hauptsatz hatte keine Story mit einer
Zahl über 999. `WithDeviations` hat jetzt **1.204** offene Buchungen;
gemessen steht dort „1.204 Buchungen sind ungeklärt."

**Punkt 3 erledigt** — `ui-repraesentationen.md` führte die Karte weiter als
„inline in `datev/page.tsx` und `reporting/page.tsx`"; die Seite `reporting`
ist gelöscht.

**Zur Begründung des grauen Zeichens: die Abnahme hat recht, ich hatte den
falschen Grund genannt.** Ich schrieb, der Zustand heiße „übersprungen" und
nicht „Warnung" — tatsächlich überschreibt die Karte das Wort längst mit
`title="nicht durchgeführt"`. Was wirklich trägt, ist die **Kopplung** in
`StateIcon`: `state` wählt Glyphe **und** Ton zusammen, `"warning"` gäbe das
Warndreieck. Ohne einen Ton-Parameter am `StateIcon` gibt es hier keinen
richtigen Griff. Der Kontrast stimmt (4,88:1). Der Befund geht ans Set, mit
dem richtigen Grund.

**Getrennt gemeldet, betrifft jeden Bau im Repo:** `pnpm build` flackert —
einer von vier Läufen brach mit `ENOENT … chmod
'./storybook-static/reference/design-system-v2/PROGRESS.md'` ab, beim
Kopieren der `staticDirs`. Die letzte Log-Zeile nennt den Grund nicht (noch
ein Fall für „Exit-Code lesen, nicht `| tail`"). Das ist keine Zeile dieser
Karte und gehört in eine eigene Aufgabe.

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-04 und L-72 sind erledigt** (App-Commit `222c8d5a`): `datev-mirror` hat ein
`domain/`, und die drei Stufen von `baseline_level` haben Wörter.

Zwei Folgen für diese Karte:

- `baselineLevel` trägt den Typ `BaselineLevel` statt `string` — ein Wert, den
  der DB-CHECK nicht kennt, fällt jetzt am Typ auf.
- **Die Zeile „Tiefe" zeigt das Wort, nicht mehr den Rohwert in Mono.** Genau
  dafür stand der Rohwert dort: „a map here would be that map". Die Map ist
  jetzt in der Domäne, also darf die Karte sie lesen. Ohne Stufe steht
  „nicht vermerkt" — Altbestand vor der Einführung, und das ist eine Aussage,
  kein fehlender Wert.

Vier Felder bleiben lokal: `contents`, `counts`, `reconcile` und `createdBy`
stehen weiter in `snapshot-history-queries.ts` und sind nicht mitgezogen —
**L-206** im Register. Die Karte zeigt alle vier, also erweitert sie den
gespiegelten Typ, statt ihn zu ersetzen.

**Der Typtausch kam nach der letzten Abnahme.** Er ist typgeprüft
(`typecheck`, `build`, `check:icons`, `check:contrast` grün über den
Exit-Code) und ändert kein Kriterium — aber gebaut hat ihn, wer auch hier
schreibt. Eine kurze Bestätigung steht aus.
