/**
 * DiagnosisListItem — Inline row for a single diagnosis within a location group.
 *
 * Shows the diagnosis name (clickable), status badge, and compact
 * confirm/reject/note icon buttons.
 */

import { useState } from "react";
import { Check, X, StickyNote } from "lucide-react";
import type { CriterionStatus, DiagnosisId } from "@cmdetect/dc-tmd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PractitionerDecision } from "../types";

interface DiagnosisListItemProps {
  diagnosisId: DiagnosisId;
  nameDE: string;
  computedStatus: CriterionStatus;
  practitionerDecision: PractitionerDecision;
  note: string | null;
  resultId: string;
  isSelected: boolean;
  onDiagnosisClick: () => void;
  onUpdateDecision: (params: {
    resultId: string;
    practitionerDecision: PractitionerDecision;
    note: string | null;
  }) => void;
  readOnly?: boolean;
}

const STATUS_LABELS: Record<CriterionStatus, string> = {
  positive: "Positiv",
  negative: "Negativ",
  pending: "Ausstehend",
};

function getStatusBadge(
  computedStatus: CriterionStatus,
  decision: PractitionerDecision
) {
  if (decision === "confirmed") {
    return { label: "Bestätigt", className: "bg-green-600 text-white" };
  }
  if (decision === "rejected") {
    return { label: "Abgelehnt", className: "bg-gray-500 text-white" };
  }
  // No decision — show computed status
  if (computedStatus === "positive") {
    return { label: "Unbestätigt", className: "bg-gray-200 text-gray-600" };
  }
  return {
    label: STATUS_LABELS[computedStatus],
    className: cn(
      computedStatus === "negative" && "bg-gray-400 text-white",
      computedStatus === "pending" && "bg-gray-200 text-gray-600"
    ),
  };
}

export function DiagnosisListItem({
  nameDE,
  computedStatus,
  practitionerDecision,
  note,
  resultId,
  isSelected,
  onDiagnosisClick,
  onUpdateDecision,
  readOnly,
  // diagnosisId used as key by parent
}: DiagnosisListItemProps) {
  const [showNote, setShowNote] = useState(false);
  // Tracks only the user's uncommitted edit; null when not editing
  const [editedNote, setEditedNote] = useState<string | null>(null);
  // When not editing, always reflect the latest prop
  const displayNote = editedNote ?? (note ?? "");

  const badge = getStatusBadge(computedStatus, practitionerDecision);

  function handleDecision(decision: PractitionerDecision) {
    const newDecision = decision === practitionerDecision ? null : decision;
    if (newDecision === "rejected") {
      setShowNote(true);
    }
    onUpdateDecision({
      resultId,
      practitionerDecision: newDecision,
      note: displayNote || null,
    });
  }

  function handleNoteBlur() {
    const trimmed = (editedNote ?? "").trim();
    setEditedNote(null);
    if ((trimmed || null) !== note) {
      onUpdateDecision({
        resultId,
        practitionerDecision,
        note: trimmed || null,
      });
    }
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 text-sm py-1 px-2 rounded transition-colors min-w-0",
          isSelected ? "bg-accent" : "hover:bg-muted/50"
        )}
      >
        {/* Clickable diagnosis name */}
        <button
          type="button"
          onClick={onDiagnosisClick}
          className={cn(
            "text-left flex-1 min-w-0",
            isSelected && "font-medium"
          )}
        >
          {nameDE}
        </button>

        {/* Status badge */}
        <Badge className={cn("text-[10px] shrink-0 ml-auto", badge.className)}>
          {badge.label}
        </Badge>

        {/* Action buttons */}
        {!readOnly && (
          <div className="flex items-center gap-0.5 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6",
                    practitionerDecision === "confirmed"
                      ? "text-green-600"
                      : "text-muted-foreground hover:text-green-600"
                  )}
                  onClick={() => handleDecision("confirmed")}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bestätigen</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6",
                    practitionerDecision === "rejected"
                      ? "text-red-600"
                      : "text-muted-foreground hover:text-red-600"
                  )}
                  onClick={() => handleDecision("rejected")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ablehnen</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6",
                    showNote || note
                      ? "text-amber-600"
                      : "text-muted-foreground hover:text-amber-600"
                  )}
                  onClick={() => setShowNote((v) => !v)}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notiz</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Read-only: show note icon if note exists */}
        {readOnly && note && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-amber-600"
                onClick={() => setShowNote((v) => !v)}
              >
                <StickyNote className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notiz anzeigen</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Expandable note textarea */}
      {showNote && (
        <div className="ml-2 mr-2">
          <textarea
            className="w-full text-xs border rounded-md px-2 py-1.5 bg-background resize-none"
            rows={2}
            placeholder="Optionale Notiz..."
            value={displayNote}
            onChange={(e) => setEditedNote(e.target.value)}
            onBlur={handleNoteBlur}
            readOnly={readOnly}
          />
        </div>
      )}

      {/* Read-only note display when note panel is closed */}
      {!showNote && note && readOnly && (
        <p className="text-xs text-muted-foreground italic ml-2">{note}</p>
      )}
    </div>
  );
}
