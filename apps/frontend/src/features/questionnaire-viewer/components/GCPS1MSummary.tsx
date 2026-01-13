/**
 * GCPS 1-Month Summary Display - Table Format
 * Shows all 7 questions with responses
 */

import {
  Card,
  CardContent,
  CardDescription,
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
  GCPS_1M_QUESTION_ORDER,
  GCPS_1M_QUESTIONS,
  GCPS_1M_QUESTION_LABELS,
  type GCPS1MAnswers,
} from "@cmdetect/questionnaires";

interface GCPS1MSummaryProps {
  answers: GCPS1MAnswers;
}

export function GCPS1MSummary({ answers }: GCPS1MSummaryProps) {
  return (
    <Card className="py-0 gap-0">
      <CardHeader className="bg-muted/50 border-b px-4 py-2">
        <CardDescription>
          Graded Chronic Pain Scale - Bewertung der Gesichtsschmerzen in den{" "}
          <span className="underline">letzten 30 Tagen</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-auto">Frage</TableHead>
              <TableHead className="text-center w-32">Antwort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GCPS_1M_QUESTION_ORDER.map((questionId, index) => {
              const question = GCPS_1M_QUESTIONS[questionId];
              const answer = answers[questionId];
              const label = GCPS_1M_QUESTION_LABELS[questionId];

              return (
                <TableRow key={questionId}>
                  <TableCell className="p-3 text-sm whitespace-normal">
                    <span className="text-muted-foreground mr-2">
                      {index + 1}.
                    </span>
                    {label}
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    <span className="text-lg font-medium">
                      {answer ?? "-"}
                    </span>
                    {question.type === "numeric" && answer !== undefined && (
                      <span className="text-sm text-muted-foreground ml-1">
                        {question.unit}
                      </span>
                    )}
                    {question.type === "scale_0_10" && (
                      <span className="text-sm text-muted-foreground ml-1">
                        /10
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
