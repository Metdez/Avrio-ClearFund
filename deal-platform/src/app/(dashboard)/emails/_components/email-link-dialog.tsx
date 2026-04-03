"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { borrowers, capitalProviders, deals, engagementThreads } from "@/mock-data";
import type { Communication } from "@/types";

interface EmailLinkDialogProps {
  email: Communication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (emailId: string) => void;
}

export function EmailLinkDialog({ email, open, onOpenChange, onLink }: EmailLinkDialogProps) {
  const [selectedBorrower, setSelectedBorrower] = useState("");
  const [selectedCP, setSelectedCP] = useState("");
  const [selectedDeal, setSelectedDeal] = useState("");
  const [selectedThread, setSelectedThread] = useState("");

  // Filter threads by selected CP
  const filteredThreads = useMemo(() => {
    if (!selectedCP) return [];
    return engagementThreads.filter((t) => t.capitalProviderId === selectedCP);
  }, [selectedCP]);

  const activeBorrowers = borrowers.filter((b) => !b.isArchived);
  const activeCPs = capitalProviders.filter((cp) => !cp.isArchived);
  const activeDeals = deals.filter((d) => !d.isArchived);

  const canSave = selectedBorrower || selectedCP || selectedDeal;

  function handleSave() {
    if (!email) return;
    onLink(email.id);
    resetForm();
  }

  function resetForm() {
    setSelectedBorrower("");
    setSelectedCP("");
    setSelectedDeal("");
    setSelectedThread("");
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetForm();
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Email</DialogTitle>
          <DialogDescription>
            Associate this email with a borrower, capital provider, deal, or engagement thread.
          </DialogDescription>
        </DialogHeader>

        {email && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
            <div className="font-medium">{email.emailSubject}</div>
            <div className="text-muted-foreground">From: {email.emailSender}</div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Borrower</Label>
            <Select value={selectedBorrower} onValueChange={(val) => setSelectedBorrower(val ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select borrower..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {activeBorrowers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Capital Provider</Label>
            <Select
              value={selectedCP}
              onValueChange={(val) => {
                setSelectedCP(val ?? "");
                setSelectedThread("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select capital provider..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {activeCPs.map((cp) => (
                  <SelectItem key={cp.id} value={cp.id}>
                    {cp.firmName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deal</Label>
            <Select value={selectedDeal} onValueChange={(val) => setSelectedDeal(val ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select deal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {activeDeals.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredThreads.length > 0 && (
            <div className="space-y-2">
              <Label>Engagement Thread</Label>
              <Select value={selectedThread} onValueChange={(val) => setSelectedThread(val ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select thread..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None</SelectItem>
                  {filteredThreads.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Link Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
