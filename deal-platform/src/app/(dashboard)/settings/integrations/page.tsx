"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Database, ArrowRight } from "lucide-react";

const integrations: {
  id: string;
  name: string;
  description: string;
  icon: typeof Mail;
  href: string;
  status: "Connected" | "Disconnected";
}[] = [
  {
    id: "email",
    name: "Email Integration",
    description: "Connect Gmail or Outlook to automatically capture and associate emails with borrowers, capital providers, and deals.",
    icon: Mail,
    href: "/settings/integrations/email",
    status: "Disconnected",
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    description: "Sync contacts and deals from your existing Zoho CRM instance. Import historical data and maintain bidirectional sync.",
    icon: Database,
    href: "/settings/integrations/zoho",
    status: "Disconnected",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect external services to streamline data flow and reduce manual entry"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <integration.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={
                  integration.status === "Connected"
                    ? "bg-green-100 text-green-700 border-0"
                    : "bg-gray-100 text-gray-700 border-0"
                }
              >
                {integration.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {integration.description}
              </CardDescription>
              <Link href={integration.href}>
                <Button variant="outline" size="sm">
                  Configure <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
