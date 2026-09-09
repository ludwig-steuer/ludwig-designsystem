# 0138 · Ein Rahmen für Detailseiten — oder drei mit denselben Slot-Namen

| | |
|---|---|
| Status | **entschieden 2026-09-09 (Owner)** — Weg 2 jetzt, Weg 1 mit 0127; die Folgeaufgaben stehen unten |
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

## Entschieden am 2026-09-09 (Owner): die Namen jetzt, der Rahmen mit 0127

**Weg 2 sofort, Weg 1 später — mit benanntem Auslöser.**

1. **Jetzt** werden nur die Slot-Namen vereinheitlicht: `signal` statt
   `nextAction` und `banner`, `aside` überall. Drei abgenommene Bausteine
   werden dabei nicht in ihrer Struktur angefasst, nur umbenannt — das Risiko
   ist eine Umbenennung, kein Umbau.
2. **Mit 0127** (`BusinessPartnerView`) wird der gemeinsame Rahmen
   **herausgezogen**, statt einen vierten danebenzustellen. Das ist der
   Unterschied zu „später vielleicht": der Auslöser hat eine Nummer.

**Warum nicht sofort Weg 1.** Der Gewinn wäre heute eine Ähnlichkeit, kein
Beleg. Drei Rahmen mit derselben Struktur können immer noch drei Rahmen sein,
die zufällig gleich aussehen; erst der vierte Fall zeigt, ob die Struktur
trägt oder ob jeder Rahmen seinen eigenen Zusatz braucht. Bis dahin wären die
in Abnahmen erkämpften Randspaltenbreiten (460 px neben den Fakten, 960 px
neben der siebenspaltigen Tabelle) als Props durch einen Rahmen gewandert, der
sie nicht kennt.

**Warum nicht Weg 3.** Der Standard beschreibt die drei in **einer**
Slot-Reihe. Eine Regel, die sagt „jede Entität baut ihren eigenen Rahmen",
müsste erklären, warum sie das trotzdem konnte.

### Folgeaufgaben

| Was | Wo | Kriterium |
|---|---|---|
| `nextAction` → `signal` | `CaseDetailView` (0050) | die 460-px-Randspalte bleibt gemessen gleich |
| `banner` → `signal` | `SourceDocumentView` (0071) | Markup zeichengleich außer dem Namen |
| `summary`/`chart` → `signal` + eigener Zusatz | `LedgerAccountView` (0063) | die 960-px-Randspalte bleibt gemessen gleich; `chart` bleibt als eigener Slot und wird in der Spec begründet |
| Rahmen herausziehen | **0127** | erst dort, mit den drei Breiten als Kriterium |

**Bis die Umbenennung läuft, gilt unverändert:** wer einen neuen Detailrahmen
baut, nimmt die Slot-Namen des Standards (`pager` · `header` · `signal` ·
`tabs` · `aside` + `children`) und begründet jeden zusätzlichen Slot in seiner
Spec.

## Abnahmekriterien

Diese Aufgabe endet nicht mit einer Komponente, sondern mit einem Entscheid.

- [ ] Der Owner hat einen der drei Wege gewählt, mit einem Satz Begründung
- [ ] Bei Weg 1 oder 2: eine Folgeaufgabe je berührtem Rahmen, mit den
      gemessenen Breiten als Kriterium
- [ ] `docs/detailseiten-standard.md` §1.1 nennt danach genau einen Satz
      Slot-Namen, und die Rahmen tragen ihn
