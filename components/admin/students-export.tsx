"use client";

import { ExportMenu } from "@/components/shared/export-menu";
import type { Profile } from "@/lib/database.types";
import type { ExportColumn } from "@/lib/export";

const columns: ExportColumn<Profile>[] = [
  { header: "Full name", accessor: (s) => s.full_name },
  { header: "Student ID", accessor: (s) => s.student_id ?? "" },
  { header: "Email", accessor: (s) => s.email },
];

export function StudentsExportMenu({ students }: { students: Profile[] }) {
  return <ExportMenu filename="students" data={students} columns={columns} />;
}
