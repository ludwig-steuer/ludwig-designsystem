/**
 * Rechte-Katalog des Ludwig-Personals (F148). Rein, ohne IO.
 *
 * Rollen und Rechte sind getrennt: ein Recht ist ein benannter Vorgang, der
 * Katalog nennt je Recht die **niedrigste** Team-Rolle, die es hält. Guards und
 * UI fragen `hasPermission(session, recht)` — außerhalb von
 * `modules/auth/domain` vergleicht niemand eine Rolle. Ein Recht zwischen
 * Rollen zu verschieben ist damit eine Zeile hier, kein grep.
 *
 * Eine TS-Konstante statt einer Tabelle: es gibt keine kanzleieigenen Rollen,
 * und ein DB-Katalog wäre Konfiguration für einen Wert, der sich nie ändert.
 * Der Katalog listet genau die Rechte, die ein Guard verbraucht.
 */
import { STAFF_ROLES, type SessionUser, type StaffRole } from "./role";

export const PERMISSIONS = {
  "support.area.enter": { minStaffRole: "support" },
  "tenant.create": { minStaffRole: "support" },
  "tenant.members.manage": { minStaffRole: "support" }, // einladen, Kanzleirolle, Status
  "tenant.conventions.manage": { minStaffRole: "support" },
  "client.create": { minStaffRole: "support" },
  "client.onboard": { minStaffRole: "support" }, // Lauf/Retry/Review/Re-Onboarding, DATEV-Liste + Shell
  "client.master_data.edit": { minStaffRole: "support" },
  "client.activate": { minStaffRole: "support" },
  "client.responsible.assign": { minStaffRole: "support" }, // F242: zuständiger Mitarbeiter je Mandant
  "job.retry": { minStaffRole: "support" },
  "technical.area.enter": { minStaffRole: "technical" },
  "client.delete": { minStaffRole: "technical" },
  "user.manage": { minStaffRole: "technical" }, // upsertPlatformUser, Mandanten-Zuordnungen
  "agent_token.manage": { minStaffRole: "technical" },
  "product_feedback.manage": { minStaffRole: "technical" },
  "staff_role.assign": { minStaffRole: "admin" },
} as const satisfies Record<string, { minStaffRole: StaffRole }>;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Wahr genau dann, wenn aktives Personal mit einer Rolle mindestens so hoch
 * wie die des Rechts. Alles andere ist falsch — fail closed.
 */
export function hasPermission(
  session: Pick<SessionUser, "kind" | "status" | "staffRole">,
  permission: Permission,
): boolean {
  if (session.kind !== "platform_staff" || session.status !== "active" || session.staffRole === null) return false;
  return STAFF_ROLES.indexOf(session.staffRole) >= STAFF_ROLES.indexOf(PERMISSIONS[permission].minStaffRole);
}
