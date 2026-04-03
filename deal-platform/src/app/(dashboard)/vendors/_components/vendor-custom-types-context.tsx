"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type VendorCustomTypesContextValue = {
  customServiceTypes: string[];
  addCustomServiceType: (type: string) => void;
};

const VendorCustomTypesContext = createContext<VendorCustomTypesContextValue>({
  customServiceTypes: [],
  addCustomServiceType: () => {},
});

export function useVendorCustomTypes() {
  return useContext(VendorCustomTypesContext);
}

export function VendorCustomTypesProvider({ children }: { children: ReactNode }) {
  const [customServiceTypes, setCustomServiceTypes] = useState<string[]>([]);

  const addCustomServiceType = useCallback((type: string) => {
    setCustomServiceTypes((prev) =>
      prev.includes(type) ? prev : [...prev, type]
    );
  }, []);

  return (
    <VendorCustomTypesContext value={{ customServiceTypes, addCustomServiceType }}>
      {children}
    </VendorCustomTypesContext>
  );
}
