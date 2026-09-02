/**
 * Wandelt einen Anzeigenamen in einen URL-sicheren Slug-Stamm um.
 * Spiegelt das SQL-Backfill in `20260505130000_add_platform_clients_slug.sql`
 * — dieselbe Eingabe muss in DB und JS denselben Stamm liefern.
 *
 * Regeln:
 *   - Lowercase
 *   - ä→ae, ö→oe, ü→ue, ß→ss
 *   - alles andere → "-"
 *   - mehrfache "-" → einzelnes "-"
 *   - führende/abschließende "-" entfernen
 *
 * Liefert leeren String wenn `displayName` nur Sonderzeichen enthielt
 * — der Aufrufer entscheidet über Fallback (z. B. "client-<uuid-prefix>").
 */
export function slugifyDisplayName(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Validiert einen vom User gesetzten Slug gegen das DB-Format. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) && slug.length >= 2 && slug.length <= 64;
}
