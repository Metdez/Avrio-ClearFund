"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { borrowers, capitalProviders, deals, engagementThreads } from "@/mock-data";
import { formatDate } from "@/lib/utils";
import { Unplug, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Communication } from "@/types";

interface EmailDetailSheetProps {
  email: Communication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlink: (emailId: string) => void;
}

function getEntityName(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  if (entityType === "Borrower") {
    return borrowers.find((b) => b.id === entityId)?.name ?? null;
  }
  if (entityType === "CapitalProvider") {
    return capitalProviders.find((cp) => cp.id === entityId)?.firmName ?? null;
  }
  if (entityType === "Deal") {
    return deals.find((d) => d.id === entityId)?.name ?? null;
  }
  return null;
}

function getEntityUrl(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  if (entityType === "Borrower") return `/borrowers/${entityId}`;
  if (entityType === "CapitalProvider") return `/capital-providers/${entityId}`;
  if (entityType === "Deal") return `/deals/${entityId}`;
  return null;
}

function getThreadTitle(threadId?: string): string | null {
  if (!threadId) return null;
  return engagementThreads.find((t) => t.id === threadId)?.title ?? null;
}

function getDealName(dealId?: string): string | null {
  if (!dealId) return null;
  return deals.find((d) => d.id === dealId)?.name ?? null;
}

export function EmailDetailSheet({ email, open, onOpenChange, onUnlink }: EmailDetailSheetProps) {
  if (!email) return null;

  const entityName = getEntityName(email.entityType, email.entityId);
  const entityUrl = getEntityUrl(email.entityType, email.entityId);
  const threadTitle = getThreadTitle(email.threadId);
  const dealName = getDealName(email.dealId);

  const hasLinks = entityName || threadTitle || dealName;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader className="pr-8">
          <SheetTitle className="text-base leading-tight">
            {email.emailSubject}
          </SheetTitle>
          <SheetDescription>
            Email detail
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-4">
            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-12">From</span>
                <span>{email.emailSender}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-12">To</span>
                <span>{email.emailRecipients?.join(", ")}</span>
              </div>
              {email.emailCc && email.emailCc.length > 0 && (
                <div className="flex gap-2">
                  <span className="font-medium text-muted-foreground w-12">CC</span>
                  <span>{email.emailCc.join(", ")}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-12">Date</span>
                <span>{formatDate(email.timestamp)}</span>
              </div>
            </div>

            <Separator />

            {/* Body */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {email.emailBody}
            </div>

            {/* Linked entities */}
            {hasLinks && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Linked Entities</h4>

                  <div className="space-y-2">
                    {entityName && entityUrl && (
                      <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">{email.entityType}: </span>
                          <Link href={entityUrl} className="font-medium hover:underline">
                            {entityName}
                            <ExternalLink className="ml-1 inline h-3 w-3" />
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => onUnlink(email.id)}
                        >
                          <Unplug className="mr-1 h-3 w-3" />
                          Unlink
                        </Button>
                      </div>
                    )}

                    {dealName && (
                      <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Deal: </span>
                          <Link href={`/deals/${email.dealId}`} className="font-medium hover:underline">
                            {dealName}
                            <ExternalLink className="ml-1 inline h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {threadTitle && (
                      <div className="flex items-center rounded-md border px-3 py-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Thread: </span>
                          <span className="font-medium">{threadTitle}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
