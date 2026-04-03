"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Zap, ShieldCheck } from "lucide-react";

interface FollowUpSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  contactEmail: string;
  contextLabel: string; // e.g. "Thread: JP Morgan Evaluation" or "Task: Phase 1 ESA"
  isOptedOut?: boolean;
  onSave?: (config: {
    totalFollowUps: number;
    intervalDays: number;
    mode: "AutoSend" | "ApprovalRequired";
  }) => void;
}

export function FollowUpSetupDialog({
  open,
  onOpenChange,
  contactName,
  contactEmail,
  contextLabel,
  isOptedOut = false,
  onSave,
}: FollowUpSetupDialogProps) {
  const [totalFollowUps, setTotalFollowUps] = useState(3);
  const [intervalDays, setIntervalDays] = useState(7);
  const [autoSend, setAutoSend] = useState(false);
  const [intervalError, setIntervalError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleIntervalChange(value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setIntervalError("Interval must be at least 1 day");
      setIntervalDays(num || 0);
    } else {
      setIntervalError(null);
      setIntervalDays(num);
    }
  }

  function handleSave() {
    if (intervalDays < 1) {
      setIntervalError("Interval must be at least 1 day");
      return;
    }
    onSave?.({
      totalFollowUps,
      intervalDays,
      mode: autoSend ? "AutoSend" : "ApprovalRequired",
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Set Up Follow-Up Sequence</DialogTitle>
          <DialogDescription>
            Configure automated follow-ups for{" "}
            <span className="font-medium text-foreground">{contactName}</span>{" "}
            ({contactEmail})
          </DialogDescription>
        </DialogHeader>

        {isOptedOut ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This contact has opted out of automated follow-ups. An Admin must
              clear the opt-out before a new sequence can be created.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6 py-2">
            {/* Context */}
            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {contextLabel}
            </div>

            {/* Number of follow-ups */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of follow-ups</Label>
                <span className="text-sm font-medium">{totalFollowUps}</span>
              </div>
              <Slider
                value={[totalFollowUps]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setTotalFollowUps(val);
                }}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* Interval */}
            <div className="space-y-2">
              <Label htmlFor="interval">Interval between follow-ups (days)</Label>
              <Input
                id="interval"
                type="number"
                min={1}
                value={intervalDays}
                onChange={(e) => handleIntervalChange(e.target.value)}
              />
              {intervalError && (
                <p className="text-sm text-red-600">{intervalError}</p>
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {autoSend ? (
                    <Zap className="h-4 w-4 text-amber-600" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  )}
                  <Label className="text-sm font-medium">
                    {autoSend ? "Auto-Send" : "Approval Required"}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {autoSend
                    ? "Messages are sent automatically without review."
                    : "Each message requires your approval before sending."}
                </p>
              </div>
              <Switch checked={autoSend} onCheckedChange={setAutoSend} />
            </div>

            {/* Summary */}
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Summary</p>
              <p className="text-muted-foreground mt-1">
                {totalFollowUps} follow-up{totalFollowUps > 1 ? "s" : ""} every{" "}
                {intervalDays} day{intervalDays > 1 ? "s" : ""} via{" "}
                {autoSend ? "auto-send" : "approval queue"}.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isOptedOut && (
            <Button onClick={handleSave} disabled={saved || intervalDays < 1}>
              {saved ? (
                <>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-0 mr-2">
                    Active
                  </Badge>
                  Saved
                </>
              ) : (
                "Activate Sequence"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
