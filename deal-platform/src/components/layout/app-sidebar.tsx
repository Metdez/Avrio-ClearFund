"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Landmark,
  Handshake,
  HardHat,
  Mail,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  ListChecks,
  Settings,
  Link2,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";

const navMain = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Borrowers", href: "/borrowers", icon: Building2 },
      { title: "Capital Providers", href: "/capital-providers", icon: Landmark },
      {
        title: "Deals",
        href: "/deals",
        icon: Handshake,
        children: [{ title: "Pipeline View", href: "/deals/pipeline" }],
      },
      { title: "Vendors", href: "/vendors", icon: HardHat },
    ],
  },
  {
    label: "Communications",
    items: [
      { title: "Emails", href: "/emails", icon: Mail },
      { title: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Pipeline Report", href: "/analytics/pipeline", icon: BarChart3 },
      { title: "Relationships", href: "/analytics/relationships", icon: TrendingUp },
      { title: "Execution Tracker", href: "/analytics/execution", icon: ListChecks },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Users & Roles", href: "/settings/users", icon: Users },
      { title: "Integrations", href: "/settings/integrations", icon: Link2 },
      { title: "Process Templates", href: "/settings/templates", icon: ClipboardList },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/acf-logo-dark.avif"
            alt="Avrio Clean Fund"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 object-contain"
          />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            Avrio Clean Fund
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive(pathname, item.href)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {"children" in item && item.children && (
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              isActive={isActive(pathname, child.href)}
                              render={<Link href={child.href} />}
                            >
                              <span>{child.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
