# 0090 · Der Link bricht aus der Schriftleiter, und sein Ton reißt den Kontrast

| | |
|---|---|
| Status | fertig |
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
`--color-bg-soft` (jede zweite Karte, jede Tabelle) und **4,45:1** auf
`--color-accent-50` (die aktive Zeile im Master-Detail). Genau diese beiden
Werte hatte auch die 0100-Abnahme gemessen.

`--color-accent-700` steht jetzt auf `#2B6F9C`: **5,45 · 5,03 · 5,04** auf
Weiß, `bg-soft` und `accent-50`. Der Kontrastwert steht als Kommentar am Token
(Regel A4), zusammen mit dem alten Wert und dem Grund.

Damit ist auch der Befund M7 der 0014-Abnahme erledigt (die Schnellübernahme
im Hinweis maß 4,44:1 auf weichem Grund) und der Hinweis der 0100-Abnahme zum
Link auf `#f4f6f8`.

## Prüfung 2026-09-07 — fremd, Claude (nicht gebaut, kein Chatverlauf gelesen)

Alles unten ist **selbst gemessen**, nicht aus dem Text übernommen: Chromium
headless über CDP gegen den laufenden Dev-Server (`localhost:6107`, also die
Quelle, nicht `storybook-static`), Fenster 1440×900. Die Kontrastwerte sind aus
den **gerenderten** Farben gerechnet (WCAG-2-Relativluminanz), zweimal
unabhängig: einmal im Browser, einmal in Python.

### (a) Sitzt der Link in der Schriftleiter? — ja

| Nachweis | Gemessen |
|---|---|
| Regel, wie der Browser sie geladen hat (`document.styleSheets`, nicht die Quelldatei) | `.v2link { … font-family: inherit; font-size: inherit; font-weight: 600; color: var(--color-accent-700); … }` — kein `font`-Kurzschreiber mehr |
| `Markdown --filled` | Link **13,5 px**, Elternteil **13,5 px**; Zeilenhöhe **20,925 px** hier wie dort; Abstand der Grundlinie zum Nachbartext im selben Absatz **0,00 px** |
| `Markdown --long`, `--reader`, `--in-use` | 6 Links, alle 13,5 px = Umfeld, Grundlinien-Abstand je 0,00 px |
| Stichprobe **60 zufällige Stories** (Zufallszahl 7 aus `index.json`), 30 `.v2link` | Größen 16 px (12×), 13,5 px (7×), 13 px (5×), 11,5 px (4×), 12,5 px (2×) — **0 Abweichungen** zwischen Link und Elternteil |
| Gewicht | überall 600, bei `--quiet` 400 — fest bleibt also nur, was fest bleiben sollte |

Die im Text genannte Zählung über 92 Stories habe ich nicht nachgezählt; die
Größenfamilien decken sich mit meiner Stichprobe, und die entscheidende Aussage
(„Größe = Umfeld") hält über alle 30 gemessenen Vorkommen.

### (b) Hält der Ton 4,5:1? — ja, aber eine Zahl im Kommentar stimmt nicht

Tokens aus `getComputedStyle(document.documentElement)` gelesen:
`--color-accent-700: #2B6F9C`, `--color-bg-soft: #F4F6F8`,
`--color-accent-50: #F1F7FB`.

| Grund | selbst gerechnet | in der Aufgabe / im Token-Kommentar |
|---|---|---|
| Weiß | **5,45** | 5,45 ✓ |
| `--color-bg-soft` | **5,03** | 5,03 ✓ |
| `--color-accent-50` | **5,04** | 5,04 ✗ |

Gerendert gegengeprüft: über die 60 Stichproben-Stories ist der **niedrigste**
gemessene Linkkontrast **5,03** (Link auf `bg-soft`, u. a.
`SourceDocument --cell`, `InlineEdit --filled`); auf Weiß 5,45. Kein Vorkommen
unter 4,5.

Der alte Ton `#2E78A8` nachgerechnet: **4,81 · 4,44 · 4,45** — der Befund, dass
er genau dort riss, wo Links am häufigsten stehen, stimmt.

**Auflage.** Die beiden `accent-50`-Zahlen sind falsch: die Aufgabe und
`tokens.css` (Z. 32–34) nennen **5,04** (neu) und **4,45** (alt), gemessen und
zweimal nachgerechnet sind es **5,04** und **4,45**. `--color-accent-50` stand
nie auf einem anderen Wert (`git log -p --follow -- src/styles/tokens.css`
zeigt genau eine Zeile `--color-accent-50: #F1F7FB`), es ist also kein
Zeitreise-Effekt, sondern ein Rechenfehler. Alle übrigen Zahlen stimmen exakt,
und der Schluss dreht sich nicht — beide falschen Werte sind zu niedrig, die
Schwelle hält so oder so. Aber Regel A4 verlangt den **gemessenen** Wert am
Token, und der steht dort falsch; er wandert von hier in jede spätere Abnahme.
Bitte in `tokens.css` und in der Auftragszeile korrigieren.

### Werkzeuge (einmal für 0090/0091/0111)

`pnpm typecheck` → exit 0 · `pnpm build` → exit 0 (Storybook gebaut, nur die
bekannte Chunk-Größen-Warnung von Rolldown) · `pnpm check:icons` → exit 0
(„53 Zeichen in der Registry, 2 Datei(en) noch offen"). Kein Fehler, auch
keiner aus einer fremden Sitzung. Der Arbeitsbaum trug währenddessen Änderungen
anderer Sitzungen (`src/styles/v3.css`, `entities/invoice-line/*`); der Diff an
`v3.css` berührt weder `.v2link` noch einen `prefers-reduced-motion`-Block
(`git diff src/styles/v3.css | grep -c "v2link\|prefers-reduced-motion"` → 0),
die Messung oben ist davon also nicht betroffen.

### Ergebnis: **bestätigt**

Beide Befunde sind gemessen behoben. Offen bleibt die eine Auflage: die zwei
falschen `accent-50`-Kontrastwerte in `tokens.css` und in der Auftragszeile.

## Nach der Prüfung (2026-09-07): bestätigt, mit einer berichtigten Zahl

Die Prüfung hat beide Hälften unabhängig nachgemessen und bestätigt: der Link
sitzt in der Schriftleiter (Grundlinien-Versatz **0,00 px** zum Nachbartext,
über 60 Stories keine einzige Abweichung von Größe oder Zeilenhöhe), und der
Ton hält (**5,45** auf Weiß, **5,03** auf bg-soft, niedrigster gemessener Wert
über alle 60 Stories 5,03).

**Berichtigt:** zwei Zahlen im Token-Kommentar und in dieser Aufgabe waren
verrechnet — der Kontrast auf `accent-50` steht bei **5,04** (nicht 4,85), der
des alten `#2E78A8` bei **4,45** (nicht 4,28). Zweimal unabhängig
nachgerechnet, dazu von mir ein drittes Mal. `--color-accent-50` hatte nie
einen anderen Wert, es war also ein Rechenfehler, keine Geschichte. **Der
Schluss ändert sich nicht** — beide falschen Werte lagen zu niedrig, und der
alte Ton reißt die Grenze auf `accent-50` so oder so. Aber A4 will den
gemessenen Wert am Token, und der stand falsch da.
