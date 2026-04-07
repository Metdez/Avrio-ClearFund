"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  MinusCircle,
  Plus,
  Search,
  Send,
  StickyNote,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

import { EntitySearchSelect } from "./entity-search-select";
import { useDeals } from "./deals-provider";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CP_PITCH_STATUSES } from "@/lib/constants";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { DealCapitalProvider } from "@/types";

interface OutreachTrackerProps {
  dealId: string;
}

const STATUS_ICONS: Record<string, typeof Send> = {
  Pitched: Send,
  Evaluating: Search,
  "Terms Negotiating": Clock,
  Committed: CheckCircle2,
  Declined: XCircle,
  Withdrawn: MinusCircle,
};

export function OutreachTracker({ dealId }: OutreachTrackerProps) {
  const {
    activeCapitalProviders,
    addCapitalProviderToDeal,
    getCapitalProviderById,
    getDealLinks,
    updateCapitalProviderStatus,
    updateDealCapitalProviderNotes,
  } = useDeals();

  const isMobile = useIsMobile();
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [selectedCapitalProviderId, setSelectedCapitalProviderId] = useState("");
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const dealLinks = getDealLinks(dealId);

  const linkRows = useMemo(
    () =>
      dealLinks
        .map((link) => ({
          link,
          capitalProvider: getCapitalProviderById(link.capitalProviderId),
        }))
        .sort(
          (a, b) =>
            new Date(b.link.updatedAt).getTime() -
            new Date(a.link.updatedAt).getTime()
        ),
    [dealLinks, getCapitalProviderById]
  );

  const availableCapitalProviders = activeCapitalProviders.filter(
    (provider) =>
      !dealLinks.some((link) => link.capitalProviderId === provider.id)
  );

  // Status counts for summary cards
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Pitched: 0,
      Evaluating: 0,
      "Terms Negotiating": 0,
      Committed: 0,
      Declined: 0,
      Withdrawn: 0,
    };
    for (const link of dealLinks) {
      counts[link.status] = (counts[link.status] || 0) + 1;
    }
    return counts;
  }, [dealLinks]);

  const addCapitalProvider = () => {
    if (!selectedCapitalProviderId) return;
    addCapitalProviderToDeal(dealId, selectedCapitalProviderId);
    setSelectedCapitalProviderId("");
    setIsAddProviderOpen(false);
    toast.success("Capital provider added with status Pitched.");
  };

  const handleOpenNote = (link: DealCapitalProvider) => {
    if (expandedNoteId === link.id) {
      setExpandedNoteId(null);
      return;
    }
    setExpandedNoteId(link.id);
    setEditingNoteText(link.notes ?? "");
  };

  const handleSaveNote = (linkId: string) => {
    updateDealCapitalProviderNotes(linkId, editingNoteText);
    setExpandedNoteId(null);
    toast.success("Note saved.");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Pitched"
          value={statusCounts["Pitched"]}
          icon={Send}
          className="border-l-4 border-l-purple-400"
        />
        <StatCard
          label="Evaluating"
          value={statusCounts["Evaluating"]}
          icon={Search}
          className="border-l-4 border-l-blue-400"
        />
        <StatCard
          label="Negotiating"
          value={statusCounts["Terms Negotiating"]}
          icon={Clock}
          className="border-l-4 border-l-amber-400"
        />
        <StatCard
          label="Committed"
          value={statusCounts["Committed"]}
          icon={CheckCircle2}
          className="border-l-4 border-l-green-400"
        />
        <StatCard
          label="Declined"
          value={statusCounts["Declined"]}
          icon={XCircle}
          className="border-l-4 border-l-red-400"
        />
        <StatCard
          label="Withdrawn"
          value={statusCounts["Withdrawn"]}
          icon={MinusCircle}
          className="border-l-4 border-l-gray-400"
        />
      </div>

      {/* Outreach Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Capital Provider Outreach</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {dealLinks.length} provider{dealLinks.length === 1 ? "" : "s"} pitched on this deal
              </p>
            </div>
            <Button type="button" onClick={() => setIsAddProviderOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Capital Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {linkRows.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              <MessageSquarePlus className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="font-medium">No capital providers pitched yet</p>
              <p className="mt-1">
                Add capital providers to start tracking outreach on this deal.
              </p>
            </div>
          ) : isMobile ? (
            /* ─── Mobile card view ─── */
            <div className="space-y-3">
              {linkRows.map(({ link, capitalProvider }) => {
                const StatusIcon = STATUS_ICONS[link.status] ?? Send;
                return (
                  <div key={link.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/capital-providers/${capitalProvider?.id ?? ""}`}
                          className="font-medium text-sm text-primary underline-offset-4 hover:underline"
                        >
                          {capitalProvider?.firmName ?? "Unknown provider"}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {capitalProvider?.type ?? "—"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleOpenNote(link)}
                        title="Add/edit note"
                      >
                        <StickyNote className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select
                      value={link.status}
                      onValueChange={(value) => {
                        updateCapitalProviderStatus(
                          link.id,
                          value as DealCapitalProvider["status"]
                        );
                        toast.success(`Status updated to ${value}.`);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {CP_PITCH_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Pitched {formatDate(link.createdAt)}</span>
                      <span title={formatDate(link.updatedAt)}>
                        Updated {formatRelativeDate(link.updatedAt)}
                      </span>
                    </div>
                    {link.notes && (
                      <p className="text-xs text-muted-foreground border-t pt-2 line-clamp-2">
                        {link.notes}
                      </p>
                    )}
                    {expandedNoteId === link.id && (
                      <div className="border-t pt-2 space-y-2">
                        <Textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          placeholder="Add a note about this pitch..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={() => handleSaveNote(link.id)}>
                            Save
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedNoteId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── Desktop table view ─── */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-3 pr-4 font-medium">Capital Provider</th>
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Date Pitched</th>
                    <th className="py-3 pr-4 font-medium">Last Updated</th>
                    <th className="py-3 pr-2 font-medium">Notes</th>
                    <th className="py-3 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {linkRows.map(({ link, capitalProvider }) => {
                    const StatusIcon = STATUS_ICONS[link.status] ?? Send;
                    return (
                      <tr key={link.id} className="group border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div className="space-y-0.5">
                            <Link
                              href={`/capital-providers/${capitalProvider?.id ?? ""}`}
                              className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                              {capitalProvider?.firmName ?? "Unknown provider"}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {capitalProvider?.contactPersonName ?? "No contact"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {capitalProvider?.type ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Select
                              value={link.status}
                              onValueChange={(value) => {
                                updateCapitalProviderStatus(
                                  link.id,
                                  value as DealCapitalProvider["status"]
                                );
                                toast.success(`Status updated to ${value}.`);
                              }}
                            >
                              <SelectTrigger className="w-[11rem]">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {CP_PITCH_STATUSES.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <StatusBadge
                              status={link.status}
                              context="cpPitch"
                            />
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(link.createdAt)}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <span
                            className="text-muted-foreground"
                            title={formatDate(link.updatedAt)}
                          >
                            {formatRelativeDate(link.updatedAt)}
                          </span>
                        </td>
                        <td className="py-3 pr-2 max-w-[16rem]">
                          {link.notes ? (
                            <p className="truncate text-muted-foreground text-xs">
                              {link.notes}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleOpenNote(link)}
                            title="Add/edit note"
                          >
                            <StickyNote className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Inline note editor */}
              {expandedNoteId && (
                <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      Note for{" "}
                      {linkRows.find(({ link }) => link.id === expandedNoteId)
                        ?.capitalProvider?.firmName ?? "provider"}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedNoteId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Textarea
                    value={editingNoteText}
                    onChange={(e) => setEditingNoteText(e.target.value)}
                    placeholder="Add a note about this pitch..."
                    rows={3}
                    className="mb-3"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveNote(expandedNoteId)}
                  >
                    Save Note
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Capital Provider Dialog */}
      <Dialog open={isAddProviderOpen} onOpenChange={setIsAddProviderOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Capital Provider</DialogTitle>
            <DialogDescription>
              Search active capital providers and link one to this deal. They
              will be added with an initial status of &quot;Pitched.&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Capital Provider</Label>
            <EntitySearchSelect
              value={selectedCapitalProviderId}
              onChange={setSelectedCapitalProviderId}
              options={availableCapitalProviders.map((provider) => ({
                value: provider.id,
                label: provider.firmName,
                meta: `${provider.type} • ${provider.relationshipType}`,
              }))}
              placeholder="Select capital provider"
              emptyMessage="No available capital providers."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddProviderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={addCapitalProvider}
              disabled={!selectedCapitalProviderId}
            >
              Add Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
