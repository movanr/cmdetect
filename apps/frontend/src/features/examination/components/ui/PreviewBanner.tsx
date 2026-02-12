/**
 * Preview Banner
 *
 * Blue info banner displayed during examination preview/preparation mode.
 * Shows a message that inputs are interactive but not saved, with a close button.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Eye, X } from "lucide-react";

interface PreviewBannerProps {
  caseId: string;
  className?: string;
}

export function PreviewBanner({ caseId, className }: PreviewBannerProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate({
      to: "/cases/$id/anamnesis/review",
      params: { id: caseId },
    });
  };

  return (
    <Alert className={cn("border-blue-200 bg-blue-50", className)}>
      <Eye className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-800">Vorbereitungsmodus</AlertTitle>
      <AlertDescription className="text-blue-700">
        Sie befinden sich im Vorbereitungsmodus. Alle Eingaben sind interaktiv, werden aber nicht
        gespeichert.
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-2 right-2 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
      >
        <X className="h-4 w-4 mr-1" />
        Schließen
      </Button>
    </Alert>
  );
}
