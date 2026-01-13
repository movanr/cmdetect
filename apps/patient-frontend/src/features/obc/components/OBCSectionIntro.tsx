/**
 * OBC Section Introduction Screen
 * Shows section title and scale information before questions
 */

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { OBC_SECTIONS, type OBCSectionId } from "@cmdetect/questionnaires";

type OBCSectionIntroProps = {
  sectionId: OBCSectionId;
  onContinue: () => void;
};

export function OBCSectionIntro({ sectionId, onContinue }: OBCSectionIntroProps) {
  const section = OBC_SECTIONS[sectionId];

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">{section.title}</h2>
        <p className="text-muted-foreground">
          {sectionId === "sleep"
            ? "Die folgenden Fragen beziehen sich auf Aktivitäten während des Schlafs."
            : "Die folgenden Fragen beziehen sich auf Aktivitäten im Wachzustand."}
        </p>
      </div>

      {/* Scale Preview */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Antwortskala:</p>
        <div className="flex flex-wrap gap-2">
          {section.options.map((opt) => (
            <span
              key={opt.value}
              className="text-sm bg-background px-2 py-1 rounded border"
            >
              {opt.label}
            </span>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full h-12">
        Weiter
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
