"use client";

/**
 * Lightweight export helpers used by <ExportMenu>. CSV needs no dependency;
 * Excel uses SheetJS (xlsx), loaded client-side only so it never bloats the
 * server bundle.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toRows<T>(data: T[], columns: ExportColumn<T>[]) {
  return data.map((row) => columns.map((col) => col.accessor(row)));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv<T>(filename: string, data: T[], columns: ExportColumn<T>[]) {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const rows = toRows(data, columns).map((row) => row.map(escapeCsvCell).join(","));
  const csv = [header, ...rows].join("\r\n");
  // Prefix a BOM so Excel opens UTF-8 CSVs correctly.
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export async function exportToXlsx<T>(filename: string, data: T[], columns: ExportColumn<T>[]) {
  const XLSX = await import("xlsx");
  const rows = [columns.map((c) => c.header), ...toRows(data, columns)];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/** Triggers the browser's print dialog, which every browser can also "Save as PDF" from. */
export function printForPdf() {
  window.print();
}
