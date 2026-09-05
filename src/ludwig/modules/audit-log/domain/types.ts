/**
 * Generisches Audit-Log: actor-action-resource-payload-Model, bewusst
 * feature-agnostisch. Erster Konsument ist der Bank-Transaktions-Import
 * (`bank_import.csv`, `bank_import.qonto`), aber die Form deckt auch
 * spätere Nutzeraktionen und Hintergrundprozesse ab.
 */

/**
 * `platform_audit_events.actor_kind` — DB-CHECK
 * `platform_audit_events_actor_kind_check` (`20260701120000`).
 */
export const ACTOR_KINDS = ["user", "system", "api", "cli", "agent"] as const;
export type ActorKind = (typeof ACTOR_KINDS)[number];

export type AuditOutcome = "success" | "partial" | "failure";

/** Schreibender Prozess (`platform_audit_events.source`, F49 WP8). */
export type AuditSource = "web" | "worker" | "workflows" | "bridge" | "cli";

export interface Actor {
  kind: ActorKind;
  /** auth.users.id wenn kind === "user", sonst null. */
  id: string | null;
  /** Mensch-lesbar, z.B. E-Mail oder Job-Name. */
  label: string | null;
}

export interface Resource {
  kind: string;
  id: string;
}

export interface AuditEventInput {
  actor: Actor;
  action: string;
  outcome: AuditOutcome;
  tenantId: string | null;
  clientId: string | null;
  resource?: Resource | null;
  message?: string | null;
  payload?: Record<string, unknown>;
  correlationId?: string | null;
  /** Schreibender Prozess; Default `"web"` (Server Actions). */
  source?: AuditSource;
}

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actorKind: ActorKind;
  actorId: string | null;
  actorLabel: string | null;
  action: string;
  outcome: AuditOutcome;
  tenantId: string | null;
  clientId: string | null;
  resourceKind: string | null;
  resourceId: string | null;
  message: string | null;
  payload: Record<string, unknown>;
  correlationId: string | null;
  source: AuditSource | null;
}

export interface AuditEventFilter {
  tenantId?: string;
  clientId?: string;
  actionPrefix?: string;
  correlationId?: string;
  /** Filtert auf eine Ressourcen-Art, z.B. "accounting_case". */
  resourceKind?: string;
  /** Filtert auf eine konkrete Ressourcen-ID (z.B. eine Case-UUID). */
  resourceId?: string;
  /** Schreibender Prozess (F49 WP8). */
  source?: AuditSource;
  /** `outcome`-Filter für die Admin-UI. */
  outcome?: AuditOutcome;
  /** Actor-Art-Filter für die Admin-UI. */
  actorKind?: ActorKind;
  /** Untere Zeitgrenze (inklusive), ISO-String. */
  occurredFrom?: string;
  /** Obere Zeitgrenze (inklusive), ISO-String. */
  occurredTo?: string;
  /** Freitext über `message` (ILIKE, F49 WP13). */
  search?: string;
  /** Keyset-Cursor: nur Events *vor* diesem (occurred_at, id). */
  cursor?: { occurredAt: string; id: string };
  limit?: number;
}
