/**
 * Domain-Typen + reine Zugriffsregel fürs Mandanten-Portal (client portal,
 * F09-T9.3). Das Portal ist die Sicht des Mandanten-Users (Mensch mit echtem
 * Supabase-Login, `platform_users.kind='client_user'`) auf seine Sachverhalte
 * mit `disposition='client'`.
 *
 * Harte Regel: das Portal transportiert ausschließlich `client_text` —
 * `professional_text` erreicht diese Typen nie (deshalb eigene Typen statt
 * Wiederverwendung von `CaseClarification`).
 */
import type { SessionUser } from "@/ludwig/modules/auth";

/**
 * F125: die offene Beleg-Erwartung eines Sachverhalts, wie der Mandant sie
 * sieht. Kein Frage-Typ mehr: hier ist nichts zu beantworten, hier fehlt eine
 * Unterlage — der Upload löst sie auf.
 */
export interface PortalDocumentRequest {
  expectationId: string;
  caseId: string;
  kind: string | null;
  counterpartyName: string | null;
  amount: number | null;
  documentDate: string | null;
  reference: string | null;
  /** Ein Satz Kontext der Kanzlei („Kundennummer 40616910"), sonst null. */
  note: string | null;
  /** Frist (yyyy-mm-dd) — die Erwartung trägt eine echte, keine geschätzte. */
  dueDate: string;
  overdue: boolean;
  raisedAt: string;
}

export interface PortalQuestion {
  clarificationId: string;
  caseId: string;
  /** Laienverständliche Formulierung — NIE `professional_text`. */
  clientText: string;
  answerKind: string;
  answerOptions: string[];
  allowFreeText: boolean;
  severity: "required" | "optional";
  raisedAt: string;
}

export interface PortalCase {
  caseId: string;
  caseNumber: string | null;
  title: string | null;
  kind: string;
  summary: string | null;
  counterpartyName: string | null;
  totalAmount: number | null;
  currency: string;
  fiscalYear: number | null;
  openedAt: string;
  /** Offene Fragen mit `audience='client'` an diesem Sachverhalt. */
  questions: PortalQuestion[];
  /** Offene Beleg-Erwartungen mit `audience='client'` (F125) — Upload statt Antwort. */
  documentRequests: PortalDocumentRequest[];
}

/**
 * App-Layer-Sichtbarkeitsregel (Route-Guard + Action-Guard): wer darf das
 * Portal dieses Mandanten sehen?
 *
 * - Mandanten-User: nur mit aktiver `platform_client_users`-Zuordnung.
 * - Steuerberater: nur für Mandanten der eigenen Kanzlei (Support/Verifikation).
 * - Plattform-Admin: immer.
 *
 * Rein (keine IO) — die Server-Schicht lädt Session + Client und ruft nur
 * diese Funktion. Achtung: Drizzle läuft als service_role, RLS greift hier
 * NICHT — diese Funktion ist die einzige Zugriffs-Schranke (siehe
 * docs/topics/architektur.md R9 — service_role umgeht RLS).
 */
export function canAccessClientPortal(
  session: SessionUser,
  client: { clientId: string; tenantId: string | null },
): boolean {
  if (session.kind === "platform_admin") return true;
  if (
    session.kind === "client_user" &&
    session.clientMemberships.some(
      (m) => m.clientId === client.clientId && m.status === "active",
    )
  ) {
    return true;
  }
  if (
    session.kind === "tenant_user" &&
    session.tenantMembership != null &&
    client.tenantId != null &&
    session.tenantMembership.tenantId === client.tenantId
  ) {
    return true;
  }
  return false;
}
