import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getOrCreateSession } from "@/lib/actions/attendance";
import { SessionPicker } from "@/components/lecturer/session-picker";
import { AttendanceSheet } from "@/components/lecturer/attendance-sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AttendanceStatus } from "@/lib/database.types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function LecturerAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; date?: string }>;
}) {
  const profile = await requireProfile(["lecturer"]);
  const { course: courseId, date } = await searchParams;
  const sessionDate = date ?? today();

  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("lecturer_id", profile.id)
    .order("code");

  let sheet: React.ReactNode = null;

  if (courseId) {
    interface EnrolledStudentRow {
      student: { id: string; full_name: string; student_id: string | null } | null;
    }
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select("student:profiles(id, full_name, student_id)")
      .eq("course_id", courseId)
      .eq("status", "approved");

    const students = ((enrollmentData ?? []) as unknown as EnrolledStudentRow[])
      .map((e) => e.student)
      .filter((s): s is NonNullable<typeof s> => !!s);

    const sessionId = await getOrCreateSession({ course_id: courseId, session_date: sessionDate });

    const { data: existing } = await supabase
      .from("attendance_records")
      .select("student_id, status")
      .eq("session_id", sessionId);

    const initialStatuses: Record<string, AttendanceStatus> = {};
    existing?.forEach((r) => {
      initialStatuses[r.student_id] = r.status as AttendanceStatus;
    });

    sheet = (
      <AttendanceSheet sessionId={sessionId} students={students} initialStatuses={initialStatuses} />
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">Take attendance</h2>
        <p className="text-sm text-muted-foreground">
          Choose a course and date, then mark each student present, late, or absent.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class session</CardTitle>
          <CardDescription>Attendance for this date is created automatically if it doesn’t exist yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionPicker courses={courses ?? []} courseId={courseId} date={sessionDate} />
        </CardContent>
      </Card>

      {courseId ? (
        sheet
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Select a course above to load its class list.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
