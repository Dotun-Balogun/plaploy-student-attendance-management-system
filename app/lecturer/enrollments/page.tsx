import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { EnrollmentQueue, type EnrollmentRequestRow } from "@/components/lecturer/enrollment-queue";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RawRequest {
  id: string;
  status: EnrollmentRequestRow["status"];
  requested_at: string;
  student: { full_name: string; student_id: string | null } | null;
  course: { code: string; name: string } | null;
}

export default async function LecturerEnrollmentsPage() {
  const profile = await requireProfile(["lecturer"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("enrollments")
    .select("id, status, requested_at, student:profiles(full_name, student_id), course:courses!inner(code, name, lecturer_id)")
    .eq("course.lecturer_id", profile.id)
    .order("requested_at", { ascending: false });

  const requests: EnrollmentRequestRow[] = ((data ?? []) as unknown as RawRequest[]).map((r) => ({
    id: r.id,
    status: r.status,
    requested_at: r.requested_at,
    student_name: r.student?.full_name ?? "Unknown student",
    student_id: r.student?.student_id ?? null,
    course_code: r.course?.code ?? "",
    course_name: r.course?.name ?? "",
  }));

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">Enrollment requests</h2>
        <p className="text-sm text-muted-foreground">
          Review and approve students requesting to join your courses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests</CardTitle>
          <CardDescription>Approving a request adds the student to your class attendance list.</CardDescription>
        </CardHeader>
        <CardContent>
          <EnrollmentQueue requests={requests} />
        </CardContent>
      </Card>
    </div>
  );
}
