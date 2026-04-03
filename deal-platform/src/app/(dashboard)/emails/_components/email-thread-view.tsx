"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { borrowers, capitalProviders, deals, engagementThreads } from "@/mock-data";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Send, Save, Mail, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AiSuggestions } from "./ai-suggestions";
import type { Communication } from "@/types";

interface EmailThreadViewProps {
  emails: Communication[];
  onBack: () => void;
  onUnlink: (emailId: string) => void;
}

function getEntityName(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  if (entityType === "Borrower") return borrowers.find((b) => b.id === entityId)?.name ?? null;
  if (entityType === "CapitalProvider") return capitalProviders.find((cp) => cp.id === entityId)?.firmName ?? null;
  if (entityType === "Deal") return deals.find((d) => d.id === entityId)?.name ?? null;
  return null;
}

function getEntityUrl(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  if (entityType === "Borrower") return `/borrowers/${entityId}`;
  if (entityType === "CapitalProvider") return `/capital-providers/${entityId}`;
  if (entityType === "Deal") return `/deals/${entityId}`;
  return null;
}

function isIncoming(email: Communication): boolean {
  return !email.emailSender?.includes("avriocleanfund.com");
}

export function EmailThreadView({ emails, onBack, onUnlink }: EmailThreadViewProps) {
  const [replyText, setReplyText] = useState("");

  // Sort emails chronologically (oldest first for conversation flow)
  const sorted = [...emails].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const subject = latest?.emailSubject?.replace(/^RE:\s*/i, "") ?? "Email Thread";

  // Find linked entities from any email in the thread
  const linkedEntity = sorted.find((e) => e.entityType && e.entityId);
  const entityName = getEntityName(linkedEntity?.entityType, linkedEntity?.entityId);
  const entityUrl = getEntityUrl(linkedEntity?.entityType, linkedEntity?.entityId);
  const linkedDeal = sorted.find((e) => e.dealId);
  const dealName = linkedDeal?.dealId ? deals.find((d) => d.id === linkedDeal.dealId)?.name : null;

  // The last received (incoming) email — AI suggestions appear after this
  const lastIncoming = [...sorted].reverse().find((e) => isIncoming(e));

  function handleSend() {
    if (!replyText.trim()) {
      toast.error("Please enter a message before sending.");
      return;
    }
    setReplyText("");
    toast.success("Email sent");
  }

  function handleSaveDraft() {
    if (!replyText.trim()) {
      toast.error("Nothing to save.");
      return;
    }
    toast.success("Draft saved");
  }

  function handleSuggestionSelect(text: string) {
    setReplyText(text);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold leading-tight">{subject}</h2>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {entityName && entityUrl && (
              <Link href={entityUrl}>
                <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">
                  {linkedEntity?.entityType}: {entityName}
                </Badge>
              </Link>
            )}
            {dealName && linkedDeal?.dealId && (
              <Link href={`/deals/${linkedDeal.dealId}`}>
                <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">
                  Deal: {dealName}
                </Badge>
              </Link>
            )}
            <Badge variant="outline" className="text-xs">
              {sorted.length} message{sorted.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Conversation thread */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 pr-2">
          {sorted.map((email) => {
            const incoming = isIncoming(email);
            return (
              <Card
                key={email.id}
                className={`${incoming ? "border-l-4 border-l-blue-400" : "border-l-4 border-l-slate-300"}`}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${incoming ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        {incoming ? <User className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium truncate block">{email.emailSender}</span>
                        <span className="text-xs text-muted-foreground">
                          To: {email.emailRecipients?.join(", ")}
                          {email.emailCc && email.emailCc.length > 0 && ` · CC: ${email.emailCc.join(", ")}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDate(email.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap pl-9">
                    {email.emailBody}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Suggestions — shown after the conversation, before reply */}
        {lastIncoming && (
          <div className="mt-4 pr-2">
            <AiSuggestions
              email={lastIncoming}
              onSelect={handleSuggestionSelect}
            />
          </div>
        )}

        {/* Reply compose area */}
        <div className="mt-4 pr-2">
          <Separator className="mb-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Reply</span>
              {lastIncoming && (
                <span className="text-xs text-muted-foreground">
                  to {lastIncoming.emailSender}
                </span>
              )}
            </div>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Compose your reply..."
              className="min-h-[140px] resize-y"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handleSend}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
