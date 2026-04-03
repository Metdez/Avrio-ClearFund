"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, XCircle, Loader2, Unplug } from "lucide-react";

interface ProviderState {
  connected: boolean;
  connecting: boolean;
  testing: boolean;
  email: string | null;
}

const initialProviders: Record<string, ProviderState> = {
  gmail: { connected: false, connecting: false, testing: false, email: null },
  outlook: { connected: false, connecting: false, testing: false, email: null },
};

export default function EmailIntegrationPage() {
  const [providers, setProviders] = useState(initialProviders);
  const [testResults, setTestResults] = useState<Record<string, "success" | "failed" | null>>({
    gmail: null,
    outlook: null,
  });

  const handleConnect = useCallback((provider: string) => {
    setProviders((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], connecting: true },
    }));

    // Simulate OAuth flow — 2s delay
    setTimeout(() => {
      const mockEmails: Record<string, string> = {
        gmail: "david.kim@avriocleanfund.com",
        outlook: "marcus.webb@avriocleanfund.com",
      };
      setProviders((prev) => ({
        ...prev,
        [provider]: {
          connected: true,
          connecting: false,
          testing: false,
          email: mockEmails[provider],
        },
      }));
    }, 2000);
  }, []);

  const handleDisconnect = useCallback((provider: string) => {
    setProviders((prev) => ({
      ...prev,
      [provider]: { connected: false, connecting: false, testing: false, email: null },
    }));
    setTestResults((prev) => ({ ...prev, [provider]: null }));
  }, []);

  const handleTest = useCallback((provider: string) => {
    setProviders((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], testing: true },
    }));
    setTestResults((prev) => ({ ...prev, [provider]: null }));

    setTimeout(() => {
      setProviders((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], testing: false },
      }));
      setTestResults((prev) => ({ ...prev, [provider]: "success" }));
    }, 1500);
  }, []);

  const providerConfigs = [
    {
      key: "gmail",
      name: "Gmail",
      description: "Connect your Gmail account to automatically ingest emails and associate them with deals and contacts.",
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
          <Mail className="h-5 w-5 text-red-600" />
        </div>
      ),
    },
    {
      key: "outlook",
      name: "Microsoft Outlook",
      description: "Connect your Outlook account to sync emails with the deal platform for centralized communication tracking.",
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <Mail className="h-5 w-5 text-blue-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Integration"
        description="Connect your email provider to automatically capture and associate communications with deals and contacts."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {providerConfigs.map(({ key, name, description, icon }) => {
          const state = providers[key];
          const testResult = testResults[key];

          return (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {icon}
                    <div>
                      <CardTitle className="text-base">{name}</CardTitle>
                      <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connection status */}
                <div className="flex items-center gap-2">
                  {state.connected ? (
                    <>
                      <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-700">Connected</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {state.email}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <span className="flex h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="text-sm text-muted-foreground">Not connected</span>
                    </>
                  )}
                </div>

                {/* Test result */}
                {testResult && (
                  <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    testResult === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                    {testResult === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {testResult === "success"
                      ? "Connection test passed — emails are syncing."
                      : "Connection test failed. Please reconnect."}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!state.connected ? (
                    <Button
                      onClick={() => handleConnect(key)}
                      disabled={state.connecting}
                    >
                      {state.connecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(key)}
                        disabled={state.testing}
                      >
                        {state.testing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(key)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Unplug className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
