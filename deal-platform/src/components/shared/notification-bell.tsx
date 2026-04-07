"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  MessageSquare,
  Clock,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { notifications as allNotifications } from "@/mock-data";
import { formatRelativeDate } from "@/lib/utils";
import type { Notification } from "@/types";

const NOTIFICATION_ICONS: Record<Notification["type"], typeof Bell> = {
  OverdueTask: AlertTriangle,
  CPResponse: MessageSquare,
  FollowUpReminder: Clock,
  DealStageChange: ArrowRightLeft,
};

const NOTIFICATION_ICON_COLORS: Record<Notification["type"], string> = {
  OverdueTask: "text-red-600",
  CPResponse: "text-blue-600",
  FollowUpReminder: "text-amber-600",
  DealStageChange: "text-emerald-600",
};

export function NotificationBell() {
  const [notifs, setNotifs] = useState(allNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifs.filter((n) => !n.isRead).length;
  const recent = [...notifs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  function handleClick(id: string) {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative inline-flex items-center justify-center rounded-lg size-9 sm:size-7 hover:bg-muted transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none"
          >
            {unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[calc(100vw-2rem)] sm:w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            recent.map((notif) => {
              const Icon = NOTIFICATION_ICONS[notif.type];
              const iconColor = NOTIFICATION_ICON_COLORS[notif.type];
              return (
                <Link
                  key={notif.id}
                  href={notif.linkUrl}
                  onClick={() => handleClick(notif.id)}
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                    !notif.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm leading-tight truncate ${
                        !notif.isRead ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeDate(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 mt-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>
        <Separator />
        <div className="px-4 py-2">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
