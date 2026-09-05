# 0081 · CaseCard — der Sachverhalt als Karte im Mandantenportal

| | |
|---|---|
| Status | offen |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CaseCard`) und „Listen" (Zeile `PortalCaseList`) |
| Auftrag | Die Karte, die der **Mandant** von einem Sachverhalt sieht: Anzeigename, Nummer, Art, Betrag, Eröffnet, Zusammenfassung — darunter seine offenen Fragen und Belegwünsche als Unterlisten. Ersetzt `modules/client-portal/ui/PortalCaseList.tsx` (396 Z.). |
| Zeigt (Ränge) | 1, 3–4, 6, 8, 11; **kein** Zustand und **keine** Zuständigkeit — der Mandant sieht seine Aufgabe, nicht den Kanzlei-Stand |
| Vertagt, weil | die Fünf-Formen-Grenze aus `entitaet-analysieren` §9 mit `CaseCell`, `CaseRow`, `CaseFacts`, `CaseDetailView` (0050) und `CaseDrawer` (0052 Schritt 3) voll ist — und weil der Inhalt der Karte die Klärung ist: sie hängt am Profil `docs/entitaeten/clarification.md` und an `ClarificationCard`. |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

Die Spec schreibt `spec-schreiben`, wenn das Profil auf `geprüft` steht und die
fünf Formen der ersten Welle gebaut sind. Sie nimmt Datenpunkte, Ränge und
„ersetzt" aus dem Profil, nicht aus dem Chat.

Ein Befund fällt dabei mit an: das Portal baut die Antwort-Eingabe der Klärung
selbst nach, statt `AnswerInput` zu nutzen (Befund L-32).
