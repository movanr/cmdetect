import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ClinicalNote } from "./ClinicalNote";

interface ScoreCardLayoutProps {
  title: string;
  manualAnchor?: string;
  scoreInputs: ReactNode;
  note: string;
  onNoteChange: (value: string) => void;
  expandedContent: ReactNode;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function ScoreCardLayout({
  title,
  manualAnchor,
  scoreInputs,
  note,
  onNoteChange,
  expandedContent,
  isExpanded: isExpandedProp,
  onToggleExpand,
}: ScoreCardLayoutProps) {
  const [isExpandedLocal, setIsExpandedLocal] = useState(false);
  const isExpanded = isExpandedProp ?? isExpandedLocal;
  const toggleExpand = onToggleExpand ?? (() => setIsExpandedLocal(!isExpandedLocal));

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight">{title}</h4>
            {manualAnchor && (
              <Link
                to="/docs/scoring-manual"
                hash={manualAnchor}
                onClick={(e) => {
                  e.stopPropagation();
                  sessionStorage.setItem("docs-return-url", window.location.pathname);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline mt-0.5"
              >
                <BookOpen className="h-3 w-3" />
                Scoring-Anleitung
              </Link>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="text-muted-foreground h-7 px-2 text-xs shrink-0"
          >
            {isExpanded ? (
              <>
                Ausblenden <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Details <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div
        className="border-t px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-medium text-muted-foreground mb-2">Score-Eintragung</p>
        <div className="flex flex-col">{scoreInputs}</div>
      </div>

      <div className="px-4">
        <ClinicalNote value={note} onChange={onNoteChange} />
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <CardContent className="border-t bg-muted/20 p-4">
            {expandedContent}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
