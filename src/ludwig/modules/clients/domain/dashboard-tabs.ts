import type { UserKind } from "@/ludwig/modules/auth";

/** Die Reiter der Übersicht (F242, web-ui R21): Sicht über `?tab=`. */
export const DASHBOARD_TABS = ["assigned", "all"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

/**
 * Welcher Reiter gilt. Mandanten-User bekommen keine (`null`) — ihre Liste
 * ist schon „ihre". Ein gültiger Wunsch aus der URL gewinnt; sonst „Mir
 * zugewiesen", sobald mindestens ein aktiver Mandant zugewiesen ist, sonst
 * „Alle". Ein unbekannter Wert fällt auf diese Vorgabe zurück, kein 404.
 */
export function resolveDashboardTab(input: {
  requested: string | undefined;
  kind: UserKind | null;
  assignedActiveCount: number;
}): DashboardTab | null {
  if (input.kind === "client_user") return null;
  if ((DASHBOARD_TABS as readonly string[]).includes(input.requested ?? "")) return input.requested as DashboardTab;
  return input.assignedActiveCount > 0 ? "assigned" : "all";
}
