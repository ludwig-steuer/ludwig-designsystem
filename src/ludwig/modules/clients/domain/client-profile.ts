/**
 * Grobes Geschäftsmodell des Mandanten — Spiegel des CHECK an
 * `platform_clients.business_model` (Migration 20260508100000).
 */
export const BUSINESS_MODELS = ["services", "trade", "production", "mixed", "other"] as const;
export type BusinessModel = (typeof BUSINESS_MODELS)[number];
