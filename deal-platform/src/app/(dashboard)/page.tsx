"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deals } from "@/mock-data/deals";
import { tasks } from "@/mock-data/tasks";
import { communications } from "@/mock-data/communications";
import { borrowers } from "@/mock-data/borrowers";
import { capitalProviders } from "@/mock-data/capital-providers";
import { users } from "@/mock-data/users";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  Zap,
  AlertTriangle,
  Plus,
  Building2,
  Landmark,
  ArrowRight,
  Mail,
  StickyNote,
  ArrowRightLeft,
  MessageSquarePlus,
} from "lucide-react";
import Link from "next/link";

const currentUser = users[0]; // Marcus Webb (Admin)

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const activeDeals = deals.filter(
    (d) => !d.isArchived && d.pipelineStage !== "Terminated"
  );
  const totalPipelineValue = activeDeals.reduce(
    (sum, d) => sum + (d.estimatedDealSize ?? 0),
    0
  );
  const dealsInExecution = activeDeals.filter(
    (d) => d.pipelineStage === "Execution"
  );

  const now = new Date();
  const overdueTasks = tasks.filter((t) => {
    if (t.status === "Complete" || t.status === "Cancelled") return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < now;
  });

  // Recent activity: last 10 communications sorted by timestamp desc
  const recentActivity = [...communications]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);

  const typeIcons: Record<string, React.ReactNode> = {
    Email: <Mail className="h-4 w-4 text-blue-500" />,
    Note: <StickyNote className="h-4 w-4 text-amber-500" />,
    StatusChange: <ArrowRightLeft className="h-4 w-4 text-purple-500" />,
    ThreadCreated: <MessageSquarePlus className="h-4 w-4 text-green-500" />,
  };

  function getActivityLabel(comm: (typeof communications)[0]): string {
    switch (comm.type) {
      case "Email":
        return `${comm.emailSubject}`;
      case "Note":
        return comm.noteContent
          ? comm.noteContent.slice(0, 100) + (comm.noteContent.length > 100 ? "..." : "")
          : "Note added";
      case "StatusChange":
        return `Stage changed: ${comm.statusFrom} → ${comm.statusTo}`;
      case "ThreadCreated":
        return "New engagement thread created";
      default:
        return "Activity";
    }
  }

  function getEntityName(comm: (typeof communications)[0]): string {
    if (comm.entityType === "Borrower") {
      return borrowers.find((b) => b.id === comm.entityId)?.name ?? "";
    }
    if (comm.entityType === "CapitalProvider") {
      return (
        capitalProviders.find((cp) => cp.id === comm.entityId)?.firmName ?? ""
      );
    }
    if (comm.entityType === "Deal") {
      return deals.find((d) => d.id === comm.entityId)?.name ?? "";
    }
    return "";
  }

  function getAuthorName(userId: string): string {
    return users.find((u) => u.id === userId)?.name ?? "Unknown";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting()}, ${currentUser.name.split(" ")[0]}`}
        description="Here's what's happening across your deal pipeline today."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/deals/new">
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> New Deal
              </Button>
            </Link>
            <Link href="/borrowers/new">
              <Button variant="outline" size="sm">
                <Building2 className="mr-1.5 h-4 w-4" /> New Borrower
              </Button>
            </Link>
            <Link href="/capital-providers/new">
              <Button variant="outline" size="sm">
                <Landmark className="mr-1.5 h-4 w-4" /> New Capital Provider
              </Button>
            </Link>
          </div>
        }
      />

      {/* Pipeline Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Deals"
          value={activeDeals.length}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Pipeline Value"
          value={formatCurrency(totalPipelineValue)}
          icon={DollarSign}
        />
        <StatCard
          label="Deals in Execution"
          value={dealsInExecution.length}
          icon={Zap}
        />
        <StatCard
          label="Overdue Tasks"
          value={overdueTasks.length}
          icon={AlertTriangle}
          className={overdueTasks.length > 0 ? "border-red-200" : ""}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Pipeline by Stage */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Pipeline by Stage
            </CardTitle>
            <Link href="/deals/pipeline">
              <Button variant="ghost" size="sm">
                View Pipeline <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(
                [
                  "Prospect",
                  "Qualifying",
                  "Structuring",
                  "Pitched",
                  "Committed",
                  "Execution",
                  "Funded",
                  "Closed",
                ] as const
              ).map((stage) => {
                const stageDeals = activeDeals.filter(
                  (d) => d.pipelineStage === stage
                );
                const stageValue = stageDeals.reduce(
                  (sum, d) => sum + (d.estimatedDealSize ?? 0),
                  0
                );
                return (
                  <div
                    key={stage}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <StatusBadge status={stage} context="pipeline" />
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="tabular-nums">
                        {stageDeals.length}{" "}
                        {stageDeals.length === 1 ? "deal" : "deals"}
                      </span>
                      <span className="tabular-nums font-medium text-foreground w-28 text-right">
                        {stageValue > 0 ? formatCurrency(stageValue) : "$0"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Overdue Tasks
            </CardTitle>
            <Link href="/analytics/execution">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No overdue tasks. Great work!
              </p>
            ) : (
              <div className="space-y-3">
                {overdueTasks.slice(0, 5).map((task) => {
                  const deal = deals.find((d) => d.id === task.dealId);
                  const daysOverdue = Math.floor(
                    (now.getTime() - new Date(task.dueDate!).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={task.id} className="text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{task.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {deal?.name} &middot; {task.assigneeName}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-red-600 whitespace-nowrap">
                          {daysOverdue}d overdue
                        </span>
                      </div>
                    </div>
                  );
                })}
                {overdueTasks.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{overdueTasks.length - 5} more overdue tasks
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((comm) => (
              <div key={comm.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5">{typeIcons[comm.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {getActivityLabel(comm)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getEntityName(comm)}
                    {getEntityName(comm) && " · "}
                    {getAuthorName(comm.createdBy)} ·{" "}
                    {formatRelativeDate(comm.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
