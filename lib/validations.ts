import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const studentSchema = z.object({
  full_name: z.string().min(2, "Enter the student's full name"),
  email: z.string().email("Enter a valid email address"),
  student_id: z.string().min(1, "Enter a student ID number"),
});
export type StudentInput = z.infer<typeof studentSchema>;

export const lecturerSchema = z.object({
  full_name: z.string().min(2, "Enter the lecturer's full name"),
  email: z.string().email("Enter a valid email address"),
});
export type LecturerInput = z.infer<typeof lecturerSchema>;

export const courseSchema = z.object({
  code: z.string().min(2, "Enter a course code, e.g. CS301"),
  name: z.string().min(2, "Enter the course name"),
  lecturer_id: z.string().uuid().nullable().optional(),
  semester: z.string().min(2, "Enter the semester, e.g. 2026 Semester 1"),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const enrollmentSchema = z.object({
  course_id: z.string().uuid("Select a course"),
  student_id: z.string().uuid("Select a student"),
});
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

export const sessionSchema = z.object({
  course_id: z.string().uuid("Select a course"),
  session_date: z.string().min(1, "Select a date"),
  topic: z.string().optional(),
});
export type SessionInput = z.infer<typeof sessionSchema>;

export const attendanceStatusSchema = z.enum(["present", "absent", "late"]);

// ---------------------------------------------------------------------------
// Self-service signup (landing page -> /signup)
// ---------------------------------------------------------------------------

// PSP/<SCHOOL>/<DEPARTMENT>/<PROGRAMME>/<YEAR>/<SERIAL>
// e.g. PSP/ICT/CSC/ND/25/0003
export const MATRIC_NUMBER_EXAMPLE = "PSP/ICT/CSC/ND/25/0003";
export const matricNumberPattern = /^PSP\/[A-Za-z]{2,8}\/[A-Za-z]{2,8}\/(ND|HND)\/\d{2}\/\d{3,5}$/i;

const passwordField = z.string().min(6, "Password must be at least 6 characters");

export const studentSignupSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  student_id: z
    .string()
    .regex(matricNumberPattern, `Use the format ${MATRIC_NUMBER_EXAMPLE}`)
    .transform((v) => v.toUpperCase()),
  password: passwordField,
});
export type StudentSignupInput = z.infer<typeof studentSignupSchema>;

export const lecturerSignupSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: passwordField,
});
export type LecturerSignupInput = z.infer<typeof lecturerSignupSchema>;

export const adminSignupSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: passwordField,
  invite_code: z.string().min(1, "Enter the administrator invite code"),
});
export type AdminSignupInput = z.infer<typeof adminSignupSchema>;
