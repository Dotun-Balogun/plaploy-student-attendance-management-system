"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { initials } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
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
  return (
    <header className="print-hide flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      <div className="flex items-center gap-3">
        <MobileNav role={role} />
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