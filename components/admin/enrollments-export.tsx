"use client";

import { ExportMenu } from "@/components/shared/export-menu";
import type { ExportColumn } from "@/lib/export";

export interface EnrollmentRow {
  id: string;
  status: string;
  student: { full_name: string; student_id: string | null } | null;
  course: { code: string; name: string } | null;
}

const columns: ExportColumn<EnrollmentRow>[] = [
  { header: "Student", accessor: (e) => e.student?.full_name ?? "" },
  { header: "Student ID", accessor: (e) => e.student?.student_id ?? "" },
  { header: "Course code", accessor: (e) => e.course?.code ?? "" },
  { header: "Course name", accessor: (e) => e.course?.name ?? "" },
  { header: "Status", accessor: (e) => e.status },
];

export function EnrollmentsExportMenu({ enrollments }: { enrollments: EnrollmentRow[] }) {
  return <ExportMenu filename="enrollments" data={enrollments} columns={columns} />;
}
