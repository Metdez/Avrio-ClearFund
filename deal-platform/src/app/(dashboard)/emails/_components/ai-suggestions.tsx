"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, ThumbsUp, HelpCircle, ThumbsDown } from "lucide-react";
import type { Communication } from "@/types";

interface AiSuggestionsProps {
  email: Communication;
  onSelect: (text: string) => void;
}

interface Suggestion {
  label: string;
  icon: typeof ThumbsUp;
  iconColor: string;
  preview: string;
  fullText: string;
}

function generateSuggestions(email: Communication): Suggestion[] {
  const senderName = email.emailSender?.split("@")[0]?.split(".").map(
    (s) => s.charAt(0).toUpperCase() + s.slice(1)
  ).join(" ") ?? "there";

  const subject = email.emailSubject ?? "your message";

  return [
    {
      label: "Positive Response",
      icon: ThumbsUp,
      iconColor: "text-green-600",
      preview: `Thank you for the update on ${subject.replace(/^RE:\s*/i, "")}. We're pleased with the progress and would like to move forward...`,
      fullText: `Hi ${senderName},

Thank you for the update regarding ${subject.replace(/^RE:\s*/i, "")}. We're pleased with the progress and would like to move forward with the next steps.

Our team has reviewed the details and we're aligned on the proposed approach. I'd suggest we schedule a call this week to finalize the remaining items and confirm the timeline.

Please let me know your availability, and I'll send a calendar invite.

Best regards,
Sarah Chen
Avrio Clean Fund`,
    },
    {
      label: "Request More Info",
      icon: HelpCircle,
      iconColor: "text-blue-600",
      preview: `Thanks for sharing this. Before we proceed, we'd like to get a few additional details on the terms and timeline...`,
      fullText: `Hi ${senderName},

Thank you for your message regarding ${subject.replace(/^RE:\s*/i, "")}. We appreciate the detail you've provided.

Before we proceed to the next stage, our team has a few follow-up questions:

1. Could you provide additional detail on the proposed terms and any flexibility on the structure?
2. What is the expected timeline for your internal review and approval process?
3. Are there any outstanding conditions or dependencies we should be aware of?

We want to ensure we have a complete picture before presenting to our investment committee. Happy to schedule a call if that would be more efficient.

Best regards,
Sarah Chen
Avrio Clean Fund`,
    },
    {
      label: "Decline Politely",
      icon: ThumbsDown,
      iconColor: "text-amber-600",
      preview: `We appreciate your interest and the time invested in evaluating this opportunity. After careful consideration...`,
      fullText: `Hi ${senderName},

Thank you for your continued engagement on ${subject.replace(/^RE:\s*/i, "")}. We genuinely appreciate the time and effort your team has invested in this evaluation.

After careful consideration and review of our current portfolio allocation, we've determined that this particular opportunity doesn't align with our investment criteria at this time. This reflects our current positioning rather than any concern about the quality of the opportunity.

We value our relationship and would welcome the chance to collaborate on future opportunities that may be a better fit. Please don't hesitate to reach out as new prospects arise.

Best regards,
Sarah Chen
Avrio Clean Fund`,
    },
  ];
}

export function AiSuggestions({ email, onSelect }: AiSuggestionsProps) {
  const [suggestions] = useState(() => generateSuggestions(email));
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = useCallback(() => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">AI Response Suggestions</span>
          <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
            Beta
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Generating..." : "Regenerate"}
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {suggestions.map((suggestion) => (
          <Card
            key={suggestion.label}
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-purple-200 hover:border-purple-300 ${regenerating ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => onSelect(suggestion.fullText)}
          >
            <CardContent className="py-3 px-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <suggestion.icon className={`h-3.5 w-3.5 ${suggestion.iconColor}`} />
                <span className="text-xs font-semibold">{suggestion.label}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {suggestion.preview}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
