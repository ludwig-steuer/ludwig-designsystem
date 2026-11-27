# 0264 · Problemkarte (`ProblemCard`)

| | |
|---|---|
| Status | spec |
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
- Sie sammelt keine Probleme und zählt sie nicht. Den Satz darüber („3 Belege nicht übertragen“) trägt `ResultSummary` (0269).
- Sie wiederholt nichts selbst. „Erneut versuchen“ ist der Knopf des Aufrufers, sein Warten zeigt `ActionButton`.
- Sie sagt sich nicht per Live-Region an (Offene Frage 2).
- Sie zeigt nur einen Knopf (Ausbau).
- Sie zeigt keine Liste der betroffenen Belege (Ausbau). Die vollständige Ergebnistabelle klappt die Seite auf (C3).

## Verhalten

- **Tastatur:** Tab erreicht in Lesereihenfolge `action`, dann die Zusammenfassung „Technisch“; Enter oder Leertaste öffnet und schließt sie (natives `<details>`). Ist der Aufklapper offen, folgen der Textblock (nur wenn er überläuft) und „Technischen Text kopieren“. Die Karte selbst ist nicht fokussierbar.
- **Hover:** Die Karte ist nicht klickbar und hat deshalb kein Hover. Hover tragen nur der Knopf und die Zusammenfassung, wie in `Disclosure`.
- **Fokus:** Der Fokusring von Knopf, Zusammenfassung und Kopierknopf liegt außen und wird nicht vom Rahmen beschnitten.
- **Zustände:** gefüllt. Die anderen vier gelten nicht, siehe Stories.
- **Ansage:** keine eigene. Im Ergebnis sagt `ResultSummary` (0269) den Satz an, die Karten sind Inhalt darunter. Zeigt ein Aufrufer eine einzelne Karte als Antwort auf eine Handlung (Verbinden scheitert), setzt er sie in seine Live-Region.
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
- **leer:** Ohne Problem gibt es keine Karte. „Nichts zu tun“ oder „alles übertragen“ sagt `ResultSummary` (0269).
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
   nein. Im Ergebnis spricht `ResultSummary`. Drei Karten als drei Alarme
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
- [ ] Tut bewusst nicht: keine Live-Region, keine Wiederholung, keine Zählung. `@instead` nennt `ResultSummary` (0269) für den Satz darüber und `ActionButton` für den Fehler eines einzelnen Klicks
- [ ] Die Nachbarn bekommen ihren Verweis: `StatusCallout` und `Messages` nennen in `@instead` „ein Problem nach einem Vorgang, mit Ursache, Schritt und technischem Text → ProblemCard“

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
