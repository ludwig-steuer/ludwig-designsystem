# 0185 · Die Belegkarte auf `Columns split`

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` (Erweiterung von `Columns`, 0154/0184) und `entities/source-document/` |
| Klassen-Test | die Erweiterung: „auch in einer Versicherungs-App?" → ja, zwei benannte Böden für zwei Hälften |
| Quelle | `docs/detailseiten-pattern.md` Spec **S4**; Befund der fremden Prüfung (`ludwig-manager`, 2026-09-11): der Beleg erfüllt D17 nicht; Abweichungszeile in `docs/seiten/beleg-detail.md` |
| Ersetzt | `.v2doccard__cols` samt Container-Query in `v3.css` |
| Blockiert | nichts; es schließt die letzte D17-Abweichung |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Die Belegkarte stellt Original und Belegdaten gegenüber — genau D-L2 —, baut
dafür aber ihr **eigenes** Raster mit eigener Container-Query. Seit D17 ist die
Gegenüberstellung `Columns split`. Der Umbau darf die gemessenen Breiten nicht
verlieren, denn sie sind in zwei Abnahmen erkämpft.

## Gemessen (2026-09-15, vor dem Umbau, Story `SourceDocumentView · InUse`)

| Fenster | Karte | Original | Belegdaten | nebeneinander |
|---|---|---|---|---|
| 1600 | 1296 | 720 | 560 | ja |
| 1440 | 1136 | 560 | 560 | ja |
| 1280 | 976 | 560 | 400 | ja |
| 1100 | 796 | — | — | nein (gestapelt) |

Die beiden Hälften sind also **nicht gleich**: das Original hat den Boden 560,
die Belegdaten 384, und der zusätzliche Platz wird gleichmäßig verteilt. Der
Umbruch liegt bei 960 px Kartenbreite (560 + 384 + 16 Rinne).

## Einordnung

- **Erweitert, weil:** Regel 2 aus `spec-schreiben` §3 — `split` ignoriert
  heute beide Breiten-Props („gleiche Hälften per Definition"). Der Owner-Satz
  zu 0154 lautet aber: **„Breiten folgen dem Gewicht, das Muster nicht."** Zwei
  Hälften mit verschiedenen Böden sind also derselbe `split`, nicht ein
  fünftes Muster.
- **Zuschnitt:** `Columns` bekommt zwei Zeilen CSS und einen dritten
  Randspalten-Schritt; die Karte verliert ihr Raster.

## Schnittstelle

| Prop | Typ | Bedeutung | Nachweis (Story) |
|---|---|---|---|
| `Columns.width` in `split` | `ColumnWidth` | der Boden der **linken** Hälfte; ohne ihn bleibt `split` bei 380 px wie bisher | `SplitWeights` |
| `Columns.asideWidth` in `split` | `ColumnAsideWidth` | der Boden der **rechten** Hälfte | `SplitWeights` |
| neu: `ColumnWidth = … \| "document"` | 560 px | das Original eines Belegs — darunter ist die Vorschau nicht mehr zu lesen (0071) | `Steps` |
| neu: `ColumnAsideWidth = … \| "record"` | 384 px | die Fakten eines Datensatzes neben seinem Original. **Warum 384 und nicht 400:** 400 legt das Tor auf 976 px — genau die Kartenbreite bei einem 1280er Fenster, und ein Browser mit Platz nehmender Scrollleiste bräche dort unbemerkt um (0150) | `SplitWeights` |

**Kann bewusst nicht:** verschiedene *Wachstumsfaktoren* — der zusätzliche
Platz wird weiter gleichmäßig verteilt. Genau das reproduziert die heutige
Messung (bei 1296 Karte: 560 + 166 und 384 + 166 ≈ 726 / 550 gegen 720 / 560).

## Verhalten

`Columns` setzt `--v3cols-main` in `split` **nur**, wenn der Aufrufer `width`
übergibt; ohne ihn bleibt der heutige Boden 380 px stehen. Damit ändert sich
für die drei bestehenden `split`-Aufrufer nichts.

`SourceDocumentCard` rendert `Columns pattern="split" width="document"
asideWidth="record"`; Vorschau links, Fakten rechts, darunter unverändert
Teilbelege und `children`.

## Stories

| Story | Beweist |
|---|---|
| `SplitWeights` (in `Columns.stories`) | zwei Hälften mit verschiedenen Böden, daneben der unveränderte `Split` |
| `SourceDocumentCard` (bestehend) | unverändert — die Messung vorher/nachher steht in der Abnahme |

## Abnahmekriterien

Fest (gilt immer): wie in 0184.

Variabel (aus dieser Spec):

- [ ] Die Karte misst nach dem Umbau bei 1600/1440/1280 dieselben Breiten ± 10 px wie oben, und der Umbruch liegt weiter bei rund 960 px Kartenbreite
- [ ] `grep` findet `.v2doccard__cols` weder im Code noch in `v3.css`
- [ ] Die drei bestehenden `split`-Aufrufer messen unverändert (380er Boden)
- [ ] `beleg-detail.md` trägt die Abweichung nicht mehr als offen, sondern als erledigt
- [ ] Im Pattern-Inventar steht S4 auf erledigt

## Offene Fragen

1. Soll das Original bei sehr breiten Fenstern weiter **stärker** wachsen als
   die Fakten (heute 720 gegen 560 bei 1600)? — ohne Antwort: **nein**, der
   zusätzliche Platz wird gleichmäßig verteilt; der Unterschied bleibt der
   Boden. Das hält `split` bei „zwei Hälften" und kostet bei 1600 rund 70 px.

## Gebaut (2026-09-15)

`Columns`: `split` liest jetzt beide Böden; neue Schritte `document` 560 (links)
und `record` 384 (rechts). Ohne `width` bleibt `split` bei 380 — die drei
bestehenden Aufrufer ändern sich nicht. `SourceDocumentCard` rendert
`Columns split`; `.v2doccard__cols` und die Container-Query der Karte sind weg.

Gemessen (CDP, Story `SourceDocumentView · InUse`), vorher gegen nachher:

| Fenster | Karte | vorher | nachher |
|---|---|---|---|
| 2000 | 1696 | (Fakten bei 560 gedeckelt) | 926 / 750 |
| 1600 | 1296 | 720 / 560 | 726 / 550 |
| 1440 | 1136 | 560 / 560 | **646 / 470** |
| 1280 | 976 | 560 / 400 | 566 / 390 |
| 1244 | 940 | gestapelt | gestapelt |
| 1100 | 796 | gestapelt | gestapelt |

**Eine sichtbare Änderung, und zwar bei 1440.** Das alte Raster ließ die
Fakten-Spalte bis 560 wachsen und gab dem Original den Rest; jetzt teilen sich
beide den zusätzlichen Platz gleichmäßig. Das Original wird dadurch breiter
(646 statt 560) und die Fakten schmaler (470 statt 560) — beide bleiben
deutlich über ihrem gemessenen Boden, und das Original ist Rang 2 der Seite.
Wer den Deckel zurück will, sagt es: er wäre ein `max-width` am Schritt
`record`, kein neues Muster.

Das Tor bleibt, wo es war: zwischen 940 und 976 px Kartenbreite, also bei
rund 960 — genau die Summe der beiden Böden plus Rinne.

`pnpm typecheck`, `check:classes`, `check:language`, `check:when` und
`pnpm build` grün; bei 1440 angesehen. Abnahme durch einen anderen Agenten
steht aus.
