"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FacilityUtilization } from "@/components/shared/facility-utilization";
import { FACILITY_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { creditFacilities, deals, dealCapitalProviders, auditLogs, users } from "@/mock-data";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  AlertTriangle,
  History,
  Info,
} from "lucide-react";

const facilityEditSchema = z
  .object({
    name: z.string().min(1, "Facility name is required").max(255, "Max 255 characters"),
    facilitySizeDollars: z.coerce
      .number()
      .positive("Facility size must be greater than zero")
      .max(999999999999999, "Max 15 digits"),
    annualAllocationDollars: z
      .union([z.coerce.number().positive("Must be a positive number"), z.literal("")])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    spreadSplitPct: z
      .union([
        z.coerce.number().min(0, "Min 0%").max(100, "Max 100%"),
        z.literal(""),
      ])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    termLength: z.string().max(255).optional(),
    refinancingProvisions: z.string().max(5000, "Max 5000 characters").optional(),
    status: z.enum(["Negotiating", "Active", "Expired", "Terminated"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type FacilityEditData = z.infer<typeof facilityEditSchema>;

export default function CreditFacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cpId = params.id as string;
  const facilityId = params.facilityId as string;

  const facility = creditFacilities.find((f) => f.id === facilityId);
  const [isEditing, setIsEditing] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showConcurrentWarning, setShowConcurrentWarning] = useState(false);

  const facilityAuditLogs = auditLogs
    .filter(
      (log) => log.entityType === "CreditFacility" && log.entityId === facilityId
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FacilityEditData>({
    resolver: zodResolver(facilityEditSchema as any) as any,
    defaultValues: facility
      ? {
          name: facility.name,
          facilitySizeDollars: facility.facilitySizeDollars,
          annualAllocationDollars: facility.annualAllocationDollars ?? (undefined as unknown as number),
          spreadSplitPct: facility.spreadSplitPct ?? (undefined as unknown as number),
          termLength: facility.termLength ?? "",
          refinancingProvisions: facility.refinancingProvisions ?? "",
          status: facility.status,
          startDate: facility.startDate
            ? facility.startDate.split("T")[0]
            : "",
          endDate: facility.endDate ? facility.endDate.split("T")[0] : "",
        }
      : undefined,
  });

  const [selectedStatus, setSelectedStatus] = useState<string>(
    facility?.status ?? "Negotiating"
  );

  if (!facility) {
    return (
      <div className="space-y-6">
        <PageHeader title="Credit Facility Not Found" />
        <p className="text-muted-foreground">
          This credit facility does not exist.
        </p>
      </div>
    );
  }

  function onSubmit(data: FacilityEditData) {
    // Simulate concurrent edit check (random 10% chance)
    if (Math.random() < 0.1) {
      setShowConcurrentWarning(true);
      return;
    }

    toast.success("Credit facility updated successfully");
    setIsEditing(false);
  }

  function handleTerminate() {
    setSelectedStatus("Terminated");
    setValue("status", "Terminated");
    setShowTerminateConfirm(false);
    toast.success("Credit facility terminated");
    setIsEditing(false);
  }

  function handleCancelEdit() {
    reset();
    setSelectedStatus(facility!.status);
    setIsEditing(false);
  }

  function handleStatusChange(value: string | null) {
    if (!value) return;
    if (value === "Terminated") {
      setShowTerminateConfirm(true);
      return;
    }
    setSelectedStatus(value);
    setValue("status", value as FacilityEditData["status"]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/capital-providers/${cpId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Capital Provider
          </Button>
        </Link>
      </div>

      <PageHeader
        title={facility.name}
        description={`Credit facility · ${formatCurrency(facility.facilitySizeDollars)}`}
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Facility Terms
                <StatusBadge status={facility.status} context="facility" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Facility Name <span className="text-red-500">*</span>
                      </Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facilitySizeDollars">
                        Facility Size ($) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="facilitySizeDollars"
                        type="number"
                        {...register("facilitySizeDollars", { valueAsNumber: true })}
                      />
                      {errors.facilitySizeDollars && (
                        <p className="text-sm text-red-500">
                          {errors.facilitySizeDollars.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="annualAllocationDollars">
                        Annual Allocation ($)
                      </Label>
                      <Input
                        id="annualAllocationDollars"
                        type="number"
                        {...register("annualAllocationDollars", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spreadSplitPct">Spread Split (%)</Label>
                      <Input
                        id="spreadSplitPct"
                        type="number"
                        min={0}
                        max={100}
                        {...register("spreadSplitPct", { valueAsNumber: true })}
                      />
                      {errors.spreadSplitPct && (
                        <p className="text-sm text-red-500">
                          {errors.spreadSplitPct.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="termLength">Term Length</Label>
                      <Input id="termLength" {...register("termLength")} />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FACILITY_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register("startDate")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register("endDate")}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-red-500">
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refinancingProvisions">
                      Refinancing Provisions
                    </Label>
                    <Textarea
                      id="refinancingProvisions"
                      rows={4}
                      {...register("refinancingProvisions")}
                    />
                    {errors.refinancingProvisions && (
                      <p className="text-sm text-red-500">
                        {errors.refinancingProvisions.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {watch("refinancingProvisions")?.length ?? 0} / 5,000 characters
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    {facility.status !== "Terminated" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setShowTerminateConfirm(true)}
                      >
                        Terminate Facility
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField label="Facility Name" value={facility.name} />
                    <DetailField
                      label="Facility Size"
                      value={formatCurrency(facility.facilitySizeDollars)}
                    />
                    <DetailField
                      label="Annual Allocation"
                      value={
                        facility.annualAllocationDollars
                          ? formatCurrency(facility.annualAllocationDollars)
                          : "—"
                      }
                    />
                    <DetailField
                      label="Spread Split"
                      value={
                        facility.spreadSplitPct !== undefined
                          ? `${facility.spreadSplitPct}%`
                          : "—"
                      }
                    />
                    <DetailField
                      label="Term Length"
                      value={facility.termLength ?? "—"}
                    />
                    <DetailField label="Status" value={facility.status} />
                    <DetailField
                      label="Start Date"
                      value={
                        facility.startDate
                          ? formatDate(facility.startDate)
                          : "—"
                      }
                    />
                    <DetailField
                      label="End Date"
                      value={
                        facility.endDate ? formatDate(facility.endDate) : "—"
                      }
                    />
                  </div>

                  {facility.refinancingProvisions && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Refinancing Provisions
                        </p>
                        <p className="text-sm whitespace-pre-wrap">
                          {facility.refinancingProvisions}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      Created:{" "}
                      {formatDate(facility.createdAt)} by{" "}
                      {users.find((u) => u.id === facility.createdBy)?.name ?? facility.createdBy}
                    </div>
                    <div>
                      Last updated:{" "}
                      {formatDate(facility.updatedAt)} by{" "}
                      {users.find((u) => u.id === facility.updatedBy)?.name ?? facility.updatedBy}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Utilization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <FacilityUtilization
                facility={facility}
                deals={deals}
                dealCapitalProviders={dealCapitalProviders}
              />
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {facilityAuditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No audit log entries for this facility.
                </p>
              ) : (
                <div className="space-y-3">
                  {facilityAuditLogs.map((log) => {
                    const user = users.find((u) => u.id === log.userId);
                    return (
                      <div
                        key={log.id}
                        className="text-sm border-l-2 border-muted pl-3 py-1"
                      >
                        <p className="font-medium">
                          {log.actionType} by {user?.name ?? log.userId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </p>
                        {log.changedFields && (
                          <div className="mt-1 text-xs">
                            {Object.entries(log.changedFields).map(
                              ([field, change]) => (
                                <p key={field} className="text-muted-foreground">
                                  {field}: {String(change.from)} → {String(change.to)}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terminate Confirmation */}
      <ConfirmDialog
        open={showTerminateConfirm}
        onOpenChange={setShowTerminateConfirm}
        title="Terminate Credit Facility"
        description="Are you sure you want to terminate this facility? This will affect utilization calculations."
        confirmLabel="Terminate"
        onConfirm={handleTerminate}
        variant="destructive"
      />

      {/* Concurrent Edit Warning */}
      {showConcurrentWarning && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <strong>Concurrent edit detected.</strong> Another user may have
            modified this facility since you started editing. Please reload the
            page and try again.
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowConcurrentWarning(false);
                  window.location.reload();
                }}
              >
                Reload
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}
