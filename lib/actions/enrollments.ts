"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { enrollmentSchema, type EnrollmentInput } from "@/lib/validations";

/** Admin directly enrolling a student — counts as pre-approved. */
export async function createEnrollment(input: EnrollmentInput) {
  const parsed = enrollmentSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("enrollments").insert({
    course_id: parsed.course_id,
    student_id: parsed.student_id,
    status: "approved",
    decided_at: new Date().toISOString(),
    decided_by: user?.id ?? null,
  });

  if (error) {
    if (error.code === "23505") throw new Error("This student is already enrolled in that course");
    throw new Error(error.message);
  }
  revalidatePath("/admin/enrollments");
}

export async function deleteEnrollment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/enrollments");
}

/** A student requesting to join a course — starts out pending. */
export async function requestEnrollment(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to sign in first");

  const { error } = await supabase.from("enrollments").insert({
    course_id: courseId,
    student_id: user.id,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      // Row already exists — most likely a prior rejection. Try flipping it
      // back to pending so the student can re-request without admin help.
      const { error: reapplyError } = await supabase
        .from("enrollments")
        .update({ status: "pending", decided_at: null, decided_by: null })
        .eq("course_id", courseId)
        .eq("student_id", user.id)
        .eq("status", "rejected");
      if (reapplyError) throw new Error("You've already requested this course");
    } else {
      throw new Error(error.message);
    }
  }

  revalidatePath("/student/register");
  revalidatePath("/student");
}

/** A student withdrawing their own still-pending request. */
export async function withdrawEnrollment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/student/register");
}

/** Lecturer or admin approving/rejecting a single request. */
export async function decideEnrollment(id: string, decision: "approved" | "rejected") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("enrollments")
    .update({ status: decision, decided_at: new Date().toISOString(), decided_by: user?.id ?? null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/lecturer/enrollments");
  revalidatePath("/admin/enrollments");
}

/** Bulk approve/reject — used for large-class requests. */
export async function decideEnrollmentsBulk(ids: string[], decision: "approved" | "rejected") {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("enrollments")
    .update({ status: decision, decided_at: new Date().toISOString(), decided_by: user?.id ?? null })
    .in("id", ids);

  if (error) throw new Error(error.message);
  revalidatePath("/lecturer/enrollments");
  revalidatePath("/admin/enrollments");
}
