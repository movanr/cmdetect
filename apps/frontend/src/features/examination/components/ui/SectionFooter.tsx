import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ChevronRight, SkipForward } from "lucide-react";

export interface SectionFooterProps {
  /** Called when Next is clicked and validation passes */
  onNext?: () => void;
  /** Called when Skip is clicked (no validation) */
  onSkip?: () => void;
  /** If true, shows "Abschließen" instead of "Weiter" */
  isLastSection?: boolean;
  /** If true, disables the Next button */
  isValidating?: boolean;
  /** Optional custom label for next button */
  nextLabel?: string;
  /** Optional custom label for skip button */
  skipLabel?: string;
}

/**
 * Reusable footer component for examination sections with Next/Skip navigation.
 */
export function SectionFooter({
  onNext,
  onSkip,
  isLastSection = false,
  isValidating = false,
  nextLabel,
  skipLabel,
}: SectionFooterProps) {
  const defaultNextLabel = isLastSection ? "Abschließen" : "Weiter";
  const defaultSkipLabel = "Überspringen";

  return (
    <CardFooter className="flex justify-between pt-6 border-t">
      <Button
        type="button"
        variant="ghost"
        onClick={onSkip}
        disabled={isValidating}
      >
        <SkipForward className="mr-2 h-4 w-4" />
        {skipLabel ?? defaultSkipLabel}
      </Button>
      <Button
        type="button"
        onClick={onNext}
        disabled={isValidating}
      >
        {nextLabel ?? defaultNextLabel}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  );
}
