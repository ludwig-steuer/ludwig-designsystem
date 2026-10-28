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

/**
 * PT-19 — darf diese Sitzung den Mandanten sehen? Dieselbe Regel wie die Liste
 * (`clientScopeFor`), keine zweite: wer einen Mandanten nicht in seiner Liste
 * hat, erreicht auch seine Seiten nicht.
 */
export function clientInScope(scope: ClientScope, client: { tenantId: string; clientId: string }): boolean {
  switch (scope.kind) {
    case "all":
      return true;
    case "tenant":
      return client.tenantId === scope.tenantId;
    case "clients":
      return scope.clientIds.includes(client.clientId);
    case "none":
      return false;
  }
}
