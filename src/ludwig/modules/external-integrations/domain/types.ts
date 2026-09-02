import type { BankTransactionRow } from "@/ludwig/modules/bank-transactions";

/**
 * Provider-Slug-Whitelist. Heute nur Qonto; spätere Provider hier +
 * im CHECK-Constraint von `ludwig.client_external_integrations` ergänzen.
 */
export type ProviderId = "qonto";

export interface ExternalIntegration {
  id: string;
  tenantId: string;
  clientId: string;
  provider: ProviderId;
  displayName: string;
  status: "active" | "disabled" | "error";
  lastSyncAt: string | null;
  lastSyncError: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ein einzelner Remote-Account innerhalb einer Integration — z.B. ein
 * konkretes Bankkonto in einer Qonto-Organisation. Ein lokales
 * `client_payment_accounts.external_account_id` speichert die `id`.
 */
export interface ExternalRemoteAccount {
  externalAccountId: string;
  displayLabel: string;
  iban: string | null;
  currency: string | null;
}

export interface IntegrationCredentialField {
  key: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

/**
 * Provider-Metadata, das auch im Client-Bundle sicher ist (keine
 * Server-Logik, kein Token-Material). Wird in Wizard-UI verwendet,
 * um das Credentials-Form zu rendern.
 */
export interface IntegrationProviderMeta {
  id: ProviderId;
  displayName: string;
  description: string;
  credentialFields: IntegrationCredentialField[];
}

/**
 * Server-only Provider-Surface. Implementations leben in
 * `modules/external-integrations/providers/<id>.ts`.
 */
export interface IntegrationProvider extends IntegrationProviderMeta {
  /** Schema-Validation der vom User eingegebenen Credentials. */
  validateCredentials(
    raw: Record<string, unknown>,
  ): { ok: true; credentials: Record<string, unknown> } | { ok: false; error: string };

  /**
   * Liefert die Remote-Accounts der Integration zurück (für den
   * Wizard-Dropdown). Wirft `BankImportError("integration_api_error")`
   * bei Auth- oder Netzwerkfehlern.
   */
  listRemoteAccounts(credentials: Record<string, unknown>): Promise<ExternalRemoteAccount[]>;

  /**
   * Holt alle Transaktionen für einen Remote-Account in einem
   * (optional offenen) Zeitfenster. Beide Datumsangaben sind ISO
   * `YYYY-MM-DD`, inklusive.
   *
   *   - `fromDate=null, toDate=null` → komplette History.
   *   - `fromDate=2024-01-01, toDate=2024-12-31` → exakt Kalenderjahr.
   *   - `fromDate=2024-06-01, toDate=null` → von Datum bis heute.
   */
  fetchTransactions(
    credentials: Record<string, unknown>,
    externalAccountId: string,
    options: { fromDate: string | null; toDate: string | null },
  ): Promise<BankTransactionRow[]>;
}

export type IntegrationStatus = ExternalIntegration["status"];
