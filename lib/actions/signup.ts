"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { studentSignupSchema, lecturerSignupSchema, adminSignupSchema } from "@/lib/validations";

export interface SignupFormState {
  error?: string;
}

export async function signupStudent(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const parsed = studentSignupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    student_id: formData.get("student_id"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        role: "student",
        student_id: parsed.data.student_id,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with that email already exists — try signing in instead." };
    }
    return { error: error.message };
  }

  redirect("/login?registered=1");
}

export async function signupLecturer(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const parsed = lecturerSignupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name, role: "lecturer" },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with that email already exists — try signing in instead." };
    }
    return { error: error.message };
  }

  redirect("/login?registered=1");
}

export async function signupAdmin(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const parsed = adminSignupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    invite_code: formData.get("invite_code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  // The invite code is a server-only secret (never sent to the browser) so
  // an administrator account can't be created by just filling in a form —
  // see ADMIN_SIGNUP_CODE in .env.example.
  const expected = process.env.ADMIN_SIGNUP_CODE;
  if (!expected || parsed.data.invite_code !== expected) {
    return { error: "That administrator invite code isn't valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name, role: "admin" },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with that email already exists — try signing in instead." };
    }
    return { error: error.message };
  }

  redirect("/login?registered=1");
}
