# 0269 · Ergebnissatz eines Abgleichs (`StatusCallout.figures`)

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` (`StatusCallout`). Erweiterung um eine Prop und eine Regel für schmale Breiten; keine neue Komponente |
| Klassen-Test | ja: Das Ergebnis eines Imports oder einer Prüfung als Satz mit ein paar Kennzahlen gibt es in jeder Fach-App |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Simon): `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Ergebnis-Zusammenfassung — ein Satz groß, darunter Zahlen (Belege übertragen, Konten, Probleme) — alles gut, mit Problemen, abgebrochen“; `docs/spec-oberflaeche-und-fehler.md` C3 („Die Ergebnisansicht beginnt mit einem Satz …“) und C2 (Durchgang: „Zeile je Mandant mit Ergebnis“) |
| Ersetzt | nichts im Set und in `ludwig/app`. Im Plugin ersetzt es den Kopf der heutigen Ergebnisansicht (Plugin-Code, hier nicht geprüft) |
| Blockiert | Plugin-Paket „Designsystem einbauen“ (Ergebnisansicht C3) |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Der Abgleich für die Bäckerei Hoffmann GmbH ist durch. Die Mitarbeiterin
schaut einmal hin und will wissen, ob sie etwas tun muss. Oben steht ein
Satz: „12 Belege übertragen, Kontoumsätze von 2 Konten“, oder „3 Belege
nicht übertragen“, oder „Abgleich beim Belegabruf abgebrochen“. Davor steht
das Wort des Zustands im Ton (Fertig, Fertig mit Problemen, Abgebrochen),
darunter die paar Zahlen, aus denen der Satz besteht, und, wo es einen gibt,
der nächste Schritt als Knopf. Darunter folgen nur die Probleme (0264) und
aufklappbar die vollständige Tabelle. Im Set gibt es den Kopf schon, ihm
fehlen nur die Zahlen.

## Einordnung

- **Wiederverwenden:** `StatusCallout` (`@when` „The header of an item
  whose state defines the page (batch, period)“). Die Ergebnisansicht ist
  eine solche Seite: Ihr Zustand ist der Ausgang des Abgleichs. Was das
  Plugin braucht, trägt `StatusCallout` schon:
  - `tone` als Kritikalität
  - `kicker` als Wort des Zustands im Ton (V7)
  - `title` als der Satz, 16 px halbfett, das ist „ein Satz groß“
  - `sub` für Ursache und nächsten Schritt nach T5
  - `actions` für den Knopf
  - `icon` für das Zeichen der Stufe

  Es fehlen nur die Zahlen unter dem Satz.
- **Geprüft und verworfen:**
  - `KpiGrid`/`KpiTile` unter dem Kopf: Das wären zwei Kästen für eine
    Antwort. Die Owner-Regel vom 2026-09-21 lautet „eine Box, nicht eine
    Kopfkarte und darunter eine zweite“. Außerdem würden die Kacheln
    (20 px, `--color-primary`, gerahmt) den Satz übertönen.
  - `Callout` ist ein Satz Kontext ohne Zustand. `Banner` ist eine bleibende
    seitenweite Meldung. `EntityHeader` ist der Kopf eines Datensatzes.
  - `checkSummary` zählt Prüfpunkte, nicht übertragene Dinge.
- **Erweitert, weil:** §3 Regel 2.
  - Eine Prop, `figures`.
  - Die Designentscheidung kommt wieder: Ergebnis eines Abgleichs und
    Ergebnis eines Durchgangs, zwei geplante Verwendungen; später der Kopf
    eines Stapelurteils in der App.
  - Sie lässt sich in der `@when`-Zeile in einem Halbsatz sagen:
    „… optionally with its key figures under the sentence“.
- **Abweichung vom Auftrag (Name):** Es gibt **keine** Komponente
  `ResultSummary`. Nach §3 Regel 1 und 2 trägt `StatusCallout` den Fall. Eine
  eigene Hülle wäre nur Markup an der Aufrufstelle, und „Ergebnis“ ist ein
  Wort des Plugins, keins des Sets.
- **Zuschnitt:** eine Datei, `StatusCallout.tsx`, dazu die Regeln in
  `v3.css`.
- **Setzt auf:** nichts Neues. Zahlen formatiert der Aufrufer mit
  `formatCount`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `figures` | `readonly { label: string; value: ReactNode }[]` | nein | **Neu.** Die Zahlen unter dem Satz, in einer Reihe innerhalb des Rahmens, nach `title` und `sub`. Je Zahl steht das Wort klein darüber (`--fs-ui-sm`, `--color-text-muted`), der Wert darunter (`--fs-ui-md`, halbfett, `tnum`, `--color-text`), als `<dl>`. Werte kommen fertig formatiert (`formatCount`). Eine Null bleibt stehen. Leeres Array = keine Reihe | `RunResult`, `FiguresEdge`, `InUse` |

Alle übrigen Props bleiben, wie sie sind. So belegt das Plugin sie, als
Vorgabe für die Seite und nicht als Code im Set:

| Prop | Fertig | Fertig mit Problemen | Abgebrochen |
|---|---|---|---|
| `tone` | `success` | `warning` | `warning` (Vorschlag, offene Frage 1) |
| `kicker` | „Fertig“ | „Fertig mit Problemen“ | „Abgebrochen“ |
| `icon` | `StateIcon state="done"` | `StateIcon state="warning"` | `StateIcon state="warning"` |
| `title` | „12 Belege übertragen, Kontoumsätze von 2 Konten“; nichts zu tun: „Keine neuen Belege seit dem 26.11.2026, Kontoumsätze aktuell“ | „3 Belege nicht übertragen“ | „Abgleich beim Belegabruf abgebrochen“ |
| `sub` | — | „Die übrigen 9 Belege sind in Ludwig. Was zu tun ist, steht unten bei jedem Problem.“ | Ursache und nächster Schritt: „Die Anmeldung in DATEV ist abgelaufen. Melden Sie sich in DATEV an und gleichen Sie erneut ab. Bereits übertragene Belege werden nicht doppelt übertragen.“ |
| `figures` | Belege übertragen 12 · Konten 2 · Ablageorte 4 | Belege übertragen 9 · nicht übertragen 3 · Konten 2 | Belege übertragen 12 · Konten 0 |
| `actions` | — | — | `Button` „Erneut abgleichen“ |
| `details` | nicht auf der Ergebnisseite: Dort kommen nach dem Satz zuerst die Probleme, dann die Tabelle (C3). Die Prop bleibt für andere Seiten | | |

**Wörter und Ton des Zustands:**
- Sie gehören in die Registry-Achse `duo_sync` der App. Vorschlag: queued
  Wartet · running Läuft · succeeded Fertig · succeeded_with_issues Fertig
  mit Problemen · cancelled Abgebrochen · skipped Übersprungen.
- Die Achse ist bei Simon offen. Bis dahin gibt das Plugin `kicker` und
  `tone` selbst mit, als **benannter Übergang** wie `Badge` in 0265.
- Sobald die Achse da ist, kommen Wort und Ton aus `resolveStatus("duo_sync",
  …)`, und die Story nimmt sie von dort.

Typen aus `src/ludwig/`: keine neuen. GLOSSARY: Die Wörter des Plugins
(Abgleich, Belegabruf, Kontoabruf) stehen in `ludwig-plugin/docs/begriffe.md`
und nur in Story-Texten.

Was die Komponente **nicht** kann (bewusst):
- **Sie färbt keine Zahl.** Farbe kodiert Kritikalität, nie einen Wert. Auch
  „nicht übertragen 3“ steht in `--color-text`, den Ton trägt der Rahmen.
- **Sie rechnet keinen Satz aus Zahlen.** Den Satz schreibt der Aufrufer, das
  Set kennt keine Grammatik.
- **Keine Live-Region.** Das Ergebnis sagt die Region der Seite an (C5:
  `aria-live`). Eine Region, die mit ihrem Inhalt erscheint, liest kaum ein
  Screenreader vor (0225, H3).
- **Keine Kachel-Links an Zahlen.** Wer von einer Zahl zur Liste will,
  braucht `KpiTile` mit `href`. Siehe Ausbau.

## Verhalten

- **Anordnung im Rahmen:** Zeichen · Textblock (`kicker`, `title`, `sub`,
  `figures`) · Aktionen rechts. `figures` steht im Textblock, unter `sub`,
  mit `--space-3` Abstand.
  - Die Zahlen stehen in einer Reihe mit `--space-6` Abstand,
    linksbündig, und brechen um, wenn der Platz endet.
  - Wort und Wert sind linksbündig zueinander.
- **Ton:** Rahmen, `kicker` und `sub` färben sich wie heute. `figures`
  bleibt in jedem Ton neutral.
- **Schmal (L1), neu für den ganzen `StatusCallout`:** Unter 640 px brechen
  die Aktionen unter den Textblock und stehen linksbündig, wie der Kartenkopf
  in 0259. Die Zahlen brechen um, zwei je Reihe bei 320 px. Die Regel steht
  in `@media (max-width: 639.98px)`; am Desktop ändert sie nichts.
- **Kein Ziel:** Die Zahlen sind keine Knöpfe, also kein Hover und kein
  Fokus.
- **Zustände:**
  - gefüllt: alle drei Ausgänge.
  - „leer, weil erledigt“ (T6): nichts zu tun, mit Datum und Nullen
    („Belege übertragen 0“).
  - Fehler: der Ausgang „Abgebrochen“ mit Ursache und Knopf.
  - Lädt: entfällt. Das Ergebnis erscheint erst, wenn der Abgleich fertig
    ist; bis dahin zeigt die Seite `PhaseProgress` (0265).
  - Leer nach Filter: entfällt, es gibt keinen Filter.
- **Server-Component** wie bisher.

## Stories

Ergänzt in `StatusCallout.stories.tsx` (`v3/Primitives/Fläche/StatusCallout`).
Dort stehen sieben Stories, mit diesen drei sind es zehn, also die
Obergrenze. Weitere Fälle gehören in eine dieser drei.

| Story | Beweist |
|---|---|
| `RunResult` | die Ausgänge eines Abgleichs untereinander, belegt wie in der Tabelle der Schnittstelle: Fertig, nichts zu tun (Nullen, Datum), Fertig mit Problemen, Abgebrochen mit „Erneut abgleichen“ |
| `FiguresEdge` | Rand: große Werte („12.480“), sechs Zahlen mit langen Wörtern („Belege an DATEV übergeben“), eine Null. Einmal bei voller Breite, einmal in einem Rahmen von 320 px: Aktionen unter dem Text, Zahlen umgebrochen, kein waagrechtes Scrollen |
| `InUse` | Ergebnis eines Durchgangs: Kopf „12 Mandanten abgeglichen, 2 mit Problemen, 1 übersprungen“ (`warning`) mit Zahlen Fertig 9 · Fertig mit Problemen 2 · Übersprungen 1 · Belege übertragen 148. Darunter je Mandant eine Zeile mit Zustand als `Badge` (Übergang bis `duo_sync`) und, aufklappbar, die vollständige Tabelle über `Disclosure` („Vollständiges Ergebnis · 148 Zeilen“) |

Bestehende Stories (`Open`, `WaitingForClient`, `Failed`, `Done`,
`WithoutAction`, `NextAction`, `WithDetails`) bleiben unverändert.

Nicht anwendbare Zustände: siehe Verhalten (lädt, leer nach Filter).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Eine Zahl führt zu ihrer Liste („nicht übertragen 3“ → die drei Zeilen) | `href?: string` je Eintrag in `figures`, gebaut wie `KpiTile`: ein Ziel je Zahl, eigener Text (I11/I12) | Die Ergebnisseite hat eine gefilterte Tabelle, auf die eine Zahl zeigen kann |
| Wort und Ton aus der Registry | keine Prop; das Plugin ruft `resolveStatus("duo_sync", …)` | Simon gibt die Achse `duo_sync` frei und die App spiegelt sie (Befund unten) |

## Offene Fragen

1. **Ton von „Abgebrochen“: Warnung oder Fehler?** **Ohne Antwort:**
   Warnung.
   - Im Set ist „abgebrochen“ überall Warnung: `RUN_OUTCOME.abandoned`,
     `AGENT_RUN_BANNER.stopped`. Ein Wort, ein Ton.
   - Der Fehler selbst steht rot an seinem Ort: am gescheiterten Abschnitt in
     `PhaseProgress` (0265) und in der Problemkarte (0264).
   - Entscheidet Simon die Achse `duo_sync` mit `danger`, folgt dieser Kopf
     der Achse.
2. **Wie groß sind die Werte, `--fs-ui-md` oder `--fs-ui-lg`?**
   **Ohne Antwort:** `--fs-ui-md` (14 px). Der Satz darüber ist 16 px und
   bleibt das Größte im Rahmen.
3. **Braucht das Plugin trotzdem einen Namen `ResultSummary`?**
   **Ohne Antwort:** nein. Wer einen Namen will, legt die Zusammensetzung in
   seinem eigenen Code an. Das Set führt keinen zweiten Kopf.

## Befund an die App

- Achse `duo_sync` in `src/ludwig/ui/status/status-registry.ts` (Abgleich der
  Browser-Erweiterung), erst nach Freigabe durch Simon. Zeile in
  `docs/befunde-app.md` trägt der Hauptstrang ein.

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

- [ ] `figures` steht im Typ wie in der Tabelle, optional. Das JSDoc nennt: Werte kommen formatiert, eine Null bleibt, keine Farbe am Wert (`RunResult`)
- [ ] `figures` rendert ein `<dl>` im Textblock unter `sub`, mit Wort (`dt`) über Wert (`dd`). Ein Screenreader liest „Belege übertragen, 12“ (`RunResult`, Barrierefreiheitsbaum)
- [ ] Gemessen: Wort `--fs-ui-sm` in `--color-text-muted`, Wert `--fs-ui-md`, 600, `font-variant-numeric` mit `tabular-nums`, Farbe `--color-text`, in allen drei Tönen (`RunResult`)
- [ ] Eine Null bleibt sichtbar („Belege übertragen 0“). Ein leeres Array rendert kein `<dl>` (`RunResult`, `FiguresEdge`)
- [ ] Ohne `figures` sind die sieben bestehenden Stories bei 1440 px pixelgleich zum Stand vorher (`scripts/png-diff.mjs` ≤ 0,5 %)
- [ ] Schmal: Unter 640 px stehen die Aktionen unter dem Textblock, linksbündig. Die Zahlen brechen um, kein waagrechtes Scrollen bei 320 px (`FiguresEdge`). Bei 1280 px ändert sich keine bestehende Story (Bildvergleich wie oben)
- [ ] Kontrast gemessen: Wort der Zahl ≥ 4,5:1 und Wert ≥ 4,5:1 auf `--color-surface` (`RunResult`)
- [ ] Keine Live-Region im `StatusCallout` (`role`, `aria-live` fehlen im DOM)
- [ ] „Leer, weil erledigt“ mit Zahl und Datum (T6), kein „Keine Einträge“ (`RunResult`, Fall nichts zu tun)
- [ ] Texte nach T1–T9: „Sie“, kein Ausrufezeichen, Ursache und nächster Schritt im Ausgang „Abgebrochen“, Datum `TT.MM.JJJJ` (`RunResult`)
- [ ] `@when` des `StatusCallout` nennt die Zahlen im Halbsatz. Das `@instead` von `KpiGrid` verweist für „Zahlen eines Ergebnisses unter seinem Satz“ auf `StatusCallout` mit `figures`
- [ ] Wort und Ton des Zustands kommen aus der Achse `duo_sync`, sobald es sie gibt: **offen (App)**, bis Simon freigibt und die App spiegelt
