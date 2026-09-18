"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/database.types";
import { NAV_ITEMS } from "@/lib/navigation";

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <aside className="print-hide hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
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
    </aside>
  );
}