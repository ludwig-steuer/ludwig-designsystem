# 0090 · Der Link bricht aus der Schriftleiter, und sein Ton reißt den Kontrast

| | |
|---|---|
| Status | offen |
| Stufe | `src/styles/v3.css` und `src/styles/tokens.css` |
| Quelle | Abnahme Paket 0019/0020/0021/0022/0028 und Paket 0010/0011/0012/0035/0036, beide 2026-09-05 |
| Auftrag | Zwei Befunde, die zusammengehören, weil sie denselben Baustein treffen. **(a)** `.v2link` (`v3.css` Z. 190) setzt `font: 600 12.5px` **fest**. Ein Link im 13,5-px-Fließtext wird damit kleiner und fetter als sein eigener Satz — gemessen in der Story `Markdown --filled`. Die Spec verspricht „die Schriftgröße kommt aus dem Umfeld"; richtig wäre `font-size: inherit`. **86 Bestandsstellen** hängen an der Klasse, deshalb keine Nebenbei-Änderung. **(b)** `--color-accent-700` (`#2E78A8`) misst auf Weiß **4,43:1** und bleibt damit als normal große Textfarbe unter den 4,5:1 aus V10; auf `--color-bg-soft` sind es 4,47:1. Der Token trägt als einziger im Satz **keinen** Kontrast-Kommentar. |
| Warum eine eigene Aufgabe | (a) ist ein Eingriff in 86 Stellen, (b) ändert einen Token, an dem jeder Link, jeder tertiäre Knopf und jede `info`-Marke hängt. Beides gehört gemessen und einmal entschieden. |
| Zu entscheiden | (a) `font-size: inherit` mit Sichtprüfung an den lautesten Stellen, oder eine zweite Klasse für Links im Fließtext? (b) Den Ton dunkler ziehen, bis er 4,5:1 hält — und dann prüfen, ob `--color-accent-700` als Flächenfarbe noch trägt? Jede Änderung an einem Token trägt ihren Kontrastwert als Kommentar (Regel A4). |
| Angelegt von / am | Claude, 2026-09-05 (aus zwei Abnahmen) |
