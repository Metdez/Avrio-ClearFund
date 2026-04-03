"use client";

import { use } from "react";
import { VendorProfile } from "../_components/vendor-profile";
import { useVendorCustomTypes } from "../_components/vendor-custom-types-context";

type VendorPageProps = {
  params: Promise<{ id: string }>;
};

export default function VendorPage({ params }: VendorPageProps) {
  const resolved = use(params);
  const { customServiceTypes, addCustomServiceType } = useVendorCustomTypes();
  return (
    <VendorProfile
      vendorId={resolved.id}
      customServiceTypes={customServiceTypes}
      onAddCustomServiceType={addCustomServiceType}
    />
  );
}
