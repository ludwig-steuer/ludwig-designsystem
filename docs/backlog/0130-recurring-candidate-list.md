# 0130 · RecurringCandidateRow + RecurringCandidateList — Dauersachverhalte aus DATEV übernehmen

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/recurring-candidate/` (eigener Ordner — der Kandidat ist eine andere Entität als die Regel, siehe Quelle) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Belegnummer, DATEV-Buchungshistorie, Personenkonto, Übernahme-Klasse |
| Quelle | Entitätsprofil `docs/entitaeten/recurring-rule.md`, Abschnitte „Der Kandidat — was noch keine Regel ist", „Listen" (dritte Zeile) und „Formen" (Zeile `RecurringCandidateRow` + `RecurringCandidateList`) |
| Auftrag | Die Liste der aus der DATEV-Buchungshistorie abgeleiteten Dauersachverhalt-Kandidaten in der Onboarding-Übernahme: je Zeile ein Kandidat mit seiner Übernahme-Klasse, auswählbar, in einem Zug bestätigt. Ersetzt `RecurringCandidatesTable` — 100 Zeilen inline in `app/(app)/admin/tenants/[tenantId]/clients/[clientId]/page.tsx` (Z. 812–911), einer Seitendatei von 952 Zeilen. |
| Warum nicht so lassen | Die Übernahme-Klasse wird dort als **vier handgeschriebene `Badge`-Zweige** gebaut (Z. 884–893), obwohl die Registry-Achse `dauersachverhalt_uebernahme` existiert und die **Kopfzeile derselben Tabelle** sie über `StatusHeader` schon benutzt (Z. 836–840). Die Zweige sind bereits abgedriftet: die Achse kennt `bereits_angelegt`, die Zelle schreibt „bereits angelegt", und das `⚠` für `reviewFlag` steht in keiner Achse (Befund L-251). Dazu zwei handgebaute Leerfälle statt `EmptyState` und keine „alle/keine"-Auswahl, obwohl je Zeile ein Kästchen steht. |
| Vertagt, weil | der Kandidat eine **zweite Entität** ist, der drei Dinge fehlen: ein GLOSSARY-Eintrag (Befund **L-246**), eine Tabelle (er entsteht on-read aus `ops_datev_ingest_staging`, ohne Persistenz) und ein Seitenprofil für die Onboarding-Übernahme unter `docs/seiten/`. Ohne das Seitenprofil sind Kopfzeile, Vorratszähler, Abschnittstext und die Frage „was passiert beim Bestätigen" geraten. Dazu hängt die Marke am Zuschnitt: die vier Formen der Wiederkehr-Regel gehen zuerst. |
| Offene Frage aus dem Profil | Frage 2 — „Bekommt der Dauersachverhalt-Kandidat ein eigenes Profil?" *Ohne Antwort gilt der Default:* er bleibt ein Abschnitt von `recurring-rule.md`, und diese Aufgabe wird erst geschrieben, wenn L-246 erledigt ist. |
| Setzt voraus | `StatusBadge` (Achse `dauersachverhalt_uebernahme`, im Spiegel vorhanden) · `SelectionScope`/`SelectionBar` (0057) · `EmptyState` · `JournalEntryCell` für die Vorlage-Zeilen · das Seitenprofil der Onboarding-Übernahme |
| Blockiert | nichts im Set. In der App blockiert es die Ablösung der Admin-Seitendatei |
| Angelegt von / am | Claude, 2026-09-08 (Skill `entitaet-analysieren` §9) |

## Was schon feststeht

Aus dem Entitätsprofil, damit die Spec es nicht neu erheben muss:

- **Identität** ist die Belegnummer (`documentNumber`), nicht eine Id — der
  Kandidat hat keine.
- **Zustand** ist die Achse `dauersachverhalt_uebernahme` mit vier Werten:
  `uebernehmen` · `bereits_angelegt` · `beendet_erkannt` · `nicht_uebernehmbar`.
  Zwei Fallstricke aus dem Registry-Kommentar, die die Form tragen muss:
  `bereits_angelegt` ist ein **Pseudowert der Oberfläche** (er kommt aus dem
  Flag `alreadyExists`, nicht aus `klass`, und überstimmt die Klasse in der
  Anzeige), und `nicht_uebernehmbar` heißt **nicht** „kommt nie" — der Fall
  kann später über den Beleg-Weg entstehen.
- `reviewFlag` ist **kein** fünfter Achsenwert. Er heißt „Lücke von zwei
  Intervallen oder mehrere Personenkonten — ein Mensch soll hinsehen" und
  gehört neben das Abzeichen, nicht hinein.
- **Heute gezeigte Spalten:** Kästchen · Belegnummer + `WK`-Abzeichen ·
  Personenkonto (Name, Nummer, Notizen) · Bruttosumme · Rhythmus · letzter
  Soll-Monat · Vorlage-Zeilen (heute zu **einem** Textstring verklebt) ·
  Übernahme-Klasse + Grund.
- **Heute unsichtbar, obwohl abgeleitet:** `description` (der
  **Titelvorschlag** des künftigen Sachverhalts), `direction`, `gapIntervals`,
  `sollMonths`, `templateMonth`, `validFrom`, `expectedDayOfMonth`,
  `documentLink`; `section.notes[]` wird nie gerendert.
- **Massenaktion:** heute nur Kästchen je Zeile
  (`name={"dsv:" + documentNumber}`, vorausgewählt), geerntet vom seitenweiten
  „Review abschließen & freigeben". Eine „alle/keine"-Auswahl fehlt.
- **Umfang** ist am Bestand nicht messbar (keine Persistenz). Belegbar ist nur
  das Ergebnis: 29 der 30 Regeln in Staging stammen aus bestätigten Kandidaten,
  über drei Mandanten.

## Was diese Datei nicht ist

Keine Spec. Auftrag, Quelle und Grund der Vertagung — die Spec schreibt später
`spec-schreiben` gegen das dann geprüfte Profil und das Seitenprofil der
Onboarding-Übernahme.
