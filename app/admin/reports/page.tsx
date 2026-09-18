import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseAttendanceChart } from "@/components/admin/course-attendance-chart";
import { AttendanceTrendChart } from "@/components/shared/attendance-trend-chart";
import { CourseReportExportMenu } from "@/components/admin/course-report-export";
import { formatPercent } from "@/lib/utils";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase.from("courses").select("id, code, name");

  const rows = await Promise.all(
    (courses ?? []).map(async (course) => {
      const { data: sessions } = await supabase
        .from("class_sessions")
        .select("id")
        .eq("course_id", course.id);

      const sessionIds = (sessions ?? []).map((s) => s.id);
      let present = 0;
      let total = 0;

      if (sessionIds.length > 0) {
        const { data: records } = await supabase
          .from("attendance_records")
          .select("status")
          .in("session_id", sessionIds);
        total = records?.length ?? 0;
        present = records?.filter((r) => r.status !== "absent").length ?? 0;
      }

      return {
        code: course.code,
        name: course.name,
        sessions: sessionIds.length,
        rate: total > 0 ? (present / total) * 100 : 0,
      };
    })
  );

  const { data: trendRaw } = await supabase.rpc("attendance_trend");
  const trend = ((trendRaw ?? []) as { session_date: string; rate: number; total: number }[]).map((t) => ({
    date: t.session_date,
    rate: t.rate,
  }));

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Attendance rate by course, based on all recorded sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance by course</CardTitle>
          <CardDescription>Present and late counted together against total marks.</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <CourseAttendanceChart data={rows} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No courses yet — add a course to see reports here.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance trend</CardTitle>
          <CardDescription>Institution-wide attendance rate by class date.</CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length > 1 ? (
            <AttendanceTrendChart data={trend} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Not enough recorded sessions yet to show a trend.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Course detail</CardTitle>
            <CardDescription>Download this table for offline records or sharing.</CardDescription>
          </div>
          <CourseReportExportMenu rows={rows} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Sessions held</TableHead>
                <TableHead>Attendance rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.code}>
                  <TableCell>
                    <span className="font-medium">{r.code}</span>{" "}
                    <span className="text-muted-foreground">{r.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.sessions}</TableCell>
                  <TableCell className="font-medium">{formatPercent(r.rate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
