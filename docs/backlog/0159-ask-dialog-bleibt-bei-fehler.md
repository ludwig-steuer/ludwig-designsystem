# 0159 · Der Frage-Dialog bleibt bei einem Fehler offen

| | |
|---|---|
| Status | **gebaut 2026-09-10** — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `primitives/ActionButton` (0004, 0121) — wirkt durch `DataTable` (`rowAction` mit `ask`) und `Selection` (`BulkAction` mit `ask`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, unverändert: ein Dialog, der bei einem Fehler zugeht und die Eingabe verliert, ist überall falsch |
| Quelle | Befund beim Bau von 0128 (Annahme eines Vorschlags); Auftrag von `ludwig-manager` 2026-09-10: „bei Fehler bleibt der Dialog offen, der Fehlersatz steht am Feld, die Eingabe bleibt; Erfolg schließt wie bisher" |
| Ersetzt | nichts — Verhaltensänderung einer bestehenden Komponente |
| Blockiert | den Umbau von `AcceptCreditorForm` in der App (L-292) |
| Spec von / am | Claude, 2026-09-10 |

## Ziel

Die Sachbearbeiterin gibt im Dialog eine DATEV-Nummer ein und bestätigt. Der
Server meldet, die Nummer sei inzwischen vergeben. Heute schließt der Dialog
**vor** der Aktion, der Fehler steht neben dem Knopf, und die Eingabe ist weg —
sie muss den Dialog neu öffnen und von vorn tippen. Künftig bleibt der Dialog
offen, der Satz steht unter dem Feld, die Eingabe bleibt, und sie korrigiert an
Ort und Stelle. Nicht jeder Fehler lässt sich vorher prüfen: zwischen Prüfung
und Absenden kann die Nummer vergeben werden.

## Einordnung

- **Regel `spec-schreiben` §3 Nr. 2**: `ActionButton` deckt den Fall zu vier
  Fünfteln; das Fehlende ist eine Verhaltensentscheidung, die überall gilt, wo
  `ask` benutzt wird. **Keine neue Prop**: ein Schalter „Dialog bei Fehler
  offen lassen" hätte keinen Aufrufer, der ihn ausschalten will.
- **Nur `ask`.** Der reine Bestätigungsdialog (`confirm`) hat keine Eingabe,
  die verloren gehen könnte; er schließt weiter vor der Aktion, und sein Fehler
  steht wie bisher neben dem Knopf.

## Schnittstelle

**Unverändert.** `AskSpec<Input>` und `action: (input) => Promise<ActionResult>`
bleiben, wie sie sind; `render` bekommt weiter `{ value, set }`. Neu ist nur,
**wo** der Fehler steht und **wann** der Dialog schließt.

## Verhalten

| Moment | Vorher | Jetzt |
|---|---|---|
| Bestätigen (Knopf oder Enter) | Dialog schließt, Aktion läuft | Dialog bleibt, der Bestätigungsknopf zeigt „läuft" (`pendingLabel`), Abbrechen ist gesperrt |
| Aktion meldet `{ error }` oder wirft | Fehler neben dem Knopf, Eingabe verloren | Dialog bleibt offen, Satz als `role="alert"` unter dem Inhalt, Eingabe bleibt |
| Weitertippen nach einem Fehler | — | der Satz verschwindet — er gehört zur alten Eingabe |
| Aktion geht durch | Dialog war schon zu | Dialog schließt, Fokus zurück auf den Auslöser (V10) |
| Abbrechen / Escape / Kreuz | schließt | schließt, verwirft den Fehlersatz; während die Aktion läuft: nichts |
| Wieder öffnen | Stand `initial` | Stand `initial`, kein alter Fehlersatz |

## Stories

| Story | Beweist |
|---|---|
| `AskFails` (neu) | 70001 → Satz im Dialog, Eingabe bleibt; weitertippen löscht den Satz; andere Nummer → Dialog zu, Ergebnis daneben |
| `AskForTarget`, `AskInvalid` | unverändert: Erfolg schließt, `valid` sperrt |
| `Failed`, `WithConfirm` | unverändert: ohne `ask` steht der Fehler neben dem Knopf |

## Betroffene Aufrufer

Keine Codeänderung nötig; das Verhalten ändert sich für alle mit `ask`.

- **Set:** `DataTable` (`rowAction` mit `ask`), `Selection` (`BulkAction` mit
  `ask`), `src/showcase/partner/partner-list.tsx` (0128).
- **App** (`apps/web/src`): `modules/bank-transactions/ui/OffenePostenWorklist.tsx:271`,
  `modules/stapelabnahme/ui/Schritt1OhneBuchung.tsx:111`,
  `modules/document-inbox/ui/UploadInbox.tsx:373`.

## Abnahmekriterien

- [ ] `pnpm typecheck` und `check:language` grün
- [ ] `AskFails`: Fehler im Dialog, Eingabe bleibt, Satz geht beim Weitertippen, Erfolg schließt
- [ ] Während die Aktion läuft: Abbrechen gesperrt, Escape schließt nicht
- [ ] `AskForTarget`, `AskInvalid`, `WithConfirm`, `Failed` verhalten sich wie vorher
- [ ] `Seiten/Geschäftspartner/Liste/Proposals`: der Rundlauf aus 0128 geht weiter durch

## Messung (CDP, 1440 × 900)

| Kriterium | Ergebnis |
|---|---|
| `pnpm typecheck`, `check:language` | grün |
| `AskFails`, während die Aktion läuft | ✓ Dialog offen, „Abbrechen" gesperrt, Escape schließt nicht |
| `AskFails`, Fehler (70001) | ✓ Dialog bleibt, Eingabe „70001" bleibt, Satz „Die Nummer 70001 ist inzwischen vergeben." im Dialog, **nichts** neben dem Knopf |
| `AskFails`, weitertippen | ✓ der Satz verschwindet |
| `AskFails`, Erfolg (70002) | ✓ Dialog zu, „Konto 70002 angelegt." daneben |
| `Failed` (ohne Dialog) | ✓ unverändert: Fehler neben dem Knopf |
| `AskForTarget` | ✓ unverändert: Erfolg schließt, „Zugeordnet an 2026-0412." |
| 0128 `Proposals` | ✓ 123 gesperrt · 70001 Satz im Dialog · 70500 legt an, 18 → 17, Toast |
| Escape und Enter | `Dialog` meldet seinen Tastatur-Handler bei jeder neuen `onClose`/`onConfirm` neu an — kein veralteter Stand |

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: — (nicht durch den Bauenden)
