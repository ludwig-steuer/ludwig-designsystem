/**
 * Minimal-CSV-Tokenizer für ';'-Trennzeichen mit '"'-Quotes
 * (Verdoppelung '""' = literales "). Reicht für DATEV- und Qonto-Exports;
 * ausgereiftere Bibliotheken bringen für diese Spezifika keinen Mehrwert
 * und mehr Dependency-Oberfläche.
 */
export function tokenizeRow(line: string): string[] {
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
    if (ch === ";") {
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
