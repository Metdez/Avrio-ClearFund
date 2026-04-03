"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  MessageSquare,
  Clock,
  ArrowRightLeft,
  CheckCheck,
  BellRing,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { notifications as initialNotifications } from "@/mock-data";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { Notification } from "@/types";

const NOTIFICATION_ICONS: Record<Notification["type"], typeof Bell> = {
  OverdueTask: AlertTriangle,
  CPResponse: MessageSquare,
  FollowUpReminder: Clock,
  DealStageChange: ArrowRightLeft,
};

const NOTIFICATION_ICON_COLORS: Record<Notification["type"], string> = {
  OverdueTask: "text-red-600 bg-red-50",
  CPResponse: "text-blue-600 bg-blue-50",
  FollowUpReminder: "text-amber-600 bg-amber-50",
  DealStageChange: "text-emerald-600 bg-emerald-50",
};

const TYPE_LABELS: Record<Notification["type"], string> = {
  OverdueTask: "Overdue Task",
  CPResponse: "CP Response",
  FollowUpReminder: "Follow-Up Reminder",
  DealStageChange: "Deal Stage Change",
};

const DEMO_TOASTS: Array<{ title: string; body: string; type: Notification["type"] }> = [
  {
    title: "Task overdue: Phase I Environmental Assessment",
    body: "3 days overdue on Meridian Hotel Dallas deal",
    type: "OverdueTask",
  },
  {
    title: "Ares Capital responded to evaluation thread",
    body: "New terms proposed on Great Lakes Solar Array",
    type: "CPResponse",
  },
  {
    title: "Deal moved to Execution",
    body: "Sierra Gold Mine Remediation entered execution phase",
    type: "DealStageChange",
  },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(initialNotifications);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const filtered = [...notifs]
    .filter((n) => !typeFilter || n.type === typeFilter)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  }

  function markRead(id: string) {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  function triggerDemoToast() {
    const demo = DEMO_TOASTS[Math.floor(Math.random() * DEMO_TOASTS.length)];
    const Icon = NOTIFICATION_ICONS[demo.type];
    toast(demo.title, {
      description: demo.body,
      icon: <Icon className="h-4 w-4" />,
      action: {
        label: "View",
        onClick: () => {},
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerDemoToast}
            >
              <BellRing className="mr-2 h-4 w-4" />
              Demo Toast
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Select
          value={typeFilter ?? ""}
          onValueChange={(val) =>
            setTypeFilter(val === "" || val == null ? null : val)
          }
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="OverdueTask">Overdue Tasks</SelectItem>
            <SelectItem value="CPResponse">CP Responses</SelectItem>
            <SelectItem value="FollowUpReminder">Follow-Up Reminders</SelectItem>
            <SelectItem value="DealStageChange">Deal Stage Changes</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            typeFilter
              ? "No notifications match the selected filter."
              : "You're all caught up."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const Icon = NOTIFICATION_ICONS[notif.type];
            const iconColor = NOTIFICATION_ICON_COLORS[notif.type];
            return (
              <Link
                key={notif.id}
                href={notif.linkUrl}
                onClick={() => markRead(notif.id)}
              >
                <Card
                  className={`transition-colors hover:bg-muted/50 ${
                    !notif.isRead
                      ? "border-l-4 border-l-blue-600 bg-blue-50/30"
                      : ""
                  }`}
                >
                  <CardContent className="flex items-start gap-4 py-4 px-5">
                    <div
                      className={`shrink-0 rounded-full p-2 ${iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm leading-tight ${
                            !notif.isRead ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {TYPE_LABELS[notif.type]}
                        </Badge>
                        {!notif.isRead && (
                          <div className="shrink-0 h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notif.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatRelativeDate(notif.createdAt)} &middot;{" "}
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
