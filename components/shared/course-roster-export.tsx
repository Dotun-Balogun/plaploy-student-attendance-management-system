"use client";

import { ExportMenu } from "@/components/shared/export-menu";
import type { ExportColumn } from "@/lib/export";

export interface RosterStudent {
  full_name: string;
  student_id: string | null;
}

const columns: ExportColumn<RosterStudent>[] = [
  { header: "Full name", accessor: (s) => s.full_name },
  { header: "Matric number", accessor: (s) => s.student_id ?? "" },
];

export function CourseRosterExportMenu({
  courseCode,
  students,
}: {
  courseCode: string;
  students: RosterStudent[];
}) {
  return <ExportMenu filename={`${courseCode}-roster`} data={students} columns={columns} />;
}
