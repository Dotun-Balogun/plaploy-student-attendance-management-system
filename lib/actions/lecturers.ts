"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { lecturerSchema, type LecturerInput } from "@/lib/validations";

export async function createLecturer(input: LecturerInput) {
  const parsed = lecturerSchema.parse(input);
  const admin = createAdminClient();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: parsed.email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: { full_name: parsed.full_name, role: "lecturer" },
  });

  if (authError || !authUser.user) {
    throw new Error(authError?.message ?? "Could not create the lecturer account");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: authUser.user.id,
      full_name: parsed.full_name,
      email: parsed.email,
      role: "lecturer",
    },
    { onConflict: "id" }
  );

  if (profileError) throw new Error(profileError.message);

  await admin.auth.resetPasswordForEmail(parsed.email);
  revalidatePath("/admin/lecturers");
}

export async function updateLecturer(id: string, input: LecturerInput) {
  const parsed = lecturerSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.full_name, email: parsed.email })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/lecturers");
}

export async function deleteLecturer(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lecturers");
}
