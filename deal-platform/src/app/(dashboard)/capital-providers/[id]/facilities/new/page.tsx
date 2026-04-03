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
import { PageHeader } from "@/components/shared/page-header";
import { FACILITY_STATUSES } from "@/lib/constants";
import { capitalProviders } from "@/mock-data";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const facilityFormSchema = z
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

type FacilityFormData = z.infer<typeof facilityFormSchema>;

export default function NewCreditFacilityPage() {
  const params = useParams();
  const router = useRouter();
  const cpId = params.id as string;
  const cp = capitalProviders.find((c) => c.id === cpId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FacilityFormData>({
    resolver: zodResolver(facilityFormSchema as any) as any,
    defaultValues: {
      name: "",
      facilitySizeDollars: undefined as unknown as number,
      status: "Negotiating",
      termLength: "",
      refinancingProvisions: "",
      startDate: "",
      endDate: "",
    },
  });

  const [selectedStatus, setSelectedStatus] = useState<string>("Negotiating");

  function onSubmit(data: FacilityFormData) {
    // Mock save
    toast.success("Credit facility created successfully");
    if (cp && cp.relationshipType !== "Credit Facility Partner") {
      toast.info("Capital Provider auto-upgraded to Credit Facility Partner");
    }
    router.push(`/capital-providers/${cpId}`);
  }

  if (!cp) {
    return (
      <div className="space-y-6">
        <PageHeader title="Capital Provider Not Found" />
        <p className="text-muted-foreground">
          The capital provider does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/capital-providers/${cpId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {cp.firmName}
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Add Credit Facility"
        description={`Create a new credit facility for ${cp.firmName}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Facility Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facility Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Facility Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., JP Morgan PACE Credit Line"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Facility Size */}
              <div className="space-y-2">
                <Label htmlFor="facilitySizeDollars">
                  Facility Size ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="facilitySizeDollars"
                  type="number"
                  placeholder="e.g., 200000000"
                  {...register("facilitySizeDollars", { valueAsNumber: true })}
                />
                {errors.facilitySizeDollars && (
                  <p className="text-sm text-red-500">
                    {errors.facilitySizeDollars.message}
                  </p>
                )}
              </div>

              {/* Annual Allocation */}
              <div className="space-y-2">
                <Label htmlFor="annualAllocationDollars">
                  Annual Allocation ($)
                </Label>
                <Input
                  id="annualAllocationDollars"
                  type="number"
                  placeholder="Optional"
                  {...register("annualAllocationDollars", { valueAsNumber: true })}
                />
                {errors.annualAllocationDollars && (
                  <p className="text-sm text-red-500">
                    {errors.annualAllocationDollars.message}
                  </p>
                )}
              </div>

              {/* Spread Split */}
              <div className="space-y-2">
                <Label htmlFor="spreadSplitPct">Spread Split (%)</Label>
                <Input
                  id="spreadSplitPct"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g., 60"
                  {...register("spreadSplitPct", { valueAsNumber: true })}
                />
                {errors.spreadSplitPct && (
                  <p className="text-sm text-red-500">
                    {errors.spreadSplitPct.message}
                  </p>
                )}
              </div>

              {/* Term Length */}
              <div className="space-y-2">
                <Label htmlFor="termLength">Term Length</Label>
                <Input
                  id="termLength"
                  placeholder='e.g., "5 years" or "Evergreen"'
                  {...register("termLength")}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(v) => {
                    if (v) {
                      setSelectedStatus(v);
                      setValue("status", v as FacilityFormData["status"]);
                    }
                  }}
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
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Refinancing Provisions */}
            <div className="space-y-2">
              <Label htmlFor="refinancingProvisions">
                Refinancing Provisions
              </Label>
              <Textarea
                id="refinancingProvisions"
                placeholder="Describe any refinancing or extension provisions..."
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

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Credit Facility"}
              </Button>
              <Link href={`/capital-providers/${cpId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
