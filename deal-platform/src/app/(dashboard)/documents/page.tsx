"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchFilterBar, type FilterOption } from "@/components/shared/search-filter-bar";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { documents as initialDocuments, borrowers, capitalProviders, deals, users } from "@/mock-data";
import { formatDate, generateId } from "@/lib/utils";
import type { Document } from "@/types";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  FolderOpen,
  Download,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// --- Helpers ---

function getFileIcon(fileType: string) {
  if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-red-600" />;
  if (fileType.includes("word") || fileType.includes("document")) return <FileText className="h-4 w-4 text-blue-600" />;
  if (fileType.includes("sheet") || fileType.includes("excel")) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function getFileExtension(fileType: string): string {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("word") || fileType.includes("document")) return "DOCX";
  if (fileType.includes("sheet") || fileType.includes("excel")) return "XLSX";
  return "FILE";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getEntityName(entityType?: string, entityId?: string): string {
  if (!entityType || !entityId) return "Unlinked";
  if (entityType === "Borrower") {
    return borrowers.find((b) => b.id === entityId)?.name ?? "Unknown Borrower";
  }
  if (entityType === "CapitalProvider") {
    return capitalProviders.find((cp) => cp.id === entityId)?.firmName ?? "Unknown CP";
  }
  if (entityType === "Deal") {
    return deals.find((d) => d.id === entityId)?.name ?? "Unknown Deal";
  }
  return "Unknown";
}

function getEntityHref(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  if (entityType === "Borrower") return `/borrowers/${entityId}`;
  if (entityType === "CapitalProvider") return `/capital-providers/${entityId}`;
  if (entityType === "Deal") return `/deals/${entityId}`;
  return null;
}

function getUserName(userId: string): string {
  return users.find((u) => u.id === userId)?.name ?? "Unknown User";
}

// --- Filters ---

const entityTypeFilter: FilterOption = {
  label: "Entity Type",
  value: "entityType",
  options: [
    { label: "Borrower", value: "Borrower" },
    { label: "Capital Provider", value: "CapitalProvider" },
    { label: "Deal", value: "Deal" },
    { label: "Unlinked", value: "none" },
  ],
};

const fileTypeFilter: FilterOption = {
  label: "File Type",
  value: "fileType",
  options: [
    { label: "PDF", value: "pdf" },
    { label: "DOCX", value: "docx" },
    { label: "XLSX", value: "xlsx" },
    { label: "Other", value: "other" },
  ],
};

// --- Entity select options (for upload dialog) ---

function getAllEntities() {
  const entities: { label: string; value: string; type: string }[] = [];
  borrowers
    .filter((b) => !b.isArchived)
    .forEach((b) => entities.push({ label: `Borrower: ${b.name}`, value: `Borrower:${b.id}`, type: "Borrower" }));
  capitalProviders
    .filter((cp) => !cp.isArchived)
    .forEach((cp) => entities.push({ label: `CP: ${cp.firmName}`, value: `CapitalProvider:${cp.id}`, type: "CapitalProvider" }));
  deals
    .filter((d) => !d.isArchived)
    .forEach((d) => entities.push({ label: `Deal: ${d.name}`, value: `Deal:${d.id}`, type: "Deal" }));
  return entities;
}

// --- Main Page ---

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Upload dialog state
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileType, setUploadFileType] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState(0);
  const [uploadEntityLink, setUploadEntityLink] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredDocs = useMemo(() => {
    let result = docs;

    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    const entityFilter = filterValues.entityType;
    if (entityFilter) {
      if (entityFilter === "none") {
        result = result.filter((d) => !d.entityType);
      } else {
        result = result.filter((d) => d.entityType === entityFilter);
      }
    }

    const ftFilter = filterValues.fileType;
    if (ftFilter) {
      if (ftFilter === "pdf") {
        result = result.filter((d) => d.fileType.includes("pdf"));
      } else if (ftFilter === "docx") {
        result = result.filter((d) => d.fileType.includes("word") || d.fileType.includes("document"));
      } else if (ftFilter === "xlsx") {
        result = result.filter((d) => d.fileType.includes("sheet") || d.fileType.includes("excel"));
      } else {
        result = result.filter(
          (d) =>
            !d.fileType.includes("pdf") &&
            !d.fileType.includes("word") &&
            !d.fileType.includes("document") &&
            !d.fileType.includes("sheet") &&
            !d.fileType.includes("excel")
        );
      }
    }

    return result;
  }, [docs, search, filterValues]);

  const columns: ColumnDef<Document & Record<string, unknown>>[] = [
    {
      key: "fileIcon",
      header: "",
      className: "w-10",
      render: (item) => getFileIcon(item.fileType),
    },
    {
      key: "name",
      header: "File Name",
      sortable: true,
      mobilePriority: 1,
      render: (item) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: "fileType",
      header: "Type",
      mobilePriority: 2,
      className: "w-20",
      render: (item) => (
        <Badge variant="outline" className="text-xs font-mono">
          {getFileExtension(item.fileType)}
        </Badge>
      ),
    },
    {
      key: "fileSizeBytes",
      header: "Size",
      sortable: true,
      className: "w-24",
      render: (item) => (
        <span className="text-muted-foreground">{formatFileSize(item.fileSizeBytes)}</span>
      ),
    },
    {
      key: "uploadedBy",
      header: "Uploaded By",
      className: "w-36",
      render: (item) => getUserName(item.uploadedBy),
    },
    {
      key: "uploadedAt",
      header: "Date",
      sortable: true,
      mobilePriority: 2,
      className: "w-32",
      accessor: (item) => item.uploadedAt,
      render: (item) => (
        <span className="text-muted-foreground">{formatDate(item.uploadedAt)}</span>
      ),
    },
    {
      key: "entity",
      header: "Linked Entity",
      mobilePriority: 1,
      className: "w-auto sm:w-52",
      render: (item) => {
        const href = getEntityHref(item.entityType as string | undefined, item.entityId);
        const name = getEntityName(item.entityType as string | undefined, item.entityId);
        if (!href) return <span className="text-muted-foreground">—</span>;
        return (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <LinkIcon className="h-3 w-3" />
            {name}
          </Link>
        );
      },
    },
  ];

  function handleUpload() {
    if (!uploadFileName) return;

    let entityType: Document["entityType"] = undefined;
    let entityId: string | undefined = undefined;
    if (uploadEntityLink) {
      const [type, id] = uploadEntityLink.split(":");
      entityType = type as Document["entityType"];
      entityId = id;
    }

    const newDoc: Document = {
      id: generateId(),
      name: uploadFileName,
      fileType: uploadFileType || "application/octet-stream",
      fileSizeBytes: uploadFileSize || 102400,
      entityType,
      entityId,
      uploadedBy: "usr-001",
      uploadedAt: new Date().toISOString(),
      version: 1,
    };

    setDocs((prev) => [newDoc, ...prev]);
    setUploadOpen(false);
    resetUploadForm();
    toast.success("Document uploaded", {
      description: `${newDoc.name} has been uploaded successfully.`,
    });
  }

  function resetUploadForm() {
    setUploadFileName("");
    setUploadFileType("");
    setUploadFileSize(0);
    setUploadEntityLink("");
    setIsDragOver(false);
  }

  function handleFileDrop() {
    // Simulated file selection
    setUploadFileName("New_Document.pdf");
    setUploadFileType("application/pdf");
    setUploadFileSize(1048576);
    setIsDragOver(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Centralized document repository — upload, organize, and search all deal-related files"
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by filename..."
        filters={[entityTypeFilter, fileTypeFilter]}
        filterValues={filterValues}
        onFilterChange={(key, val) =>
          setFilterValues((prev) => ({ ...prev, [key]: val }))
        }
      />

      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents found"
          description={
            search || Object.values(filterValues).some(Boolean)
              ? "Try adjusting your search or filters."
              : "Upload your first document to get started."
          }
          actionLabel={!search && !Object.values(filterValues).some(Boolean) ? "Upload Document" : undefined}
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredDocs as (Document & Record<string, unknown>)[]}
          onRowClick={(item) => setSelectedDoc(item as unknown as Document)}
          keyField="id"
        />
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUploadForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a document to the repository. Link it to a borrower, capital provider, or deal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : uploadFileName
                  ? "border-green-300 bg-green-50"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); handleFileDrop(); }}
              onClick={handleFileDrop}
            >
              {uploadFileName ? (
                <div className="flex flex-col items-center gap-2">
                  {getFileIcon(uploadFileType)}
                  <p className="font-medium text-sm">{uploadFileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {getFileExtension(uploadFileType)} &middot; {formatFileSize(uploadFileSize)}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadFileName("");
                      setUploadFileType("");
                      setUploadFileSize(0);
                    }}
                  >
                    Remove and choose another
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag and drop a file here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, XLSX up to 50 MB
                  </p>
                </div>
              )}
            </div>

            {/* File name override */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">File Name</Label>
              <Input
                id="doc-name"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="Enter file name"
              />
            </div>

            {/* Entity linker */}
            <div className="space-y-1.5">
              <Label>Link to Entity (optional)</Label>
              <Select
                value={uploadEntityLink || "none"}
                onValueChange={(val) => setUploadEntityLink(val === "none" ? "" : (val ?? ""))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No link</SelectItem>
                  {getAllEntities().map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleUpload} disabled={!uploadFileName}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Detail Sheet */}
      <Sheet open={!!selectedDoc} onOpenChange={(open) => { if (!open) setSelectedDoc(null); }}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          {selectedDoc && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {getFileIcon(selectedDoc.fileType)}
                  <span className="break-all">{selectedDoc.name}</span>
                </SheetTitle>
                <SheetDescription>Document details and metadata</SheetDescription>
              </SheetHeader>

              <div className="px-4 space-y-5">
                <Separator />

                {/* Metadata */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Details</h4>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline" className="w-fit font-mono text-xs">
                      {getFileExtension(selectedDoc.fileType)}
                    </Badge>
                    <span className="text-muted-foreground">Size</span>
                    <span>{formatFileSize(selectedDoc.fileSizeBytes)}</span>
                    <span className="text-muted-foreground">Uploaded By</span>
                    <span>{getUserName(selectedDoc.uploadedBy)}</span>
                    <span className="text-muted-foreground">Upload Date</span>
                    <span>{formatDate(selectedDoc.uploadedAt)}</span>
                    <span className="text-muted-foreground">Version</span>
                    <span>v{selectedDoc.version}</span>
                  </div>
                </div>

                <Separator />

                {/* Linked Entity */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Linked Entity</h4>
                  {selectedDoc.entityType && selectedDoc.entityId ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedDoc.entityType === "CapitalProvider" ? "Capital Provider" : selectedDoc.entityType}</Badge>
                      {(() => {
                        const href = getEntityHref(selectedDoc.entityType, selectedDoc.entityId);
                        const name = getEntityName(selectedDoc.entityType, selectedDoc.entityId);
                        return href ? (
                          <Link href={href} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            {name}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-sm">{name}</span>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not linked to any entity</p>
                  )}
                </div>

                <Separator />

                {/* Version History */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Version History</h4>
                  <div className="space-y-2">
                    {selectedDoc.version >= 2 && (
                      Array.from({ length: selectedDoc.version }, (_, i) => selectedDoc.version - i).map((v) => (
                        <div key={v} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                          <span className="font-medium">v{v}</span>
                          <span className="text-muted-foreground">
                            {v === selectedDoc.version
                              ? formatDate(selectedDoc.uploadedAt)
                              : `${formatDate(new Date(new Date(selectedDoc.uploadedAt).getTime() - (selectedDoc.version - v) * 86400000 * 7).toISOString())}`}
                          </span>
                          {v === selectedDoc.version && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>
                          )}
                        </div>
                      ))
                    )}
                    {selectedDoc.version === 1 && (
                      <div className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                        <span className="font-medium">v1</span>
                        <span className="text-muted-foreground">{formatDate(selectedDoc.uploadedAt)}</span>
                        <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Download button */}
                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download (Placeholder)
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
