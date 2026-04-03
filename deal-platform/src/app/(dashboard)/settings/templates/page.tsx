"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { processTemplates } from "@/mock-data";
import { Plus, Star, StarOff, FileText, ListChecks } from "lucide-react";
import type { ProcessTemplate } from "@/types";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProcessTemplate[]>(processTemplates);

  function handleSetDefault(templateId: string) {
    setTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isDefault: t.id === templateId,
      }))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Process Templates"
        description="Define standard task checklists for deal execution workflows"
        actions={
          <Button onClick={() => router.push("/settings/templates/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        }
      />

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium mb-1">No templates yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a process template to standardize deal execution tasks.
            </p>
            <Button onClick={() => router.push("/settings/templates/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates
            .filter((t) => !t.isArchived)
            .map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => router.push(`/settings/templates/${template.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                          Default
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                        v{template.version}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(template.id);
                      }}
                      title={template.isDefault ? "Currently default" : "Set as default"}
                    >
                      {template.isDefault ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      {template.tasks.length} tasks
                    </span>
                    <span>
                      Created by {template.createdBy === "usr-001" ? "Marcus Webb" : template.createdBy}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
