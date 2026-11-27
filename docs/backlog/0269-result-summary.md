# 0269 · Ergebnis eines Abgleichs (`StatusCallout layout="sentence"` + Seitenaufgabe)

| | |
|---|---|
| Status | spec (überarbeitet 2026-11-27 nach Simons Feedback zu den Entwürfen; die erste Fassung mit `figures` ist verworfen) |
| Stufe | `primitives/` (`StatusCallout`): eine neue Prop `layout`. Alles Übrige ist eine Seitenaufgabe aus vorhandenen bzw. spezifizierten Bausteinen |
| Klassen-Test | ja: Das Ergebnis eines Vorgangs als ein Satz, der mit seinem Zustand beginnt, mit dem nächsten Schritt darunter, gibt es in jeder Fach-App |
| Quelle | Seitenprofil `docs/seiten/duo-connect.md`, Abschnitt „Nachtrag 2 2026-11-27 — Simons Feedback zu den Entwürfen (17e044a)“, Zeilen **A10–A12 Ergebnis**, **A11, A12, B4 Support** und **A9** (Regel für jede Hinweisfläche mit Aktion: Knopf in eigener Zeile unter dem Text, linksbündig). Davor: `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), „Ergebnis-Zusammenfassung“; `docs/spec-oberflaeche-und-fehler.md` C3 |
| Ersetzt | die erste Fassung dieser Spec (Zahlenkacheln `figures`, Marke über dem Satz). Im Set und in `ludwig/app` nichts. In den Entwürfen `src/showcase/duo-connect/Sync.stories.tsx` die Zustände A10–A12, die noch `figures` und `KpiGrid` zeigen |
| Blockiert | Plugin-Paket „Designsystem einbauen“ (A10–A13, B4); die Entwürfe A10–A12 |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Der Abgleich für die Musterfirma GmbH ist durch. Die Mitarbeiterin schaut
einmal hin und will wissen, ob sie etwas tun muss. Oben steht **ein Satz,
der mit dem Zustand beginnt**, je nach Ausgang:
- „**Fertig.** 12 Belege übertragen, Kontoumsätze von 2 Konten geholt.“
- „**Fertig mit Problemen.** 9 Belege übertragen, 3 Belege nicht
  übertragen.“
- „**Abgebrochen.** Stehen geblieben bei „Neue Belege aus DATEV holen“,
  Beleg 37 von 120.“

Bei Problemen und Abbruch trägt die Fläche Zeichen und Ton der Warnung. So ist
der Zustand deutlich, ohne dass eine Marke daneben schwebt. Der nächste
Schritt steht als Knopf in einer eigenen Zeile darunter.

Darunter bleiben die Schrittzeilen aus dem Fortschritt stehen, jetzt im
Endzustand: Haken bzw. Warnzeichen, rechts das Ergebnis. Das Bild läuft vom
Fortschritt ins Ergebnis, ohne dass etwas springt. Danach folgen die
Problemkarten, eingeklappt das Ergebnis im Einzelnen und das Protokoll, und
am Ende ein Block „Hilfe vom Support“.

Zahlenkacheln gibt es nicht.

## Einordnung

- **Was die Seite braucht**, nach Nachtrag 2:
  1. Satz mit fettem Zustandswort vorn, ohne Marke darüber.
  2. Fläche mit Zeichen und Ton bei Problemen und Abbruch.
  3. Aktionen in eigener Zeile darunter, linksbündig.
  4. Ergebnisliste.
  5. Problemkarten.
  6. Eingeklapptes Ergebnis im Einzelnen und Protokoll.
  7. Block „Hilfe vom Support“.
- **Punkte 4–7 sind vorhanden oder spezifiziert:**
  - Punkt 4 ist `PhaseProgress` (0265) im Endzustand. 0265 trägt ihn: alle
    Schritte `done` bzw. `done` mit `issue`, das Ergebnis rechts über `note`,
    still, wenn nichts mehr läuft (Story `Finished`).
  - Punkt 5 ist `ProblemCard` (0264).
  - Punkt 6 sind `Disclosure` mit `DataTable` bzw. `LogList`.
  - Punkt 7 ist `Card` mit `CardHead`, `CardSection`, `CopyTextButton` und
    `Button`.

  Dafür braucht es keine Prop und keine Komponente.
- **Punkte 1–3, geprüft an `StatusCallout`** (`@when` „The header of an item
  whose state defines the page“). Rahmen, `tone`, `icon`, `title`, `sub`,
  `actions` und `details` sind da. Die heutige Form weicht in drei Punkten ab:
  - `kicker` ist Pflicht und steht **über** dem Titel. Das ist genau die
    Marke, die Simon nicht will.
  - Der Titel ist ganz halbfett, ein fettes Wort am Anfang hebt sich nicht ab.
  - `actions` stehen **rechts** neben dem Text.

  Das sind drei Abweichungen, aber eine Designentscheidung: *ein Zustand als
  ein Satz, den sein Wort eröffnet, mit dem nächsten Schritt darunter.*
- **Erweitert, weil:** §3 Regel 2, **eine** Prop `layout: "head" |
  "sentence"`.
  - Die Entscheidung kommt wieder: A10–A12 (Ergebnis eines Abgleichs), A13
    (Ergebnis eines Durchgangs), B (Verlauf; U9: dieselbe Form wie das
    Ergebnis). Simons Regel gilt außerdem für jede Hinweisfläche mit Aktion
    im Plugin.
  - Sie lässt sich in der `@when`-Zeile in einem Halbsatz sagen: „… or as
    one sentence opened by its state word, actions below
    (`layout="sentence"`)“.
  - Ein Enum statt dreier Booleans (`kickerInline`, `actionsBelow`,
    `plainTitle`): Die drei ergeben nur zusammen Sinn. Getrennt erlaubten sie
    Mischformen, die niemand entworfen hat.
- **Geprüft und verworfen:**
  - `Callout` ist ein Satz Kontext ohne Zeichen und ohne Aktionen, und sein
    Text steht im Ton. Nach Nachtrag 1 (Problemkarte) soll Text in Textfarbe
    stehen.
  - `Banner` ist eine seitenweite, bleibende Meldung. `ProblemCard` ist ein
    einzelnes Problem mit eigener Stufe, nicht der Ausgang des Ganzen.
  - `KpiGrid`/`KpiTile` hat Simon gestrichen („keine Zahlenkacheln“).
- **`figures` entfällt ersatzlos.** Die Zahlen stehen im Satz und rechts in
  den Schrittzeilen (0265).
- **Name:** weiterhin keine Komponente `ResultSummary`. Das Ergebnis ist eine
  Zusammensetzung im Plugin, und das Set hat dafür keine zweite Kopfform.
- **Zuschnitt:** eine Datei (`StatusCallout.tsx`), dazu die Regeln in `v3.css`.
- **Setzt auf:** nichts Neues im `StatusCallout`. Die Seite setzt
  `PhaseProgress` (0265), `ProblemCard` (0264), `Disclosure`, `DataTable`,
  `LogList`, `Card`, `CopyTextButton` und `Button` zusammen.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `layout` | `"head" \| "sentence"` | nein (`"head"`) | **Neu.** `head` wie bisher: `kicker` über dem Titel, Titel halbfett, `sub` im Ton, `actions` rechts. `sentence`: `kicker` eröffnet den Satz fett („Fertig.“), `title` setzt ihn in normaler Stärke fort, `sub` steht darunter in `--color-text-muted`, `actions` in einer eigenen Zeile darunter, linksbündig. Der Ton liegt nur auf Rahmen und `icon`, aller Text bleibt in Textfarben | `Layouts`, `RunResult` |

So verhalten sich die vorhandenen Props bei `layout="sentence"`:

| Prop | bei `sentence` |
|---|---|
| `kicker` | Das erste Wort des Satzes samt Punkt, im selben Absatz wie `title`, in `--fs-ui-lg`, Stärke 600, `--color-text`. Es gibt kein Element darüber |
| `title` | Der Rest des Satzes, `--fs-ui-lg`, Stärke 400, `--color-text`. Vorleser lesen Wort und Titel als einen Satz |
| `sub` | darunter, `--fs-ui`, `--color-text-muted`, in jedem Ton |
| `icon` | links vom Satz, auf der ersten Zeile, in der Farbe des Tons, wie heute |
| `actions` | eigene Zeile unter Satz und `sub`, linksbündig an der Textkante, Abstand `--space-3`. Unter 640 px stehen die Knöpfe untereinander in voller Breite (Seitenprofil, „Schmale Fläche“) |
| `details` | wie heute im selben Rahmen, unter den Aktionen |
| `tone` | färbt Rahmen und Zeichen, keinen Text |

**Seitenaufgabe: so setzt das Plugin das Ergebnis zusammen** (Texte aus
Nachtrag 2, Wort und Stufe aus der Achse `duo_sync`):

| Teil | A10 · Fertig | A11 · Fertig mit Problemen | A12 · Abgebrochen |
|---|---|---|---|
| `StatusCallout` `layout` | `sentence` | `sentence` | `sentence` |
| `tone` · `icon` | `neutral`, ohne Zeichen | `warning`, Zeichen Warnung | `warning`, Zeichen Warnung |
| `kicker` | „Fertig.“ | „Fertig mit Problemen.“ | „Abgebrochen.“ |
| `title` | „12 Belege übertragen, Kontoumsätze von 2 Konten geholt.“ | „9 Belege übertragen, 3 Belege nicht übertragen.“ | „Stehen geblieben bei „Neue Belege aus DATEV holen“, Beleg 37 von 120.“; durch die Nutzerin: „Von Ihnen abgebrochen bei „Neue Belege aus DATEV holen“, Beleg 37 von 120.“ |
| `actions` | **Erneut abgleichen** (secondary); Link **Belege in Ludwig ansehen**, nur mit Ludwig-Adresse (U14) | **Erneut versuchen**, daneben „Ein neuer Versuch überträgt nichts doppelt.“ | **Erneut abgleichen**; den Weg zur Lösung trägt die Problemkarte |
| darunter | `PhaseProgress` im Endzustand (0265, `Finished`): „4 Belege einsortiert“ · „12 übertragen, 47 schon in Ludwig“ · „2 Konten“ | `PhaseProgress`: Belegabruf `done` mit `issue` „9 übertragen, 3 nicht übertragen“ | `PhaseProgress`: Belegabruf `held` (Seite geschlossen, von Ihnen abgebrochen) bzw. `failed` (Ludwig nicht erreichbar, liegt nicht an Ihnen) bei 37 von 120; danach `pending` mit „nicht ausgeführt“ |
| dann | eingeklappt: „Ergebnis im Einzelnen“ (`DataTable`), „Protokoll“ (`LogList`) | `ProblemCard` je Problem (0264), dann wie A10 | `ProblemCard` mit eigener Stufe (0264); beim Abbruch durch die Nutzerin keine. Dann wie A10 |
| am Ende | — | Block „Hilfe vom Support“ | Block „Hilfe vom Support“ |

- **Wort und Ton:** Die Achse `duo_sync` steht in der App
  (`apps/web/src/ui/status/status-registry.ts`, Owner 2026-11-27): Wartet ·
  Läuft · Fertig (success) · Fertig mit Problemen (warning) · Abgebrochen
  (warning, auch durch die Nutzerin) · Übersprungen. Im Spiegel `src/ludwig/`
  des Sets fehlt sie noch, `pnpm sync:ludwig` holt sie. Danach nimmt das
  Plugin `kicker` aus dem `label` (+ „.“) und `tone` aus der Stufe.
  - Für den Rahmen gilt Nachtrag 2: Nur Probleme und Abbruch tragen Ton und
    Zeichen. `success` bleibt bei `neutral` (offene Frage 1).
- **Block „Hilfe vom Support“** (A11, A12, B4): `Card` mit `CardHead`
  „Hilfe vom Support“, in `CardSection`:
  - der Satz „Das Protokoll enthält Mandantendaten. Geben Sie es nur an den
    Ludwig-Support weiter.“
  - eine Zeile mit `CopyTextButton label="Angaben kopieren"`. Der Text sind
    die technischen Angaben ohne Mandantendaten: Fehler-Code, Schritt,
    Plugin-Version, Browser, Kennung des Abgleichs.
  - in derselben Zeile `Button` **E-Mail an den Support**. Das Plugin öffnet
    das E-Mail-Programm mit den Angaben und lädt das Protokoll herunter.
    Gesendet wird erst, wenn die Nutzerin selbst sendet.
  - darunter gedämpft: „Ihr E-Mail-Programm öffnet sich mit allen Angaben. Das
    Protokoll wird dabei heruntergeladen — hängen Sie die Datei an.“

  Der Block ist eine Zusammensetzung des Plugins und keine Komponente des
  Sets: Adresse und Texte gehören dem Plugin, die Bausteine sind vorhanden.
- **Nichts springt:** Die Karte des Abgleichs bleibt dieselbe. Beim Ende
  tauscht die Seite den Hinweis „Lassen Sie diese Seite … geöffnet“ gegen den
  Satz und lässt die Instanz von `PhaseProgress` stehen (dieselben `key`).
  Nur die Spur unter der zuletzt laufenden Zeile fällt weg (0265).
- **Ansage:** Den Satz sagt die Region der Seite an (C5). `StatusCallout` und
  `PhaseProgress` im Endzustand schweigen.

Typen aus `src/ludwig/`: keine neuen; die Achse `duo_sync` kommt mit dem
nächsten Spiegel. Was die Komponente **nicht** kann (bewusst):
- **Keine Zahlenreihe, keine Kacheln.** Zahlen stehen im Satz und in den
  Schrittzeilen.
- **Sie baut den Satz nicht.** Wort und Satz schreibt der Aufrufer, das Set
  kennt keine Grammatik.
- **Keine Live-Region.** Eine Region, die mit ihrem Inhalt erscheint, liest
  kaum ein Screenreader vor (0225, H3). Die Seite sagt an.
- **`head` ändert sich nicht.** Die App behält ihre Köpfe mit Aktion rechts.
  Siehe offene Frage 3.

## Verhalten

- **`sentence`:** Zeichen (falls vorhanden) · Textblock.
  - Der Textblock enthält den Satz (`kicker` + `title` in einem Absatz),
    `sub` und die Aktionszeile.
  - Es gibt keine rechte Spalte, der Textblock nimmt die ganze Breite.
  - Langer Satz bricht um. Das Zeichen bleibt auf der ersten Zeile.
- **Ton:** `neutral` wie heute (Rand `--color-border`). `warning` und
  `danger` färben Rahmen und Zeichen. Text in `--color-text` bzw.
  `--color-text-muted`, in jedem Ton.
- **Fokus und Tastatur:** wie die enthaltenen Knöpfe. Die Fläche selbst ist
  kein Ziel und hat keinen Hover.
- **Schmal:** Unter 640 px stehen die Knöpfe der Aktionszeile untereinander
  in voller Breite. Die Regel steht in `@media (max-width: 639.98px)` und
  betrifft nur `sentence`; am Desktop ändert sich nichts.
- **Zustände:**
  - gefüllt: die drei Ausgänge.
  - „leer, weil erledigt“ (T6): „**Fertig.** Keine neuen Belege seit dem
    26.11.2026, Kontoumsätze von 2 Konten geholt.“
  - Fehler: der Ausgang „Abgebrochen“ mit Problemkarte.
  - lädt: entfällt. Das Ergebnis erscheint erst, wenn der Abgleich fertig
    ist; bis dahin zeigt die Seite `PhaseProgress` mit dem Hinweis.
  - leer nach Filter: entfällt, es gibt keinen Filter.
- **Server-Component** wie bisher.

## Stories

Ergänzt in `StatusCallout.stories.tsx` (`v3/Primitives/Fläche/StatusCallout`).
Dort stehen sieben Stories, mit diesen zwei sind es neun.

| Story | Beweist |
|---|---|
| `Layouts` | `head` und `sentence` mit denselben Daten nebeneinander, in `neutral`, `warning` und `danger`. Bei `sentence` steht nichts über dem Satz, die Aktionen stehen darunter, Text in Textfarbe |
| `RunResult` | die Ausgänge eines Abgleichs mit den Texten aus Nachtrag 2: Fertig, Fertig ohne Neues („Keine neuen Belege seit dem 26.11.2026 …“), Fertig mit Problemen (mit „Ein neuer Versuch überträgt nichts doppelt.“), Abgebrochen, von Ihnen abgebrochen. Zusätzlich in einem Rahmen von 320 px: Knöpfe untereinander, nichts scrollt waagerecht |

Die ganze Ergebnisseite (Satz, `PhaseProgress`, `ProblemCard`, Aufklapper,
„Hilfe vom Support“) entsteht als Seitenaufgabe in den Entwürfen
`src/showcase/duo-connect/Sync.stories.tsx` (A10–A12), nicht als Story des
`StatusCallout`. Bestehende Stories (`Open`, `WaitingForClient`, `Failed`,
`Done`, `WithoutAction`, `NextAction`, `WithDetails`) bleiben unverändert.

Nicht anwendbare Zustände: siehe Verhalten (lädt, leer nach Filter).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Aktionen unter dem Text auch bei `head` auf dem Handy (L1) | keine neue Prop, eine Regel in `@media (max-width: 639.98px)` für `head` | ein Kopf der App mit Aktion wird unter 640 px gemeldet |
| Andere Hinweisflächen des Plugins mit Aktion (A7b, A9, A8b) in derselben Form | keine Prop; sie nehmen `StatusCallout layout="sentence"` oder `Callout` mit dem Knopf als eigener Zeile darunter | 0263 bzw. der Bau des Plugins setzt sie zusammen |

## Offene Fragen

1. **Bekommt „Fertig“ einen grünen Rahmen?** Die Achse sagt `success`.
   **Ohne Antwort:** nein, `neutral` und ohne Zeichen. Nachtrag 2 lässt nur
   Probleme und Abbruch Ton und Zeichen tragen, und „erledigt“ braucht kein
   Signal.
2. **Steht der Hinweis „Ein neuer Versuch überträgt nichts doppelt.“ neben
   oder unter dem Knopf?** **Ohne Antwort:** in der Aktionszeile rechts neben
   dem Knopf als gedämpfter Text, unter 640 px unter dem Knopf.
3. **Gilt die Aktionszeile unter dem Text auch für die Köpfe der App?**
   **Ohne Antwort:** nein. Simons Regel gilt für das Plugin, die App behält
   `head`. Eine Änderung dort wäre ein Systementscheid und bräuchte den Owner.

## Befund an die App

Die Achse `duo_sync` ist in der App angelegt (Owner 2026-11-27, Wörter und
Stufen freigegeben), im Spiegel des Sets fehlt sie. Das ist kein Befund an die
App, sondern ein `pnpm sync:ludwig` hier. L-388 („ein Wort für eingereiht“)
bleibt offen.

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

- [ ] `layout` steht im Typ wie in der Tabelle, optional, Default `"head"`. Eine Prop `figures` gibt es nicht (`git grep figures -- src/ui/v3/primitives/StatusCallout.tsx` leer)
- [ ] Ohne `layout` sind die sieben bestehenden Stories bei 1440 px pixelgleich zum Stand vorher (`scripts/png-diff.mjs` ≤ 0,5 %)
- [ ] `sentence`, gemessen (`Layouts`, `RunResult`): Über dem Satz steht kein Element. `kicker` und `title` stehen in einem Absatz. `kicker` hat 600, `title` 400, beide `--fs-ui-lg` und `--color-text`; `sub` steht in `--color-text-muted`, in allen drei Tönen
- [ ] Vorleser: Der Satz wird als einer gelesen („Fertig. 12 Belege übertragen, Kontoumsätze von 2 Konten geholt.“), ohne Pause zwischen Wort und Titel (Barrierefreiheitsbaum: ein Textknoten-Elternteil)
- [ ] Aktionen bei `sentence`: in eigener Zeile unter Satz und `sub`, linke Kante bündig mit dem Satz (± 1 px), nicht rechts daneben. Unter 640 px untereinander in voller Breite, kein waagerechtes Scrollen bei 320 px (`RunResult`). Bei 1280 px ändert die Regel für schmale Breiten keine bestehende Story
- [ ] Ton bei `sentence`: `warning` und `danger` färben Rahmen und Zeichen, keinen Text (berechnete Farben). `neutral` hat keinen getönten Rahmen
- [ ] Kontrast gemessen: Satz ≥ 4,5:1, `sub` ≥ 4,5:1, Zeichen und Rahmen im Ton ≥ 3:1 (`Layouts`)
- [ ] Keine Live-Region im `StatusCallout` (`role`, `aria-live` fehlen im DOM)
- [ ] Texte wörtlich aus Nachtrag 2 (`RunResult`): „Fertig.“, „Fertig mit Problemen.“, „Abgebrochen.“, „Stehen geblieben bei „Neue Belege aus DATEV holen“, Beleg 37 von 120.“, „Ein neuer Versuch überträgt nichts doppelt.“. Kein Ausrufezeichen, „Sie“, Datum `TT.MM.JJJJ`
- [ ] `@when` des `StatusCallout` nennt `layout="sentence"` im Halbsatz. Das `@instead` von `Callout` verweist für „Zustand als Satz mit nächstem Schritt“ auf `StatusCallout layout="sentence"`
- [ ] Seitenaufgabe, **offen bis 0264 und 0265 gebaut sind:** Die Entwürfe A10–A12 in `src/showcase/duo-connect/Sync.stories.tsx` zeigen `StatusCallout layout="sentence"`, darunter `PhaseProgress` im Endzustand, `ProblemCard`, die zwei Aufklapper und „Hilfe vom Support“ mit den Texten aus Nachtrag 2. Sie haben kein `figures` und kein `KpiGrid`
- [ ] Wort und Stufe aus `duo_sync`, sobald der Spiegel sie hat: **offen (Spiegel)**, `pnpm sync:ludwig`
