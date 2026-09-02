/**
 * Result type for operations where `throw` is too coarse — typically
 * Server Actions where the failure must round-trip to the UI as data.
 * For internal services, prefer raising domain errors directly.
 */

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
