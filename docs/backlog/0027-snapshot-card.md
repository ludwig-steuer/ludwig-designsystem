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
