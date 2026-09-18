"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { deleteStudent } from "@/lib/actions/students";
import { StudentDialog } from "@/components/admin/student-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

export function StudentsTable({ students }: { students: Profile[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.full_name.toLowerCase().includes(q) || (s.student_id ?? "").toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div className="grid gap-3">
      <div className="relative px-6 pt-4">
        <Search className="pointer-events-none absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, matric number, or email…"
          className="pl-9"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-xs">{initials(s.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{s.full_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{s.student_id}</TableCell>
              <TableCell className="text-muted-foreground">{s.email}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <StudentDialog student={s} />
                  <DeleteButton
                    description={`This permanently removes ${s.full_name}'s account and attendance history.`}
                    action={deleteStudent.bind(null, s.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && students.length > 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                No students match “{query}”.
              </TableCell>
            </TableRow>
          )}
          {students.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                No students yet. Add your first student to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
