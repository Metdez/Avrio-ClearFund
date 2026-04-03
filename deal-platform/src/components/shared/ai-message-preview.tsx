"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Pencil, Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AiMessagePreviewProps {
  recipientName: string;
  recipientEmail: string;
  dealOrTaskName: string;
  lastCommunicationDate: string;
  daysSinceLastComm: number;
  draftMessage: string;
  scheduledSendTime?: string;
  onApprove?: (message: string) => void;
  onSkip?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export function AiMessagePreview({
  recipientName,
  recipientEmail,
  dealOrTaskName,
  lastCommunicationDate,
  daysSinceLastComm,
  draftMessage,
  scheduledSendTime,
  onApprove,
  onSkip,
  onCancel,
  showActions = true,
}: AiMessagePreviewProps) {
  const [editing, setEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(draftMessage);

  return (
    <Card>
      {/* Context card */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            AI-Generated Follow-Up
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">
            Draft
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">To:</span>
            <div>
              <p className="font-medium">{recipientName}</p>
              <p className="text-muted-foreground text-xs">{recipientEmail}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">Re:</span>
            <p className="font-medium">{dealOrTaskName}</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last contact: {formatDate(lastCommunicationDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {daysSinceLastComm} day{daysSinceLastComm !== 1 ? "s" : ""} ago
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Draft message */}
        <div className="rounded-md border bg-muted/30 p-4">
          {editing ? (
            <Textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="min-h-[140px] bg-background"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{editedMessage}</p>
          )}
        </div>

        {scheduledSendTime && (
          <p className="text-xs text-muted-foreground">
            Scheduled: {formatDate(scheduledSendTime)}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-1">
            {editing ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditing(false);
                  onApprove?.(editedMessage);
                }}
              >
                Save & Approve
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove?.(editedMessage)}
                >
                  Approve & Send
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={onSkip}>
              Skip
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onCancel}
            >
              Cancel Sequence
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
