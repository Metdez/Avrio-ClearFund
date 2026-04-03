"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Mail, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Communication } from "@/types";

interface EmailTimelineEntryProps {
  email: Communication;
  className?: string;
}

export function EmailTimelineEntry({ email, className }: EmailTimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const bodyPreview = email.emailBody?.slice(0, 200) ?? "";
  const hasMore = (email.emailBody?.length ?? 0) > 200;

  return (
    <div className={cn("flex gap-3", className)}>
      {/* Icon */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 w-px bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-baseline justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">From: </span>
            <span className="font-medium">{email.emailSender}</span>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(email.timestamp)}</span>
        </div>
        <div className="text-sm font-medium mt-0.5">{email.emailSubject}</div>
        <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {expanded ? email.emailBody : bodyPreview}
          {hasMore && !expanded && "..."}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
