"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Unplug,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// --- Mock data for import flow ---
const mockZohoContacts = [
  { zohoId: "z-001", name: "Robert Chen", email: "rchen@meridianhotels.com", suggested: "Borrower" },
  { zohoId: "z-002", name: "Sarah Mitchell", email: "smitchell@jpmorgan.com", suggested: "Capital Provider" },
  { zohoId: "z-003", name: "David Park", email: "dpark@arescapital.com", suggested: "Capital Provider" },
  { zohoId: "z-004", name: "Elena Vasquez", email: "evasquez@sunbeltinfra.com", suggested: "Borrower" },
  { zohoId: "z-005", name: "James O'Brien", email: "jobrien@blackrock.com", suggested: "Capital Provider" },
  { zohoId: "z-006", name: "Maria Santos", email: "msantos@pacificmining.com", suggested: "Borrower" },
  { zohoId: "z-007", name: "Thomas Wright", email: "twright@pnc.com", suggested: "Capital Provider" },
  { zohoId: "z-008", name: "Lisa Chang", email: "lchang@internal.test", suggested: "Skip" },
  { zohoId: "z-009", name: "Kevin Murphy", email: "kmurphy@greatlakes.com", suggested: "Borrower" },
  { zohoId: "z-010", name: "Anna Petrov", email: "apetrov@metlife.com", suggested: "Capital Provider" },
];

const mockSyncLog = [
  { id: "sl-001", timestamp: "2026-04-02T14:00:00Z", event: "Full sync completed", recordsSynced: 42, status: "Success" },
  { id: "sl-002", timestamp: "2026-04-02T13:45:00Z", event: "Incremental sync completed", recordsSynced: 3, status: "Success" },
  { id: "sl-003", timestamp: "2026-04-02T13:30:00Z", event: "Incremental sync completed", recordsSynced: 0, status: "Success" },
  { id: "sl-004", timestamp: "2026-04-02T13:15:00Z", event: "Sync failed — Zoho API rate limit exceeded", recordsSynced: 0, status: "Error" },
  { id: "sl-005", timestamp: "2026-04-02T13:00:00Z", event: "Incremental sync completed", recordsSynced: 5, status: "Success" },
  { id: "sl-006", timestamp: "2026-04-02T12:45:00Z", event: "Conflict detected — Sarah Mitchell", recordsSynced: 0, status: "Warning" },
  { id: "sl-007", timestamp: "2026-04-02T12:30:00Z", event: "Incremental sync completed", recordsSynced: 2, status: "Success" },
];

const mockConflicts = [
  {
    id: "cf-001",
    recordName: "Sarah Mitchell",
    field: "Phone",
    zohoValue: "(212) 555-0199",
    platformValue: "(212) 555-0142",
    lastModifiedZoho: "2026-04-02T12:30:00Z",
    lastModifiedPlatform: "2026-04-02T11:00:00Z",
  },
  {
    id: "cf-002",
    recordName: "David Park",
    field: "Email",
    zohoValue: "david.park@arescap.com",
    platformValue: "dpark@arescapital.com",
    lastModifiedZoho: "2026-04-01T09:00:00Z",
    lastModifiedPlatform: "2026-04-02T10:00:00Z",
  },
];

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "testing";
type ImportPhase = "idle" | "importing" | "mapping" | "complete";

export default function ZohoIntegrationPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [testResult, setTestResult] = useState<"success" | "idle">("idle");

  // Import state
  const [importPhase, setImportPhase] = useState<ImportPhase>("idle");
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal] = useState(120);
  const [contactClassifications, setContactClassifications] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    mockZohoContacts.forEach((c) => {
      initial[c.zohoId] = c.suggested;
    });
    return initial;
  });
  const [importSummary, setImportSummary] = useState({ contacts: 0, deals: 0, duplicates: 0 });

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState(mockConflicts);

  // --- Connection handlers ---
  function handleConnect() {
    setConnectionStatus("connecting");
    setTimeout(() => {
      setConnectionStatus("connected");
    }, 2000);
  }

  function handleTestConnection() {
    setConnectionStatus("testing");
    setTestResult("idle");
    setTimeout(() => {
      setConnectionStatus("connected");
      setTestResult("success");
    }, 1500);
  }

  function handleDisconnect() {
    setConnectionStatus("disconnected");
    setTestResult("idle");
    setImportPhase("idle");
    setImportProgress(0);
  }

  // --- Import handlers ---
  const startImport = useCallback(() => {
    setImportPhase("importing");
    setImportProgress(0);
  }, []);

  useEffect(() => {
    if (importPhase !== "importing") return;
    if (importProgress >= importTotal) {
      setImportPhase("mapping");
      return;
    }
    const timer = setTimeout(() => {
      setImportProgress((prev) => Math.min(prev + Math.floor(Math.random() * 12) + 3, importTotal));
    }, 150);
    return () => clearTimeout(timer);
  }, [importPhase, importProgress, importTotal]);

  function handleClassificationChange(zohoId: string, value: string) {
    setContactClassifications((prev) => ({ ...prev, [zohoId]: value }));
  }

  function handleCompleteImport() {
    const classified = Object.values(contactClassifications);
    const contacts = classified.filter((c) => c === "Borrower" || c === "Capital Provider").length;
    setImportSummary({ contacts, deals: 7, duplicates: 2 });
    setImportPhase("complete");
  }

  // --- Sync handlers ---
  function handleSyncNow() {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  }

  function handleResolveConflict(conflictId: string) {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zoho CRM Integration"
        description="Connect and sync contacts and deals with your Zoho CRM instance"
      />

      {/* Connection Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Connection Status</CardTitle>
              <CardDescription>
                {connectionStatus === "connected"
                  ? "Connected to Avrio Capital — Zoho Organization"
                  : "Not connected to Zoho CRM"}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={
              connectionStatus === "connected" || connectionStatus === "testing"
                ? "bg-green-100 text-green-700 border-0"
                : connectionStatus === "connecting"
                ? "bg-amber-100 text-amber-700 border-0"
                : "bg-gray-100 text-gray-700 border-0"
            }
          >
            {connectionStatus === "connecting"
              ? "Connecting..."
              : connectionStatus === "testing"
              ? "Testing..."
              : connectionStatus === "connected"
              ? "Connected"
              : "Disconnected"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {connectionStatus === "disconnected" && (
              <Button onClick={handleConnect}>
                <Database className="mr-2 h-4 w-4" />
                Connect to Zoho CRM
              </Button>
            )}
            {connectionStatus === "connecting" && (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating with Zoho...
              </Button>
            )}
            {(connectionStatus === "connected" || connectionStatus === "testing") && (
              <>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={connectionStatus === "testing"}
                >
                  {connectionStatus === "testing" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Test Connection
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="outline" className="text-red-600 hover:text-red-700" />}
                  >
                    <Unplug className="mr-2 h-4 w-4" />
                    Disconnect
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Zoho CRM?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Disconnecting will stop all data sync with Zoho. Data already in the platform will not be affected. Reconnecting later may require re-mapping.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700">
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
          {testResult === "success" && connectionStatus === "connected" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Connection verified — API access confirmed
            </div>
          )}
        </CardContent>
      </Card>

      {/* Initial Import — only when connected */}
      {(connectionStatus === "connected" || connectionStatus === "testing") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initial Data Import</CardTitle>
            <CardDescription>
              Import existing contacts and deals from Zoho into the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {importPhase === "idle" && (
              <Button onClick={startImport}>
                Start Initial Import
              </Button>
            )}

            {importPhase === "importing" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Importing contacts... {importProgress}/{importTotal}
                  </span>
                  <span className="font-medium">
                    {Math.round((importProgress / importTotal) * 100)}%
                  </span>
                </div>
                <Progress value={(importProgress / importTotal) * 100} />
                <p className="text-xs text-muted-foreground">
                  Please wait while we pull records from Zoho. You can navigate away and check back.
                </p>
              </div>
            )}

            {importPhase === "mapping" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-md p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Review and classify each contact before completing the import.
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zoho Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[200px]">Classify As</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockZohoContacts.map((contact) => (
                        <TableRow key={contact.zohoId}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                          <TableCell>
                            <Select
                              value={contactClassifications[contact.zohoId]}
                              onValueChange={(val) => val && handleClassificationChange(contact.zohoId, val)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Borrower">Borrower</SelectItem>
                                <SelectItem value="Capital Provider">Capital Provider</SelectItem>
                                <SelectItem value="Skip">Skip</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCompleteImport}>
                    Complete Import
                  </Button>
                </div>
              </div>
            )}

            {importPhase === "complete" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-md p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Import completed successfully
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-semibold">{importSummary.contacts}</p>
                    <p className="text-xs text-muted-foreground">Contacts Imported</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-semibold">{importSummary.deals}</p>
                    <p className="text-xs text-muted-foreground">Deals Imported</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-semibold">{importSummary.duplicates}</p>
                    <p className="text-xs text-muted-foreground">Duplicates Detected</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sync Status — only when connected */}
      {(connectionStatus === "connected" || connectionStatus === "testing") && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Sync Status</CardTitle>
              <CardDescription>
                Bidirectional sync runs every 15 minutes
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncNow}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync Now
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Last Sync</p>
                <p className="text-sm font-medium">{formatDate("2026-04-02T14:00:00Z")}</p>
                <p className="text-xs text-muted-foreground">2:00 PM</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Next Scheduled</p>
                <p className="text-sm font-medium">{formatDate("2026-04-02T14:15:00Z")}</p>
                <p className="text-xs text-muted-foreground">2:15 PM</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Records Synced (24h)</p>
                <p className="text-sm font-medium">52</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Errors (24h)</p>
                <p className="text-sm font-medium text-red-600">1</p>
              </div>
            </div>

            <Separator />

            {/* Sync Log */}
            <div>
              <h4 className="text-sm font-medium mb-2">Sync Log</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="text-right">Records</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSyncLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(entry.timestamp)}
                        </TableCell>
                        <TableCell className="text-sm">{entry.event}</TableCell>
                        <TableCell className="text-right text-sm">{entry.recordsSynced}</TableCell>
                        <TableCell>
                          {entry.status === "Success" && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">Success</Badge>
                          )}
                          {entry.status === "Error" && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 border-0">Error</Badge>
                          )}
                          {entry.status === "Warning" && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">Warning</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Unresolved Conflicts ({conflicts.length})
                  </h4>
                  <div className="space-y-3">
                    {conflicts.map((conflict) => (
                      <div key={conflict.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="font-medium text-sm">{conflict.recordName}</span>
                            <span className="text-xs text-muted-foreground">
                              Field: {conflict.field}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="rounded-md bg-muted p-3">
                            <p className="text-xs text-muted-foreground mb-1">Zoho Value</p>
                            <p className="text-sm font-medium">{conflict.zohoValue}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Modified: {formatDate(conflict.lastModifiedZoho)}
                            </p>
                          </div>
                          <div className="rounded-md bg-muted p-3">
                            <p className="text-xs text-muted-foreground mb-1">Platform Value</p>
                            <p className="text-sm font-medium">{conflict.platformValue}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Modified: {formatDate(conflict.lastModifiedPlatform)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveConflict(conflict.id)}
                          >
                            Keep Zoho
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveConflict(conflict.id)}
                          >
                            Keep Platform
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disconnected empty state */}
      {connectionStatus === "disconnected" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium mb-1">No Zoho connection</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Connect your Zoho CRM instance to import existing contacts and deals, and keep data synchronized between both systems.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
