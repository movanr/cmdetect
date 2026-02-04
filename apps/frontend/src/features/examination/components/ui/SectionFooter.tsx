import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, SkipForward } from "lucide-react";

export interface SectionFooterProps {
  /** Called when Next is clicked and validation passes */
  onNext?: () => void;
  /** Called when Skip is clicked (no validation) */
  onSkip?: () => void;
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
  /** Optional custom label for skip button */
  skipLabel?: string;
  /** If true, shows confirmation dialog when skip is clicked with incomplete data */
  warnOnSkip?: boolean;
  /** Returns true if data is incomplete (used when warnOnSkip is true) */
  checkIncomplete?: () => boolean;
}

/**
 * Reusable footer component for examination sections with Back/Skip/Next navigation.
 * Layout: Back button on left, Skip and Next buttons on right.
 */
export function SectionFooter({
  onNext,
  onSkip,
  onBack,
  isFirstStep = false,
  isLastSection = false,
  isValidating = false,
  nextLabel,
  skipLabel,
  warnOnSkip = false,
  checkIncomplete,
}: SectionFooterProps) {
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const defaultNextLabel = isLastSection ? "Abschließen" : "Weiter";
  const defaultSkipLabel = "Überspringen";

  const handleSkipClick = () => {
    // If warnOnSkip is enabled and data is incomplete, show confirmation dialog
    if (warnOnSkip && checkIncomplete?.()) {
      setShowSkipDialog(true);
    } else {
      onSkip?.();
    }
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    onSkip?.();
  };

  return (
    <>
      <CardFooter className="flex items-center justify-between pt-6 border-t">
        {/* Left: Back button */}
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

        {/* Right: Next and Skip buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onNext}
            disabled={isValidating}
          >
            {nextLabel ?? defaultNextLabel}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          {onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipClick}
              disabled={isValidating}
              className="text-muted-foreground"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              {skipLabel ?? defaultSkipLabel}
            </Button>
          )}
        </div>
      </CardFooter>

      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unvollständige Daten</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Abschnitt enthält unvollständige Daten. Möchten Sie trotzdem
              fortfahren? Sie können später zurückkehren um die fehlenden Daten zu
              ergänzen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSkip}>
              Überspringen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
