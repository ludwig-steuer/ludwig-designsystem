# 0138 · Ein Rahmen für Detailseiten — oder drei mit denselben Slot-Namen

| | |
|---|---|
| Status | offen — **Entscheidungsaufgabe**, kein Bauauftrag |
| Stufe | `patterns/` (falls gebaut) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: der Rahmen kennt keine Entität, nur Slots |
| Quelle | `docs/detailseiten-standard.md` D3/D5 |
| Ersetzt | ggf. `CaseDetailView` (0050), `SourceDocumentView` (0071), `LedgerAccountView` (0063) — oder nur deren Slot-Namen |
| Blockiert | **0127 `BusinessPartnerView`** — der vierte Rahmen entsteht, bevor entschieden ist, ob es einen geben soll |
| Spec von / am | noch keine — Befund von Claude, 2026-09-08 |

## Ziel

Drei Detailrahmen sind gebaut, und sie sind einander so ähnlich, dass der
Detailseiten-Standard sie in **einer** Slot-Reihe beschreiben konnte: Pager ·
Kopf · Signal · Reiter · Körper. Verschieden sind nur die Namen und je ein
Zusatz:

| Rahmen | Slots |
|---|---|
| `CaseDetailView` (0050) | `pager` · `header` · **`nextAction`** · `tabs` · `aside` + `children` |
| `SourceDocumentView` (0071) | `pager` · `header` · **`banner`** · `tabs` · `children` |
| `LedgerAccountView` (0063) | `pager` · `header` · **`summary`** · **`chart`** · `tabs` · `aside` + `children` |

Derselbe dritte Slot heißt dreimal anders, und alle drei tragen dieselbe
Sorte Inhalt: was für den ganzen Datensatz gilt und nicht auf einen Reiter
warten kann. Wer den vierten Rahmen baut, entscheidet die Frage zum vierten Mal
neu — und mit 0127 (`BusinessPartnerView`) steht der vierte an.

## Was die Spec entscheiden muss

Drei Wege, mit unterschiedlichem Preis:

1. **Ein `DetailView` in `patterns/`** mit den fünf Slots des Standards; die
   drei Entitäts-Rahmen werden dünne Aufrufer oder verschwinden. Gewinn: der
   Standard hat einen Träger, `0127` erbt ihn. Preis: die gemessenen
   Randspalten-Breiten (460 px neben Fakten, 960 px neben der siebenspaltigen
   Tabelle — beide in Abnahmen erkämpft) müssen als Prop mitwandern, und ein
   Rahmen, der `summary` und `chart` kennt, kennt schon halb die Kontoseite.
2. **Nur die Namen vereinheitlichen** (`signal` statt `nextAction`/`banner`;
   `aside` überall), die drei Rahmen bleiben. Gewinn: billig, kein Risiko für
   drei abgenommene Bausteine. Preis: die Dopplung bleibt, und der vierte
   Rahmen kommt trotzdem.
3. **Nichts tun** und im Standard festhalten, dass der Rahmen eine
   Entitätsangelegenheit ist. Dann muss D3 sagen, warum dieselbe Struktur
   viermal gebaut wird.

Die Entscheidung gehört dem Owner, weil sie drei abgenommene Aufgaben berührt.
**Bis sie fällt, gilt:** wer einen neuen Detailrahmen baut, nimmt die
Slot-Namen des Standards (`pager` · `header` · `signal` · `tabs` · `aside` +
`children`) und begründet jeden zusätzlichen Slot in seiner Spec.

## Abnahmekriterien

Diese Aufgabe endet nicht mit einer Komponente, sondern mit einem Entscheid.

- [ ] Der Owner hat einen der drei Wege gewählt, mit einem Satz Begründung
- [ ] Bei Weg 1 oder 2: eine Folgeaufgabe je berührtem Rahmen, mit den
      gemessenen Breiten als Kriterium
- [ ] `docs/detailseiten-standard.md` §1.1 nennt danach genau einen Satz
      Slot-Namen, und die Rahmen tragen ihn
