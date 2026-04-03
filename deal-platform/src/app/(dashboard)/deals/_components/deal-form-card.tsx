"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, X } from "lucide-react";
import { type DefaultValues, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { EntitySearchSelect } from "./entity-search-select";
import { type DealFormInput, useDeals } from "./deals-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_TYPES } from "@/lib/constants";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : "";
    });

const optionalNumber = (label: string, options?: { min?: number; max?: number }) =>
  z.preprocess(
    (value) => {
      if (value === "" || value == null) {
        return undefined;
      }

      if (typeof value === "string") {
        const normalized = Number(value.replaceAll(",", ""));
        return Number.isNaN(normalized) ? value : normalized;
      }

      return value;
    },
    z
      .number()
      .refine((value) => Number.isFinite(value), `${label} must be a valid number`)
      .refine(
        (value) => (options?.min == null ? true : value >= options.min),
        `${label} must be at least ${options?.min}`
      )
      .refine(
        (value) => (options?.max == null ? true : value <= options.max),
        `${label} must be ${options?.max} or less`
      )
      .optional()
  );

const dealFormSchema = z.object({
  name: z.string().trim().min(1, "Deal name is required").max(255),
  borrowerId: z.string().min(1, "Borrower is required"),
  capitalProviderIds: z.array(z.string()).optional().default([]),
  projectType: z.string().optional(),
  location: optionalTrimmedString(500),
  estimatedDealSize: optionalNumber("Deal size", {
    min: 0.01,
    max: 999_999_999_999_999,
  }),
  traditionalFinancingPct: optionalNumber("Traditional financing %", {
    min: 0,
    max: 100,
  }),
  paceFinancingPct: optionalNumber("PACE financing %", {
    min: 0,
    max: 100,
  }),
  notes: optionalTrimmedString(5000),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

interface DealFormCardProps {
  mode: "create" | "edit";
  dealId?: string;
  defaultValues?: DealFormValues;
}

export function DealFormCard({
  mode,
  dealId,
  defaultValues,
}: DealFormCardProps) {
  const router = useRouter();
  const { activeBorrowers, activeCapitalProviders, createDeal, updateDeal } = useDeals();

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema as never) as never,
    defaultValues: (defaultValues ?? {
      name: "",
      borrowerId: "",
      capitalProviderIds: [],
      projectType: "",
      location: "",
      estimatedDealSize: undefined,
      traditionalFinancingPct: undefined,
      paceFinancingPct: undefined,
      notes: "",
    }) as DefaultValues<DealFormValues>,
  });

  const borrowerOptions = activeBorrowers.map((borrower) => ({
    value: borrower.id,
    label: borrower.name,
    meta: [borrower.projectType, borrower.location].filter(Boolean).join(" • "),
  }));

  const selectedCpIds = form.watch("capitalProviderIds") ?? [];
  const availableCpOptions = activeCapitalProviders
    .filter((cp) => !selectedCpIds.includes(cp.id))
    .map((cp) => ({
      value: cp.id,
      label: cp.firmName,
      meta: `${cp.type} • ${cp.relationshipType}`,
    }));

  const addCapitalProvider = (cpId: string) => {
    if (!selectedCpIds.includes(cpId)) {
      form.setValue("capitalProviderIds", [...selectedCpIds, cpId], {
        shouldDirty: true,
      });
    }
  };

  const removeCapitalProvider = (cpId: string) => {
    form.setValue(
      "capitalProviderIds",
      selectedCpIds.filter((id) => id !== cpId),
      { shouldDirty: true }
    );
  };

  const traditionalPct = form.watch("traditionalFinancingPct");
  const pacePct = form.watch("paceFinancingPct");
  const financingTotal = (traditionalPct ?? 0) + (pacePct ?? 0);
  const showFinancingWarning =
    (traditionalPct != null || pacePct != null) && financingTotal !== 100;

  const onSubmit = (values: DealFormValues) => {
    const borrower = activeBorrowers.find((item) => item.id === values.borrowerId);

    if (!borrower) {
      form.setError("borrowerId", {
        message:
          "The selected borrower has been archived. Please select an active borrower or restore the archived record.",
      });
      return;
    }

    const payload: DealFormInput = {
      name: values.name,
      borrowerId: values.borrowerId,
      capitalProviderIds: values.capitalProviderIds?.length
        ? values.capitalProviderIds
        : undefined,
      projectType: values.projectType || undefined,
      location: values.location || undefined,
      estimatedDealSize: values.estimatedDealSize,
      traditionalFinancingPct: values.traditionalFinancingPct,
      paceFinancingPct: values.paceFinancingPct,
      notes: values.notes || undefined,
    };

    if (mode === "create") {
      const deal = createDeal(payload);
      toast.success("Deal created and added to the pipeline.");
      router.push(`/deals/${deal.id}`);
      return;
    }

    if (!dealId) {
      return;
    }

    updateDeal(dealId, payload);
    toast.success("Deal details updated.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Deal" : "Edit Deal Details"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit as never)}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="borrower">Borrower</Label>
              <EntitySearchSelect
                value={form.watch("borrowerId")}
                onChange={(value) => {
                  form.setValue("borrowerId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                options={borrowerOptions}
                placeholder="Select borrower"
                emptyMessage="No active borrowers found."
              />
              {form.formState.errors.borrowerId ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.borrowerId.message}
                </p>
              ) : null}
            </div>

            {mode === "create" ? (
              <div className="space-y-2 md:col-span-2">
                <Label>Capital Providers</Label>
                <p className="text-sm text-muted-foreground">
                  Select one or more capital providers to pitch this deal to.
                </p>
                <EntitySearchSelect
                  value=""
                  onChange={addCapitalProvider}
                  options={availableCpOptions}
                  placeholder="Search capital providers"
                  emptyMessage="No available capital providers."
                />
                {selectedCpIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedCpIds.map((cpId) => {
                      const cp = activeCapitalProviders.find((p) => p.id === cpId);
                      if (!cp) return null;
                      return (
                        <Badge
                          key={cpId}
                          variant="secondary"
                          className="gap-1.5 py-1 pl-3 pr-1.5 text-sm"
                        >
                          <span>{cp.firmName}</span>
                          <span className="text-xs text-muted-foreground">
                            {cp.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCapitalProvider(cpId)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {cp.firmName}</span>
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="name">Deal Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select
                value={form.watch("projectType") || "none"}
                onValueChange={(value) =>
                  form.setValue("projectType", (value === "none" ? "" : value) ?? "", {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id="projectType" className="w-full">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project type</SelectItem>
                  {PROJECT_TYPES.map((projectType) => (
                    <SelectItem key={projectType} value={projectType}>
                      {projectType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...form.register("location")} />
              {form.formState.errors.location ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.location.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDealSize">Estimated Deal Size ($)</Label>
              <Input
                id="estimatedDealSize"
                type="number"
                min="0"
                step="0.01"
                {...form.register("estimatedDealSize")}
              />
              {form.formState.errors.estimatedDealSize ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.estimatedDealSize.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="traditionalFinancingPct">
                Traditional Financing %
              </Label>
              <Input
                id="traditionalFinancingPct"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...form.register("traditionalFinancingPct")}
              />
              {form.formState.errors.traditionalFinancingPct ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.traditionalFinancingPct.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paceFinancingPct">PACE Financing %</Label>
              <Input
                id="paceFinancingPct"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...form.register("paceFinancingPct")}
              />
              {form.formState.errors.paceFinancingPct ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.paceFinancingPct.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={5} {...form.register("notes")} />
              {form.formState.errors.notes ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.notes.message}
                </p>
              ) : null}
            </div>
          </div>

          {showFinancingWarning ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Financing percentages do not total 100%. This may be intentional
                for partial structures.
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit">
              {mode === "create" ? "Create Deal" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              render={<Link href={mode === "create" ? "/deals" : `/deals/${dealId}`} />}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { dealFormSchema };
export type { DealFormValues };
