"use client";

import { ExportMenu } from "@/components/shared/export-menu";
import type { ExportColumn } from "@/lib/export";

export interface CourseReportRow {
  code: string;
  name: string;
  sessions: number;
  rate: number;
}

const columns: ExportColumn<CourseReportRow>[] = [
  { header: "Course code", accessor: (r) => r.code },
  { header: "Course name", accessor: (r) => r.name },
  { header: "Sessions held", accessor: (r) => r.sessions },
  { header: "Attendance rate (%)", accessor: (r) => Math.round(r.rate * 10) / 10 },
];

export function CourseReportExportMenu({ rows }: { rows: CourseReportRow[] }) {
  return <ExportMenu filename="attendance-by-course" data={rows} columns={columns} />;
}
