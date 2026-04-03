"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { EntityForm, Label } from "@/components/shared/entity-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { THREAD_TYPES } from "@/lib/constants";
import { capitalProviders, deals, engagementThreads } from "@/mock-data";

const threadSchema = z.object({
  type: z.enum(["Deal Evaluation", "Credit Facility Negotiation", "JV Partnership", "Other"]),
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or fewer"),
  description: z.string().max(2000, "Description must be 2000 characters or fewer").optional(),
  dealId: z.string().optional(),
}).refine(
  (data) => data.type !== "Deal Evaluation" || (data.dealId && data.dealId.length > 0),
  { message: "A linked deal is required for Deal Evaluation threads", path: ["dealId"] }
);

type ThreadFormData = z.infer<typeof threadSchema>;

export default function NewThreadPage() {
  const params = useParams();
  const router = useRouter();
  const cpId = params.id as string;

  const cp = capitalProviders.find((c) => c.id === cpId);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [dealSearch, setDealSearch] = useState("");

  // Check for duplicate thread warning
  const existingThread = selectedType === "Deal Evaluation" && selectedDealId
    ? engagementThreads.find(
        (t) => t.capitalProviderId === cpId && t.dealId === selectedDealId
      )
    : null;

  const filteredDeals = deals.filter(
    (d) =>
      !d.isArchived &&
      d.name.toLowerCase().includes(dealSearch.toLowerCase())
  );

  if (!cp) {
    return (
      <div className="space-y-6">
        <PageHeader title="Capital Provider Not Found" />
        <p className="text-muted-foreground">The requested capital provider does not exist.</p>
      </div>
    );
  }

  function handleSubmit(data: ThreadFormData) {
    // Mock save — in real app this would create the thread
    console.log("Creating thread:", { ...data, capitalProviderId: cpId });
    router.push(`/capital-providers/${cpId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Engagement Thread"
        description={`Create a new thread for ${cp.firmName}`}
      />

      <div className="max-w-2xl">
        <EntityForm<ThreadFormData>
          schema={threadSchema}
          defaultValues={{ type: undefined, title: "", description: "", dealId: "" }}
          onSubmit={handleSubmit}
          submitLabel="Create Thread"
          onCancel={() => router.push(`/capital-providers/${cpId}`)}
        >
          {(form) => (
            <div className="space-y-4">
              {/* Thread Type */}
              <div className="space-y-2">
                <Label>Thread Type *</Label>
                <Select
                  value={form.watch("type") ?? ""}
                  onValueChange={(val) => {
                    if (val) {
                      form.setValue("type", val as ThreadFormData["type"], { shouldValidate: true });
                      setSelectedType(val);
                      if (val !== "Deal Evaluation") {
                        form.setValue("dealId", "");
                        setSelectedDealId("");
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select thread type" />
                  </SelectTrigger>
                  <SelectContent>
                    {THREAD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  {...form.register("title")}
                  placeholder="e.g., Meridian Miami Resort - JP Morgan Evaluation"
                  maxLength={255}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {(form.watch("title") ?? "").length}/255
                </p>
              </div>

              {/* Linked Deal (conditional) */}
              {selectedType === "Deal Evaluation" && (
                <div className="space-y-2">
                  <Label>Linked Deal *</Label>
                  <Input
                    placeholder="Search deals..."
                    value={dealSearch}
                    onChange={(e) => setDealSearch(e.target.value)}
                    className="mb-2"
                  />
                  <Select
                    value={form.watch("dealId") ?? ""}
                    onValueChange={(val) => {
                      if (val) {
                        form.setValue("dealId", val, { shouldValidate: true });
                        setSelectedDealId(val);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDeals.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} — {d.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.dealId && (
                    <p className="text-sm text-red-600">{form.formState.errors.dealId.message}</p>
                  )}

                  {/* Duplicate thread warning */}
                  {existingThread && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        A thread for this deal already exists with this capital provider: &quot;{existingThread.title}&quot; ({existingThread.status}).
                        You can still proceed, but consider viewing the existing thread first.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Describe the context of this engagement..."
                  rows={4}
                  maxLength={2000}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {(form.watch("description") ?? "").length}/2000
                </p>
              </div>
            </div>
          )}
        </EntityForm>
      </div>
    </div>
  );
}
