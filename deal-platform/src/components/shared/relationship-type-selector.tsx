"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RELATIONSHIP_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Building2, Handshake, Landmark } from "lucide-react";
import type { CapitalProvider } from "@/types";

const RELATIONSHIP_COLORS: Record<string, string> = {
  Prospective: "bg-slate-100 text-slate-700 border-slate-200",
  Transactional: "bg-blue-100 text-blue-700 border-blue-200",
  "Credit Facility Partner": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const RELATIONSHIP_ICONS: Record<string, React.ElementType> = {
  Prospective: Building2,
  Transactional: Handshake,
  "Credit Facility Partner": Landmark,
};

interface RelationshipTypeSelectorProps {
  capitalProvider: CapitalProvider;
  onTypeChange?: (newType: CapitalProvider["relationshipType"]) => void;
  hasCreditFacilities?: boolean;
  className?: string;
}

export function RelationshipTypeSelector({
  capitalProvider,
  onTypeChange,
  hasCreditFacilities = false,
  className,
}: RelationshipTypeSelectorProps) {
  const [currentType, setCurrentType] = useState(capitalProvider.relationshipType);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [showFacilityPrompt, setShowFacilityPrompt] = useState(false);
  const [pendingType, setPendingType] = useState<CapitalProvider["relationshipType"] | null>(null);

  const Icon = RELATIONSHIP_ICONS[currentType];
  const colors = RELATIONSHIP_COLORS[currentType];

  function handleValueChange(value: string | null) {
    if (!value || value === currentType) return;
    const newType = value as CapitalProvider["relationshipType"];

    if (currentType === "Credit Facility Partner" && newType !== "Credit Facility Partner") {
      setPendingType(newType);
      setShowDowngradeWarning(true);
      return;
    }

    if (newType === "Credit Facility Partner") {
      setPendingType(newType);
      setShowFacilityPrompt(true);
      return;
    }

    applyChange(newType);
  }

  function applyChange(newType: CapitalProvider["relationshipType"]) {
    setCurrentType(newType);
    onTypeChange?.(newType);
  }

  function handleDowngradeConfirm() {
    if (pendingType) {
      applyChange(pendingType);
    }
    setPendingType(null);
    setShowDowngradeWarning(false);
  }

  function handleFacilityPromptYes() {
    if (pendingType) {
      applyChange(pendingType);
    }
    setPendingType(null);
    setShowFacilityPrompt(false);
    // In a real app, navigate to add facility form
    window.location.href = `/capital-providers/${capitalProvider.id}/facilities/new`;
  }

  function handleFacilityPromptLater() {
    if (pendingType) {
      applyChange(pendingType);
    }
    setPendingType(null);
    setShowFacilityPrompt(false);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <Badge
          variant="secondary"
          className={cn("text-sm px-3 py-1 font-medium border", colors)}
        >
          <Icon className="h-4 w-4 mr-1.5" />
          {currentType}
        </Badge>

        <Select value={currentType} onValueChange={handleValueChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RELATIONSHIP_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasCreditFacilities && currentType === "Credit Facility Partner" && (
        <p className="text-xs text-muted-foreground">
          Auto-upgraded to Credit Facility Partner when a credit facility was created.
        </p>
      )}

      <ConfirmDialog
        open={showDowngradeWarning}
        onOpenChange={setShowDowngradeWarning}
        title="Change Relationship Type"
        description="This will not delete existing credit facility records. The facility data will be preserved but the provider will no longer be classified as a Credit Facility Partner."
        confirmLabel="Change Type"
        onConfirm={handleDowngradeConfirm}
      />

      <Dialog open={showFacilityPrompt} onOpenChange={setShowFacilityPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Credit Facility Terms?</DialogTitle>
            <DialogDescription>
              Would you like to enter credit facility terms now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleFacilityPromptLater}>
              Later
            </Button>
            <Button onClick={handleFacilityPromptYes}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
