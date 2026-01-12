/**
 * PHQ-4 Score Summary Display - Table Format
 */

import { Badge } from "@/components/ui/badge";
import {
  calculatePHQ4Score,
  getPHQ4Interpretation,
  PHQ4_QUESTIONS,
  PHQ4_QUESTION_ORDER,
  PHQ4_OPTIONS,
} from "@cmdetect/questionnaires";

interface PHQ4SummaryProps {
  answers: Record<string, string>;
}

export function PHQ4Summary({ answers }: PHQ4SummaryProps) {
  const score = calculatePHQ4Score(answers);
  const interpretation = getPHQ4Interpretation(score);

  const severityColors: Record<string, string> = {
    none: "bg-green-100 text-green-800 border-green-200",
    mild: "bg-yellow-100 text-yellow-800 border-yellow-200",
    moderate: "bg-orange-100 text-orange-800 border-orange-200",
    severe: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="border rounded-lg overflow-hidden mb-4 w-fit max-w-full">
      {/* Header */}
      <div className="bg-muted/50 px-4 py-2 border-b">
        <p className="text-sm text-muted-foreground">
          Wie oft fühlten Sie sich im Verlauf der <span className="underline">letzten 2 Wochen</span> durch die folgenden Beschwerden beeinträchtigt?
        </p>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-sm"></th>
            {PHQ4_OPTIONS.map((opt) => (
              <th key={opt.value} className="p-2 text-center font-medium text-xs align-bottom">
                <div className="text-muted-foreground text-[10px] leading-tight mb-1">{opt.label}</div>
                <div className="text-sm font-semibold">{opt.value}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PHQ4_QUESTION_ORDER.map((questionId, index) => {
            const label = PHQ4_QUESTIONS[questionId];
            const selectedValue = answers[questionId];

            return (
              <tr key={questionId} className="border-b last:border-b-0">
                <td className="p-3 text-sm">
                  <span className="text-muted-foreground mr-2">{String.fromCharCode(97 + index)}.</span>
                  {label?.text}
                </td>
                {PHQ4_OPTIONS.map((opt) => (
                  <td key={opt.value} className="p-2 text-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center ${
                        selectedValue === opt.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedValue === opt.value && (
                        <span className="text-xs font-bold">{opt.value}</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Total Score */}
      <div className="bg-muted/50 px-4 py-3 border-t flex items-center justify-between">
        <span className="font-medium">Gesamtpunktzahl</span>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">
            {score.total}
            <span className="text-base font-normal text-muted-foreground">/{score.maxTotal}</span>
          </span>
          <Badge className={severityColors[interpretation.severity]}>
            {interpretation.text}
          </Badge>
        </div>
      </div>
    </div>
  );
}
