import type { MembershipStatus, UserKind } from "@/ludwig/modules/auth";

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
  lastSignInAt: string | null;
  clientMemberships: Array<{
    clientId: string;
    clientName: string;
    role: string;
    status: MembershipStatus;
  }>;
}
