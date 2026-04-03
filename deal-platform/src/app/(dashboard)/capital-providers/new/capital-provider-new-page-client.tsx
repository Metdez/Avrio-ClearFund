"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CapitalProviderCreateForm } from "../capital-provider-form";
import {
  getCapitalProviderCreateDefaults,
  useCapitalProviderStore,
} from "../capital-provider-store";

export function CapitalProviderNewPageClient() {
  const router = useRouter();
  const { capitalProviders, createCapitalProvider, isReady } =
    useCapitalProviderStore();
  const defaultValues = useMemo(() => getCapitalProviderCreateDefaults(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Capital Provider"
        description="Create a capital provider record for deal matching and relationship tracking."
      />

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Capital Provider Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isReady && (
            <CapitalProviderCreateForm
              defaultValues={defaultValues}
              submitLabel="Create Capital Provider"
              cancelLabel="Back to Capital Providers"
              onCancel={() => router.push("/capital-providers")}
              onSubmit={(values) => {
                const duplicate = capitalProviders.find(
                  (capitalProvider) =>
                    capitalProvider.firmName.toLowerCase() ===
                    values.firmName.trim().toLowerCase(),
                );

                createCapitalProvider(values);

                if (duplicate) {
                  toast.warning(
                    "A capital provider with this name already exists. Created anyway.",
                  );
                } else {
                  toast.success("Capital provider created successfully.");
                }

                router.push("/capital-providers");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
