/**
 * Domain types for authentication and role resolution. Pure types —
 * no IO, no framework imports.
 *
 * Mirrors the database classifier from `ludwig.platform_users.kind`.
 */

export const USER_KINDS = ["tenant_user", "client_user", "platform_admin"] as const;
export type UserKind = (typeof USER_KINDS)[number];

export const MEMBERSHIP_STATUS = ["active", "invited", "disabled"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[number];

export interface TenantMembership {
  tenantId: string;
  role: string;
  status: MembershipStatus;
}

export interface ClientMembership {
  clientId: string;
  role: string;
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
export type DisplayRole = "platform_admin" | "tenant_user" | "client_user" | "pending";

export function displayRole(session: SessionUser): DisplayRole {
  if (session.kind === "platform_admin") return "platform_admin";
  if (session.kind === "tenant_user" && session.tenantMembership) return "tenant_user";
  if (session.kind === "client_user" && session.clientMemberships.length > 0) return "client_user";
  return "pending";
}
