/**
 * Back/Next navigation buttons for the questionnaire wizard
 * Next button is only shown for questions that require explicit submission (e.g., number inputs)
 */

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type NavigationButtonsProps = {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  showNext: boolean;
  isLoading?: boolean;
};

export function NavigationButtons({
  onBack,
  onNext,
  canGoBack,
  showNext,
  isLoading = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack || isLoading}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      {showNext && (
        <Button type="button" onClick={() => onNext()} disabled={isLoading}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
