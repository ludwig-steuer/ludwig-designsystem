/**
 * Spiegel-Buchungen eines Sachverhalts → die Lese-Form des Design-Systems
 * (F251, DS-Befund L-339).
 *
 * Bis F251 rechnete die Karte „In DATEV gebucht" Betrag und Konten in der
 * UI-Datei. Die Form der Zeile (`CaseMirrorEntry`) liegt deshalb hier in der
 * Domain — die Infrastruktur liest sie nur —, und die Übersetzung in
 * `MirrorEntryVM` ist rein und testbar.
 */
import type { MirrorEntryVM } from "@ludwig/designsystem";

import { asCurrency } from "@/ludwig/shared/money";

export interface CaseMirrorLine {
  accountNumber: string;
  side: "debit" | "credit";
  amount: number;
  contraAccountNumber: string | null;
}

/** Eine Spiegel-Buchung, die zu einem Sachverhalt gehört (`listCaseDatevTruth`). */
export interface CaseMirrorEntry {
  id: string;
  postingDate: string | null;
  documentNumber: string | null;
  description: string | null;
  sequenceId: string | null;
  matchState: string | null;
  via: string[];
  lines: CaseMirrorLine[];
}

export function toMirrorEntryVM(e: CaseMirrorEntry, currency: string, href: string | null): MirrorEntryVM {
  return {
    id: e.id,
    description: e.description ?? "",
    // Der Buchungsbetrag ist die Soll-Seite.
    amount: e.lines.filter((l) => l.side === "debit").reduce((sum, l) => sum + l.amount, 0),
    currency: asCurrency(currency),
    lines: e.lines,
    postingDate: e.postingDate ?? "",
    // NULL = der Abgleich hat den Satz noch nicht angefasst (Achse `mirror_match`).
    matchState: e.matchState ?? "new_unprocessed",
    externalDocumentNumber: e.documentNumber,
    sequenceId: e.sequenceId,
    href,
  };
}
