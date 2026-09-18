import { createClient } from "@/lib/supabase/server";
import { deleteCourse } from "@/lib/actions/courses";
import { CourseDialog } from "@/components/admin/course-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { CourseRosterExportMenu } from "@/components/shared/course-roster-export";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CourseWithLecturer {
  id: string;
  code: string;
  name: string;
  semester: string;
  lecturer_id: string | null;
  created_at: string;
  lecturer: { id: string; full_name: string } | null;
}

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const [{ data: courseData }, { data: lecturers }] = await Promise.all([
    supabase.from("courses").select("*, lecturer:profiles(id, full_name)").order("code"),
    supabase.from("profiles").select("*").eq("role", "lecturer").order("full_name"),
  ]);

  const courses = (courseData ?? []) as unknown as CourseWithLecturer[];

  const rosters = await Promise.all(
    courses.map(async (c) => {
      const { data } = await supabase
        .from("enrollments")
        .select("student:profiles(full_name, student_id)")
        .eq("course_id", c.id)
        .eq("status", "approved");
      const roster = ((data ?? []) as unknown as { student: { full_name: string; student_id: string | null } | null }[])
        .map((r) => r.student)
        .filter((s): s is NonNullable<typeof s> => !!s);
      return [c.id, roster] as const;
    })
  );
  const rosterByCourse = new Map(rosters);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium">Courses</h2>
          <p className="text-sm text-muted-foreground">Manage courses and their assigned lecturer.</p>
        </div>
        <CourseDialog lecturers={lecturers ?? []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All courses</CardTitle>
          <CardDescription>{courses.length} courses</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Badge variant="outline">{c.code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.lecturer?.full_name ?? "Unassigned"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.semester}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <CourseRosterExportMenu courseCode={c.code} students={rosterByCourse.get(c.id) ?? []} />
                      <CourseDialog course={c} lecturers={lecturers ?? []} />
                      <DeleteButton
                        description={`This removes ${c.name} along with its enrollments and attendance records.`}
                        action={deleteCourse.bind(null, c.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No courses yet. Add your first course to get started.
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
