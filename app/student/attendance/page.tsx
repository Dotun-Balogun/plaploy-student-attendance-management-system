import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceStatusBadge } from "@/components/shared/attendance-status-badge";
import { AttendanceHistoryExportMenu, type AttendanceHistoryRow } from "@/components/student/attendance-history-export";
import type { AttendanceStatus } from "@/lib/database.types";

export default async function StudentAttendanceHistoryPage() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("attendance_records")
    .select("status, marked_at, session:class_sessions(session_date, topic, course:courses(code, name))")
    .eq("student_id", profile.id)
    .order("marked_at", { ascending: false });

  const records = (data ?? []) as unknown as AttendanceHistoryRow[];

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">Attendance history</h2>
        <p className="text-sm text-muted-foreground">Every recorded class session across your courses.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Records</CardTitle>
            <CardDescription>{records?.length ?? 0} sessions recorded</CardDescription>
          </div>
          <AttendanceHistoryExportMenu records={records} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">{r.session?.session_date}</TableCell>
                  <TableCell>
                    <span className="font-medium">{r.session?.course?.code}</span>{" "}
                    <span className="text-muted-foreground">{r.session?.course?.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.session?.topic ?? "—"}</TableCell>
                  <TableCell>
                    <AttendanceStatusBadge status={r.status as AttendanceStatus} />
                  </TableCell>
                </TableRow>
              ))}
              {(!records || records.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No attendance has been recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
