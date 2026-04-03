"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface OptOutBadgeProps {
  contactName: string;
  isOptedOut: boolean;
  isAdmin?: boolean;
  onClearOptOut?: () => void;
  className?: string;
}

export function OptOutBadge({
  contactName,
  isOptedOut,
  isAdmin = false,
  onClearOptOut,
  className,
}: OptOutBadgeProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isOptedOut) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-red-50 text-red-700 border border-red-200"
        >
          <ShieldOff className="h-3 w-3 mr-1" />
          Opted out of automated follow-ups
        </Badge>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => setConfirmOpen(true)}
          >
            Clear opt-out
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear Opt-Out?"
        description={`This will allow automated follow-ups to be sent to ${contactName} again. This action will be recorded in the audit log.`}
        confirmLabel="Clear Opt-Out"
        onConfirm={() => {
          onClearOptOut?.();
          setConfirmOpen(false);
          toast.success(`Opt-out cleared for ${contactName}.`);
        }}
      />
    </div>
  );
}
