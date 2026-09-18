import type { MembershipStatus, StaffRole, UserKind } from "@/ludwig/modules/auth";

export interface TenantSummary {
  tenantId: string;
  slug: string;
  name: string;
  memberCount: number;
  clientCount: number;
  createdAt: string;
}

export interface ClientSummary {
  clientId: string;
  displayName: string;
  tenantId: string;
  tenantName: string;
  memberCount: number;
}

export interface UserSummary {
  userId: string;
  email: string | null;
  kind: UserKind | null;
  displayName: string | null;
  status: MembershipStatus | null;
  tenantMembership: { tenantId: string; tenantName: string; role: string } | null;
  clientMembershipCount: number;
  authCreatedAt: string;
}

export interface UserDetail extends UserSummary {
  /** Team-Rolle (F148) — nur beim Ludwig-Team, sonst null. */
  staffRole: StaffRole | null;
  lastSignInAt: string | null;
  clientMemberships: Array<{
    clientId: string;
    clientName: string;
    role: string;
    status: MembershipStatus;
  }>;
  /**
   * Alle Mandanten der Kanzlei des Users mit ihrem Zuständigen (F242) — für
   * die Karte „Zuständig für". Leer ohne Kanzlei-Mitgliedschaft.
   */
  tenantClients: Array<{
    clientId: string;
    displayName: string;
    datevClientNumber: string | null;
    isActive: boolean;
    responsibleUserId: string | null;
    responsibleDisplayName: string | null;
  }>;
}
