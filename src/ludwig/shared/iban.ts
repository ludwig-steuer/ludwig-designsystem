/**
 * IBAN-Validierung nach ISO 13616 (Format + Mod-97-Checksum).
 *
 * Akzeptiert eine IBAN mit oder ohne Whitespace; gibt ein Result mit der
 * normalisierten (aufsteigend Großbuchstaben, ohne Spaces) IBAN oder einem
 * Fehlergrund zurück. Längen-Tabelle pro Land bleibt absichtlich
 * unspezifiziert — der Mod-97-Check fängt die meisten Tippfehler, und der
 * Längen-Cap (max. 34) ist die ISO-Obergrenze.
 */

export type IbanValidationError =
  | "empty"
  | "format"
  | "checksum";

export interface IbanValidationOk {
  ok: true;
  normalized: string;
}

export interface IbanValidationFail {
  ok: false;
  error: IbanValidationError;
}

export function validateIban(raw: string): IbanValidationOk | IbanValidationFail {
  const stripped = raw.replace(/\s+/g, "").toUpperCase();
  if (stripped.length === 0) return { ok: false, error: "empty" };
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(stripped)) {
    return { ok: false, error: "format" };
  }
  // Mod-97-Berechnung: erste 4 Zeichen ans Ende, Buchstaben → 2-stellige
  // Zahl (A=10, ..., Z=35), gesamten String mod 97 ⇒ muss 1 ergeben.
  const rearranged = stripped.slice(4) + stripped.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    const digit = code >= 65 ? code - 65 + 10 : code - 48;
    // Stückweise mod, sonst overflow für lange IBANs.
    remainder = (remainder * (digit >= 10 ? 100 : 10) + digit) % 97;
  }
  if (remainder !== 1) return { ok: false, error: "checksum" };
  return { ok: true, normalized: stripped };
}
