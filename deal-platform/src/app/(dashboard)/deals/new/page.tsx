import { PageHeader } from "@/components/shared/page-header";

import { DealFormCard } from "../_components/deal-form-card";

export default function NewDealPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Deal"
        description="Create a new deal record and place it into the pipeline."
      />
      <DealFormCard mode="create" />
    </div>
  );
}
