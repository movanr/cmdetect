/**
 * PHQ-4 Score Summary Display - Table Format
 * Uses shadcn Card and Table components
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculatePHQ4Score,
  PHQ4_OPTIONS,
  PHQ4_QUESTION_ORDER,
  PHQ4_QUESTIONS,
} from "@cmdetect/questionnaires";

interface PHQ4SummaryProps {
  answers: Record<string, string>;
}

export function PHQ4Summary({ answers }: PHQ4SummaryProps) {
  const score = calculatePHQ4Score(answers);

  return (
    <Card className="py-0 gap-0">
      {/* Header */}
      <CardHeader className="bg-muted/50 border-b px-4 py-2">
        <CardDescription>
          Wie oft fühlten Sie sich im Verlauf der{" "}
          <span className="underline">letzten 2 Wochen</span> durch die folgenden Beschwerden
          beeinträchtigt?
        </CardDescription>
        <div className="text-[10px] text-muted-foreground/70 mt-1">
          0 = Überhaupt nicht, 1 = An einzelnen Tagen, 2 = An mehr als der Hälfte der Tage, 3 = Beinahe jeden Tag
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-auto" />
              {PHQ4_OPTIONS.map((opt) => (
                <TableHead key={opt.value} className="text-center px-1 py-1 w-[32px]">
                  <div className="text-xs font-semibold">{opt.value}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PHQ4_QUESTION_ORDER.map((questionId, index) => {
              const label = PHQ4_QUESTIONS[questionId];
              const selectedValue = answers[questionId];

              return (
                <TableRow key={questionId}>
                  <TableCell className="p-2 text-sm">
                    <span className="text-muted-foreground mr-1">
                      {String.fromCharCode(97 + index)}.
                    </span>
                    {label?.text}
                  </TableCell>
                  {PHQ4_OPTIONS.map((opt) => (
                    <TableCell key={opt.value} className="px-1 py-1 text-center">
                      <div
                        className={`w-5 h-5 rounded-full border-[1.5px] mx-auto flex items-center justify-center ${
                          selectedValue === opt.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {selectedValue === opt.value && (
                          <span className="text-[10px] font-bold">{opt.value}</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      {/* Total Score */}
      <CardFooter className="bg-muted/50 border-t px-4 py-3">
        <span className="font-medium">
          Gesamtpunktzahl = <span className="text-xl">{score.total}</span>
          <span className="text-base font-normal text-muted-foreground">/{score.maxTotal}</span>
        </span>
      </CardFooter>
    </Card>
  );
}
