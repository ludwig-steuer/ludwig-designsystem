export interface ClientListItem {
  clientId: string;
  slug: string;
  displayName: string;
  tenantId: string;
  accountFrameworkCode: string | null;
  taxationType: string | null;
  datevClientNumber: string | null;
  /**
   * Replay-Stichtag (`platform_clients.replay_cutoff_date`). NULL = normaler
   * Mandant; gesetzt = Experiment-Mandant (abgeleitet, KEIN eigenes Flag —
   * siehe docs/topics/datev.md).
   */
  replayCutoffDate: string | null;
  /** `platform_clients.is_active` — false = stillgelegt (Zwilling eines neu importierten Mandanten). */
  isActive: boolean;
  invoiceCount: number;
}

export interface ClientDetail extends ClientListItem {
  /** `platform_clients.onboarding_state` — `review` = Freigabe steht aus, Mandant nicht buchbar. */
  onboardingState: string;
  legalName: string | null;
  vatId: string | null;
  steuernummer: string | null;
  baseCurrency: string | null;
  isKleinunternehmer: boolean;
  createdAt: string;
  cycleCount: number;
}
