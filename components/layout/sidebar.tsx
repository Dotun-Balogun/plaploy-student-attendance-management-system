
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
  X,
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
    {
      href: "/lecturer/attendance",
      label: "Take Attendance",
      icon: CalendarCheck,
    },
    {
      href: "/lecturer/enrollments",
      label: "Enrollment Requests",
      icon: UserCheck,
    },
  ],

  student: [
    { href: "/student", label: "Overview", icon: LayoutDashboard },
    {
      href: "/student/register",
      label: "Register for Courses",
      icon: ClipboardList,
    },
    {
      href: "/student/attendance",
      label: "Attendance History",
      icon: History,
    },
  ],
};

interface SidebarProps {
  role: UserRole;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          // Desktop
          "print-hide w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground",

          // Mobile
          "fixed inset-y-0 left-0 z-50 flex h-full transform transition-transform duration-200 ease-in-out md:static md:z-auto md:translate-x-0 md:transition-none",

          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white p-1">
              <Image
                src="/psp-logo.jpg"
                alt="Plateau State Polytechnic crest"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-medium tracking-tight">
                Plateau State Polytechnic
              </p>

              <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/50">
                Attendance System
              </p>
            </div>
          </div>

          {/* Close button - mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/50">
          {role === "admin"
            ? "Administrator"
            : role === "lecturer"
              ? "Lecturer"
              : "Student"}{" "}
          workspace
        </div>
      </aside>
    </>
  );
}

