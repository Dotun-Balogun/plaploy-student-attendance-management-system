"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { markAttendanceBulk } from "@/lib/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/database.types";

interface StudentRow {
  id: string;
  full_name: string;
  student_id: string | null;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { value: "present", label: "Present", icon: CheckCircle2 },
  { value: "late", label: "Late", icon: Clock },
  { value: "absent", label: "Absent", icon: XCircle },
];

export function AttendanceSheet({
  sessionId,
  students,
  initialStatuses,
}: {
  sessionId: string;
  students: StudentRow[];
  initialStatuses: Record<string, AttendanceStatus>;
}) {
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const base: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      base[s.id] = initialStatuses[s.id] ?? "present";
    });
    return base;
  });
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.full_name.toLowerCase().includes(q) || (s.student_id ?? "").toLowerCase().includes(q)
    );
  }, [students, query]);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAll(status: AttendanceStatus) {
    setStatuses((prev) => {
      const next = { ...prev };
      students.forEach((s) => (next[s.id] = status));
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      try {
        await markAttendanceBulk(
          sessionId,
          students.map((s) => ({ studentId: s.id, status: statuses[s.id] }))
        );
        toast.success("Attendance saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save attendance");
      }
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll("present")}>
            Mark all present
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAll("absent")}>
            Mark all absent
          </Button>
        </div>
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save attendance"}
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or matric number…"
          className="pl-9"
        />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {filteredStudents.map((student) => (
          <div key={student.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-xs">{initials(student.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{student.full_name}</p>
                <p className="text-xs text-muted-foreground">{student.student_id}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = statuses[student.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(student.id, value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active && value === "present" && "border-present bg-present/10 text-present",
                      active && value === "late" && "border-late bg-late/10 text-late",
                      active && value === "absent" && "border-absent bg-absent/10 text-absent",
                      !active && "border-border text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && students.length > 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No students match “{query}”.</p>
        )}
        {students.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No students enrolled in this course yet.</p>
        )}
      </div>
    </div>
  );
}
