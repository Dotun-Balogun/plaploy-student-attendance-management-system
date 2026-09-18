export type UserRole = "admin" | "lecturer" | "student";
export type AttendanceStatus = "present" | "absent" | "late";
export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id: string | null; // institution ID number, only for students
  avatar_url: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  code: string; // e.g. CS301
  name: string; // e.g. Database Systems
  lecturer_id: string | null;
  semester: string; // e.g. "2026 Semester 1"
  created_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  status: EnrollmentStatus;
  requested_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface ClassSession {
  id: string;
  course_id: string;
  session_date: string; // ISO date
  topic: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  marked_at: string;
  marked_by: string | null;
}

// Minimal Database generic shape so @supabase/ssr's generics are satisfied.
// Replace with `supabase gen types typescript` output once the project is
// linked to a real Supabase project — that generated file is a drop-in
// replacement for this one and will keep every query fully typed as the
// schema evolves.
type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      courses: TableDef<Course>;
      enrollments: TableDef<Enrollment>;
      class_sessions: TableDef<ClassSession>;
      attendance_records: TableDef<AttendanceRecord>;
    };
    Views: Record<string, never>;
    Functions: {
      student_attendance_rates: {
        Args: { threshold?: number };
        Returns: { student_id: string; full_name: string; rate: number }[];
      };
      attendance_trend: {
        Args: Record<string, never>;
        Returns: { session_date: string; rate: number; total: number }[];
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      attendance_status: AttendanceStatus;
      enrollment_status: EnrollmentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
