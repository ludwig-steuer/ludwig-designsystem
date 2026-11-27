# Ludwig DUO-Connect — Seitenprofil (Browser-Erweiterung)

| | |
|---|---|
| Status | geprüft — vom Owner angenommen 2026-11-27 (über plugin-mananger: U1–U15 übernommen, die drei Punkte unter „Zu entscheiden“ gelten wie entworfen); Verhalten und Abnahme stehen in `ludwig-plugin` `docs/spec-oberflaeche-und-fehler.md`, Abschnitt „Layout-Konzept“ |
| Route | keine App-Route: Erweiterungsseite `sync.html` (Hauptseite, ein Tab) und `popup.html` (etwa 320 px) im Repo `ludwig-plugin` |
| Heute gebaut in | `ludwig-plugin/ludwig-duo-sync/` (HTML, CSS, JS ohne Framework); Neubau mit React 19 und diesem Set (Simon 2026-11-27) |
| Entitäten | Mandant, Beleg, Bankkonto — nur als Namen und Zahlen; das Plugin zeigt keine Entitätsformen der App |
| Baustein in v3 | Rahmen 0263 `ExtensionShell`/`ExtensionPopup`; dazu 0264–0271 |
| Fachliche Quelle | `ludwig-plugin` Branch `umbau`: `docs/spec-oberflaeche-und-fehler.md` (Teil C, B8), `docs/spec-bausteine.md`, `docs/begriffe.md` (verbindliche Wörter), `docs/spec-verbinden-und-store-pruefung.md` (V1) |
| Profil von / am | Claude (designsystem), 2026-11-27, Auftrag Simon über plugin-mananger |
| Entwürfe | Storybook `Seiten/DUO-Connect/…` (`src/showcase/duo-connect/`) |
| Statuswörter | Achse `duo_sync` „DUO-Abgleich“ (freigegeben Simon 2026-11-27, in der App-Registry seit `ludwig/app` b4e1e9a48): Wartet · Läuft · Fertig · Fertig mit Problemen · Abgebrochen · Übersprungen (neutral · info · success · warning · warning · neutral). „Übersprungen“ und „Abgebrochen“ tragen immer einen Grund daneben |

## Job

> Wenn **neue Belege in DATEV liegen oder Ludwig Belege gebucht hat**, will
> **die Mitarbeiterin der Kanzlei** **einen oder alle Mandanten mit einem
> Klick abgleichen**, damit **Ludwig mit dem Stand von DATEV arbeitet und sie
> nichts von Hand übertragen muss**.

- **Fertig ist sie, wenn** der Satz oben im Ergebnis „Fertig“ sagt, oder wenn
  sie bei einem Problem weiß, was der nächste Schritt ist, und ihn als Knopf
  vor sich hat.
- **Misslungen ist die Seite, wenn** sie etwas entscheiden muss, das das
  Plugin selbst wissen kann (Zeitraum, Schritte), wenn sie einen Fehler an
  zwei Stellen suchen muss, oder wenn sie die Seite schließt, weil nichts
  sagt, dass sie offen bleiben muss.

Die Seite wird alle zwei bis vier Wochen geöffnet und dazwischen vergessen.
Deshalb gilt der Vier-Wochen-Test streng: Der Hauptweg kommt ohne Hotkey,
ohne Fachwort der Technik und ohne Farbe aus. Jeder Zustand sagt in einem Satz,
was gerade passiert und was zu tun ist.

## Aufteilung

Drei Reiter, eine Seite: **Abgleich · Verlauf · Einstellungen** (C5). Die
Aufteilung bleibt. Die Reiter sind Sichten mit eigener Form, keine Filter
(R9). Begründung in U10.

| Reiter | Job | Wie oft |
|---|---|---|
| Abgleich | abgleichen und sehen, was herauskam | bei jedem Öffnen |
| Verlauf | nachsehen, ob ein bestimmter Beleg ankam; Protokoll für den Support | selten, im Zweifel |
| Einstellungen | verbinden, trennen, Schritte, Bereitschaftsprüfung, Diagnose | einmal, dann im Fehlerfall |

Rahmen (0263): Kopf mit Zeichen, „Ludwig DUO-Connect“, Kennzeichen der
Umgebung nur außerhalb der Produktion („Staging“); die drei Reiter; Inhalt in
`--container-narrow` (720 px), weil die Seite eine Entscheidung und eine
Liste trägt, keine breite Tabelle; Fußzeile „Ludwig DUO-Connect 0.11.0 ·
Datenschutz“. Während eines Abgleichs trägt der Reiter Abgleich einen Punkt
(`Tabs dot`), bei einem Problem den Alarm.

## Fragen, in dieser Reihenfolge (Reiter Abgleich)

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Kann ich loslegen?" | ein Satz mit der Auswahl und ein Knopf | `Combobox`, `Button` primary |
| 2 | „Was ist beim letzten Mal passiert?" | eine Zeile unter dem Knopf: „Zuletzt: heute, 09:14 · Fertig · 12 Belege übertragen“ | `Badge` (Übergang für `StatusBadge duo_sync`), `Time` |
| 3 | „Wie weit ist es?" | Schritte des Abgleichs mit Zählern; beim Durchgang zusätzlich „Mandant 3 von 12“ | 0265, `Progress` |
| 4 | „Was muss ich jetzt tun?" | eine hervorgehobene Hinweisfläche, nur wenn etwas wartet | `Callout`, 0264 `ProblemCard` |
| 5 | „Was kam heraus?" | ein Satz groß, darunter Zahlen, darunter nur die Probleme | 0269 `StatusCallout figures`, 0264 |
| 6 | „Was genau ist gelaufen?" | eingeklappt: vollständige Tabelle und Protokoll | `Disclosure`, `DataTable`, `LogList` |

Rang 1 und 2 stehen ohne Scrollen und ohne Klick. Rang 6 ist eingeklappt:
Diese Frage stellt man nur, wenn man dem Satz nicht glaubt.

## Ansichten und Zustände

Notation: **vorhanden** = Export in `src/ui/v3/index.ts`; **fehlt** = Spec
liegt, Baustein ist im Entwurf nachgestellt und als Entwurf gekennzeichnet.

### A Abgleich

| # | Zustand | Inhalt | Bausteine vorhanden | fehlt |
|---|---|---|---|---|
| A1 | Einrichtung · nicht verbunden | Schrittfolge „Verbinden · Prüfen · Fertig“ (Edge: „Browser-Freigabe“ als dritter Schritt). Satz: „Verbinden Sie das Plugin einmal mit Ihrem Ludwig-Zugang. Ein neuer Tab öffnet sich; dort bestätigen Sie mit „Verbinden“.“ Knopf **Mit Ludwig verbinden**. Eingeklappt: „Token von Hand eintragen“ | `StepRail` bzw. Schrittfolge, `Button`, `Disclosure`, `Field` + `Input type="password"` nach 0267 (kein eigener Baustein, kein „Anzeigen“) | 0263 |
| A1b | Einrichtung · wartet auf Bestätigung | „Bitte bestätigen Sie im Ludwig-Tab. Dieser Tab schließt sich danach von selbst.“ Laufanzeige klein. Knöpfe **Ludwig-Tab zeigen** · **Erneut verbinden** (V1: Link in anderem Browser geöffnet) | `Button` | 0268 `Spinner` |
| A1c | Einrichtung · Prüfung | nach dem Verbinden läuft die Bereitschaftsprüfung von selbst (C6, Punkte 1–6, 8–10); oben ein Satz mit dem Ergebnis, darunter die Prüfpunkte; Knopf **Weiter zum Abgleich** erst, wenn kein Fehler | `CheckItems` | 0270 (wird geprüft, Aktion je Zeile) |
| A2 | Einrichtung · Verbindung abgelaufen | wie A1, darüber Hinweisfläche warning: **Verbindung abgelaufen.** Eine Verbindung gilt 365 Tage; diese endete am 26.11.2026. Knopf **Neu verbinden** | `Callout` | 0263 |
| A3 | Plugin zu alt | Problemkarte statt Auswahl, Abgleich gesperrt: **Ludwig DUO-Connect ist zu alt.** Installiert ist 0.10.1, Ludwig verlangt mindestens 0.11.0. Die Erweiterung aktualisiert sich meist von selbst; sonst unter Erweiterungen „Aktualisieren“ wählen. Knopf **Anleitung öffnen** | `Button` | 0264 `ProblemCard` |
| A4 | Bereit · ein Mandant | „Mandant“ als Suchfeld mit der gemerkten Auswahl „Musterfirma GmbH · 10001“; darunter die Schritte in einer Zeile („Gebuchte Belege in DATEV einsortieren · Neue Belege aus DATEV holen · Kontoumsätze aus DATEV holen“, Link **Schritte ändern** → Einstellungen); Knopf **Mandant abgleichen**; Zeile „Zuletzt: heute, 09:14 · Fertig · 12 Belege übertragen“ | `Combobox`, `Button`, `Badge`, `Time`, `TextButton` | — |
| A4b | Bereit · Stichtag fragen (Übergang ohne `documentFetch`) | wie A4, zusätzlich Feld **Belege übernehmen ab** mit Hinweis „Erster Belegabruf für diesen Mandanten. Ältere Belege bleiben in DATEV.“ — je Mandant höchstens einmal | `DateField`, `Field` | — |
| A5 | Bereit · alle | Auswahl „Alle Mandanten (12)“; Zeile „10 werden abgeglichen · 2 übersprungen“; eingeklappt **Liste ansehen und einzelne abwählen** (= A6); Knopf **Alle Mandanten abgleichen** | `Combobox`, `Disclosure`, `Button` | — |
| A6 | Übersicht vor dem Durchgang (aufgeklappt in A5) | Tabelle: Auswahl · Mandant · Letzter Abgleich · Abrufzeitraum; darunter Gruppe „Werden übersprungen“ mit Grund („Keine DATEV-Mandantennummer in Ludwig“, „Einrichtung in Ludwig noch nicht abgeschlossen“); Abwahl gilt nur für diesen Durchgang | `DataTable`, `Selection`, `Badge` | — |
| A7 | Läuft · ein Mandant | Hinweis oben: „Lassen Sie diese Seite und das DATEV-Fenster geöffnet, bis der Abgleich fertig ist.“ Kopf „Musterfirma GmbH wird abgeglichen“; vier Schritte als Zeilen: fertig („4 Ablageorte“) · läuft („Beleg 37 von 120“, Balken) · offen · offen; ausgeschaltete Belegübergabe erscheint nicht; Knopf **Abgleich abbrechen** (tertiary) | `Callout`, `Progress` | 0265, 0268 |
| A7b | Läuft · erster Belegabruf | in A7 über den Schritten Hinweisfläche info: **Erster Belegabruf für Musterfirma GmbH.** In DATEV liegen 214 Belege seit dem 01.01.2026, 38 kennt Ludwig schon, 176 werden übertragen. Das dauert einige Minuten. Knopf **Belegabruf abbrechen** (tertiary). Der Abgleich läuft weiter, ohne auf eine Antwort zu warten | `Callout` | — |
| A8 | Läuft · Durchgang | Gesamt „Mandant 3 von 10 · 2 übersprungen“ mit Balken; Block „Jetzt“: der laufende Mandant mit seinen Schritten (wie A7, kompakt); darunter die Liste aller Mandanten in fester Reihenfolge, je Zeile Status (Wartet, Läuft, Fertig, Fertig mit Problemen, Abgebrochen, Übersprungen + Grund) und Kurzergebnis; fertige Zeilen aufklappbar; Schnellfilter „Probleme (1) · Übersprungen (2)“; Knopf **Durchgang anhalten** | `Progress`, `DataTable`, `ExpandableRow`, `Badge`, `FilterBar`-Schnellfilter | 0265 |
| A8b | Läuft · Durchgang wird angehalten | Zeile: „Wird angehalten. Bäckerei Schneider e.K. wird noch fertig abgeglichen, die übrigen 9 werden übersprungen.“ Knopf **Doch weitermachen** — keine Rückfrage, weil umkehrbar (U13) | `Callout`, `Button` | — |
| A9 | Wartet auf DATEV-Anmeldung | Variante von A7/A8: Hinweisfläche warning hervorgehoben **Bitte melden Sie sich bei DATEV an.** Der Abgleich wartet, bis die Anmeldung im DATEV-Fenster abgeschlossen ist. Knopf **DATEV-Fenster zeigen**; der laufende Schritt zeigt „wartet auf Anmeldung“ statt Zahl | `Callout`, `Button` | 0265 |
| A10 | Ergebnis · alles gut | Satz groß: „Fertig. 12 Belege übertragen, Kontoumsätze von 2 Konten geholt.“ Zahlen: Belege übertragen 12 · schon in Ludwig 47 · einsortiert 4 · Konten 2. Nächster Schritt: **Belege in Ludwig ansehen** (Link) · **Erneut abgleichen** (secondary). Eingeklappt: Ergebnis im Einzelnen, Protokoll | `Disclosure`, `DataTable`, `LogList`, `CopyTextButton`, `Link` | 0269 (`StatusCallout` mit `figures`, kein eigener Baustein) |
| A11 | Ergebnis · mit Problemen | Satz: „Fertig mit Problemen. 9 Belege übertragen, 3 Belege nicht übertragen.“ darunter je Problem eine Problemkarte (Was · Ursache · nächster Schritt als Knopf · eingeklappt technischer Text). Neben **Erneut versuchen**: „Ein neuer Versuch überträgt nichts doppelt.“ | wie A10 | 0264, 0269 (`StatusCallout figures`) |
| A12 | Ergebnis · abgebrochen | Satz: „Abgebrochen bei „Neue Belege aus DATEV holen“, Beleg 37 von 120.“ Problemkarte mit Klasse: Anwender (z. B. Seite geschlossen), vorübergehend (Ludwig nicht erreichbar), „liegt nicht an Ihnen“ (DATEV hat anders reagiert). Bricht die Nutzerin selbst ab (A7 „Abgleich abbrechen“): „Abgebrochen“ mit Grund „von Ihnen abgebrochen“, ohne Problemkarte (plugin-mananger 2026-11-27) | wie A11 | 0264, 0269 (`StatusCallout figures`) |
| A13 | Ergebnis · Durchgang | Satz: „Durchgang fertig mit Problemen. 10 Mandanten abgeglichen, 1 mit Problemen, 2 übersprungen.“ dann die Liste je Mandant, Probleme zuerst aufgeklappt | `DataTable`, `ExpandableRow` | 0264, 0269 (`StatusCallout figures`) |
| A14 | Stille Prüfung sperrt | vor dem Start: Problemkarte an der Stelle des Knopfs, z. B. **Mandant ohne DATEV-Mandantennummer.** In Ludwig fehlt für Musterfirma GmbH die DATEV-Mandantennummer. Knopf **In Ludwig öffnen**; Link **Alle Prüfpunkte ansehen** | | 0264 |

### B Verlauf

| # | Zustand | Inhalt | vorhanden | fehlt |
|---|---|---|---|---|
| B1 | leer, nie befüllt | „Noch kein Abgleich. Nach dem ersten Abgleich stehen hier je Mandant der letzte erfolgreiche Abgleich und das Protokoll.“ Knopf **Zum Abgleich** | `EmptyState` (Art nie befüllt) | — |
| B2 | je Mandant | Suchfeld oben; Tabelle Mandant · Letzter erfolgreicher Abgleich · Letzter Abgleich (Status) · Abgleiche; Zeile aufklappbar mit den letzten Abgleichen; ein Abgleich öffnet seine Ergebnisansicht (dieselbe Form wie A10–A12, U9) | `DataTable`, `ExpandableRow`, `Badge`, `Time`, `SearchInput` | — |
| B3 | Suche nach Beleg | Eingabe „Beleg-Nummer oder Eingangsdatum“; Antwort je Fund in einem Satz: „Gesehen am 12.11.2026 im Abgleich Musterfirma GmbH · übertragen“ / „· schon in Ludwig“ / „· nicht übertragen: DATEV hat keine PDF-Datei geliefert“; kein Fund: „Diesen Beleg hat kein gespeicherter Abgleich gesehen. Gespeichert sind die Abgleiche der letzten 90 Tage.“ | `SearchInput`, `Table`, `EmptyState` (Art leer nach Filter) | — |
| B4 | Protokoll | Kopf „Protokoll · Musterfirma GmbH · 27.11.2026, 09:14“; Hinweis vor dem Herunterladen: „Das Protokoll enthält Mandantendaten (Namen, Beträge, IBAN). Geben Sie es nur an den Ludwig-Support weiter.“ Knöpfe **Protokoll herunterladen** · **Kopieren**; Text in fester Breite, scrollbar; ganz unten, abgesetzt: **Alle Protokolle löschen** (danger, mit Rückfrage) | `LogList`/`RawRecord`, `CopyTextButton`, `Callout`, `Button`, `Dialog` | — |

### C Einstellungen

| # | Karte | Inhalt | vorhanden | fehlt |
|---|---|---|---|---|
| C1 | Verbindung | Wertepaare Nutzer „Anna Berger“ · Gerät „Laptop Büro“ · gültig bis 26.11.2027; Knöpfe **Neu verbinden** · **Verbindung trennen** (danger, Rückfrage: „Verbindung trennen? Das Plugin kann danach nicht mehr abgleichen, bis Sie es neu verbinden. Ludwig widerruft die Verbindung.“ Primärknopf **Verbindung trennen**) | `Card`, `FieldList`, `Button`, `Dialog` | — |
| C2 | Schritte | Sofort wirkende Einstellung nach 0266 (kein Schalter, Owner 2026-09-04, 0018): Karte „Belege aus Ludwig an DATEV übergeben“, Zustandswort „ausgeschaltet“ grau im Kopf, Knopf **Belegübergabe einschalten** (bzw. **ausschalten**), Erklärtext aus C2: „Lädt Beleg-Dateien, die auf anderem Weg nach Ludwig kamen, zum Beispiel per E-Mail, nach DATEV Unternehmen Online hoch. Welche das sind, bestimmt Ludwig. Buchungen werden nicht übertragen.“ Gilt für alle Mandanten dieses Geräts | `Card`, `CardHead`, `CardSection`, `ActionButton` | 0266 (Seitenaufgabe; `ActionButton` sagt den Fehler an) |
| C3 | Fehlermeldungen | wie C2: Karte „Fehlermeldungen senden“, Zustandswort, Knopf **Fehlermeldungen senden** bzw. **Fehlermeldungen nicht mehr senden**, Erklärtext „Technische Meldungen ohne Mandantendaten an den Anbieter. Hilft, Fehler zu finden, die nicht an Ihnen liegen.“ | `Card`, `ActionButton` | 0266 |
| C4 | Alles bereit? | Satz oben („Alles bereit.“ / „1 Punkt braucht Sie.“), zehn Prüfpunkte mit Zustand, Erklärtext und Aktion; Knöpfe **Erneut prüfen** · **Gründlich prüfen** (Punkt 7, öffnet einen DATEV-Tab) · **Bericht kopieren** | `CheckItems`, `CopyTextButton` | 0270 |
| C5 | Diagnose (eingeklappt) | Umgebung (Auswahl, nur entpackt), Zeitraum von Hand (zwei Datumsfelder), einzelne Schritte (Ankreuzfelder), Probeablage, Rohprotokoll als Text und JSON. Ein Abgleich von hier ist im Protokoll gekennzeichnet und verschiebt den Stand nicht | `Disclosure`, `Select`, `DateRangeField`, `Checkbox`, `Button` | — |
| C5a | Diagnose › Verbindung, technisch (Owner 2026-11-27) | Wertepaare, immer sichtbar: Art („über „Mit Ludwig verbinden“ erzeugt“ / „von Hand eingetragen“) · Nutzer · Gerät · gültig bis · Umgebung · Token `lag_…a1b2` (mono). Knopf **Token anzeigen** (tertiary, nur Wort, kein Zeichen) → voller Wert in fester Breite, daneben **Kopieren**, darunter „Wird nach 30 Sekunden wieder ausgeblendet.“ und **Ausblenden**; blendet auch beim Verlassen des Bereichs aus; der Fokus springt dann auf **Token anzeigen** zurück, „Token ausgeblendet“ wird angesagt. Darunter **Token austauschen**: Feld „Neues Token“ (0267), Knopf **Token prüfen und speichern** — erst geprüft, dann gespeichert | `FieldList`, `RawValue`, `CopyTextButton`, `TextButton`, `Field` + `Input type="password"`, `ActionButton` | — (Komposition an der Aufrufstelle; benannte Ausnahme zu 0267, siehe dort) |
| C5b | Diagnose › Gespeicherte Daten | Satz: „Gespeichert sind die Einstellungen von Ludwig und der Stand der letzten Belegabrufe dieser Umgebung. Die Verbindung bleibt bestehen.“ Knopf **Gespeicherte Daten löschen** (danger). Rückfrage: Titel „Gespeicherte Daten löschen?“, Text „Der nächste Abgleich bestimmt den Abrufzeitraum neu aus Ludwig. Die Verbindung bleibt bestehen.“, Primärknopf **Gespeicherte Daten löschen** | `Card`, `Button`, `Dialog` | — |

Version steht nicht als eigene Karte da (U8): Fußzeile und Prüfpunkt 1.

### D Popup (etwa 320 px)

| # | Zustand | Inhalt | fehlt |
|---|---|---|---|
| D1 | verbunden | Zeichen + Name; Statuszeile „Verbunden als Anna Berger“; „Zuletzt: heute, 09:14 · Musterfirma GmbH · Fertig“; Knopf **Abgleich öffnen** (volle Breite) | 0263 `ExtensionPopup` |
| D2 | nicht verbunden | „Nicht verbunden. Richten Sie das Plugin einmal ein.“ Knopf **Einrichten** | 0263 |
| D3 | Abgleich läuft | „Abgleich läuft · Musterfirma GmbH“; „Neue Belege aus DATEV holen · Beleg 37 von 120“ mit Balken; Knopf **Abgleich öffnen** | 0263, 0268 |
| D4 | letzter Abgleich mit Problemen (Vorschlag U11) | Statuszeile mit Badge „Fertig mit Problemen“ und „3 Belege nicht übertragen“; Knopf **Ergebnis ansehen** | 0263 |

Der Knopf wechselt zu einer offenen Hauptseite, statt eine zweite zu öffnen (C5).

## Nachtrag 2026-11-27 — aus dem Bau der Entwürfe

- **A8 zählt nur, was läuft:** „Mandant 3 von 10 · 2 übersprungen“, nicht
  „3 von 12“ — Übersprungene laufen nie; A8b nennt „die übrigen 7“.
- ~~**Der Ergebnissatz wiederholt den Zustand nicht**~~ (abgelöst durch Nachtrag 2: keine Marke mehr über dem Satz, der Satz beginnt mit dem Zustandswort) (A10–A13): Die Marke
  trägt „Fertig“ bzw. „Abgebrochen“, der Satz beginnt mit dem Inhalt
  („12 Belege übertragen …“); A12: „Stehen geblieben bei „Neue Belege aus
  DATEV holen“, Beleg 37 von 120.“
- **Punkt am Reiter Abgleich:** Alarm (rot) nur bei Fehler (A3, A14), sonst
  der graue Punkt — auch bei Warnung und Abbruch (Farbe = Kritikalität).
- **Problemkarte (0264):** Die Karte trägt ihre eigene Stufe, unabhängig vom
  Zustand des Abgleichs: Seite geschlossen (A12a) ist Warnung, Ludwig nicht
  erreichbar und „liegt nicht an Ihnen“ (A12b, A12c) sind Fehler. Text in
  Textfarbe, der Knopf unter dem Satz, nicht rechts im Kopf (drückte den Text
  auf ein Drittel).
- **Lücke im Set (an 0263):** L1 macht Tabellen unter 1280 px **Fenster**
  zu Zeilenkarten. Die Erweiterung liegt neben DATEV oft bei rund 960 px und
  zeigte Karten, obwohl die 720-px-Spalte die Tabelle trägt. Weg: Der Rahmen
  setzt `container-type: inline-size` auf seinen Inhalt, und der Wechsel zu
  Zeilenkarten richtet sich dort nach der Spaltenbreite (`@container`, unter
  640 px), nicht nach dem Fenster. Am Desktop der App ändert sich nichts.
  Bis dahin sind die Entwürfe bei 1440 px fotografiert.

## Nachtrag 2 2026-11-27 — Simons Feedback zu den Entwürfen (17e044a)

U1–U16 und alle hier nicht genannten Zustände sind angenommen. Diese Punkte
ersetzen die Zeilen oben (Quelle: `ludwig-plugin` Branch `umbau`,
`docs/spec-oberflaeche-und-fehler.md`, „Feedback von Simon zu den
Entwürfen“).

| Zustand | Neu |
|---|---|
| A4, A5 Bereit | Die Wahl ist immer sichtbar: zwei Optionen untereinander (`RadioGroup`) **Ein Mandant** — darunter das Suchfeld mit der gemerkten Auswahl — und **Alle Mandanten (12)** — darunter „10 werden abgeglichen · 2 übersprungen“ und der Aufklapper zur Liste (A6). Der Knopf heißt nach der Wahl **Mandant abgleichen** bzw. **Alle Mandanten abgleichen**. Die Schritte stehen nicht mehr einzeln da, sondern als eine Zeile: „Alle Schritte“ bzw. „Alle Schritte, ohne Belegübergabe“ (Standard, weil die Belegübergabe aus ist) · **Schritte ändern** |
| A9 und jede Hinweisfläche mit Aktion im Plugin | Der Knopf steht in einer eigenen Zeile unter dem Text, linksbündig — nie rechts neben dem Text |
| A10–A12 Ergebnis | **Keine Zahlenkacheln, keine Marke über dem Satz.** Oben ein Satz, der mit dem Zustandswort beginnt: „**Fertig.** 12 Belege übertragen, Kontoumsätze von 2 Konten geholt.“ · „**Fertig mit Problemen.** 9 Belege übertragen, 3 Belege nicht übertragen.“ · „**Abgebrochen.** Stehen geblieben bei „Neue Belege aus DATEV holen“, Beleg 37 von 120.“ Bei Problemen und Abbruch trägt die Fläche Zeichen und Ton der Stufe (warning), damit der Zustand deutlich ist, ohne dass eine Marke daneben schwebt. Darunter die Ergebnisliste: **dieselben Schrittzeilen wie im Fortschritt (0265), jetzt im Endzustand** — Haken bzw. Warnzeichen, Anwendertext, rechts das Ergebnis: „4 Belege einsortiert“ · „12 übertragen, 47 schon in Ludwig“ (A11: Warnzeichen, „9 übertragen, 3 nicht übertragen“) · „2 Konten“. So läuft das Bild vom Fortschritt ins Ergebnis, ohne dass etwas springt. Dann die Problemkarten, dann eingeklappt Ergebnis im Einzelnen und Protokoll |
| A11, A12, B4 Support | Ein Block **Hilfe vom Support** am Ende des Ergebnisses (und im Protokoll B4): Satz „Das Protokoll enthält Mandantendaten. Geben Sie es nur an den Ludwig-Support weiter.“ Knöpfe **Angaben kopieren** (technische Angaben ohne Mandantendaten: Fehler-Code, Schritt, Plugin-Version, Browser, Kennung des Abgleichs) und **E-Mail an den Support**; darunter: „Ihr E-Mail-Programm öffnet sich mit allen Angaben. Das Protokoll wird dabei heruntergeladen — hängen Sie die Datei an.“ Gesendet wird erst, wenn Sie selbst senden. In der Problemkarte bleibt „Technische Angaben für den Support“ eingeklappt mit **Kopieren** |
| A8, A13 Durchgang | Über der Liste eine **Zählzeile** in fester Reihenfolge: Mit Problemen · Abgebrochen · Läuft · Wartet · Fertig · Übersprungen, je Wort und Zahl; Zahl 0 grau. Jede Zahl ist zugleich Schnellfilter (ersetzt „Zeigen: Alle · Probleme · Übersprungen“). Darunter zuerst die Gruppe **Mit Problemen** (Fertig mit Problemen und Abgebrochen), dann **Alle übrigen** in fester Reihenfolge. Ein Mandant wechselt nur einmal die Gruppe, wenn sein Abgleich mit Problem endet — das ist ein Ereignis, kein Springen. A13: die Gruppe Mit Problemen aufgeklappt, die übrigen eingeklappt mit Zahl |
| C2, C3 Einstellungen | **Schalter** (Owner 2026-11-27, hebt 0018 für sofort wirkende, umkehrbare Einstellungen auf; 0266 wird zur Spec des `Switch`): Zeile mit Titel, Erklärtext darunter, rechts der Schalter mit sichtbarem Zustandswort „An“/„Aus“. Wirkt sofort. Während des Speicherns gesperrt mit „wird gespeichert“; misslingt es, springt er zurück und der Fehler steht darunter (angesagt); gelingt es, sagt die Seite „Belegübergabe eingeschaltet“ an |

## Schmale Fläche

- Die Hauptseite liegt oft neben dem DATEV-Fenster: halbe Bildschirmbreite
  ist der Normalfall, nicht der Rand. Unter 720 px füllt der Inhalt die Breite
  mit 16 px Rand; unter 640 px gilt L1: eine Spalte, Tabellen werden
  Zeilenkarten (`priority`: Mandant und Status `primary`, Zeitraum `meta`),
  Knöpfe stehen untereinander in voller Breite, die drei Reiter bleiben (drei
  kurze Wörter passen auf 320 px).
- Popup: 320 px fest, eine Spalte, ein Knopf in voller Breite. Nichts
  scrollt im Popup; was nicht passt, gehört auf die Hauptseite.

## Mehr als hundert Mandanten

- Auswahl: `Combobox` mit Suche nach Name **oder** DATEV-Mandantennummer,
  erste Option „Alle Mandanten (140)“. Keine Ausklappliste mit 140 Einträgen.
- Übersicht (A6): eingeklappt mit Zahl; aufgeklappt zwei Gruppen „Werden
  abgeglichen (133)“ und „Werden übersprungen (7)“, Suche über der Tabelle,
  „Alle auswählen“ mit Zahl.
- Durchgang (A8): Die Liste behält ihre Reihenfolge, Zeilen springen nicht.
  Der laufende Mandant steht zusätzlich oben im Block „Jetzt“, damit niemand
  scrollen muss. Schnellfilter „Probleme · Übersprungen · Alle“ mit Zahlen.
  Bei 140 Zeilen keine Virtualisierung, Kopf bleibt stehen.
- Ergebnis (A13): Probleme zuerst, aufgeklappt; die übrigen eingeklappt mit
  Zahl („129 Mandanten fertig“).
- Verlauf: Suche und Sortierung nach letztem Abgleich; nach 90 Tagen fallen
  Protokolle weg (C2), das steht im Leertext.

## UX-Einwände und Vorschläge

| # | Einwand | Vorschlag | Job bleibt |
|---|---|---|---|
| U1 | „Übersicht vor dem Durchgang“ als eigener Schritt bricht „ein Klick startet“ (C2 Bereit) | Übersicht ist eingeklappt Teil von „Bereit · alle“ (A5/A6). Wer nichts abwählen will, klickt einmal | ja |
| U2 | „Wartet auf DATEV-Anmeldung“ ist keine eigene Seite | Variante von Läuft: Hinweisfläche oben, Schritt zeigt „wartet auf Anmeldung“ | ja |
| U3 | Hinweis beim ersten Belegabruf darf den Durchgang nicht anhalten | nicht blockierend, mit „Belegabruf abbrechen“; der Abgleich läuft weiter | ja |
| U4 | Nach dem Abgleich muss man für „was war zuletzt“ nicht in den Verlauf | Zeile „Zuletzt: …“ unter dem Knopf; das Ergebnis bleibt stehen, bis der nächste Abgleich startet | ja |
| U5 | Ein waagerechter Balken mit vier Abschnitten trägt die Anwendertexte nicht („Neue Belege aus DATEV holen“) und bricht unter 640 px | Schritte als Zeilen untereinander, je mit Zustand und Zähler; der Balken nur in der laufenden Zeile und als Gesamtbalken im Durchgang | ja |
| U6 | Ausgeschaltete Belegübergabe erscheint sonst als ewig „offener“ Schritt | nur eingeschaltete Schritte zeigen; die Bereit-Zeile nennt sie, „Schritte ändern“ führt in die Einstellungen | ja |
| U7 | Ein Problem der stillen Prüfung muss dort stehen, wo man abgleichen wollte | Problemkarte an der Stelle des Knopfs, Link „Alle Prüfpunkte ansehen“ | ja |
| U8 | Version an zwei Stellen | Fußzeile und Prüfpunkt 1; keine eigene Karte | ja |
| U9 | Ergebnisansicht und Abgleich im Verlauf sind dieselbe Frage | eine Form für beide | ja |
| U10 | Drei Reiter geprüft: Verlauf in den Abgleich zu legen, mischt „jetzt abgleichen“ mit „im Zweifel nachsehen“ | Aufteilung bleibt | ja |
| U11 | Popup kennt keinen Problemfall | vierter Zustand „letzter Abgleich mit Problemen“ mit **Ergebnis ansehen** | ja |
| U12 | Knopftexte ohne Objekt („Abgleichen“, „Anhalten“, „Trennen“) | **Mandant abgleichen** · **Alle Mandanten abgleichen** · **Durchgang anhalten** · **Verbindung trennen** (T-Regel: Imperativ mit Objekt) | ja |
| U13 | Rückfrage „Durchgang anhalten?“ (Liste in spec-bausteine) — Anhalten ist umkehrbar | keine Rückfrage, sondern „Doch weitermachen“, solange der laufende Mandant fertig wird; Rückfragen nur bei „Verbindung trennen“, „Gespeicherte Daten löschen“ (U16) und „Alle Protokolle löschen“ | ja |
| U14 | Nach „Fertig“ fehlt der nächste Schritt | Link **Belege in Ludwig ansehen** (Eingang des Mandanten in Ludwig) | ja |
| U15 | Die Einrichtung kennt den Zustand nach dem Klick nicht (Tab offen, Bestätigung aussteht, Link in anderem Browser) | Zustand A1b mit **Ludwig-Tab zeigen** und **Erneut verbinden** | ja |
| U16 | „Verbindung zurücksetzen“ (Token + Einstellungen + Stand + Widerruf) deckt sich zu vier Fünfteln mit „Verbindung trennen“ und nennt sein Objekt nicht — zwei Knöpfe für fast dasselbe werden verwechselt | jede Handlung tut eine Sache und nennt sie: **Verbindung trennen** (Karte Verbindung: Token löschen und in Ludwig widerrufen) und **Gespeicherte Daten löschen** (Diagnose: Einstellungen von Ludwig und gemerkter Stand, Token bleibt). Wer alles will, tut beides. Hält der Owner am Gesamtknopf fest: nur in der Diagnose, Wortlaut **Verbindung trennen und gespeicherte Daten löschen**, nie „zurücksetzen“ | ja |

## Was hier nicht hingehört

- Zeitraum, Schritte, Umgebung auf der Hauptseite (nur Diagnose).
- „Sync“, „Lauf“, „DUO“, „BEDI“, „Export“ in Nutzertexten (`begriffe.md`).
- DATEV-Marken, -Farben oder -Logos.
- Ein dunkler Modus (Simon 2026-11-27: helle Darstellung).

## Entschieden (Owner 2026-11-27: wie entworfen)

1. U1 und U5: Übersicht eingeklappt in „Bereit · alle“ statt eigenem Schritt;
   Schritte als Zeilen statt waagerechtem Abschnittsbalken. Ohne Antwort: so
   wie hier entworfen.
2. U13: kein Rückfrage-Dialog beim Anhalten. Ohne Antwort: kein Dialog.
3. U11 und U14: vierter Popup-Zustand und Link „Belege in Ludwig ansehen“
   (braucht eine Ludwig-Adresse je Mandant). Ohne Antwort: beides im Entwurf,
   der Link entfällt, solange es keine Adresse gibt.

## Zweifel am heutigen Format

Keine Route, keine App-Entität: Die Kopfzeilen „Route“ und „Entitäten“ passen
nur halb. Das Profil beschreibt zwei Flächen einer Erweiterung statt einer
App-Seite; die Fragen-Tabelle steht deshalb nur für den Reiter Abgleich, die
anderen Reiter haben je eine Zustandstabelle.
