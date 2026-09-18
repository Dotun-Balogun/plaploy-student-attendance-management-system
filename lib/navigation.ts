// lib/navigation.ts
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  History,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/database.types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: GraduationCap },
    { href: "/admin/lecturers", label: "Lecturers", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ],
  lecturer: [
    { href: "/lecturer", label: "My Courses", icon: LayoutDashboard },
    { href: "/lecturer/attendance", label: "Take Attendance", icon: CalendarCheck },
    { href: "/lecturer/enrollments", label: "Enrollment Requests", icon: UserCheck },
  ],
  student: [
    { href: "/student", label: "Overview", icon: LayoutDashboard },
    { href: "/student/register", label: "Register for Courses", icon: ClipboardList },
    { href: "/student/attendance", label: "Attendance History", icon: History },
  ],
};