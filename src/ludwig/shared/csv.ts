/**
 * Minimal-CSV-Tokenizer mit '"'-Quotes (Verdoppelung '""' = literales ").
 * Trennzeichen per Default ';' (DATEV, Qonto); der Kontoauszug-Formatkatalog
 * (F286) deklariert es je Eintrag. Ausgereiftere Bibliotheken bringen für
 * diese Spezifika keinen Mehrwert und mehr Dependency-Oberfläche.
 */
export function tokenizeRow(line: string, delimiter = ";"): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

export function stripQuotes(cell: string): string {
  if (cell.length >= 2 && cell.startsWith('"') && cell.endsWith('"')) {
    return cell.slice(1, -1).replace(/""/g, '"');
  }
  return cell;
}
