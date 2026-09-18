"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { initials, cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import { NAV_ITEMS } from "@/lib/navigation"; // Move NAV_ITEMS to a shared file or pass as prop
import type { UserRole } from "@/lib/database.types";

export function Header({
  title,
  name,
  email,
  role,
}: {
  title: string;
  name: string;
  email: string;
  role: UserRole;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = NAV_ITEMS[role] || [];

  return (
    <header className="print-hide flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile Navigation Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
            <SheetHeader className="p-5 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white p-1">
                  <Image
                    src="/psp-logo.jpg"
                    alt="Plateau State Polytechnic crest"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="leading-tight">
                  <SheetTitle className="font-display text-sm font-medium tracking-tight text-sidebar-foreground">
                    Plateau State Polytechnic
                  </SheetTitle>
                  <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/50">
                    Attendance System
                  </p>
                </div>
              </div>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
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
          </SheetContent>
        </Sheet>

        <h1 className="font-display text-xl font-medium">{title}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(name || email)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{name}</span>
              <span className="text-xs font-normal text-muted-foreground">{email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <form action={signOut}>
            <button type="submit" className="w-full">
              <DropdownMenuItem asChild>
                <span className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}