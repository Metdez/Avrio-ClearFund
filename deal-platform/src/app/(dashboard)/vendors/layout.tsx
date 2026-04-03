"use client";

import { VendorCustomTypesProvider } from "./_components/vendor-custom-types-context";

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return <VendorCustomTypesProvider>{children}</VendorCustomTypesProvider>;
}
