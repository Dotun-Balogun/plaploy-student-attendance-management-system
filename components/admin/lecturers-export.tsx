"use client";

import { ExportMenu } from "@/components/shared/export-menu";
import type { Profile } from "@/lib/database.types";
import type { ExportColumn } from "@/lib/export";

const columns: ExportColumn<Profile>[] = [
  { header: "Full name", accessor: (l) => l.full_name },
  { header: "Email", accessor: (l) => l.email },
];

export function LecturersExportMenu({ lecturers }: { lecturers: Profile[] }) {
  return <ExportMenu filename="lecturers" data={lecturers} columns={columns} />;
}
