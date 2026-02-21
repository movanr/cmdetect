import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowRight, ChevronLeft } from "lucide-react";

export interface SectionFooterProps {
  /** Called when Next is clicked */
  onNext?: () => void;
  /** Called when the direct skip button is clicked */
  onSkipConfirm?: () => void;
  /** Called when Back is clicked */
  onBack?: () => void;
  /** If true, disables the Back button */
  isFirstStep?: boolean;
  /** If true, shows "Abschließen" instead of "Weiter" */
  isLastSection?: boolean;
  /** If true, disables buttons */
  isValidating?: boolean;
  /** Optional custom label for next button */
  nextLabel?: string;
  /** When provided, renders a small skip button next to "Weiter" that calls onSkipConfirm directly. */
  directSkipLabel?: string;
  /** When false, hides the Back button and aligns content to the right. Default: true */
  showBack?: boolean;
}

/**
 * Reusable footer component for examination sections with Back/Next navigation.
 * Layout: Back button on left, optional skip + Next button on right.
 * Validation errors are shown inline by the section; no confirmation dialog here.
 */
export function SectionFooter({
  onNext,
  onSkipConfirm,
  onBack,
  isFirstStep = false,
  isLastSection = false,
  isValidating = false,
  nextLabel,
  directSkipLabel,
  showBack = true,
}: SectionFooterProps) {
  const defaultNextLabel = isLastSection ? "Abschließen" : "Weiter";

  return (
    <CardFooter className={cn("flex items-center pt-6 border-t", showBack ? "justify-between" : "justify-end")}>
      {/* Left: Back button */}
      {showBack && (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isFirstStep || !onBack || isValidating}
          className="text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
      )}

      {/* Right: skip button (optional) + Next button */}
      <div className="flex items-center gap-2">
        {directSkipLabel && onSkipConfirm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSkipConfirm}
            disabled={isValidating}
            className="text-muted-foreground text-xs"
          >
            {directSkipLabel}
          </Button>
        )}
        <Button
          type="button"
          onClick={onNext}
          disabled={isValidating}
        >
          {nextLabel ?? defaultNextLabel}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </CardFooter>
  );
}
