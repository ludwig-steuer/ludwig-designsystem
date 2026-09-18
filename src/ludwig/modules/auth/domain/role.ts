/**
 * Domain types for authentication and role resolution. Pure types —
 * no IO, no framework imports.
 *
 * Mirrors the database classifier from `ludwig.platform_users.kind`.
 */

export const USER_KINDS = ["tenant_user", "client_user", "platform_staff"] as const;
export type UserKind = (typeof USER_KINDS)[number];

/**
 * Team-Rolle des Ludwig-Personals (F148, `platform_users.staff_role`).
 * **Die Reihenfolge im Array ist der Rang**: eine höhere Rolle hält jedes
 * Recht der niedrigeren. Nichts anderes kodiert diese Ordnung — Rechte fragt
 * man über `hasPermission`, nie über einen Rollenvergleich.
 */
export const STAFF_ROLES = ["support", "technical", "admin"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/** Rolle in der Kanzlei (`platform_tenant_users.role`) — heute nur Anzeige. */
export const TENANT_ROLES = ["owner", "admin", "member"] as const;
export type TenantRole = (typeof TENANT_ROLES)[number];

/** Rolle am Mandanten (`platform_client_users.role`). */
export const CLIENT_ROLES = ["owner", "member"] as const;
export type ClientRole = (typeof CLIENT_ROLES)[number];

export const MEMBERSHIP_STATUS = ["active", "invited", "disabled"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[number];

export interface TenantMembership {
  tenantId: string;
  role: TenantRole;
  status: MembershipStatus;
}

export interface ClientMembership {
  clientId: string;
  role: ClientRole;
  status: MembershipStatus;
}

/**
 * Resolved session for the currently authenticated user.
 *
 * `kind` is `null` when the user authenticated successfully but has no
 * `platform_users` row yet — typical for a brand-new signup before an
 * admin has classified the account. The UI shows a "pending" state in
 * that case.
 *
 * `firstName` / `lastName` live in `auth.users.user_metadata` until
 * classification — Pending-Users haben keine `platform_users`-Row.
 * Ist ein `platform_users.display_name` gesetzt, hat das Vorrang.
 */
export interface SessionUser {
  userId: string;
  email: string;
  kind: UserKind | null;
  /** Team-Rolle — nur bei `kind === "platform_staff"`, sonst null. */
  staffRole: StaffRole | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  status: MembershipStatus | null;
  tenantMembership: TenantMembership | null;
  clientMemberships: ClientMembership[];
}

/**
 * Coarse role label used by the UI for headings, navigation and copy.
 * Derived from kind + memberships, not stored in the DB.
 */
export type DisplayRole = "platform_staff" | "tenant_user" | "client_user" | "pending";

export function displayRole(session: SessionUser): DisplayRole {
  if (session.kind === "platform_staff") return "platform_staff";
  if (session.kind === "tenant_user" && session.tenantMembership) return "tenant_user";
  if (session.kind === "client_user" && session.clientMemberships.length > 0) return "client_user";
  return "pending";
}
