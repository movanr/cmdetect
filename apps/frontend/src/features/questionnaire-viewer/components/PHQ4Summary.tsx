/**
 * PHQ-4 Score Summary Display - Table Format
 * Uses shadcn Card and Table components with ScalePips
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import { ScalePips } from "./dashboard/questionnaire-tables";

interface PHQ4SummaryProps {
  answers: Record<string, string>;
}

export function PHQ4Summary({ answers }: PHQ4SummaryProps) {
  const score = calculatePHQ4Score(answers);

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="bg-muted/50 border-b px-4 py-2">
        <CardDescription>
          Wie oft fühlten Sie sich im Verlauf der{" "}
          <span className="underline">letzten 2 Wochen</span> durch die
          folgenden Beschwerden beeinträchtigt?
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-auto">Frage</TableHead>
              <TableHead className="text-right">Antwort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PHQ4_QUESTION_ORDER.map((questionId, index) => {
              const label = PHQ4_QUESTIONS[questionId];
              const selectedValue = answers[questionId];
              const numValue =
                selectedValue != null ? Number(selectedValue) : null;
              const optionLabel = PHQ4_OPTIONS.find(
                (o) => o.value === selectedValue,
              )?.label;

              return (
                <TableRow key={questionId}>
                  <TableCell className="p-3 text-sm whitespace-normal">
                    <span className="text-muted-foreground mr-2">
                      {String.fromCharCode(97 + index)}.
                    </span>
                    {label?.text}
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="grid grid-cols-[auto_1.5rem_1fr] items-center gap-x-2">
                      <span className="justify-self-end">
                        {numValue != null && (
                          <ScalePips value={numValue} max={3} />
                        )}
                      </span>
                      <span className="text-lg font-medium tabular-nums text-right">
                        {selectedValue ?? "-"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {optionLabel ?? ""}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="bg-muted/50 border-t px-4 py-3 flex justify-between">
        <span className="font-medium">
          {score.total}/{score.maxTotal}
        </span>
        <span className="text-muted-foreground text-sm">
          Angst {score.anxiety}/{score.maxAnxiety}, Depression{" "}
          {score.depression}/{score.maxDepression}
        </span>
      </CardFooter>
    </Card>
  );
}
