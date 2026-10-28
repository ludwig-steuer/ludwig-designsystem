/**
 * F351 — was die Serversuche des Command-Menüs zurückgibt. Eigene Datei, weil
 * eine `"use server"`-Datei nur async Funktionen exportieren darf.
 */
export const COMMAND_HIT_KINDS = ["account", "document", "case", "batch", "transaction", "year", "quick"] as const;
export type CommandHitKind = (typeof COMMAND_HIT_KINDS)[number];

export type CommandDrawer =
  | { kind: "account"; accountNumber: string }
  | { kind: "document"; sourceDocId: string }
  | { kind: "transaction"; transactionId: string };

export interface CommandHit {
  kind: CommandHitKind;
  id: string;
  label: string;
  hint: string | null;
  href: string;
  drawer: CommandDrawer | null;
}

export interface CommandHitGroup {
  title: string;
  hits: CommandHit[];
}

export interface CommandSearchResult {
  scope: { clientId: string; clientSlug: string; year: number };
  groups: CommandHitGroup[];
}
