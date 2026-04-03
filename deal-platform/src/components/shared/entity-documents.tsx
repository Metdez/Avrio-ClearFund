"use client";

import { useState, useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { documents as allDocuments, users } from "@/mock-data";
import { formatDate, generateId } from "@/lib/utils";
import type { Document } from "@/types";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  FolderOpen,
  Download,
} from "lucide-react";
import { toast } from "sonner";

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

function getUserName(userId: string): string {
  return users.find((u) => u.id === userId)?.name ?? "Unknown User";
}

interface EntityDocumentsProps {
  entityType: "Borrower" | "CapitalProvider" | "Deal";
  entityId: string;
  entityName: string;
}

export function EntityDocuments({ entityType, entityId, entityName }: EntityDocumentsProps) {
  const [extraDocs, setExtraDocs] = useState<Document[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileType, setUploadFileType] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const docs = useMemo(() => {
    const existing = allDocuments.filter(
      (d) => d.entityType === entityType && d.entityId === entityId
    );
    return [...extraDocs, ...existing];
  }, [entityType, entityId, extraDocs]);

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
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "fileType",
      header: "Type",
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
      className: "w-32",
      accessor: (item) => item.uploadedAt,
      render: (item) => (
        <span className="text-muted-foreground">{formatDate(item.uploadedAt)}</span>
      ),
    },
  ];

  function handleFileDrop() {
    setUploadFileName("New_Document.pdf");
    setUploadFileType("application/pdf");
    setUploadFileSize(1048576);
    setIsDragOver(false);
  }

  function resetUploadForm() {
    setUploadFileName("");
    setUploadFileType("");
    setUploadFileSize(0);
    setIsDragOver(false);
  }

  function handleUpload() {
    if (!uploadFileName) return;

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

    setExtraDocs((prev) => [newDoc, ...prev]);
    setUploadOpen(false);
    resetUploadForm();
    toast.success("Document uploaded", {
      description: `${newDoc.name} linked to ${entityName}.`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Documents ({docs.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-3.5 w-3.5" />
          Upload
        </Button>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents"
          description={`No documents linked to ${entityName} yet.`}
          actionLabel="Upload Document"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={docs as (Document & Record<string, unknown>)[]}
          onRowClick={(item) => setSelectedDoc(item as unknown as Document)}
          keyField="id"
        />
      )}

      {/* Upload Dialog — scoped to this entity */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUploadForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document linked to {entityName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
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
                    onClick={(e) => { e.stopPropagation(); setUploadFileName(""); }}
                  >
                    Remove and choose another
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Drag and drop a file here, or click to select</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX up to 50 MB</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="entity-doc-name">File Name</Label>
              <Input
                id="entity-doc-name"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="Enter file name"
              />
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
                <SheetDescription>Document details</SheetDescription>
              </SheetHeader>

              <div className="px-4 space-y-5">
                <Separator />
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

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Version History</h4>
                  <div className="space-y-2">
                    {Array.from({ length: selectedDoc.version }, (_, i) => selectedDoc.version - i).map((v) => (
                      <div key={v} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                        <span className="font-medium">v{v}</span>
                        <span className="text-muted-foreground">
                          {v === selectedDoc.version
                            ? formatDate(selectedDoc.uploadedAt)
                            : formatDate(new Date(new Date(selectedDoc.uploadedAt).getTime() - (selectedDoc.version - v) * 86400000 * 7).toISOString())}
                        </span>
                        {v === selectedDoc.version && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

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
