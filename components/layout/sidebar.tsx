"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/database.types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
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

/**
 * The branding + nav links + footer shared by the fixed desktop sidebar and
 * the mobile slide-out drawer (see components/layout/mobile-nav.tsx).
 * `onNavigate` lets the drawer close itself when a link is tapped.
 */
export function SidebarContent({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white p-1">
          <Image src="/psp-logo.jpg" alt="Plateau State Polytechnic crest" width={36} height={36} className="h-full w-full object-contain" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-medium tracking-tight">Plateau State Polytechnic</p>
          <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/50">Attendance System</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/50">
        {role === "admin" ? "Administrator" : role === "lecturer" ? "Lecturer" : "Student"} workspace
      </div>
    </div>
  );
}

/** Fixed sidebar shown on md+ screens. Hidden entirely on mobile — see MobileNav for the small-screen equivalent. */
export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="print-hide hidden w-64 shrink-0 md:block">
      <SidebarContent role={role} />
    </aside>
  );
}