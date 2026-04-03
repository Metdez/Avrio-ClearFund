"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { users } from "@/mock-data";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Current user is the Admin (Marcus Webb)
const currentUser = users[0];

export function UserNav() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback className="text-[10px]">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {currentUser.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {currentUser.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side="top"
            align="start"
            sideOffset={8}
          >
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <span>{currentUser.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {currentUser.role}
                </Badge>
              </div>
              <p className="text-xs font-normal text-muted-foreground">
                {currentUser.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/login" />}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
