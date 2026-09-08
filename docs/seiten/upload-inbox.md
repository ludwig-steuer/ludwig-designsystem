# Upload & Inbox — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/document-inbox/page.tsx` — am 2026-09-05 gelöscht, **seit 2026-09-08 wieder gebaut** und nach diesem Profil in Betrieb |
| Heute gebaut in | nichts. Das Modul lebt: `modules/document-inbox/` — `ui/DocumentInbox.tsx` (Vorlage, nicht Vorbild), `ui/ClassificationEditor.tsx`, `application/*`, `server.ts` |
| Entitäten | Beleg (`source-document`) · Klassifikation |
| Baustein in v3 | noch keiner |
| Fachliche Quelle | `ludwig/app`: `docs/topics/belege.md`, `docs/backlog/seitenrueckbau-2026-09.md` |
| Profil von / am | Claude, 2026-09-06 · aus dem Rückbau-Dokument und dem erhaltenen Modul |

Dieses Profil war die **Vorgabe für einen Neubau**: die Seite wurde mit dem
Rückbau vom 2026-09-05 gelöscht, weil sie neu entstehen sollte. Sie ist am
2026-09-08 nach diesem Profil gebaut worden und läuft — die Zeilen unten
beschreiben also wieder einen Screen, nicht mehr eine Absicht.

*(Der Satz „hier steht heute gar nichts" blieb drei Tage länger stehen als er
stimmte und hat sich weitergetragen: das Jobs-Register hat daraus fünf Jobs
als unbedient geführt, die längst einen Ort haben — berichtigt 2026-09-08.)*

## Job — J-10

> Wenn **ein Mandant Papier geschickt hat**, will **die Sachbearbeiterin der
> Kanzlei** **es in Ludwig haben und wissen, dass es angekommen und richtig
> erkannt ist**, damit **die Verarbeitung ohne ihr Zutun weiterläuft und sie
> nichts zweimal anfassen muss**.

- **Fertig ist sie, wenn** jede hochgeladene Datei eine Einordnung trägt, der
  sie zustimmt — oder sie die Einordnung korrigiert hat. Nicht: „alle Dateien
  sind hochgeladen".
- **Misslungen ist die Seite, wenn** sie glaubt, fertig zu sein, während der
  Klassifikator noch läuft oder gescheitert ist. Ein stiller Hänger ist hier
  teurer als ein sichtbarer Fehler: der Beleg fehlt später im Monat, und
  niemand weiß, warum.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Wie bekomme ich das hier rein?" | Ablagefläche, die den ganzen Bereich annimmt — Drag & Drop und Dateiauswahl gleichwertig | `FileDrop` |
| 2 | „Ist es angekommen?" | Zeile je Datei, sofort nach dem Ablegen sichtbar, mit Fortschritt je Datei | `LogList` oder `DataTable` mit `Progress` |
| 3 | „Was hat Ludwig darin erkannt?" | Belegform, Richtung, Gegenpart, Kurzfassung je Zeile | `SourceDocumentFacts` |
| 4 | „Stimmt das?" | Korrektur an derselben Zeile, ohne Seitenwechsel | `InlineEdit` · `ChoicePrompt` |
| 5 | „Was ist mit dem, was nicht ging?" | Fehlerzeile mit Grund und genau einer Handlung: neu verarbeiten oder löschen | `StatusBadge` (Achse `beleg_inbox`) · `ActionButton` |
| 6 | „Und jetzt?" | Was als Rechnung erkannt wurde, geht an die Verarbeitung; woraus ein Sachverhalt werden soll, wird einer | `ActionBar` |

Rang 2 und 3 sind der Kern. Die Klassifikation braucht Sekunden bis Minuten;
in dieser Zeit muss die Zeile **sagen, dass sie arbeitet** — sonst liest sich
eine leere Einordnungsspalte wie „nichts erkannt".

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Dublette erkennen und verwerfen | bei jedem größeren Stapel (geschätzt) | eine Zeile mit Hinweis, keinen Dialog |
| Sammel-PDF in Einzelbelege trennen | selten, aber teuer wenn übersehen | einen Knopf an der Zeile |
| Einen Beleg löschen, der nicht hierher gehört | selten | einen Klick mit Rückfrage |

## Was hier nicht hingehört

- **Das Wirtschaftsjahr.** Die Seite hängt bewusst nicht am Jahr — ein Mandant
  schickt, was er schickt. Ein Jahres-Segment stand schon einmal in der URL
  und ist bewusst wieder entfernt worden; Belege ohne erkanntes Datum fielen
  sonst aus jeder Ansicht.
- **Die Buchung.** Hier wird eingeordnet, nicht gebucht. Wer bucht, ist auf
  dem Sachverhalt.
- **Eine Liste aller Belege des Mandanten.** Das ist die Belegliste. Diese
  Seite zeigt den Eingang, nicht den Bestand — sonst wird sie zur zweiten
  Belegliste mit eigenem Filter, und genau die wurde 2026-09-05 gelöscht.

## Zweifel am heutigen Format

Es gibt kein heutiges Format mehr. Die drei Punkte, an denen die alte Seite
schwach war und der Neubau es besser machen sollte:

1. **Der Fortschritt war global, der Zustand je Zeile.** Ein Sammel-Upload
   von zehn Dateien zeigte einen Balken und darunter zehn Zeilen in
   verschiedenen Stufen. Wer wissen wollte, ob Datei 7 durch ist, musste
   suchen. Der Zustand gehört an die Zeile, und nur dorthin.
2. **Der Worker war unsichtbar.** Ohne laufenden TS-Worker bleibt jeder
   Eingang auf `pending_classification` stehen — die Seite sagte das nicht,
   sie sah nur langsam aus. Ein Eingang, der länger als erwartet wartet,
   muss das benennen. **Umgesetzt am 2026-09-08, und damit eine Regel dieser
   Seite:** nach **drei Minuten** im selben Zustand sagt die Zeile „Wartet
   seit n Minuten — läuft der Verarbeitungs-Worker?". Die Zahl gehört in den
   Satz, nicht in einen Tooltip: sie ist der Unterschied zwischen „langsam"
   und „steht". Drei Minuten, weil die Einordnung im Normalfall unter einer
   bleibt — wer die Grenze verschiebt, verschiebt sie hier, nicht im Code
   der Seite.
3. **Zwei Wege zur Verarbeitung.** „Als Rechnung übergeben" und „Sachverhalt
   anlegen" standen gleichwertig nebeneinander, ohne dass die Seite sagte,
   wann welcher gilt. Der Neubau sollte den Regelfall zeigen und den anderen
   im Menü führen.

## Vorbedingungen für den Bau

Aus `ludwig/app`, Stand 2026-09-06:

- Alle Server-Einstiege stehen bereit (`listInboxForClient`,
  `prepareDocumentUpload`/`finalizeDocumentUpload`, `listInboxEntries`,
  `manage-actions`, `submit-actions`, `case-creation-actions`).
- Grenzen des Uploads: 25 MB je Datei, 100 MB je Anfrage, 10 Dateien je
  Anfrage. Die Liste lief bisher mit 2 s Polling.
- Die Achse `beleg_inbox` trägt die vier Zustände
  (`pending_classification` · `classified` · `classification_failed` ·
  `deleted`) samt Erklärung; die Seite braucht dafür keine eigene Legende.
- Offen im Set: eine Ablagefläche für Dateien (`FileDrop`) und die
  Beleg-Familie (0074–0076).
