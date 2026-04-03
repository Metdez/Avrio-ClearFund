"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labelMap: Record<string, string> = {
  borrowers: "Borrowers",
  "capital-providers": "Capital Providers",
  deals: "Deals",
  vendors: "Vendors",
  emails: "Emails",
  documents: "Documents",
  "follow-ups": "Follow-Ups",
  analytics: "Analytics",
  pipeline: "Pipeline",
  relationships: "Relationships",
  execution: "Execution",
  settings: "Settings",
  users: "Users & Roles",
  integrations: "Integrations",
  templates: "Process Templates",
  notifications: "Notifications",
  new: "New",
  email: "Email",
  zoho: "Zoho",
  threads: "Threads",
  facilities: "Facilities",
  timeline: "Timeline",
  link: "Link Email",
  sequences: "Sequences",
};

function formatSegment(segment: string): string {
  return labelMap[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/" />}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          // Skip dynamic route segments that look like IDs
          const isId =
            segment.startsWith("usr-") ||
            segment.startsWith("brw-") ||
            segment.startsWith("cp-") ||
            segment.startsWith("deal-") ||
            segment.startsWith("vnd-") ||
            segment.match(/^[0-9a-f-]{36}$/);

          const label = isId ? segment : formatSegment(segment);

          return (
            <span key={href} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
