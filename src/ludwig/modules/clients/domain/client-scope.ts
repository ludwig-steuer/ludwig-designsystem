import type { SessionUser } from "@/ludwig/modules/auth";

/**
 * Welche Mandanten eine Sitzung in der Mandantenliste sieht (F242). Drizzle
 * läuft als Service-Role und umgeht RLS (architektur R9) — die Eingrenzung
 * ist deshalb Sache der Anwendung, und sie steht hier, rein und prüfbar; die
 * Abfrage übersetzt nur das Ergebnis in ein `where`.
 *
 * Die Zuständigkeit (`responsible_user_id`) spielt hier keine Rolle: jeder
 * Kanzlei-Mitarbeiter sieht alle Mandanten seiner Kanzlei.
 */
export type ClientScope =
  | { kind: "all" }
  | { kind: "tenant"; tenantId: string }
  | { kind: "clients"; clientIds: string[] }
  | { kind: "none" };

export function clientScopeFor(
  session: Pick<SessionUser, "kind" | "tenantMembership" | "clientMemberships">,
): ClientScope {
  if (session.kind === "platform_staff") return { kind: "all" };
  if (session.kind === "tenant_user" && session.tenantMembership) {
    return { kind: "tenant", tenantId: session.tenantMembership.tenantId };
  }
  if (session.kind === "client_user" && session.clientMemberships.length > 0) {
    return { kind: "clients", clientIds: session.clientMemberships.map((m) => m.clientId) };
  }
  return { kind: "none" };
}
