"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Landmark } from "lucide-react";
import { creditFacilities } from "@/mock-data";
import { deals, dealCapitalProviders } from "@/mock-data";
import { calculateUtilization } from "@/components/shared/facility-utilization";
import Link from "next/link";
import type { CreditFacility } from "@/types";

interface FacilitiesSectionProps {
  capitalProviderId: string;
}

export function FacilitiesSection({ capitalProviderId }: FacilitiesSectionProps) {
  const facilities = creditFacilities
    .filter((f) => f.capitalProviderId === capitalProviderId)
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Credit Facilities</CardTitle>
        <Link href={`/capital-providers/${capitalProviderId}/facilities/new`}>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Credit Facility
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {facilities.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No Credit Facilities"
            description="Add a credit facility to track utilization and terms for this capital provider."
            actionLabel="Add Credit Facility"
            actionHref={`/capital-providers/${capitalProviderId}/facilities/new`}
          />
        ) : (
          <div className="space-y-4">
            {facilities.map((facility) => (
              <FacilityRow key={facility.id} facility={facility} capitalProviderId={capitalProviderId} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FacilityRow({
  facility,
  capitalProviderId,
}: {
  facility: CreditFacility;
  capitalProviderId: string;
}) {
  const { utilized } = calculateUtilization(
    facility,
    deals,
    dealCapitalProviders
  );
  const percentage =
    facility.facilitySizeDollars > 0
      ? (utilized / facility.facilitySizeDollars) * 100
      : 0;
  const isAmber = percentage >= 80 && percentage < 100;

  return (
    <Link
      href={`/capital-providers/${capitalProviderId}/facilities/${facility.id}`}
      className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium">{facility.name}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatCurrency(facility.facilitySizeDollars)}
            {facility.startDate && ` · Started ${formatDate(facility.startDate)}`}
          </p>
        </div>
        <StatusBadge status={facility.status} context="facility" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Utilization</span>
          <span className="tabular-nums">
            {formatCurrency(utilized)} / {formatCurrency(facility.facilitySizeDollars)}
          </span>
        </div>
        <ProgressBar percentage={percentage} hasOverdue={isAmber} showLabel={false} />
      </div>
    </Link>
  );
}
