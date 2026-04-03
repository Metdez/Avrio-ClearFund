"use client";

import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { VENDOR_SERVICE_TYPES } from "@/lib/constants";
import type { Vendor } from "@/types";

const OTHER_VALUE = "__other__";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
});

const vendorSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  serviceType: z.string().trim().min(1, "Service type is required"),
  customServiceType: z.string().optional().or(z.literal("")),
  contacts: z.array(contactSchema).min(1, "At least one contact is required"),
  notes: z.string().optional().or(z.literal("")),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
const vendorFormResolver = zodResolver(vendorSchema as never) as Resolver<VendorFormValues>;

type VendorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSubmit: (values: VendorFormValues) => void;
  customServiceTypes?: string[];
  onAddCustomServiceType?: (type: string) => void;
};

export function VendorFormDialog({
  open,
  onOpenChange,
  vendor,
  onSubmit,
  customServiceTypes = [],
  onAddCustomServiceType,
}: VendorFormDialogProps) {
  const allServiceTypes = [
    ...VENDOR_SERVICE_TYPES,
    ...customServiceTypes.filter((t) => !(VENDOR_SERVICE_TYPES as readonly string[]).includes(t)),
  ];

  const initialContacts = vendor?.contacts?.length
    ? vendor.contacts.map((c) => ({
        name: c.name,
        email: c.email ?? "",
        phone: c.phone ?? "",
        role: c.role ?? "",
      }))
    : [{ name: vendor?.contactPersonName ?? "", email: vendor?.contactEmail ?? "", phone: vendor?.contactPhone ?? "", role: "" }];

  const existingServiceType = vendor?.serviceType ?? "";
  const isCustomExisting =
    existingServiceType &&
    !(allServiceTypes as readonly string[]).includes(existingServiceType);

  const form = useForm<VendorFormValues>({
    resolver: vendorFormResolver,
    defaultValues: {
      companyName: vendor?.companyName ?? "",
      serviceType: isCustomExisting ? OTHER_VALUE : existingServiceType,
      customServiceType: isCustomExisting ? existingServiceType : "",
      contacts: initialContacts,
      notes: vendor?.notes ?? "",
    },
    values: {
      companyName: vendor?.companyName ?? "",
      serviceType: isCustomExisting ? OTHER_VALUE : existingServiceType,
      customServiceType: isCustomExisting ? existingServiceType : "",
      contacts: initialContacts,
      notes: vendor?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const watchServiceType = form.watch("serviceType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit vendor" : "New vendor"}</DialogTitle>
          <DialogDescription>
            Keep third-party contacts current so execution tasks can be assigned cleanly across deals.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => {
            const resolved = { ...values };
            if (values.serviceType === OTHER_VALUE) {
              const custom = (values.customServiceType ?? "").trim();
              if (!custom) {
                form.setError("customServiceType", { message: "Enter a custom service type" });
                return;
              }
              resolved.serviceType = custom;
              if (onAddCustomServiceType) {
                onAddCustomServiceType(custom);
                toast.success("New service type saved — it will appear in future selections.");
              }
            }
            onSubmit(resolved);
            onOpenChange(false);
          })}
        >
          {/* Company + Service Type row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vendor-company-name">Company Name</Label>
              <Input id="vendor-company-name" {...form.register("companyName")} />
              {form.formState.errors.companyName && (
                <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Service Type</Label>
              <Controller
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {allServiceTypes.map((serviceType) => (
                        <SelectItem key={serviceType} value={serviceType}>
                          {serviceType}
                        </SelectItem>
                      ))}
                      <SelectItem value={OTHER_VALUE}>Other...</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.serviceType && (
                <p className="text-sm text-destructive">{form.formState.errors.serviceType.message}</p>
              )}
            </div>

            {watchServiceType === OTHER_VALUE && (
              <div className="space-y-2">
                <Label htmlFor="vendor-custom-service-type">Custom Service Type</Label>
                <Input
                  id="vendor-custom-service-type"
                  placeholder="e.g. Geotechnical Consultant"
                  {...form.register("customServiceType")}
                />
                {form.formState.errors.customServiceType && (
                  <p className="text-sm text-destructive">{form.formState.errors.customServiceType.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Contacts section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Contacts</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", email: "", phone: "", role: "" })}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Contact
              </Button>
            </div>
            {form.formState.errors.contacts?.root && (
              <p className="text-sm text-destructive">{form.formState.errors.contacts.root.message}</p>
            )}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border bg-muted/30 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Contact {index + 1}{index === 0 ? " (Primary)" : ""}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor={`contact-name-${index}`} className="text-xs">Name</Label>
                    <Input id={`contact-name-${index}`} {...form.register(`contacts.${index}.name`)} />
                    {form.formState.errors.contacts?.[index]?.name && (
                      <p className="text-xs text-destructive">{form.formState.errors.contacts[index].name?.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`contact-role-${index}`} className="text-xs">Role</Label>
                    <Input id={`contact-role-${index}`} placeholder="e.g. Partner, Lead Auditor" {...form.register(`contacts.${index}.role`)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`contact-email-${index}`} className="text-xs">Email</Label>
                    <Input id={`contact-email-${index}`} type="email" {...form.register(`contacts.${index}.email`)} />
                    {form.formState.errors.contacts?.[index]?.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.contacts[index].email?.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`contact-phone-${index}`} className="text-xs">Phone</Label>
                    <Input id={`contact-phone-${index}`} {...form.register(`contacts.${index}.phone`)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="vendor-notes">Notes</Label>
            <Textarea id="vendor-notes" rows={4} {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{vendor ? "Save vendor" : "Create vendor"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
