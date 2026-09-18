import { GraduationCap, Users, BookOpen, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: studentCount }, { count: lecturerCount }, { count: courseCount }, { data: records }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "lecturer"),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("attendance_records").select("status"),
    ]);

  const total = records?.length ?? 0;
  const presentCount = records?.filter((r) => r.status !== "absent").length ?? 0;
  const overallRate = total > 0 ? (presentCount / total) * 100 : 0;

  const { data: lowAttendance } = await supabase
    .rpc("student_attendance_rates", { threshold: 75 })
    .limit(5);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">Overview</h2>
        <p className="text-sm text-muted-foreground">A snapshot of attendance across your institution.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={studentCount ?? 0} icon={GraduationCap} />
        <StatCard label="Lecturers" value={lecturerCount ?? 0} icon={Users} />
        <StatCard label="Courses" value={courseCount ?? 0} icon={BookOpen} />
        <StatCard label="Overall attendance" value={formatPercent(overallRate)} icon={TrendingUp} accent="present" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students below 75% attendance</CardTitle>
          <CardDescription>Flagged automatically from recorded attendance across all courses.</CardDescription>
        </CardHeader>
        <CardContent>
          {lowAttendance && lowAttendance.length > 0 ? (
            <ul className="divide-y divide-border">
              {lowAttendance.map((row: { student_id: string; full_name: string; rate: number }) => (
                <li key={row.student_id} className="flex items-center justify-between py-3">
                  <span className="text-sm">{row.full_name}</span>
                  <Badge variant="absent">{formatPercent(row.rate)}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No students are currently below the attendance threshold, or no records have been taken yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
