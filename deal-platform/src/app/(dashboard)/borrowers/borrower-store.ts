"use client";

import { useMemo, useSyncExternalStore } from "react";
import { borrowers as initialBorrowers, users } from "@/mock-data";
import type { Borrower, BorrowerContact } from "@/types";
import { generateId } from "@/lib/utils";

const currentUser = users[0];
let borrowerState: Borrower[] = initialBorrowers;
const borrowerListeners = new Set<() => void>();

function emitBorrowerChange() {
  borrowerListeners.forEach((listener) => listener());
}

function subscribeToBorrowers(listener: () => void) {
  borrowerListeners.add(listener);
  return () => borrowerListeners.delete(listener);
}

function getBorrowerSnapshot() {
  return borrowerState;
}

export interface BorrowerFormValues {
  name: string;
  contacts: BorrowerContact[];
  projectType: string;
  location: string;
  notes: string;
}

export function getBorrowerFormDefaults(
  borrower?: Partial<Borrower>,
): BorrowerFormValues {
  return {
    name: borrower?.name ?? "",
    contacts: borrower?.contacts ?? [{ name: "", email: "", phone: "", role: "" }],
    projectType: borrower?.projectType ?? "",
    location: borrower?.location ?? "",
    notes: borrower?.notes ?? "",
  };
}

export function useBorrowerStore() {
  const borrowers = useSyncExternalStore(
    subscribeToBorrowers,
    getBorrowerSnapshot,
    getBorrowerSnapshot,
  );

  const actions = useMemo(
    () => ({
      createBorrower(values: BorrowerFormValues) {
        const timestamp = new Date().toISOString();
        const contacts = values.contacts
          .filter((c) => c.name.trim() || c.email.trim())
          .map((c) => ({
            name: c.name.trim(),
            email: c.email.trim(),
            phone: c.phone.trim(),
            role: c.role.trim(),
          }));

        const borrower: Borrower = {
          id: `bor-${generateId()}`,
          name: values.name.trim(),
          contacts,
          projectType: values.projectType || undefined,
          location: values.location.trim() || undefined,
          notes: values.notes.trim() || undefined,
          isArchived: false,
          createdAt: timestamp,
          createdBy: currentUser.id,
          updatedAt: timestamp,
          updatedBy: currentUser.id,
        };

        borrowerState = [borrower, ...borrowerState];
        emitBorrowerChange();
        return borrower;
      },
      updateBorrower(id: string, values: BorrowerFormValues) {
        const timestamp = new Date().toISOString();
        let updatedBorrower: Borrower | null = null;
        const contacts = values.contacts
          .filter((c) => c.name.trim() || c.email.trim())
          .map((c) => ({
            name: c.name.trim(),
            email: c.email.trim(),
            phone: c.phone.trim(),
            role: c.role.trim(),
          }));

        borrowerState = borrowerState.map((borrower) => {
            if (borrower.id !== id) {
              return borrower;
            }

            updatedBorrower = {
              ...borrower,
              name: values.name.trim(),
              contacts,
              projectType: values.projectType || undefined,
              location: values.location.trim() || undefined,
              notes: values.notes.trim() || undefined,
              updatedAt: timestamp,
              updatedBy: currentUser.id,
            };

            return updatedBorrower;
          });

        emitBorrowerChange();

        return updatedBorrower;
      },
      setArchived(id: string, isArchived: boolean) {
        const timestamp = new Date().toISOString();
        let updatedBorrower: Borrower | null = null;

        borrowerState = borrowerState.map((borrower) => {
            if (borrower.id !== id) {
              return borrower;
            }

            updatedBorrower = {
              ...borrower,
              isArchived,
              archivedAt: isArchived ? timestamp : undefined,
              updatedAt: timestamp,
              updatedBy: currentUser.id,
            };

            return updatedBorrower;
          });

        emitBorrowerChange();

        return updatedBorrower;
      },
    }),
    [],
  );

  return {
    borrowers,
    isReady: true,
    currentUser,
    ...actions,
  };
}
