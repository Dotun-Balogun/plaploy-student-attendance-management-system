"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { courseSchema, type CourseInput } from "@/lib/validations";

export async function createCourse(input: CourseInput) {
  const parsed = courseSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase.from("courses").insert({
    code: parsed.code,
    name: parsed.name,
    lecturer_id: parsed.lecturer_id || null,
    semester: parsed.semester,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
}

export async function updateCourse(id: string, input: CourseInput) {
  const parsed = courseSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update({
      code: parsed.code,
      name: parsed.name,
      lecturer_id: parsed.lecturer_id || null,
      semester: parsed.semester,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
}
