# 0264 · Problemkarte (`ProblemCard`)

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (Nachprüfung ✓; Schätzwert 24 Zeichen) |
| Stufe | `primitives/`, neue Datei `ProblemCard.tsx`, ein Export |
| Klassen-Test | ja: Jede Anwendung, die nach einem Vorgang sagt, was schiefging, warum, was jetzt zu tun ist und was die Technik dazu meldet, braucht diese Form |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Auftrag Simon): `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Problemkarte“; Anforderungen aus `ludwig-plugin/docs/spec-oberflaeche-und-fehler.md`, B8 (Fehlertyp mit `klasse`, `technisch`) und C3 (Ergebnis und Fehleranzeige) |
| Ersetzt | nichts im Set. Im Plugin ersetzt sie die Fehler als Freitext in der Ergebnisansicht (B8, Befund „Fehler sind Freitext“) |
| Blockiert | Plugin Teil C3 (Probleme unter dem Ergebnissatz, je Mandant im Durchgang) und C1 (Verbinden scheitert) |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Ein Abgleich ist durchgelaufen, aber drei Dinge gingen nicht. Die
Mitarbeiterin der Kanzlei sieht unter dem Ergebnissatz je Problem eine Karte:
was passiert ist (ein Satz, fett), warum, und was sie jetzt tut, mit genau
einem Knopf dafür. Liegt es nicht an ihr, steht das da. Den technischen Text
für den Support sieht sie nur, wenn sie „Technisch“ aufklappt, und kann ihn
dort kopieren. Heute steht im Plugin der Fehlertext der Technik als Freitext in
der Ergebnistabelle. Die Mitarbeiterin kann daraus weder ablesen, was zu tun
ist, noch ob es an ihr liegt.

## Einordnung

- **Wiederverwenden:** geprüft und verworfen:
  - `StatusCallout` hat dieselbe Gestalt: Kicker, Titel, Unterzeile, Aktionen rechts und ein Aufklapper im selben Rahmen. Sein `@when` ist aber „der Kopf eines Dings, dessen Zustand die Seite bestimmt“. Der Titel steht in `--fs-ui-lg`, die Unterzeile in der Tonfarbe. Als Liste von drei bis fünf Problemen wäre das zu laut, und mehrere Sätze in Rot lesen sich schlecht. `ProblemCard` übernimmt die Gestalt (Aktion im Kopf, Aufklapper im Rahmen, natives `<details>`), aber kompakt und mit Text in Textfarbe.
  - `Messages` (`patterns/Review.tsx`) trägt Stufe, Text und Aktionen. Sie meldet aber Fehler an einem Buchungssatz oder Formular, die das Speichern sperren. Sie hat weder die drei Teile noch einen Aufklapper.
  - `Callout` ist ein Satz ohne Handlung. `Banner` ist eine dauerhafte, seitenweite Meldung. `ErrorRow` ist ein Ladefehler in einer Tabellenzeile.
  - `ActionButton` zeigt den Fehler **seines** Klicks unter sich. Ein Problem hier ist das Ergebnis eines Vorgangs, nicht eines Klicks.
  - `TechnicalFields` ist eine Tabelle aus Feld, Wert und Bedeutung. Der technische Text des Plugins ist dagegen Freitext (Fehlermeldung, Pfad, HTTP-Status), siehe B8 `technisch`.
  - `RawRecord` zeigt einen Datensatz. `LogList` zeigt das ganze Protokoll, und das klappt die Seite einmal auf (C3), nicht jede Karte.
  - `AgentRunBanner` gehört zur Entität „Lauf von Ludwig“.
  - **Genutzt werden** `Disclosure` (der Aufklapper „Technisch“), `CopyTextButton` (Kopieren mit „Kopiert“) und `LEVEL_ICON` (Zeichen und Wort der Stufe).
- **Neu, weil:** §3 Regel 3.
  - Kein `@when` passt, siehe oben.
  - Kein Fachwort.
  - Verwendungen: Ergebnis eines Abgleichs (C3), aufgeklappte Mandantenzeile im Durchgang (C3), Verbinden scheitert in der Einrichtung (C1). Die Anfrage-Liste des Plugins ist die Vorlage.
  - An der Aufrufstelle nicht in 15 Zeilen zu bauen: Die festen Sätze je `resolution` stünden sonst an jeder Aufrufstelle als eigene Textliste. Das wäre eine zweite Quelle, und die Reihenfolge nach T5 (Was · Ursache · nächster Schritt) läge bei jedem Aufrufer neu.
  - Kein Pattern (§3 Regel 4), denn die Karte trägt keinen eigenen Zustand. Das Klappen macht `<details>`, das „Kopiert“ macht `CopyTextButton`.
- **Zuschnitt:** eine Datei, ein Export. Eine Liste von Karten ist Markup an der Aufrufstelle: Karten untereinander mit Abstand `--space-3`, siehe Story `InUse`. Eine eigene `ProblemList` hätte keinen Zustand und keine Regel.
- **Setzt auf:** `Disclosure`, `CopyTextButton`, `LEVEL_ICON` (`Icons.tsx`). Der Knopf kommt fertig vom Aufrufer als `Button` oder `ActionButton`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `title` | `string` | ja | **Was** passiert ist, ein Satz, fett (T5). „Ludwig war nicht erreichbar.“ | `Filled` |
| `cause` | `ReactNode` | nein | Die Ursache in ein bis zwei Sätzen | `Filled`, `Edge` (ohne) |
| `step` | `ReactNode` | ja | Der nächste Schritt als Satz in der Sie-Form („Starten Sie den Abgleich erneut.“). Er darf einen `Link` enthalten | `Filled` |
| `action` | `ReactNode` | nein | genau ein Knopf für den nächsten Schritt: `Button`, `ActionButton` oder `CopyTextButton` | `Filled`, `Edge` (ohne) |
| `resolution` | `"user" \| "retry" \| "support"` | ja | wer das Problem löst; setzt den festen Satz nach der Ursache (Tabelle unten) | `Resolutions` |
| `level` | `"error" \| "warning"` | nein, `"error"` | Kritikalität: Rahmen, Zeichen und Wort im Kopf | `Levels` |
| `context` | `string` | nein | wo es passiert ist, ein Schritt oder ein Mandant: „Belegabruf“, „Kontoabruf · Konto 2 von 3“ | `Filled`, `Edge` (langer Mandantenname) |
| `technical` | `string` | nein | der technische Text, unverändert und mit Zeilenumbrüchen. Er steht hinter „Technisch“ und lässt sich kopieren | `Filled`, `Edge` (lang, ohne) |

Der feste Satz je `resolution` steht direkt hinter `cause` im selben Absatz.
Ohne `cause` steht er allein an dessen Stelle.

| `resolution` | fester Satz | Klasse im Plugin (B8 `klasse`) |
|---|---|---|
| `user` | (keiner, der nächste Schritt sagt, was zu tun ist) | `anwender` |
| `retry` | „Das ist meist vorübergehend.“ | `voruebergehend` |
| `support` | „Das liegt nicht an Ihnen.“ | `duo`, `intern` |

Aufbau, von oben nach unten:

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⊗ Fehler · Belegabruf                                                │ Kopf: Zeichen + Stufenwort + context, in der Stufenfarbe
│ Ludwig war nicht erreichbar.                      [Erneut versuchen] │ title fett, Textfarbe · action rechts, oben bündig
│ Drei Versuche sind an einer Zeitüberschreitung gescheitert.         │ cause + fester Satz
│ Das ist meist vorübergehend.                                         │
│ Starten Sie den Abgleich in einigen Minuten erneut. Bereits          │ step
│ übertragene Belege werden nicht doppelt übertragen.                  │
│ ▸ Technisch                                                          │ nur mit technical: zu
└──────────────────────────────────────────────────────────────────────┘
```

- **Rahmen:** 1 px in der Stufenfarbe (`--color-danger` bzw. `--color-warning`), Fläche `--color-surface`, Radius `md`, ohne Schatten (die Karte steht meist in einer `Card`). Kein getönter Hintergrund: Hintergrundfarbe ist für aktiv, ausgewählt oder alarmiert reserviert, und mehrere Sätze auf Rot-Ton lesen sich schlecht.
- **Kopf:** `LEVEL_ICON[level]` mit seinem Wort („Fehler“, „Warnung“). Mit `context` folgen ` · ` und der Kontext. Alles in `--fs-ui-xs` 600 in der Stufenfarbe, wie der Kicker von `StatusCallout`. Farbe steht nie allein, Zeichen und Wort tragen die Stufe mit (V7).
- **Text:** `title` in `--fs-ui` 600, `cause` und `step` in `--fs-ui` 400, alles in `--color-text`. Nichts Technisches steht außerhalb des Aufklappers (T4, Owner 2026-09-27).
- **Aufklapper:** `Disclosure` mit `tone="quiet"` und der Zusammenfassung „Technisch“ (T4 b), standardmäßig zu.
  - Im Inneren steht der Text als `<pre>` in `--font-mono` `--fs-ui-sm`. Umbrüche bleiben erhalten (`white-space: pre-wrap`), lange Zeilen brechen um (`overflow-wrap: anywhere`), sodass die Seite nie waagerecht scrollt.
  - Über eine Höhe von etwa 16 Zeilen scrollt der Block in sich. Er ist dann mit `tabIndex={0}` und `aria-label="Technischer Text"` per Tastatur scrollbar.
  - Darunter steht `CopyTextButton` mit dem Label „Technischen Text kopieren“ (`size="sm"`). Er kopiert genau `technical`.
- **Schmal (unter 640 px):** `action` bricht unter `step` in eine eigene Zeile, linksbündig, wie der Kartenkopf in 0259. Am Desktop ändert sich nichts, die Regel steht in `@media (max-width: 639.98px)`.
- CSS-Klasse neu. Vor dem Benennen greppen, die kurzen `v2*`-Präfixe sind vergeben; `v2prob` war am 2026-11-27 frei.

Typen aus `src/ludwig/`: keine. Die Karte nimmt Texte, kein Datenmodell. Die
Abbildung von B8 (`code` → Anwendertext, nächster Schritt, `klasse`) liegt
in der Fehler-Datei des Plugins. GLOSSARY: kein neuer Begriff.

Was die Karte **nicht** kann (bewusst):
- Sie sammelt keine Probleme und zählt sie nicht. Den Satz darüber („3 Belege nicht übertragen“) trägt `StatusCallout layout="sentence"` (0269).
- Sie wiederholt nichts selbst. „Erneut versuchen“ ist der Knopf des Aufrufers, sein Warten zeigt `ActionButton`.
- Sie sagt sich nicht per Live-Region an (Offene Frage 2).
- Sie zeigt nur einen Knopf (Ausbau).
- Sie zeigt keine Liste der betroffenen Belege (Ausbau). Die vollständige Ergebnistabelle klappt die Seite auf (C3).

## Verhalten

- **Tastatur:** Tab erreicht in Lesereihenfolge `action`, dann die Zusammenfassung „Technisch“; Enter oder Leertaste öffnet und schließt sie (natives `<details>`). Ist der Aufklapper offen, folgen der Textblock (nur wenn er überläuft) und „Technischen Text kopieren“. Die Karte selbst ist nicht fokussierbar.
- **Hover:** Die Karte ist nicht klickbar und hat deshalb kein Hover. Hover tragen nur der Knopf und die Zusammenfassung, wie in `Disclosure`.
- **Fokus:** Der Fokusring von Knopf, Zusammenfassung und Kopierknopf liegt außen und wird nicht vom Rahmen beschnitten.
- **Zustände:** gefüllt. Die anderen vier gelten nicht, siehe Stories.
- **Ansage:** keine eigene. Im Ergebnis sagt `StatusCallout layout="sentence"` (0269) den Satz an, die Karten sind Inhalt darunter. Zeigt ein Aufrufer eine einzelne Karte als Antwort auf eine Handlung (Verbinden scheitert), setzt er sie in seine Live-Region.
- **Server-Component:** keine Hooks, kein `"use client"`. `CopyTextButton` ist ein Client-Kind.

## Stories

Titel `v3/Primitives/Fläche/ProblemCard`, Daten aus der Ergebnisansicht des
Plugins (Musterfirma GmbH, Abgleich vom 27.11.2026).

| Story | Beweist |
|---|---|
| `Filled` | „Ludwig war nicht erreichbar.“, `resolution="retry"`, `context="Belegabruf"`, Ursache, Schritt mit „Bereits übertragene Belege werden nicht doppelt übertragen.“, `action` „Erneut versuchen“, `technical` mit drei Zeilen (`ludwig_nicht_erreichbar · POST /api/intake/v2/documents · 504 Gateway Timeout`, Versuche 1 s · 3 s · 9 s). Aufklapper zu; öffnen, kopieren, „Kopiert“ |
| `Resolutions` | die drei Werte untereinander. `user`: „Bei DATEV nicht angemeldet.“ mit „DATEV öffnen“, ohne festen Satz. `retry`: „Das ist meist vorübergehend.“. `support`: „DATEV hat die Belegübersicht anders angezeigt als erwartet.“ mit „Das liegt nicht an Ihnen.“ und „Protokoll herunterladen“ |
| `Levels` | `error` und `warning` nebeneinander. Warnung: „Keine DATEV-Mandantennummer hinterlegt.“, Mandant übersprungen, „Mandant in Ludwig öffnen“ als `Button` mit `href` |
| `InUse` | in einer `Card` mit `CardHead` „Ergebnis“ und dem Satz „12 Belege übertragen, 3 nicht übertragen“ (Platzhalter, bis 0269 steht). Darunter drei Karten mit `--space-3` Abstand, Breite 1280 px |
| `Edge` | ohne `cause`: der feste Satz steht allein · ohne `action`: kein leerer Platz rechts · ohne `technical`: kein Aufklapper · `context` mit langem Mandantennamen („Bäckerei Schulze & Söhne Gebäudereinigung und Hausmeisterservice GmbH“) · `technical` mit 40 Zeilen Stack und einer 300 Zeichen langen Zeile ohne Leerzeichen. Dieselben Karten in 320 px Breite: `action` unter dem Text, keine waagerechte Scrollleiste der Seite |

Nicht anwendbare Zustände und warum:
- **leer:** Ohne Problem gibt es keine Karte. „Nichts zu tun“ oder „alles übertragen“ sagt `StatusCallout layout="sentence"` (0269).
- **leer nach Filter:** Die Karte filtert nichts.
- **lädt:** Ein Problem ist ein Ergebnis. Ein laufender neuer Versuch zeigt sich am Knopf (`ActionButton` `pending`).
- **Fehler:** Die Karte ist der Fehler. Scheitert das Kopieren, meldet das `CopyTextButton` (seine Story).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| ein zweiter Knopf („Erneut versuchen“ und „Protokoll herunterladen“) | `secondaryAction?: ReactNode` | Ein Problem braucht zwei Wege. Heute verlangt C3 genau einen |
| die betroffenen Einträge („die 3 Belege, die nicht übertragen wurden“) | `affected?: ReactNode`, ein zweiter Aufklapper vor „Technisch“ | Das Ergebnis fasst mehrere Belege unter einem Code zusammen, und die Mitarbeiterin sucht sie in der vollen Tabelle |
| eigene Ansage, wenn die Karte allein erscheint | `announce?: boolean` (`role="alert"`) | Offene Frage 2 wird anders entschieden, oder ein zweiter Aufrufer zeigt sie allein nach einer Handlung |

## Offene Fragen

1. **Wortlaut der zwei festen Sätze.** Beide sind neu im Set: „Das ist meist
   vorübergehend.“ (`retry`) und „Das liegt nicht an Ihnen.“ (`support`).
   Neue Wörter entscheidet der Owner. **Ohne Antwort:** diese beiden Sätze.
2. **Sagt sich die Karte selbst an** (`role="alert"`)? **Ohne Antwort:**
   nein. Im Ergebnis spricht der Satz in `StatusCallout layout="sentence"` (0269). Drei Karten als drei Alarme
   hintereinander wären Lärm.

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

- [ ] Die Props stehen Zeichen für Zeichen wie in der Schnittstellen-Tabelle; `step` und `resolution` sind Pflicht (Code, `Filled`)
- [ ] Reihenfolge nach T5: Kopf, `title` fett, `cause` mit festem Satz, `step`; außerhalb des Aufklappers steht nichts Technisches (`Filled`, `Resolutions`)
- [ ] `resolution` setzt genau die Sätze der Tabelle, `user` setzt keinen; ohne `cause` steht der Satz allein (`Resolutions`, `Edge`)
- [ ] `level` färbt Rahmen, Zeichen und Kopf; das Wort „Fehler“ bzw. „Warnung“ steht immer da; die Fläche bleibt `--color-surface` (`Levels`)
- [ ] `context` steht im Kopf nach dem Stufenwort, mit ` · ` getrennt; ein langer Name bricht um und schiebt den Knopf nicht aus der Karte (`Edge`)
- [ ] `action` steht rechts im Kopfbereich, oben bündig, Trefferfläche ≥ 24 × 24 px gemessen; unter 640 px steht er in eigener Zeile unter `step`; bei 1280 px unverändert (`Edge`, `InUse`)
- [ ] `technical`: Aufklapper „Technisch“ ist zu; offen zeigt er den Text mit erhaltenen Umbrüchen; der Kopierknopf legt genau `technical` in die Zwischenablage und zeigt „Kopiert“ (`Filled`, per Einfügen geprüft)
- [ ] Langer technischer Text: Der Block scrollt in sich, ist per Tab erreichbar und mit Pfeiltasten scrollbar; die Seite scrollt bei 320 px nicht waagerecht (`Edge`)
- [ ] Ohne `technical` kein Aufklapper, ohne `action` kein leerer Platz (`Edge`)
- [ ] Tastatur: Tab-Reihenfolge `action` → „Technisch“ → (offen) Textblock → Kopieren; Enter und Leertaste klappen; der Fokusring ist sichtbar und nicht beschnitten (`Filled`)
- [ ] Kontrast gemessen: Text ≥ 4,5:1, Rahmen und Zeichen ≥ 3:1 gegen `--color-surface`, je Stufe (`Levels`)
- [ ] `ProblemCard.tsx` trägt kein `"use client"` und keinen Hook
- [ ] Tut bewusst nicht: keine Live-Region, keine Wiederholung, keine Zählung. `@instead` nennt `StatusCallout layout="sentence"` (0269) für den Satz darüber und `ActionButton` für den Fehler eines einzelnen Klicks
- [ ] Die Nachbarn bekommen ihren Verweis: `StatusCallout` und `Messages` nennen in `@instead` „ein Problem nach einem Vorgang, mit Ursache, Schritt und technischem Text → ProblemCard“

## Nachtrag 2026-11-27 — aus dem Bau

- **Knopf unter dem Satz, auf jeder Breite.** Das vom Owner freigegebene
  Seitenprofil (`docs/seiten/duo-connect.md`, Nachtrag 1: „der Knopf unter
  dem Satz, nicht rechts im Kopf — drückte den Text auf ein Drittel“) geht
  der Zeichnung oben vor. `action` steht in einer eigenen Zeile unter `step`,
  linksbündig an der Textkante, 12 px darüber (Lücke `--space-1` des Rasters
  plus `--space-2`); die Regel „unter 640 px“ entfällt, weil es keinen zweiten Zustand gibt. Die Kriterien
  „`action` steht rechts im Kopfbereich, oben bündig … unter 640 px in eigener
  Zeile“ werden so geprüft: **auf allen Breiten** in eigener Zeile unter
  `step`, linke Kante = Textkante (± 1 px), Trefferfläche ≥ 24 × 24 px.
- **Tab-Halt des technischen Blocks ohne Hook:** Ob der Block überläuft,
  schätzt die Karte auf dem Server (je Zeile ⌈Länge / 30⌉, Summe > 16; 30
  Zeichen passen bei 320 px knapp in eine Zeile, Nachbesserung aus der
  Abnahme). Nur dann
  trägt er `tabIndex=0`, `role="region"` und `aria-label="Technischer Text"`.
  Grenze: ein breiter Block mit mehr als 16 geschätzten Zeilen kann ein Tab-Halt
  sein, der nicht scrollt (ein Halt zu viel, kein Halt zu wenig).
  Nachweis: eine JSON-Zeile mit 900 Zeichen ist bei 320 px Tab-Halt und
  scrollt (`Edge`).
- **Fokusring an „Technisch“** liegt innen (Vorgabe von `Disclosure`,
  `outline-offset: -2px`) und wird deshalb vom Rahmen nicht beschnitten.
- **Wörter:** Aufklapper „Technisch“ (T4 b) und Knopf „Technischen Text
  kopieren“ wie oben. Der Entwurf im Showcase und Nachtrag 2 des Profils
  sagen „Technische Angaben für den Support“ und „Kopieren“ — die Spec gilt,
  der Showcase zieht beim Umstellen auf den echten Export nach. Weicht der
  Owner davon ab, ist es ein Wort an einer Stelle (`ProblemCard.tsx`).
- `InUse` zeigt den Satz darüber schon mit `StatusCallout layout="sentence"`
  (0269), nicht mit einem Platzhalter; das Zustandswort kommt aus der Registry
  (`resolveStatus("duo_sync", key).label` + „.“).

## Abnahme

Gemessene Abnahme (nicht schlank), Storybook-Dev-Server :6107 (Arbeitsbaum),
Chromium 158, je Story eine eigene Seite; Messung über
`getBoundingClientRect`/`getComputedStyle`, Kontrast nach WCAG aus den
berechneten Farben gegen den berechneten Kartengrund. Story-IDs
`v3-primitives-fläche-problemcard--…`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0; `pnpm build -o <scratchpad>/abn0264/sb-work` Exit 0 („Storybook build completed successfully“) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `primitives/ProblemCard.tsx` + `ProblemCard.stories.tsx`, Titel `v3/Primitives/Fläche/ProblemCard`; Barrel unter `/* Fläche */` (`ProblemCard`, `ProblemLevel`, `ProblemResolution`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:when` „in Ordnung“, `--test` Exit 0; `pnpm check:language` „0 German comment lines“; ein Export mit `@when`/`@instead` | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep` auf Hex/`px` in `ProblemCard.tsx` und Stories: leer; Stufenwort und Zeichen aus `LEVEL_ICON`; `RESOLUTION_SENTENCE` ist die von der Spec verlangte eine Quelle der festen Sätze, keine Statusliste. `12px` in `.v3prob__ico` (v3.css): px ist in der Stildatei zulässig (§9 „kein px außerhalb `v2.css`“, hier `v3.css`; CLAUDE „kein px in TSX“); kein Token-Fall — die Icon-Leiter A8 (12/14/16) hat keine Token, das Maß steht als `size={12}` am Icon, und die Rechnung zentriert genau dieses Zeichen auf der ersten Kopfzeile (gemessen: 2,35 px Versatz bei 16,7 px Zeile). Gleiches Muster wie `.v2switch__knob` (18px), `.v2pp__running` (15px) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Index: `filled`, `resolutions`, `levels`, `in-use`, `edge` (5 von 5); leer/leer nach Filter/lädt/Fehler im Abschnitt „Nicht anwendbare Zustände“ begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, keine Zahlenspalte; Farbe nur Kritikalität (Fehler `--color-danger`, Warnung `--color-warning`), jede Stufe mit Wort + Zeichen; Rand ohne Schatten; `min-width: 0` an Karte, Kopf, Text, Block; Icons Lucide 12 px, Strich 1,5; Schrift aus der Skala (`pnpm check:type` ok, `--test` Exit 0); Trefferflächen ≥ 24 px; kein Hover auf der Karte; Texte Sie-Form, Imperativ, keine Ausrufezeichen; `pnpm check:icons` ok | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle fünf Stories bei 1440 px gerendert, keine Konsolen-Fehler oder -Warnungen, kein `pageerror` | ✓ |
| Die Props stehen Zeichen für Zeichen wie in der Schnittstellen-Tabelle; `step` und `resolution` sind Pflicht | Code: `title: string`, `cause?: ReactNode`, `step: ReactNode`, `action?: ReactNode`, `resolution: ProblemResolution` (= `"user" \| "retry" \| "support"`), `level?: ProblemLevel` (= `"error" \| "warning"`, Vorgabe `"error"`), `context?: string`, `technical?: string` | ✓ |
| Reihenfolge nach T5: Kopf, `title` fett, `cause` mit festem Satz, `step`; außerhalb des Aufklappers nichts Technisches | `filled`: Kinder in DOM- und Bildreihenfolge `kicker` „Fehler · Belegabruf“ → `title` (600) → „Drei Versuche … gescheitert. Das ist meist vorübergehend.“ → `step` → Knopf → `details`. Code-Zeichenkette, Pfad und HTTP-Status stehen nur im `<pre>` | ✓ |
| `resolution` setzt genau die Sätze der Tabelle, `user` setzt keinen; ohne `cause` steht der Satz allein | `resolutions`: user „Die Anmeldung bei DATEV Unternehmen Online ist abgelaufen.“ (ohne Zusatz) · retry „… abgebrochen. Das ist meist vorübergehend.“ · support „… fehlte. Das liegt nicht an Ihnen.“; `edge` ohne `cause`: Absatz = „Das liegt nicht an Ihnen.“ | ✓ |
| `level` färbt Rahmen, Zeichen und Kopf; Wort immer da; Fläche bleibt `--color-surface` | `levels`: error Rahmen/Kopf/Zeichen `rgb(168,64,60)`, warning `rgb(140,96,30)`; Kopf „Fehler · …“ bzw. „Warnung · …“; Grund beider Karten `rgb(255,255,255)`, auch unter Hover | ✓ |
| `context` im Kopf nach dem Stufenwort, ` · ` getrennt; langer Name bricht um, schiebt den Knopf nicht aus der Karte | `edge`: „Warnung · Bäckerei Schulze & Söhne Gebäudereinigung und Hausmeisterservice GmbH“; im 320-px-Rahmen drei Kopfzeilen (50 px), Zeichen auf der ersten; Knopf 204,5 px breit, innerhalb der Karte (rechts 981,5 < 1063 Textkante) | ✓ |
| `action` rechts im Kopf … — **geprüft nach Nachtrag 2026-11-27** (Profil-Nachtrag 1, Owner): auf allen Breiten eigene Zeile unter `step`, linke Kante = Textkante ± 1 px, Trefferfläche ≥ 24 × 24 px | `in-use` bei 700/1100/1280/1400/1920 px und `edge` (720- und 320-px-Rahmen, Fenster 1280 und 320): linke Kante − Textkante = 0 px, 12 px unter `step`, Knopf 148,1 × 34,8 px (`Protokoll herunterladen` 186,6 × 34,8, `Mandant in Ludwig öffnen` 204,5 × 34,8) | ✓ |
| `technical`: Aufklapper „Technisch“ zu; offen mit erhaltenen Umbrüchen; Kopierknopf legt genau `technical` ab und zeigt „Kopiert“ | `filled`: `details.open` = false; nach Enter offen, `<pre>` mit 3 Zeilen, `white-space: pre-wrap`, `--font-mono` 12,5 px; Kopieren per Tastatur → Beschriftung „Kopiert“; `navigator.clipboard.readText()` und Einfügen mit Cmd+V in ein Textfeld = Fixture `GATEWAY` zeichengenau | ✓ |
| Langer technischer Text: scrollt in sich, per Tab erreichbar, mit Pfeiltasten scrollbar; Seite bei 320 px ohne waagerechtes Scrollen | `edge`, 40-Zeilen-Stack: `<pre tabindex="0" role="region" aria-label="Technischer Text">`, `max-height` 300 px (16 Zeilen), `scrollHeight` 806 (1280) bzw. 2381 (320); Tab landet darauf, 3 × Pfeil ab → `scrollTop` 0 → 120, Bild ab → 400; Block `scrollWidth` = `clientWidth`; Fenster 320 px mit allen Aufklappern offen: `scrollWidth` 320 = `clientWidth` | ✓ (Hinweis H1) |
| Ohne `technical` kein Aufklapper, ohne `action` kein leerer Platz | `edge`: Karte ohne `technical` hat kein `details`; Karte ohne `action` hat kein `.v3prob__action`, Abstand letzter Absatz → Kartenunterkante 17 px (16 Polster + 1 Rand) wie bei den anderen | ✓ |
| Tastatur: Tab-Reihenfolge `action` → „Technisch“ → (offen) Textblock → Kopieren; Enter und Leertaste klappen; Fokusring sichtbar, nicht beschnitten | `filled`: Tab → `Erneut versuchen` → `summary` „Technisch“; Enter öffnet, Leertaste schließt, Leertaste öffnet; Tab → `Technischen Text kopieren` (der Block mit 3 Zeilen läuft nicht über und ist zu Recht kein Halt); `edge` mit Überlauf: Knopf → Zusammenfassung → Block → Kopieren. Ring 2 px `--color-focus`, Knopf und Block außen (+2 px), Zusammenfassung innen (−2 px, Vorgabe von `Disclosure`) — alle drei vollständig sichtbar (Bildschirmfotos `pc-focus-*.png`), die Karte selbst ist kein Ziel | ✓ |
| Kontrast gemessen: Text ≥ 4,5:1, Rahmen und Zeichen ≥ 3:1 gegen `--color-surface`, je Stufe | `levels`: Text (Titel, Ursache, Schritt) 13,77:1; Kopf (Text, 11,5 px/600) und Zeichen und Rahmen error 6,06:1, warning 5,52:1; „Technisch“ 6,69:1 | ✓ |
| `ProblemCard.tsx` trägt kein `"use client"` und keinen Hook | `grep` nach `use client`, `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useId`, `useContext`: leer; `CopyTextButton` ist das Client-Kind | ✓ |
| Tut bewusst nicht: keine Live-Region, keine Wiederholung, keine Zählung; `@instead` nennt `StatusCallout layout="sentence"` und `ActionButton` | DOM von `filled`: kein `role`/`aria-live` in der Karte; keine Zählung, Knopf kommt vom Aufrufer; JSDoc: „The result sentence above the problems → StatusCallout `layout="sentence"`. The failure of a single click → ActionButton.“ | ✓ |
| Die Nachbarn bekommen ihren Verweis: `StatusCallout` und `Messages` nennen in `@instead` … → ProblemCard | `StatusCallout.tsx` und `patterns/Review.tsx` (`Messages`): „A problem after a process, with cause, next step and technical text → ProblemCard.“ | ✓ |

Abgenommen von / am: Claude (Abnahme-Agent designsystem, hat nicht gebaut) ·
2026-11-27 · **abgenommen**, mit Hinweisen ·
Offene Punkte (keiner sperrt):
- **H1 Tab-Halt-Schätzung unter 640 px zu knapp.** `TECH_LINE_CHARS = 60`
  gilt laut Kommentar „when the block is as narrow as a phone“, gemessen
  passen bei 320 px Fenster aber **31** Zeichen in eine Zeile (bei
  720/1280 px 80). Ein Text, den die Karte auf 15–16 Zeilen schätzt (eine
  JSON-Zeile mit 900 Zeichen; 8 Zeilen à 119 Zeichen), läuft bei 320 px über
  (525 bzw. 600 px Inhalt in 300 px) und hat weder `tabIndex` noch
  `role="region"`/`aria-label`. Chromium 158 macht den Scroller selbst
  fokussierbar (gemessen: Tab erreicht ihn, Pfeil scrollt), aber ohne Namen;
  Safari und Firefox tun das nicht. Die Aussage im Nachtrag „ein Halt zu viel,
  kein Halt zu wenig“ stimmt damit nur ab etwa 640 px. Vorschlag: 30 Zeichen
  (gemessene Handy-Breite) — eine Konstante.
- **H2 Satz im Nachtrag:** „Abstand `--space-2` darüber“ — der sichtbare
  Abstand `step` → Knopf ist 12 px (`--space-1` Rasterlücke + `--space-2`
  Rand). Satz auf „12 px (`--space-3`)“ angleichen oder Rand auf
  `calc(var(--space-3) - var(--space-1))` wie in `.v2callout--sentence`.
- Verhalten sagt „Fokusring … liegt außen“; bei „Technisch“ liegt er innen
  (Vorgabe `Disclosure`, unbeschnitten) — kein Mangel, nur der Satz.

### Nachprüfung 2026-11-27

Derselbe Prüfer, Storybook :6107 (Arbeitsbaum), Chromium 158.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| H1 `TECH_LINE_CHARS` 30 | `ProblemCard.tsx`: `TECH_LINE_CHARS = 30`. `edge`, neue Karte „technical: eine JSON-Zeile mit 900 Zeichen“ (Schätzung 30 > 16): bei 320 px Fenster `tabindex="0"`, `role="region"`, `aria-label="Technischer Text"`, Block 254 px, `scrollHeight` 788 > 300 → scrollt; Tab: „Technisch“ → Block → „Technischen Text kopieren“, 2 × Pfeil ab `scrollTop` 0 → 80. Bei 1280 px im 720-px-Rahmen ist derselbe Block Tab-Halt ohne Überlauf (263 = 263) — der zugelassene „Halt zu viel“ | ✓ |
| H1 Rest: „kein Halt zu wenig“ auch verschachtelt? | `in-use` bei 320 px Fenster (Karte in `Card` › `CardSection`): Block 221 px, **29** Zeichen je Zeile. 16 Zeilen à 30 Zeichen (Schätzung 16, also kein Halt) belegen dort 600 px in 300 px → scrollt ohne `tabindex`/Namen (Chromium macht ihn selbst fokussierbar, Safari/Firefox nicht). Der Code-Kommentar „at 320 px … about 33“ gilt nur für die Karte direkt im Fenster | H (Rest) |
| H2 Bau-Notiz | Nachtrag sagt jetzt „12 px darüber (Lücke `--space-1` des Rasters plus `--space-2`)“ — gemessen 12 px; Fokusring an „Technisch“ innen als Satz ergänzt | ✓ |
| Nebenwirkung: Wort im Satz darüber | `in-use`: `kicker` = `resolveStatus("duo_sync", "succeeded_with_issues").label` + „.“ → „Fertig mit Problemen.“; Achse passt zum Gegenstand (Abgleich) | ✓ |
| Wächter, Bau | `pnpm typecheck` Exit 0; `check:type`, `check:when`, `check:icons`, `check:language`, `check:domain-paths` Exit 0; `check:classes` rot nur durch fremde Klassen (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`); `pnpm build -o <scratchpad>/abn0264/sb-work2` Exit 0 | ✓ |
| Browser | `filled`, `edge` (320 und 1280 px) ohne Konsolen-Fehler/-Warnungen; 320 px mit allen Aufklappern offen: `scrollWidth` 320 = `clientWidth` | ✓ |

Ergebnis der Nachprüfung: **abgenommen.** Offen als Hinweis:
- **H (Rest zu H1):** Die Schätzung trägt bis zu einer Blockbreite von etwa
  230 px (30 Zeichen); eine Karte in einer Karte bei 320 px hat 221 px (29
  Zeichen). Wer „kein Halt zu wenig“ ohne Bedingung will: 24 Zeichen (reicht
  bis etwa 180 px Block) oder den Satz im Nachtrag auf „ab etwa 230 px
  Blockbreite“ einschränken.
