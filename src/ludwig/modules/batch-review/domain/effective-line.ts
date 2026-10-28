/**
 * F337 T337.1/T337.5 — was eine Zeile der Effektiv-Sicht (bank.md R8) in T2
 * trägt: Herkunftszeichen und Buchungszustand. Ein Wert je Zweig der Sicht,
 * keine Rechnung; Schritt 4 zeigt Drawer und Verrechnungskonten damit gleich.
 */
import type { AccountEntry } from "@ludwig/designsystem";

import { accountEntryOrigin } from "@/ludwig/modules/accounts";

export type EffectiveLineSource = "mirror" | "journal" | "client_import" | "proposed";

const STATUS_BY_SOURCE: Record<EffectiveLineSource, Pick<AccountEntry, "status" | "entryOrigin">> = {
  journal: { status: "accepted", entryOrigin: null },
  proposed: { status: "proposed", entryOrigin: null },
  // Den Mandantenstapel unterscheidet der Zustand nicht, erst die Herkunft des Satzes.
  client_import: { status: "proposed", entryOrigin: "client_import" },
  // Das Herkunftszeichen trägt DATEV.
  mirror: { status: null, entryOrigin: null },
};

export function effectiveLineFacts(line: {
  source: EffectiveLineSource;
  exportedAt: string | null;
  datevMirrorEntryId: string | null;
  matchState: string | null;
}): Pick<AccountEntry, "origin" | "status" | "entryOrigin"> {
  const origin =
    line.source === "mirror"
      ? accountEntryOrigin({ source: "datev", matchState: line.matchState })
      : accountEntryOrigin({ source: "ludwig", exportedAt: line.exportedAt, datevMirrorEntryId: line.datevMirrorEntryId });
  return { origin, ...STATUS_BY_SOURCE[line.source] };
}
