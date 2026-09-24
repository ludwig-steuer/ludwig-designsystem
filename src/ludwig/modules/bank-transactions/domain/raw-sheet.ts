/**
 * `RawSheet` ist die neutrale tabellarische Zwischenform, in die der
 * xlsx-Decoder Excel-Worksheets und der csv-Decoder Trennzeichen-CSVs
 * überführt. Profile (`infrastructure/profiles/`) matchen + parsen
 * gegen diese Form — sie müssen sich weder um Encoding noch um
 * Excel-Quirks (Zellen-Typen, Date-Serial, etc.) kümmern.
 *
 * `headerRow` enthält die erste Zeile, `dataRows` alle nachfolgenden. Ob die
 * erste Zeile wirklich der Kopf ist, entscheidet erst der Katalog-Eintrag
 * (F286-T286.2: Kopfzeilen-Suche hinter Vorspann-Zeilen). Beide werden auf
 * Strings normalisiert; Excel-`Date`-Zellen werden vom xlsx-Decoder
 * in ISO-Strings (`YYYY-MM-DD`) konvertiert, damit Profile-Code
 * type-stabil bleibt.
 */
export interface RawSheet {
  /** Spalten-Header, getrimmt. */
  headerRow: string[];
  /** Daten-Zeilen, jede mit derselben Länge wie `headerRow` (alle Zeilen
   * werden auf die breiteste Zeile mit Leerstrings aufgefüllt). */
  dataRows: string[][];
  /** Quelle (Sheet-Name bei xlsx, "csv" bei CSV) — nur Diagnostik. */
  sourceLabel: string;
}

/**
 * Was der Decoder-Layer (`infrastructure/decoders/`) ausspuckt, bevor
 * der Profil-Matcher entscheidet, wer zuständig ist.
 *
 * - `csv`: Lines bereits dekodiert (cp1252 oder utf-8). Profile, die
 *   den Tokenizer selbst nutzen wollen (DATEV/Qonto), bekommen die
 *   Lines direkt; sie können ihren eigenen Tokenizer aufrufen.
 * - `xlsx`: erstes Sheet bereits in `RawSheet`-Form.
 * - `xml`: Volltext (utf-8 decodiert).
 */
export type DecodedSource =
  | {
      kind: "csv";
      /** Dekodiertes File ohne BOM, in Zeilen aufgesplittet (leere Zeilen verworfen). */
      lines: string[];
      encoding: "utf-8" | "windows-1252";
      /** F286: die Roh-Bytes — Katalog-Einträge deklarieren ihr Encoding selbst. */
      bytes: Uint8Array;
    }
  | { kind: "xlsx"; sheet: RawSheet }
  | { kind: "xml"; text: string };
