"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { EntityForm, Label } from "@/components/shared/entity-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_TYPES } from "@/lib/constants";
import type { BorrowerFormValues } from "./borrower-store";

const phoneRegex = /^[+\d\s().-]{7,30}$/;

const contactSchema = z.object({
  name: z.string().trim().max(255).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine((value) => !value || value.length === 0 || phoneRegex.test(value), {
      message: "Enter a valid phone number",
    }),
  role: z.string().trim().max(255).optional().or(z.literal("")),
});

export const borrowerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Borrower name is required")
    .max(255, "Company Name must be 255 characters or fewer"),
  contacts: z.array(contactSchema),
  projectType: z.string().optional(),
  location: z
    .string()
    .trim()
    .max(500, "Location must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(5000, "Notes must be 5000 characters or fewer")
    .optional()
    .or(z.literal("")),
});

const US_LOCATIONS = [
  "Miami, FL",
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Dallas, TX",
  "Seattle, WA",
  "Boston, MA",
  "Portland, OR",
  "Denver, CO",
  "Charleston, WV",
  "Reno, NV",
  "Phoenix, AZ",
  "Atlanta, GA",
  "San Francisco, CA",
  "Houston, TX",
] as const;

interface BorrowerFormProps {
  defaultValues: BorrowerFormValues;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (values: BorrowerFormValues) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

function getErrorMessage(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function SelectWithOther({
  label,
  options,
  value,
  onValueChange,
  placeholder,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}) {
  const isOtherSelected = value !== "" && value !== "none" && !options.includes(value as typeof options[number]);
  const [showCustomInput, setShowCustomInput] = useState(isOtherSelected);
  const [customValue, setCustomValue] = useState(isOtherSelected ? value : "");

  const selectValue = isOtherSelected ? "__other__" : (value || "none");

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={selectValue}
        onValueChange={(val) => {
          if (val === "__other__") {
            setShowCustomInput(true);
            if (customValue) {
              onValueChange(customValue);
            } else {
              onValueChange("");
            }
          } else {
            setShowCustomInput(false);
            setCustomValue("");
            onValueChange(!val || val === "none" ? "" : val);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
          <SelectItem value="__other__">Other...</SelectItem>
        </SelectContent>
      </Select>
      {showCustomInput && (
        <Input
          placeholder="Enter custom value"
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onValueChange(e.target.value);
          }}
          onBlur={() => {
            if (customValue.trim()) {
              toast("Custom value saved", {
                description: `"${customValue.trim()}" will be used as the ${label.toLowerCase()}.`,
              });
            }
          }}
        />
      )}
    </div>
  );
}

export function BorrowerForm({
  defaultValues,
  submitLabel,
  cancelLabel,
  onSubmit,
  onCancel,
  isEditing,
}: BorrowerFormProps) {
  return (
    <EntityForm<BorrowerFormValues>
      schema={borrowerSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
      isEditing={isEditing}
    >
      {(form) => {
        const contacts = form.watch("contacts");

        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(form.formState.errors.name.message)}
                </p>
              )}
            </div>

            {/* Multi-contact section */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Contacts</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.setValue("contacts", [
                      ...contacts,
                      { name: "", email: "", phone: "", role: "" },
                    ], { shouldDirty: true });
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Contact
                </Button>
              </div>

              {contacts.map((_, index) => (
                <div
                  key={index}
                  className="relative rounded-lg border bg-muted/30 p-4"
                >
                  {contacts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        const updated = contacts.filter((__, i) => i !== index);
                        form.setValue("contacts", updated, { shouldDirty: true });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`contacts.${index}.name`}>Name</Label>
                      <Input
                        id={`contacts.${index}.name`}
                        {...form.register(`contacts.${index}.name`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`contacts.${index}.email`}>Email</Label>
                      <Input
                        id={`contacts.${index}.email`}
                        type="email"
                        {...form.register(`contacts.${index}.email`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`contacts.${index}.phone`}>Phone</Label>
                      <Input
                        id={`contacts.${index}.phone`}
                        {...form.register(`contacts.${index}.phone`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`contacts.${index}.role`}>Role</Label>
                      <Input
                        id={`contacts.${index}.role`}
                        {...form.register(`contacts.${index}.role`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SelectWithOther
              label="Project Type"
              options={PROJECT_TYPES}
              value={form.watch("projectType") || ""}
              onValueChange={(value) =>
                form.setValue("projectType", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="Select project type"
            />

            <SelectWithOther
              label="Location"
              options={US_LOCATIONS}
              value={form.watch("location") || ""}
              onValueChange={(value) =>
                form.setValue("location", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="Select location"
            />

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
