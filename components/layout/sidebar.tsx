"use client";

import { useState, createContext, useContext } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

// Sidebar Context for Mobile Toggle
const SidebarContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] || [];
  const { open, setOpen } = useSidebar();

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white p-1">
          <Image
            src="/psp-logo.jpg"
            alt="Plateau State Polytechnic crest"
            width={36}
            height={36}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-medium tracking-tight">
            Plateau State Polytechnic
          </p>
          <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/50">
            Attendance System
          </p>
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
              onClick={() => setOpen(false)}
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
        {role === "admin"
          ? "Administrator"
          : role === "lecturer"
          ? "Lecturer"
          : "Student"}{" "}
        workspace
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="print-hide hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground md:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">{navContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}