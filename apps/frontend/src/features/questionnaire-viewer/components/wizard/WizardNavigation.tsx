/**
 * Wizard Navigation - Previous/Next/Complete buttons with progress indicator
 */

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  sectionName: string;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onCancel: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  isSubmitting?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  sectionName,
  onPrevious,
  onNext,
  onComplete,
  onCancel,
  isLastStep,
  isFirstStep,
  isSubmitting = false,
}: WizardNavigationProps) {
  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Abschnitt {currentStep + 1} von {totalSteps}
        </span>
        <span className="font-medium">{sectionName}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          {isLastStep ? (
            <Button onClick={onComplete} disabled={isSubmitting}>
              <Check className="mr-2 h-4 w-4" />
              {isSubmitting ? "Speichern..." : "Überprüfung abschließen"}
            </Button>
          ) : (
            <Button onClick={onNext} disabled={isSubmitting}>
              Weiter
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
