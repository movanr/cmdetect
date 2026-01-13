/**
 * Generic questionnaire completion screen
 */

import { Card, CardContent } from "@/components/ui/card";

type QuestionnaireCompleteProps = {
  title: string;
  answeredCount: number;
};

export function QuestionnaireComplete({
  title,
  answeredCount,
}: QuestionnaireCompleteProps) {
  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold">Fragebogen abgeschlossen</h2>

          <p className="text-muted-foreground">
            Vielen Dank für das Ausfüllen des {title}.
          </p>

          <p className="text-sm text-muted-foreground">
            {answeredCount} Fragen beantwortet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
