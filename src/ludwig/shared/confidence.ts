/**
 * # Konfidenz — Band und Ampelstufe
 *
 * EINE Ableitung von der rohen Konfidenz zur Darstellung. Vorher lagen vier
 * eigene Schwellensätze in der App (85/70/50 an der Satz-Ampel, 0,8/0,5 an
 * der Rechnungs-Prozentzahl, 85/60 am Konfidenz-Messer, 85/70/55/40 am
 * breiten Band) — dieselbe Zahl bekam je nach Bildschirm eine andere Farbe
 * und ein anderes Wort.
 *
 * Der Wertebereich ist **nicht** hier zu Hause: die Bänder und ihre Schwellen
 * gehören `buchassi_shared.confidence_to_band`
 * (`apps/shared/src/buchassi_shared/interpretation.py`, GLOSSARY
 * „Confidence band"). Diese Datei ist der TypeScript-Spiegel davon. Ändern
 * sich die Schwellen, ändern sie sich dort zuerst.
 *
 * Bewusst ohne Import: die Datei wird gespiegelt (`sync-ludwig.sh`) und darf
 * nichts aus `ui/` oder `modules/` ziehen.
 */

/**
 * Die fünf Bänder, aufsteigend. LLMs sind in nackten Prozentwerten
 * kalibrationsschwach — „mittel" liest sich für den Prüfer ehrlicher als
 * „61 %". Der Float bleibt daneben stehen: er ist die Rechengröße
 * (Sortierung, Schwellwerte), das Band ist das Etikett.
 */
export const CONFIDENCE_BANDS = [
  "sehr_niedrig",
  "niedrig",
  "mittel",
  "hoch",
  "sehr_hoch",
] as const;

export type ConfidenceBand = (typeof CONFIDENCE_BANDS)[number];

/** Band → Wort für die Oberfläche. */
export const CONFIDENCE_BAND_LABEL: Record<ConfidenceBand, string> = {
  sehr_niedrig: "sehr niedrig",
  niedrig: "niedrig",
  mittel: "mittel",
  hoch: "hoch",
  sehr_hoch: "sehr hoch",
};

/**
 * Rohwert → ganzzahliger Prozentwert, oder `null`.
 *
 * Toleriert beide Schreibweisen, weil die App historisch beide führt: `0…1`
 * (so kommt es aus Python und aus der DB) und `0…100` (so steht es an
 * einigen UI-Grenzen). Ein Wert über 1 gilt als Prozent.
 */
export function confidencePercent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Math.round(value <= 1 ? value * 100 : value);
}

/**
 * Rohwert → Band. Spiegel von `confidence_to_band`.
 *
 * Schwellen exklusiv unten, inklusiv oben: genau 0,30 ist `niedrig` (nicht
 * `sehr_niedrig`), genau 0,85 ist `hoch` (nicht `sehr_hoch`). Werte außerhalb
 * `[0, 1]` werden geklemmt; `null` bleibt `null`, weil „keine Angabe" etwas
 * anderes ist als „null Prozent".
 */
export function confidenceBand(value: number | null | undefined): ConfidenceBand | null {
  const pct = confidencePercent(value);
  if (pct == null) return null;
  const v = Math.min(100, Math.max(0, pct)) / 100;
  if (v < 0.3) return "sehr_niedrig";
  if (v < 0.5) return "niedrig";
  if (v < 0.7) return "mittel";
  if (v <= 0.85) return "hoch";
  return "sehr_hoch";
}

/** Die vier Ausprägungen der Registry-Achse `konfidenz`. */
export type ConfidenceLevel = "green" | "yellow" | "orange" | "red";

/**
 * Band → Ampelstufe. Die Achse hat vier Farben, die Skala fünf Wörter — die
 * beiden unteren Bänder teilen sich `red`, weil „unter der Hälfte" für den
 * Prüfer dieselbe Handlung auslöst: nicht ungeprüft freigeben.
 */
const BAND_LEVEL: Record<ConfidenceBand, ConfidenceLevel> = {
  sehr_niedrig: "red",
  niedrig: "red",
  mittel: "orange",
  hoch: "yellow",
  sehr_hoch: "green",
};

/**
 * Rohwert → Ampelstufe der Achse `konfidenz`, oder `null` ohne Angabe.
 *
 * Der einzige Weg von einer Konfidenz zu einer Farbe. Die Farbe selbst kommt
 * weiterhin aus der Status-Registry (`resolveStatus("konfidenz", level)`) —
 * hier fällt nur die Stufe.
 */
export function confidenceLevel(value: number | null | undefined): ConfidenceLevel | null {
  const band = confidenceBand(value);
  return band == null ? null : BAND_LEVEL[band];
}
