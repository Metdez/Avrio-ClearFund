import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  ListChecks,
  MailCheck,
} from "lucide-react";
import Link from "next/link";

const reports = [
  {
    title: "Pipeline Analytics",
    description:
      "Deals by stage, total pipeline value, value per stage, and average days in stage.",
    href: "/analytics/pipeline",
    icon: BarChart3,
  },
  {
    title: "Relationship Analytics",
    description:
      "Capital provider counts by type and relationship status, facility utilization, and pitch-to-commit rates.",
    href: "/analytics/relationships",
    icon: Users,
  },
  {
    title: "Execution Tracker",
    description:
      "Deals in execution with progress bars, overdue task counts, and the top 10 most overdue tasks.",
    href: "/analytics/execution",
    icon: ListChecks,
  },
  {
    title: "Follow-Up Analytics",
    description:
      "Active follow-up sequences, messages sent, response rates, and opt-out metrics.",
    href: "/analytics/follow-ups",
    icon: MailCheck,
  },
];

export default function AnalyticsHubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Reporting dashboards for pipeline, relationships, execution, and follow-up performance."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="h-full transition-colors hover:border-foreground/20 hover:bg-muted/30">
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="rounded-md bg-muted p-2">
                  <report.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
