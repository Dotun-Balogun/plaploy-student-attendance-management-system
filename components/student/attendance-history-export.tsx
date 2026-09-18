"use client";

import { ExportMenu } from "@/components/shared/export-menu";
import type { AttendanceStatus } from "@/lib/database.types";
import type { ExportColumn } from "@/lib/export";

export interface AttendanceHistoryRow {
  status: AttendanceStatus;
  marked_at: string;
  session: { session_date: string; topic: string | null; course: { code: string; name: string } | null } | null;
}

const columns: ExportColumn<AttendanceHistoryRow>[] = [
  { header: "Date", accessor: (r) => r.session?.session_date ?? "" },
  { header: "Course code", accessor: (r) => r.session?.course?.code ?? "" },
  { header: "Course name", accessor: (r) => r.session?.course?.name ?? "" },
  { header: "Topic", accessor: (r) => r.session?.topic ?? "" },
  { header: "Status", accessor: (r) => r.status },
];

export function AttendanceHistoryExportMenu({ records }: { records: AttendanceHistoryRow[] }) {
  return <ExportMenu filename="my-attendance-history" data={records} columns={columns} />;
}
