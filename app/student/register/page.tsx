import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { CourseRegistrationCard } from "@/components/student/course-registration-card";
import type { EnrollmentStatus } from "@/lib/database.types";

interface CourseWithLecturer {
  id: string;
  code: string;
  name: string;
  semester: string;
  lecturer: { full_name: string } | null;
}

export default async function StudentRegisterPage() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const [{ data: courseData }, { data: enrollmentData }] = await Promise.all([
    supabase.from("courses").select("*, lecturer:profiles(full_name)").order("code"),
    supabase.from("enrollments").select("id, course_id, status").eq("student_id", profile.id),
  ]);

  const courses = (courseData ?? []) as unknown as CourseWithLecturer[];
  const enrollmentByCourse = new Map(
    (enrollmentData ?? []).map((e: { id: string; course_id: string; status: EnrollmentStatus }) => [
      e.course_id,
      e,
    ])
  );

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-2xl font-medium">Register for courses</h2>
        <p className="text-sm text-muted-foreground">
          Request the courses you’re registered for. Your lecturer approves each request before it counts
          toward attendance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const enrollment = enrollmentByCourse.get(course.id);
          return (
            <CourseRegistrationCard
              key={course.id}
              course={{
                id: course.id,
                code: course.code,
                name: course.name,
                semester: course.semester,
                lecturer_name: course.lecturer?.full_name ?? null,
              }}
              enrollmentId={enrollment?.id ?? null}
              status={enrollment?.status ?? null}
            />
          );
        })}
        {courses.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            No courses have been added yet — check back once your department sets up this semester’s courses.
          </p>
        )}
      </div>
    </div>
  );
}
