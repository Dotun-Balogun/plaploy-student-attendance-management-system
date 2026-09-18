
"use client";

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
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

export function Header({
  title,
  name,
  email,
  onMenuClick,
}: {
  title: string;
  name: string;
  email: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="print-hide flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile hamburger */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="truncate font-display text-lg font-medium sm:text-xl">
          {title}
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open account menu"
          >
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(name || email)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex max-w-[220px] flex-col">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <form action={signOut}>
            <button type="submit" className="w-full">
              <DropdownMenuItem asChild>
                <span className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

