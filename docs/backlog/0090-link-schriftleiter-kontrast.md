# 0090 · Der Link bricht aus der Schriftleiter, und sein Ton reißt den Kontrast

| | |
|---|---|
| Status | Abnahme |
| Stufe | `src/styles/v3.css` und `src/styles/tokens.css` |
| Quelle | Abnahme Paket 0019/0020/0021/0022/0028 und Paket 0010/0011/0012/0035/0036, beide 2026-09-05 |
| Auftrag | Zwei Befunde, die zusammengehören, weil sie denselben Baustein treffen. **(a)** `.v2link` (`v3.css` Z. 190) setzt `font: 600 12.5px` **fest**. Ein Link im 13,5-px-Fließtext wird damit kleiner und fetter als sein eigener Satz — gemessen in der Story `Markdown --filled`. Die Spec verspricht „die Schriftgröße kommt aus dem Umfeld"; richtig wäre `font-size: inherit`. **86 Bestandsstellen** hängen an der Klasse, deshalb keine Nebenbei-Änderung. **(b)** `--color-accent-700` (`#2E78A8`) misst auf Weiß **4,43:1** und bleibt damit als normal große Textfarbe unter den 4,5:1 aus V10; auf `--color-bg-soft` sind es 4,47:1. Der Token trägt als einziger im Satz **keinen** Kontrast-Kommentar. |
| Warum eine eigene Aufgabe | (a) ist ein Eingriff in 86 Stellen, (b) ändert einen Token, an dem jeder Link, jeder tertiäre Knopf und jede `info`-Marke hängt. Beides gehört gemessen und einmal entschieden. |
| Zu entscheiden | (a) `font-size: inherit` mit Sichtprüfung an den lautesten Stellen, oder eine zweite Klasse für Links im Fließtext? (b) Den Ton dunkler ziehen, bis er 4,5:1 hält — und dann prüfen, ob `--color-accent-700` als Flächenfarbe noch trägt? Jede Änderung an einem Token trägt ihren Kontrastwert als Kommentar (Regel A4). |
| Angelegt von / am | Claude, 2026-09-05 (aus zwei Abnahmen) |

## Erledigt 2026-09-06

**(a) Die Schriftgröße kommt jetzt aus dem Umfeld.** `.v2link` hatte
`font: 600 12.5px` — ein Link im 13,5-px-Fließtext war damit kleiner **und**
fetter als sein eigener Satz. Jetzt `font-family: inherit; font-size: inherit;
font-weight: 600`; fest bleibt nur das Gewicht, daran erkennt man ihn, und es
trägt in jeder Größe. Gemessen über **92 Stories mit `.v2link`**: die Größen
sind jetzt 13,5 px (70×), 16 px (66×), 13 px (38×), 12,5 px (12×), 12 px (2×)
und 11,5 px (2×) — also überall die des Umfelds statt einheitlich 12,5.

**(b) Der Ton hält jetzt 4,5:1, auch auf den weichen Gründen.** Der Auftrag
nannte 4,43:1 auf Weiß; nachgerechnet sind es **4,81:1** — auf Weiß hielt der
Ton also. Er riss dort, wo Links am häufigsten stehen: **4,44:1** auf
`--color-bg-soft` (jede zweite Karte, jede Tabelle) und **4,28:1** auf
`--color-accent-50` (die aktive Zeile im Master-Detail). Genau diese beiden
Werte hatte auch die 0100-Abnahme gemessen.

`--color-accent-700` steht jetzt auf `#2B6F9C`: **5,45 · 5,03 · 4,85** auf
Weiß, `bg-soft` und `accent-50`. Der Kontrastwert steht als Kommentar am Token
(Regel A4), zusammen mit dem alten Wert und dem Grund.

Damit ist auch der Befund M7 der 0014-Abnahme erledigt (die Schnellübernahme
im Hinweis maß 4,44:1 auf weichem Grund) und der Hinweis der 0100-Abnahme zum
Link auf `#f4f6f8`.
