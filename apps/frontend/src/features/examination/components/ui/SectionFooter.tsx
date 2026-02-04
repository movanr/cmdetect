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
import { ArrowRight, ChevronLeft } from "lucide-react";

export interface SectionFooterProps {
  /** Called when Next is clicked and validation passes */
  onNext?: () => void;
  /** Called when user confirms skip in the dialog */
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
  /** If true, shows confirmation dialog when Next is clicked with incomplete data */
  warnOnSkip?: boolean;
  /** Returns true if data is incomplete (used when warnOnSkip is true) */
  checkIncomplete?: () => boolean;
}

/**
 * Reusable footer component for examination sections with Back/Next navigation.
 * Layout: Back button on left, Next button on right.
 * When Next is clicked with incomplete data and warnOnSkip is true, shows a skip confirmation dialog.
 */
export function SectionFooter({
  onNext,
  onSkipConfirm,
  onBack,
  isFirstStep = false,
  isLastSection = false,
  isValidating = false,
  nextLabel,
  warnOnSkip = false,
  checkIncomplete,
}: SectionFooterProps) {
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const defaultNextLabel = isLastSection ? "Abschließen" : "Weiter";

  const handleNextClick = () => {
    // If warnOnSkip is enabled and data is incomplete, show confirmation dialog
    // Note: checkIncomplete() typically calls validateStep() which triggers form errors
    if (warnOnSkip && checkIncomplete?.()) {
      setShowSkipDialog(true);
    } else {
      onNext?.();
    }
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    onSkipConfirm?.();
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

        {/* Right: Next button */}
        <Button
          type="button"
          onClick={handleNextClick}
          disabled={isValidating}
        >
          {nextLabel ?? defaultNextLabel}
          <ArrowRight className="h-4 w-4 ml-1" />
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
