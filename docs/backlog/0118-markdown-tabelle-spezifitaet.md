# 0118 · Die Markdown-Tabelle trägt dieselbe Spezifitätsfalle

| | |
|---|---|
| Status | Abnahme |
| Stufe | `src/styles/v3.css` (`.v2mk__tbl`), `primitives/Markdown.tsx` |
| Quelle | Befund M3 der Abnahme des `:where()`-Umbaus (0106) — dort ausdrücklich als eigene Aufgabe vermerkt, weil er einer anderen Familie gehört |
| Auftrag | `.v2mk__tbl th, .v2mk__tbl td` steht auf Spezifität 0-1-1 und schlägt damit jede Regel, die nur an einer Klasse hängt. Heute harmlos — keine der Zellen trägt eine Klasse —, aber es ist dieselbe Bauform, die bei `.v2tbl` an einem Tag viermal zugeschnappt ist. |
| Angelegt von / am | Claude, 2026-09-07 |

## Warum das eine Aufgabe ist, obwohl heute nichts kaputt ist

Die Falle ist nicht der Fehler, sie ist die **Bauform**, die den Fehler
erzeugt: wer später eine Zahlenspalte, ein Polster oder eine Ausrichtung an
einer dieser Zellen braucht, schreibt eine Klassenregel (0-1-0), sie greift
nicht, und die naheliegende Abhilfe ist eine Gegen-Regel mit höherer
Spezifität. Bei `.v2tbl` sind so **sieben** Gegen-Regeln entstanden, bis 0106
den Reset auf `:where()` (0-0-0) gezogen hat. Der Kopf gehört mit hinein: bei
`.v2tbl` war es genau die Kopfregel (`text-align: left`, 0-1-1), die `.v2num`
schlug und die Zahlenspalten nach links fallen ließ.

## Abnahmekriterien

| Kriterium | Nachweis |
|---|---|
| Beide Regeln stehen in `:where()`, Reset **und** Kopf | `v3.css`, `:where(.v2mk__tbl th, .v2mk__tbl td)` und `:where(.v2mk__tbl th)` |
| Das Bild ändert sich nicht | dieselben Zellen vor und nach dem Umbau: Polster, Ausrichtung, Vertikalausrichtung, Gewicht, Farbe, Unterkante, Position und Maße identisch |
| Eine Klassenregel greift jetzt | Gegenprobe am lebenden Baum: eine Klasse mit `padding`, `text-align` und `font-weight` an einer Zelle setzt sich durch |
| Keine neue Gegen-Regel | `grep` auf `.v2mk__tbl` zeigt nur die zwei `:where()`-Regeln und die zwei Rahmenregeln |
| Wächter | `pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`, `check:mirror`, `check:when` je Exit 0 |

## Gebaut und gemessen (2026-09-07)

Gemessen gegen den Dev-Server `http://localhost:6107` über CDP, `getComputedStyle`
und `getBoundingClientRect`, Fenster 1280 × 900, sechs Stories von `Markdown`
(`Filled`, `Long`, `InUse`, `Reader`, `Variants`, `Flow`).

**Das Bild ist identisch.** Die alte Fassung wurde am lebenden Baum
wiederhergestellt, gemessen, und die neue wieder eingesetzt — also zwei echte
Läufe, keine Rechnung: **63 Zellen in 6 Stories, 0 Abweichungen, 0
Zellzahl-Unterschiede** über Polster, Ausrichtung, Vertikalausrichtung,
Gewicht, Farbe, Unterkante, `left`, Breite und Höhe.

**Die Falle ist zu.** Gegenprobe an derselben Story: eine zur Laufzeit
eingefügte Klasse `.probe { padding: 33px; text-align: right; font-weight: 200 }`
an einem `<th>` setzt sich jetzt durch — gemessen `padding: 33px`,
`text-align: right`, `font-weight: 200`. Vorher hätte `.v2mk__tbl th` (0-1-1)
alle drei geschlagen.

Es bleibt bei zwei Regeln; es ist keine Gegen-Regel entstanden.

**Status: Abnahme** — gebaut habe ich, abnehmen muss ein anderer.
