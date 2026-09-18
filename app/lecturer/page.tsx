import Link from "next/link";
import { CalendarCheck, Users, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseRosterExportMenu } from "@/components/shared/course-roster-export";

interface CourseRow {
  id: string;
  code: string;
  name: string;
  semester: string;
}

export default async function LecturerDashboardPage() {
  const profile = await requireProfile(["lecturer"]);
  const supabase = await createClient();

  const { data: courseData } = await supabase
    .from("courses")
    .select("id, code, name, semester")
    .eq("lecturer_id", profile.id)
    .order("code");

  const courses = (courseData ?? []) as CourseRow[];

  const courseRows = await Promise.all(
    courses.map(async (course) => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("status, student:profiles(full_name, student_id)")
        .eq("course_id", course.id);

      const rows = (enrollments ?? []) as unknown as {
        status: string;
        student: { full_name: string; student_id: string | null } | null;
      }[];

      const approved = rows.filter((r) => r.status === "approved");
      const pendingCount = rows.filter((r) => r.status === "pending").length;

      return {
        ...course,
        studentCount: approved.length,
        pendingCount,
        roster: approved.map((r) => r.student).filter((s): s is NonNullable<typeof s> => !!s),
      };
    })
  );

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">My courses</h2>
        <p className="text-sm text-muted-foreground">Select a course to take attendance or export the class roster.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courseRows.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                {course.code}
              </Badge>
              <CardTitle className="mt-1 text-lg">{course.name}</CardTitle>
              <CardDescription>{course.semester}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course.studentCount} student{course.studentCount === 1 ? "" : "s"}
                </span>
                {course.pendingCount > 0 && (
                  <Link href="/lecturer/enrollments" className="flex items-center gap-1.5 text-late hover:underline">
                    <Clock className="h-4 w-4" />
                    {course.pendingCount} pending
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/lecturer/attendance?course=${course.id}`}>
                    <CalendarCheck className="h-4 w-4" /> Take attendance
                  </Link>
                </Button>
                <CourseRosterExportMenu courseCode={course.code} students={course.roster} />
              </div>
            </CardContent>
          </Card>
        ))}
        {courseRows.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              You haven’t been assigned any courses yet. Contact your administrator.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
