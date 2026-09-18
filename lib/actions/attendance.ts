"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sessionSchema, attendanceStatusSchema, type SessionInput } from "@/lib/validations";
import type { AttendanceStatus } from "@/lib/database.types";

/**
 * Finds today's (or the given date's) class session for a course, creating
 * it if it doesn't exist yet, so a lecturer can jump straight to marking.
 */
export async function getOrCreateSession(input: SessionInput) {
  const parsed = sessionSchema.parse(input);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("class_sessions")
    .select("id")
    .eq("course_id", parsed.course_id)
    .eq("session_date", parsed.session_date)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("class_sessions")
    .insert({ course_id: parsed.course_id, session_date: parsed.session_date, topic: parsed.topic || null })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return created.id;
}

export async function markAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus
) {
  const parsedStatus = attendanceStatusSchema.parse(status);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("attendance_records").upsert(
    {
      session_id: sessionId,
      student_id: studentId,
      status: parsedStatus,
      marked_at: new Date().toISOString(),
      marked_by: user?.id ?? null,
    },
    { onConflict: "session_id,student_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/lecturer/attendance");
}

export async function markAttendanceBulk(
  sessionId: string,
  records: { studentId: string; status: AttendanceStatus }[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = records.map((r) => ({
    session_id: sessionId,
    student_id: r.studentId,
    status: attendanceStatusSchema.parse(r.status),
    marked_at: new Date().toISOString(),
    marked_by: user?.id ?? null,
  }));

  const { error } = await supabase
    .from("attendance_records")
    .upsert(rows, { onConflict: "session_id,student_id" });

  if (error) throw new Error(error.message);
  revalidatePath("/lecturer/attendance");
}
