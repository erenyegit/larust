import Papa from "papaparse";

export function toCsv(rows: Record<string, unknown>[]) {
  return Papa.unparse(rows);
}

export function toJson(rows: Record<string, unknown>[]) {
  return JSON.stringify(rows, null, 2);
}
