"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBorrowerFormDefaults, useBorrowerStore } from "../borrower-store";
import { BorrowerForm } from "../borrower-form";

export function BorrowerNewPageClient() {
  const router = useRouter();
  const { borrowers, createBorrower, isReady } = useBorrowerStore();

  const defaultValues = useMemo(() => getBorrowerFormDefaults(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Borrower"
        description="Create a borrower profile so it can be linked to deals."
      />

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Borrower Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isReady && (
            <BorrowerForm
              defaultValues={defaultValues}
              submitLabel="Create Borrower"
              cancelLabel="Back to Borrowers"
              onCancel={() => router.push("/borrowers")}
              onSubmit={(values) => {
                const duplicate = borrowers.find(
                  (borrower) =>
                    borrower.name.toLowerCase() === values.name.trim().toLowerCase(),
                );

                createBorrower(values);

                if (duplicate) {
                  toast.warning("A borrower with this name already exists. Created anyway.");
                } else {
                  toast.success("Borrower created successfully.");
                }

                router.push("/borrowers");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
