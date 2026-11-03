/**
 * # Wie ein Beleg heißt
 *
 * Ein Beleg heißt nach dem, was auf ihm steht, nicht nach seiner Datei
 * (`docs/topics/belege.md` R32). Der Dateiname ist die Kennung des Scanners:
 * auf Staging tragen 74 % der Belege einen GUID-Namen, der niemandem sagt,
 * worum es geht — während Gegenpart (94 %), Datum (97 %) und Betrag (76 %)
 * dastehen.
 *
 * Die Kaskade, in dieser Ordnung:
 *   0. ein gesetzter Titel (F639, nur Belege ohne Rechnungsauslese, ≤ 60) — „eBay: Gebührenabrechnung Q4/2025"
 *   1. `Gegenpart · Betrag · Datum`   — „eBay S.à r.l. · 50,75 € · 09.07.2026"
 *   2. ohne Betrag tritt die Belegform an dessen Stelle
 *   3. ohne Gegenpart bleiben Form und Datum; bliebe nur das Datum, heißt er „Beleg vom <Datum>“ (L-379)
 *   4. erst wenn nichts erkannt ist, der Dateiname
 *
 * Die Belegnummer steht **nicht** im Namen: sie ist in Listen eine eigene
 * Spalte und in einem Viertel der Belege leer.
 *
 * Rein und ohne IO — dieselbe Datei wird ins Design-System gespiegelt, wie
 * `document-counterparty.ts` daneben.
 */

import { documentCounterparty } from "./document-counterparty";
import { formatDocumentForm } from "./document-form-labels";

export interface BelegNameFelder {
  /** F639: Kurztitel, den Ludwig in Schritt 1b setzt — nur bei Belegen ohne Rechnungsauslese. */
  title?: string | null;
  businessPartnerName?: string | null;
  docDirection?: string | null;
  vendorName?: string | null;
  customerName?: string | null;
  classCounterpartyName?: string | null;
  /** Brutto; ohne Währung wird nichts erfunden (GLOSSARY: kein stilles „€"). */
  grossValue?: number | string | null;
  currency?: string | null;
  /** `class_document_form` — die Form, die der Klassifizierer gelesen hat. */
  documentForm?: string | null;
  /** Belegdatum; das Eingangsdatum nur, wo der Aufrufer es schon einsetzt. */
  documentDate?: string | null;
  fileName?: string | null;
}

function betrag(value: number | string | null | undefined, currency: string | null | undefined): string | null {
  const n = typeof value === "string" ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return null;
  // Ohne Währung die nackte Zahl: ein erfundenes „€" auf einer
  // Fremdwährungsrechnung ist eine falsche Tatsache, keine Formatierung.
  return currency
    ? new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(n)
    : new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function datum(iso: string | null | undefined): string | null {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return m ? `${m[3]}.${m[2]}.${m[1]}` : null;
}

/** Die Form nur, wenn sie etwas sagt — „Unbekannt" ist kein Name. */
function form(value: string | null | undefined): string | null {
  if (!value || value === "unknown" || value === "other") return null;
  return formatDocumentForm(value);
}

/**
 * Der Anzeigename eines Belegs — überall, wo er benannt wird: Drawer-Kopf,
 * Quellen-Chip, Posten in der Abnahme, Beleg am Sachverhalt, Meldung des
 * Agenten.
 *
 * Gibt immer etwas zurück; bleibt jedes Feld leer, ist es „Beleg ohne
 * Kennzeichen" — nie ein leerer String, an dem eine Zeile unsichtbar wird.
 */
export function belegAnzeigename(f: BelegNameFelder): string {
  // Der Titel trägt seinen Zeitraum selbst — kein Betrag, kein Datum dahinter.
  const titel = f.title?.trim();
  if (titel) return titel;
  const gegenpart = documentCounterparty(f);
  const summe = betrag(f.grossValue, f.currency);
  const art = form(f.documentForm);
  // Mit Gegenpart führt der Betrag — er ist das Merkmal, an dem man einen
  // Beleg wiedererkennt. Ohne Gegenpart führt die Form: „50,75 € ·
  // 09.07.2026" ließe offen, was für ein Papier das ist.
  const tag = datum(f.documentDate);
  const teile = [gegenpart, gegenpart ? (summe ?? art) : (art ?? summe), tag];
  const name = teile.filter((t): t is string => !!t && t.length > 0).join(" · ");
  // L-379: ein nacktes Datum ist kein Name.
  if (tag && name === tag) return `Beleg vom ${tag}`;
  return name || f.fileName?.trim() || "Beleg ohne Kennzeichen";
}

/**
 * Der Kopf der Spalte Beleg in Tabellen (R32, DS 0212): Betrag und Datum stehen dort in eigenen Spalten, der Kopf
 * nennt nur, was der Beleg ist — Titel, sonst Gegenpart, sonst Form, sonst Dateiname. Hier gebaut, damit das
 * Design-System ihn nicht selbst ableitet (R27).
 */
export function documentHead(f: BelegNameFelder): string {
  return (
    f.title?.trim() || documentCounterparty(f) || form(f.documentForm) || f.fileName?.trim() || "Beleg ohne Kennzeichen"
  );
}
