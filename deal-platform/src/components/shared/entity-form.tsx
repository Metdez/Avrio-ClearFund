"use client";

import { ReactNode } from "react";
import { useForm, DefaultValues, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EntityFormProps<T extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodSchema<any>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void;
  children: (form: ReturnType<typeof useForm<T>>) => ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isEditing?: boolean;
  className?: string;
}

export function EntityForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitLabel,
  cancelLabel = "Cancel",
  onCancel,
  isEditing = false,
  className,
}: EntityFormProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<T>({ resolver: zodResolver(schema as any) as any, defaultValues });

  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSubmit={form.handleSubmit(onSubmit as any)}
      className={cn("space-y-6", className)}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children(form as any)}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit">
          {submitLabel ?? (isEditing ? "Save Changes" : "Create")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  );
}

// Re-export Label for form fields convenience
export { Label };
