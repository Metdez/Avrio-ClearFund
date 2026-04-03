"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/progress-bar";
import { AlertTriangle, Ban } from "lucide-react";
import type { CreditFacility, Deal, DealCapitalProvider } from "@/types";

interface FacilityUtilizationProps {
  facility: CreditFacility;
  deals: Deal[];
  dealCapitalProviders: DealCapitalProvider[];
  className?: string;
}

function calculateUtilization(
  facility: CreditFacility,
  deals: Deal[],
  dealCapitalProviders: DealCapitalProvider[]
): { utilized: number; linkedDeals: Deal[] } {
  // Find deal-CP links for this facility's CP where deal is Funded/Closed and CP is Committed
  const cpLinks = dealCapitalProviders.filter(
    (dcp) =>
      dcp.capitalProviderId === facility.capitalProviderId &&
      dcp.status === "Committed"
  );

  const linkedDealIds = new Set(cpLinks.map((dcp) => dcp.dealId));
  const linkedDeals = deals.filter(
    (d) =>
      linkedDealIds.has(d.id) &&
      (d.pipelineStage === "Funded" || d.pipelineStage === "Closed") &&
      !d.isArchived
  );

  const utilized = linkedDeals.reduce(
    (sum, d) => sum + (d.estimatedDealSize ?? 0),
    0
  );

  return { utilized, linkedDeals };
}

export function FacilityUtilization({
  facility,
  deals,
  dealCapitalProviders,
  className,
}: FacilityUtilizationProps) {
  const { utilized, linkedDeals } = calculateUtilization(
    facility,
    deals,
    dealCapitalProviders
  );

  const remaining = Math.max(0, facility.facilitySizeDollars - utilized);
  const percentage =
    facility.facilitySizeDollars > 0
      ? (utilized / facility.facilitySizeDollars) * 100
      : 0;
  const isAmber = percentage >= 80 && percentage < 100;
  const isRed = percentage >= 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-medium tabular-nums">
            {formatCurrency(utilized)} / {formatCurrency(facility.facilitySizeDollars)}
          </span>
        </div>
        <ProgressBar
          percentage={percentage}
          hasOverdue={isAmber}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Remaining Capacity</span>
        <span className="font-medium tabular-nums">{formatCurrency(remaining)}</span>
      </div>

      {isAmber && !isRed && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 border border-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Facility utilization exceeds 80%</span>
        </div>
      )}

      {isRed && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          <Ban className="h-4 w-4 shrink-0" />
          <span>Facility fully utilized</span>
        </div>
      )}

      {linkedDeals.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Linked Funded Deals
          </p>
          <ul className="space-y-1">
            {linkedDeals.map((deal) => (
              <li key={deal.id} className="flex items-center justify-between text-sm">
                <a
                  href={`/deals/${deal.id}`}
                  className="text-blue-600 hover:underline truncate mr-2"
                >
                  {deal.name}
                </a>
                <span className="tabular-nums text-muted-foreground shrink-0">
                  {formatCurrency(deal.estimatedDealSize ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {linkedDeals.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No funded deals linked to this facility — {formatCurrency(0)} / 0% utilized.
        </p>
      )}
    </div>
  );
}

export { calculateUtilization };
