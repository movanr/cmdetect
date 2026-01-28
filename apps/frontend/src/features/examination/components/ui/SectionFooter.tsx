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
  /** If true, shows confirmation dialog when skip is clicked with incomplete data */
  warnOnSkip?: boolean;
  /** Returns true if data is incomplete (used when warnOnSkip is true) */
  checkIncomplete?: () => boolean;
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
      <CardFooter className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkipClick}
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
