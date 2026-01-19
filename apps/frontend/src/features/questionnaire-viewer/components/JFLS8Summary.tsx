/**
 * JFLS-8 Summary Display - Matrix Table Format
 * Similar to PHQ4Summary but with 0-10 scale
 */

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  JFLS8_QUESTION_ORDER,
  JFLS8_QUESTION_LABELS,
  JFLS8_SCALE_LABELS,
  type JFLS8Answers,
} from "@cmdetect/questionnaires";

interface JFLS8SummaryProps {
  answers: JFLS8Answers;
}

// Scale options 0-10
const SCALE_OPTIONS = Array.from({ length: 11 }, (_, i) => String(i));

export function JFLS8Summary({ answers }: JFLS8SummaryProps) {
  return (
    <Card className="py-0 gap-0">
      {/* Header with instruction */}
      <CardHeader className="bg-muted/50 border-b px-4 py-2">
        <CardDescription>
          Grad der Einschränkung <span className="underline">innerhalb des letzten Monats</span>
          <span className="text-muted-foreground/70 ml-2">
            (0 = {JFLS8_SCALE_LABELS.min}, 10 = {JFLS8_SCALE_LABELS.max})
          </span>
        </CardDescription>
      </CardHeader>

      {/* Matrix Table */}
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="min-w-[160px]" />
              {SCALE_OPTIONS.map((value) => (
                <TableHead key={value} className="text-center px-1 py-1 w-[32px] min-w-[32px]">
                  <div className="text-xs font-semibold">{value}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {JFLS8_QUESTION_ORDER.map((questionId, index) => {
              const selectedValue = answers[questionId];

              return (
                <TableRow key={questionId}>
                  <TableCell className="p-2 text-sm whitespace-normal">
                    <span className="text-muted-foreground mr-1">{index + 1}.</span>
                    {JFLS8_QUESTION_LABELS[questionId]}
                  </TableCell>
                  {SCALE_OPTIONS.map((value) => (
                    <TableCell key={value} className="px-1 py-1 text-center">
                      <div
                        className={`w-4 h-4 rounded-full border-[1.5px] mx-auto flex items-center justify-center ${
                          selectedValue === value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {selectedValue === value && (
                          <span className="text-[8px] font-bold">{value}</span>
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
    </Card>
  );
}
