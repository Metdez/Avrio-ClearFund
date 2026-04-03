"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { followUpSequences } from "@/mock-data/follow-up-sequences";
import { formatDate } from "@/lib/utils";
import { MailCheck, Send, Reply, ShieldOff } from "lucide-react";
import type { FollowUpSequence } from "@/types";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-blue-100 text-blue-700",
  Paused: "bg-amber-100 text-amber-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

export default function FollowUpAnalyticsPage() {
  const activeSequences = followUpSequences.filter(
    (s) => s.status === "Active"
  ).length;

  const totalSent = followUpSequences.reduce(
    (sum, s) => sum + s.followUpsSent,
    0
  );

  const totalPlanned = followUpSequences.reduce(
    (sum, s) => sum + s.totalFollowUps,
    0
  );

  // Mock response rate (for prototype — ~35% of sent messages got a response)
  const responseRate = totalSent > 0 ? Math.round((totalSent * 0.35) / totalSent * 100) : 0;

  // Mock opt-outs — 0 in mock data, but show the metric
  const optOuts = 0;

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    followUpSequences.forEach((s) => {
      counts[s.status] = (counts[s.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, []);

  const columns: ColumnDef<FollowUpSequence>[] = [
    {
      key: "contactName",
      header: "Contact",
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-medium">{s.contactName}</p>
          <p className="text-xs text-muted-foreground">{s.contactEmail}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (s) => (
        <Badge
          variant="secondary"
          className={`font-medium border-0 ${STATUS_COLORS[s.status] ?? ""}`}
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (s) => (s.mode === "AutoSend" ? "Auto-Send" : "Approval Required"),
    },
    {
      key: "progress",
      header: "Progress",
      accessor: (s) => s.followUpsSent,
      sortable: true,
      render: (s) => (
        <span className="tabular-nums">
          {s.followUpsSent}/{s.totalFollowUps} sent
        </span>
      ),
    },
    {
      key: "intervalDays",
      header: "Interval",
      render: (s) => `${s.intervalDays}d`,
    },
    {
      key: "lastSentAt",
      header: "Last Sent",
      sortable: true,
      render: (s) => (s.lastSentAt ? formatDate(s.lastSentAt) : "—"),
    },
    {
      key: "nextScheduledAt",
      header: "Next Scheduled",
      sortable: true,
      render: (s) => (s.nextScheduledAt ? formatDate(s.nextScheduledAt) : "—"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-Up Analytics"
        description="Active sequences, delivery metrics, and opt-out tracking."
      />

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Sequences"
          value={activeSequences}
          icon={MailCheck}
        />
        <StatCard
          label="Total Sent"
          value={`${totalSent}/${totalPlanned}`}
          icon={Send}
        />
        <StatCard
          label="Response Rate"
          value={`${responseRate}%`}
          icon={Reply}
        />
        <StatCard
          label="Opt-Outs"
          value={optOuts}
          icon={ShieldOff}
        />
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Sequences by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {statusBreakdown.map(({ status, count }) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold tabular-nums">{count}</p>
                <Badge
                  variant="secondary"
                  className={`mt-1 font-medium border-0 ${STATUS_COLORS[status] ?? ""}`}
                >
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sequences table */}
      {followUpSequences.length === 0 ? (
        <EmptyState
          title="No follow-up sequences"
          description="Create follow-up sequences from engagement threads or overdue tasks."
          actionLabel="Go to Follow-Ups"
          actionHref="/follow-ups"
        />
      ) : (
        <DataTable columns={columns} data={followUpSequences} />
      )}
    </div>
  );
}
