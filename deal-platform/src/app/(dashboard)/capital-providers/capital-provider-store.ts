"use client";

import { useMemo, useSyncExternalStore } from "react";
import { capitalProviders as initialCapitalProviders, users } from "@/mock-data";
import type { CapitalProvider } from "@/types";
import { generateId } from "@/lib/utils";

const currentUser = users[0];
let capitalProviderState: CapitalProvider[] = initialCapitalProviders;
const capitalProviderListeners = new Set<() => void>();

function emitCapitalProviderChange() {
  capitalProviderListeners.forEach((listener) => listener());
}

function subscribeToCapitalProviders(listener: () => void) {
  capitalProviderListeners.add(listener);
  return () => capitalProviderListeners.delete(listener);
}

function getCapitalProviderSnapshot() {
  return capitalProviderState;
}

export interface CapitalProviderCreateFormValues {
  firmName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  type: CapitalProvider["type"] | "";
  notes: string;
}

export interface CapitalProviderEditFormValues
  extends CapitalProviderCreateFormValues {
  relationshipType: CapitalProvider["relationshipType"];
}

export function getCapitalProviderCreateDefaults(
  capitalProvider?: Partial<CapitalProvider>,
): CapitalProviderCreateFormValues {
  return {
    firmName: capitalProvider?.firmName ?? "",
    contactPersonName: capitalProvider?.contactPersonName ?? "",
    contactEmail: capitalProvider?.contactEmail ?? "",
    contactPhone: capitalProvider?.contactPhone ?? "",
    type: capitalProvider?.type ?? "",
    notes: capitalProvider?.notes ?? "",
  };
}

export function getCapitalProviderEditDefaults(
  capitalProvider: CapitalProvider,
): CapitalProviderEditFormValues {
  return {
    ...getCapitalProviderCreateDefaults(capitalProvider),
    relationshipType: capitalProvider.relationshipType,
  };
}

export function useCapitalProviderStore() {
  const capitalProviders = useSyncExternalStore(
    subscribeToCapitalProviders,
    getCapitalProviderSnapshot,
    getCapitalProviderSnapshot,
  );

  const actions = useMemo(
    () => ({
      createCapitalProvider(values: CapitalProviderCreateFormValues) {
        const timestamp = new Date().toISOString();
        const capitalProvider: CapitalProvider = {
          id: `cp-${generateId()}`,
          firmName: values.firmName.trim(),
          contactPersonName: values.contactPersonName.trim() || undefined,
          contactEmail: values.contactEmail.trim() || undefined,
          contactPhone: values.contactPhone.trim() || undefined,
          type: values.type || "Other",
          relationshipType: "Prospective",
          notes: values.notes.trim() || undefined,
          isArchived: false,
          createdAt: timestamp,
          createdBy: currentUser.id,
          updatedAt: timestamp,
          updatedBy: currentUser.id,
        };

        capitalProviderState = [capitalProvider, ...capitalProviderState];
        emitCapitalProviderChange();
        return capitalProvider;
      },
      updateCapitalProvider(id: string, values: CapitalProviderEditFormValues) {
        const timestamp = new Date().toISOString();
        let updatedCapitalProvider: CapitalProvider | null = null;

        capitalProviderState = capitalProviderState.map((capitalProvider) => {
            if (capitalProvider.id !== id) {
              return capitalProvider;
            }

            updatedCapitalProvider = {
              ...capitalProvider,
              firmName: values.firmName.trim(),
              contactPersonName: values.contactPersonName.trim() || undefined,
              contactEmail: values.contactEmail.trim() || undefined,
              contactPhone: values.contactPhone.trim() || undefined,
              type: values.type || "Other",
              relationshipType: values.relationshipType,
              notes: values.notes.trim() || undefined,
              updatedAt: timestamp,
              updatedBy: currentUser.id,
            };

            return updatedCapitalProvider;
          });

        emitCapitalProviderChange();

        return updatedCapitalProvider;
      },
      setArchived(id: string, isArchived: boolean) {
        const timestamp = new Date().toISOString();
        let updatedCapitalProvider: CapitalProvider | null = null;

        capitalProviderState = capitalProviderState.map((capitalProvider) => {
            if (capitalProvider.id !== id) {
              return capitalProvider;
            }

            updatedCapitalProvider = {
              ...capitalProvider,
              isArchived,
              archivedAt: isArchived ? timestamp : undefined,
              updatedAt: timestamp,
              updatedBy: currentUser.id,
            };

            return updatedCapitalProvider;
          });

        emitCapitalProviderChange();

        return updatedCapitalProvider;
      },
    }),
    [],
  );

  return {
    capitalProviders,
    currentUser,
    isReady: true,
    ...actions,
  };
}
