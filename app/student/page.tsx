import Link from "next/link";
import { GraduationCap, TrendingUp, AlertTriangle, Clock, ShieldCheck, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { StatCard } from "@/components/shared/stat-card";
import { AttendanceTrendChart } from "@/components/shared/attendance-trend-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/utils";

const ELIGIBILITY_THRESHOLD = 75;

interface EnrolledCourseRow {
  status: string;
  course: { id: string; code: string; name: string } | null;
}

export default async function StudentOverviewPage() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("enrollments")
    .select("status, course:courses(id, code, name)")
    .eq("student_id", profile.id);

  const enrollments = (data ?? []) as unknown as EnrolledCourseRow[];
  const approvedEnrollments = enrollments.filter((e) => e.status === "approved" && e.course);
  const pendingCount = enrollments.filter((e) => e.status === "pending").length;

  const courseRows = await Promise.all(
    approvedEnrollments.map(async ({ course }) => {
      const c = course!;
      const { data: sessions } = await supabase
        .from("class_sessions")
        .select("id")
        .eq("course_id", c.id);
      const sessionIds = (sessions ?? []).map((s: { id: string }) => s.id);

      let present = 0;
      let total = 0;
      if (sessionIds.length > 0) {
        const { data: records } = await supabase
          .from("attendance_records")
          .select("status")
          .eq("student_id", profile.id)
          .in("session_id", sessionIds);
        total = records?.length ?? 0;
        present = records?.filter((r: { status: string }) => r.status !== "absent").length ?? 0;
      }

      return { id: c.id, code: c.code, name: c.name, rate: total > 0 ? (present / total) * 100 : 0, total };
    })
  );

  const overallTotal = courseRows.reduce((sum, c) => sum + c.total, 0);
  const overallRate =
    courseRows.length > 0
      ? courseRows.reduce((sum, c) => sum + c.rate * c.total, 0) / (overallTotal || 1)
      : 0;
  const atRisk = courseRows.filter((c) => c.total > 0 && c.rate < ELIGIBILITY_THRESHOLD).length;

  // Trend: running attendance rate over time, across every course, so dips
  // in the pattern (e.g. a bad stretch) are visible at a glance.
  const { data: history } = await supabase
    .from("attendance_records")
    .select("status, session:class_sessions(session_date)")
    .eq("student_id", profile.id);

  const chronological = ((history ?? []) as unknown as { status: string; session: { session_date: string } | null }[])
    .filter((r) => r.session?.session_date)
    .sort((a, b) => (a.session!.session_date < b.session!.session_date ? -1 : 1));

  const trendData = chronological.map((_, i) => {
    const upToHere = chronological.slice(0, i + 1);
    const present = upToHere.filter((r) => r.status !== "absent").length;
    return { date: chronological[i].session!.session_date, rate: (present / upToHere.length) * 100 };
  });

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">Welcome back, {profile.full_name.split(" ")[0]}</h2>
        <p className="text-sm text-muted-foreground">Here’s how your attendance looks across your courses.</p>
      </div>

      {pendingCount > 0 && (
        <Card className="border-late/30 bg-late/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <span className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-late" />
              You have {pendingCount} course request{pendingCount === 1 ? "" : "s"} awaiting lecturer approval.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href="/student/register">View requests</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Enrolled courses" value={courseRows.length} icon={GraduationCap} />
        <StatCard label="Overall attendance" value={formatPercent(overallRate)} icon={TrendingUp} accent="present" />
        <StatCard label="Courses below 75%" value={atRisk} icon={AlertTriangle} accent={atRisk > 0 ? "absent" : "default"} />
      </div>

      {trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance trend</CardTitle>
            <CardDescription>Your running attendance rate over time, across all courses.</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceTrendChart data={trendData} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance by course</CardTitle>
          <CardDescription>
            Present and late marks both count toward attendance. Exam eligibility requires at least{" "}
            {ELIGIBILITY_THRESHOLD}%.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {courseRows.map((c) => {
            const eligible = c.total === 0 || c.rate >= ELIGIBILITY_THRESHOLD;
            return (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <p className="font-medium">
                    {c.code} <span className="font-normal text-muted-foreground">{c.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{c.total} session{c.total === 1 ? "" : "s"} recorded</p>
                  {c.total > 0 && (
                    <p className={`mt-1 flex items-center gap-1 text-xs ${eligible ? "text-present" : "text-absent"}`}>
                      {eligible ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                      {eligible ? "Eligible for exams" : `Below ${ELIGIBILITY_THRESHOLD}% — at risk of exam ineligibility`}
                    </p>
                  )}
                </div>
                <Badge variant={c.total > 0 && c.rate < ELIGIBILITY_THRESHOLD ? "absent" : "present"}>
                  {formatPercent(c.rate)}
                </Badge>
              </div>
            );
          })}
          {courseRows.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              You’re not enrolled in any courses yet.{" "}
              <Link href="/student/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Request a course
              </Link>
              .
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
