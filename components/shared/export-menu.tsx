"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToXlsx, printForPdf, type ExportColumn } from "@/lib/export";

export function ExportMenu<T>({
  filename,
  data,
  columns,
}: {
  filename: string;
  data: T[];
  columns: ExportColumn<T>[];
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExcel() {
    try {
      setExporting(true);
      await exportToXlsx(filename, data, columns);
    } catch {
      toast.error("Could not generate the Excel file");
    } finally {
      setExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={data.length === 0}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportToCsv(filename, data, columns)}>
          <FileText className="h-4 w-4" /> Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExcel} disabled={exporting}>
          <FileSpreadsheet className="h-4 w-4" /> {exporting ? "Preparing…" : "Export as Excel"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printForPdf}>
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
