"use client";

import { z } from "zod";
import { EntityForm, Label } from "@/components/shared/entity-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CP_TYPES, RELATIONSHIP_TYPES } from "@/lib/constants";
import type { CapitalProvider } from "@/types";
import type {
  CapitalProviderCreateFormValues,
  CapitalProviderEditFormValues,
} from "./capital-provider-store";

const phoneRegex = /^[+\d\s().-]{7,30}$/;

export const capitalProviderCreateSchema = z.object({
  firmName: z
    .string()
    .trim()
    .min(1, "Firm name is required")
    .max(255, "Firm Name must be 255 characters or fewer"),
  contactPersonName: z
    .string()
    .trim()
    .max(255, "Contact Person must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  contactPhone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || phoneRegex.test(value), {
      message: "Enter a valid phone number",
    }),
  type: z.string().trim().min(1, "Type is required"),
  notes: z
    .string()
    .trim()
    .max(5000, "Notes must be 5000 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export const capitalProviderEditSchema = capitalProviderCreateSchema.extend({
  relationshipType: z.enum(RELATIONSHIP_TYPES),
});

function getErrorMessage(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

interface CapitalProviderCreateFormProps {
  defaultValues: CapitalProviderCreateFormValues;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (values: CapitalProviderCreateFormValues) => void;
  onCancel?: () => void;
}

interface CapitalProviderEditFormProps {
  defaultValues: CapitalProviderEditFormValues;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (values: CapitalProviderEditFormValues) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function CapitalProviderCreateForm({
  defaultValues,
  submitLabel,
  cancelLabel,
  onSubmit,
  onCancel,
}: CapitalProviderCreateFormProps) {
  return (
    <EntityForm<CapitalProviderCreateFormValues>
      schema={capitalProviderCreateSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
    >
      {(form) => {
        const selectedType = form.watch("type");

        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="firmName">Firm Name</Label>
              <Input id="firmName" {...form.register("firmName")} />
              {form.formState.errors.firmName && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.firmName.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPersonName">Contact Person</Label>
              <Input id="contactPersonName" {...form.register("contactPersonName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" {...form.register("contactEmail")} />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.contactEmail.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" {...form.register("contactPhone")} />
              {form.formState.errors.contactPhone && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.contactPhone.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={selectedType || "none"}
                onValueChange={(value) => {
                  const nextValue: CapitalProviderCreateFormValues["type"] =
                    !value || value === "none"
                      ? ""
                      : (value as CapitalProvider["type"]);

                  form.setValue("type", nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select type</SelectItem>
                  {CP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "Life Insurance Company" ? "Life Insurance" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.type.message)}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={6} {...form.register("notes")} />
              {form.formState.errors.notes && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.notes.message)}
                </p>
              )}
            </div>
          </div>
        );
      }}
    </EntityForm>
  );
}

export function CapitalProviderEditForm({
  defaultValues,
  submitLabel,
  cancelLabel,
  onSubmit,
  onCancel,
  isEditing,
}: CapitalProviderEditFormProps) {
  return (
    <EntityForm<CapitalProviderEditFormValues>
      schema={capitalProviderEditSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
      isEditing={isEditing}
    >
      {(form) => {
        const selectedType = form.watch("type");
        const selectedRelationshipType = form.watch("relationshipType");

        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="firmName">Firm Name</Label>
              <Input id="firmName" {...form.register("firmName")} />
              {form.formState.errors.firmName && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.firmName.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPersonName">Contact Person</Label>
              <Input id="contactPersonName" {...form.register("contactPersonName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" {...form.register("contactEmail")} />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.contactEmail.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" {...form.register("contactPhone")} />
              {form.formState.errors.contactPhone && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.contactPhone.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={selectedType || "none"}
                onValueChange={(value) => {
                  const nextValue: CapitalProviderEditFormValues["type"] =
                    !value || value === "none"
                      ? ""
                      : (value as CapitalProvider["type"]);

                  form.setValue("type", nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select type</SelectItem>
                  {CP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "Life Insurance Company" ? "Life Insurance" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Relationship Type</Label>
              <Select
                value={selectedRelationshipType}
                onValueChange={(value) => {
                  const nextValue: CapitalProviderEditFormValues["relationshipType"] =
                    (value as CapitalProvider["relationshipType"] | null) ??
                    defaultValues.relationshipType;

                  form.setValue("relationshipType", nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={6} {...form.register("notes")} />
            </div>
          </div>
        );
      }}
    </EntityForm>
  );
}
