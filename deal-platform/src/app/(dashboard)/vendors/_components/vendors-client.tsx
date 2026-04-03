"use client";

import { useMemo, useState } from "react";
import { Building2, Plus } from "lucide-react";

import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { useExecutionWorkspaceStore } from "@/app/(dashboard)/deals/[id]/execution/_lib/execution-workspace-store";
import { Button } from "@/components/ui/button";
import type { Vendor } from "@/types";

import { VendorFormDialog, type VendorFormValues } from "./vendor-form-dialog";
import { useVendorCustomTypes } from "./vendor-custom-types-context";

export function VendorsClient() {
  const { vendors, isReady, upsertVendor } = useExecutionWorkspaceStore();
  const { customServiceTypes, addCustomServiceType } = useVendorCustomTypes();
  const [searchValue, setSearchValue] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => !vendor.isArchived)
      .filter((vendor) => !serviceType || vendor.serviceType === serviceType)
      .filter((vendor) => {
        if (searchValue.trim().length < 2) {
          return true;
        }

        const contactNames = (vendor.contacts ?? []).map((c) => c.name).join(" ");
        const contactEmails = (vendor.contacts ?? []).map((c) => c.email ?? "").join(" ");
        const haystack = [
          vendor.companyName,
          vendor.contactPersonName,
          vendor.contactEmail,
          vendor.contactPhone,
          vendor.serviceType,
          contactNames,
          contactEmails,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchValue.trim().toLowerCase());
      })
      .sort((left, right) => left.companyName.localeCompare(right.companyName));
  }, [searchValue, serviceType, vendors]);

  const serviceTypeOptions = Array.from(new Set(vendors.map((vendor) => vendor.serviceType)))
    .sort()
    .map((option) => ({ label: option, value: option }));

  const getPrimaryContact = (vendor: Vendor) => {
    if (vendor.contacts?.length) return vendor.contacts[0];
    if (vendor.contactPersonName) return { name: vendor.contactPersonName, email: vendor.contactEmail, phone: vendor.contactPhone };
    return null;
  };

  const columns: ColumnDef<Vendor>[] = [
    {
      key: "companyName",
      header: "Company Name",
      sortable: true,
      accessor: (vendor) => vendor.companyName,
      render: (vendor) => <span className="font-medium">{vendor.companyName}</span>,
    },
    {
      key: "contactPersonName",
      header: "Primary Contact",
      sortable: true,
      accessor: (vendor) => getPrimaryContact(vendor)?.name ?? "",
      render: (vendor) => {
        const primary = getPrimaryContact(vendor);
        return primary?.name || "No contact";
      },
    },
    {
      key: "serviceType",
      header: "Service Type",
      sortable: true,
      accessor: (vendor) => vendor.serviceType,
    },
    {
      key: "contactEmail",
      header: "Contact Email",
      render: (vendor) => {
        const primary = getPrimaryContact(vendor);
        return primary?.email || "No email";
      },
    },
    {
      key: "contactCount",
      header: "Contacts",
      render: (vendor) => {
        const count = vendor.contacts?.length ?? (vendor.contactPersonName ? 1 : 0);
        return <span className="text-muted-foreground">{count}</span>;
      },
    },
  ];

  const handleSubmit = (values: VendorFormValues) => {
    upsertVendor({
      companyName: values.companyName,
      serviceType: values.serviceType,
      contactPersonName: values.contacts[0]?.name || undefined,
      contactEmail: values.contacts[0]?.email || undefined,
      contactPhone: values.contacts[0]?.phone || undefined,
      contacts: values.contacts.map((c) => ({
        name: c.name,
        email: c.email || undefined,
        phone: c.phone || undefined,
        role: c.role || undefined,
      })),
      notes: values.notes || undefined,
    });
  };

  if (!isReady) {
    return <LoadingSkeleton layout="table" rows={8} columns={5} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Track third-party execution partners, service coverage, and task ownership."
        actions={(
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Vendor
          </Button>
        )}
      />

      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search vendors, contacts, or service types"
        filters={[
          {
            label: "Service Type",
            value: "serviceType",
            options: serviceTypeOptions,
          },
        ]}
        filterValues={{ serviceType }}
        onFilterChange={(_, value) => setServiceType(value)}
      />

      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendors match your filters"
          description="Try a broader search or add a new vendor record."
          actionLabel="New Vendor"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredVendors}
          onRowClick={(vendor) => {
            window.location.href = `/vendors/${vendor.id}`;
          }}
        />
      )}

      <VendorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        customServiceTypes={customServiceTypes}
        onAddCustomServiceType={addCustomServiceType}
      />
    </div>
  );
}
