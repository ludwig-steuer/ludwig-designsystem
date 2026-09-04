# 0058 · ClarificationDrawer

| | |
|---|---|
| Status | offen |
| Stufe | `entities/clarification/` |
| Klassen-Test | nein — „Klärung" ist ein Ludwig-Fachwort |
| Quelle | Entitätsprofil `docs/entitaeten/clarification.md` §Formen, §Zuschnitt (2026-09-04) |
| Ersetzt | noch nichts — heute führt der Verweis in `RationaleSources` auf die Sachverhaltsseite |
| Blockiert | nichts |
| Spec von / am | — (Auftrag, noch keine Spec) |

## Auftrag

Eine beantwortete Klärung wird aus der Begründung einer Buchung heraus
verwiesen (`RationaleSource.kind='clarification'`, 31 % der Klärungen tragen
selbst Quellen). Wer sie dort nachschlagen will, verlässt heute den Vorgang
und landet auf der Sachverhaltsseite. Regel 5 aus `entitaet-analysieren` §7
trifft dem Grunde nach zu: die Frage taucht mitten in der Arbeit an einer
anderen Entität auf.

## Warum vertagt

Der Bedarf ist **nicht belegt** — kein Screen zeigt heute einen Drawer für
eine Klärung, und ohne `ClarificationView` (verworfen: das Detail einer
Klärung ist der Sachverhalt) wäre der Drawer nur die `ClarificationCard` im
Rahmen. Solange `EntityDrawer` (0052) plus Karte das leisten, entsteht hier
keine eigene Komponente.

## Wieder aufnehmen, wenn

- eine Ansicht auf eine Klärung verweist und den Kontext dahinter nicht
  verlieren darf (Buchungs-Begründung, Prüfpunkt), **oder**
- der Klärungs-Faden im Datenmodell existiert (Befund B8) und eine Gegenfrage
  ihre Vorgängerin zeigen muss.

Dann: Spec mit `spec-schreiben`, Quelle bleibt das Entitätsprofil.
