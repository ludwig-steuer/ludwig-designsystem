const escapeRegExp = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Ein Name als ganzes Wort im Text (case-insensitive) — „Paypal" trifft „PayPal
 * Europe", nicht „Paypalooza"; „Qonto" trifft „FTC Operativ (Qonto)". Genutzt
 * für Zahlungsdienstleister (F229) und das kontoführende Institut (F482).
 */
export function mentionsAsWord(text: string | null, name: string): boolean {
  if (!text || !name.trim()) return false;
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(name.trim())}($|[^\\p{L}\\p{N}])`, "iu").test(text);
}
