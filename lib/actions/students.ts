"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { studentSchema, type StudentInput } from "@/lib/validations";

export async function createStudent(input: StudentInput) {
  const parsed = studentSchema.parse(input);
  const admin = createAdminClient();

  // Create the auth user with a temporary password; the student resets it on first login.
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: parsed.email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: { full_name: parsed.full_name, role: "student" },
  });

  if (authError || !authUser.user) {
    throw new Error(authError?.message ?? "Could not create the student account");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: authUser.user.id,
      full_name: parsed.full_name,
      email: parsed.email,
      role: "student",
      student_id: parsed.student_id,
    },
    { onConflict: "id" }
  );

  if (profileError) throw new Error(profileError.message);

  await admin.auth.resetPasswordForEmail(parsed.email);

  revalidatePath("/admin/students");
}

export async function updateStudent(id: string, input: StudentInput) {
  const parsed = studentSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.full_name, email: parsed.email, student_id: parsed.student_id })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/students");
}

export async function deleteStudent(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/students");
}
