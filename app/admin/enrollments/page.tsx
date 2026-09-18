import { createClient } from "@/lib/supabase/server";
import { deleteEnrollment } from "@/lib/actions/enrollments";
import { EnrollmentDialog } from "@/components/admin/enrollment-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { EnrollmentDecisionButtons } from "@/components/admin/enrollment-decision-buttons";
import { EnrollmentsExportMenu, type EnrollmentRow } from "@/components/admin/enrollments-export";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();
  const [{ data: enrollmentData }, { data: courses }, { data: students }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, course:courses(id, code, name), student:profiles(id, full_name, student_id)")
      .order("requested_at", { ascending: false }),
    supabase.from("courses").select("*").order("code"),
    supabase.from("profiles").select("*").eq("role", "student").order("full_name"),
  ]);

  const enrollments = (enrollmentData ?? []) as unknown as EnrollmentRow[];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium">Enrollments</h2>
          <p className="text-sm text-muted-foreground">
            Every enrollment request, system-wide — approve, reject, or enrol a student directly.
          </p>
        </div>
        <EnrollmentDialog courses={courses ?? []} students={students ?? []} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All enrollments</CardTitle>
            <CardDescription>{enrollments.length} total</CardDescription>
          </div>
          <EnrollmentsExportMenu enrollments={enrollments} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{e.student?.full_name}</span>
                      <span className="text-xs text-muted-foreground">{e.student?.student_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.course?.code}</Badge>{" "}
                    <span className="text-muted-foreground">{e.course?.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.status === "approved" ? "present" : e.status === "rejected" ? "absent" : "late"}>
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {e.status === "pending" && <EnrollmentDecisionButtons id={e.id} />}
                      <DeleteButton
                        description="This removes the student from the course's class list."
                        action={deleteEnrollment.bind(null, e.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No enrollments yet.
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
