/**
 * Welcher Schritt der Pipeline eine Spur geschrieben hat, in Worten.
 *
 * **Zwei Schreibweisen, dasselbe Modul.** `client_invoice_traces.module` trägt
 * historisch beide Konventionen: den kurzen Namen (`interpreter`, 1480 Spuren)
 * und den Paketnamen (`invoice-interpreter`, 839) — dasselbe für Extraktion
 * (481 / 264) und Klassifizierung (471 / 113), gemessen auf Staging am
 * 2026-09-10. Beide zeigen hier auf ein Wort; sonst liest die Verarbeitung
 * dieselbe Stufe zweimal verschieden.
 *
 * Der Rohwert bleibt sichtbar, wo kein Wort hinterlegt ist — ein unbekanntes
 * Modul ist eine Nachricht, keine Lücke.
 */
export const TRACE_MODULE_LABEL: Record<string, string> = {
  classifier: "Klassifizierung",
  "document-simple-classifier": "Klassifizierung",
  preprocessor: "Extraktion",
  "invoice-preprocessor": "Extraktion",
  interpreter: "Interpretation",
  "invoice-interpreter": "Interpretation",
  fx_normalization: "Währungsumrechnung",
  workflows: "Ablaufsteuerung",
  booking: "Buchungsvorschlag",
  judge: "Prüfung",
  review: "Sichtung",
};

export function traceModuleLabel(module: string): string {
  return TRACE_MODULE_LABEL[module] ?? module;
}
