/**
 * OBC Summary Display - Matrix Table Format
 * Two sections with different scales (sleep vs waking)
 * Highlights items with values >= 3, collapsible sections
 */

import { Button } from "@/components/ui/button";
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
  OBC_QUESTION_LABELS,
  OBC_QUESTION_ORDER,
  OBC_QUESTIONS,
  OBC_SLEEP_OPTIONS,
  OBC_WAKING_OPTIONS,
  type OBCAnswers,
  type OBCQuestionId,
} from "@cmdetect/questionnaires";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface OBCSummaryProps {
  answers: OBCAnswers;
}

// Clinical relevance threshold
const RELEVANCE_THRESHOLD = 3;

// Scale options 0-4
const SCALE_OPTIONS = ["0", "1", "2", "3", "4"];

// Sleep questions (items 1-2)
const SLEEP_QUESTIONS = OBC_QUESTION_ORDER.filter((id) => OBC_QUESTIONS[id].section === "sleep");

// Waking questions (items 3-21)
const WAKING_QUESTIONS = OBC_QUESTION_ORDER.filter((id) => OBC_QUESTIONS[id].section === "waking");

// Get question number for display
function getQuestionNumber(questionId: OBCQuestionId): number {
  return OBC_QUESTION_ORDER.indexOf(questionId) + 1;
}

// Check if answer is clinically relevant (>= 3)
function isRelevant(value: string | undefined): boolean {
  if (!value) return false;
  return parseInt(value, 10) >= RELEVANCE_THRESHOLD;
}

interface SectionProps {
  title: string;
  questions: OBCQuestionId[];
  answers: OBCAnswers;
  options: typeof OBC_SLEEP_OPTIONS | typeof OBC_WAKING_OPTIONS;
}

function OBCSection({ title, questions, answers, options }: SectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find questions with relevant answers (>= 3)
  const relevantQuestions = questions.filter((id) => isRelevant(answers[id]));
  const hasRelevantAnswers = relevantQuestions.length > 0;

  // Show relevant questions when collapsed, all when expanded
  const displayQuestions = isExpanded ? questions : relevantQuestions;

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="bg-muted/50 border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>{title}</CardDescription>
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              {options.map((opt, i) => (
                <span key={opt.value}>
                  {i > 0 && ", "}
                  {opt.value} = {opt.label}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground h-7 px-2"
          >
            {isExpanded ? (
              <>
                <span className="text-xs">Weniger</span>
                <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                <span className="text-xs">Alle ({questions.length})</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {!hasRelevantAnswers && !isExpanded ? (
          // No relevant answers message
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
            <span>Keine Auffälligkeiten (alle Werte &lt; {RELEVANCE_THRESHOLD})</span>
          </div>
        ) : (
          // Table with questions
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="min-w-[180px]" />
                {SCALE_OPTIONS.map((value) => (
                  <TableHead key={value} className="text-center px-1 py-1 w-[36px] min-w-[36px]">
                    <div className="text-xs font-semibold">{value}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayQuestions.map((questionId) => {
                const selectedValue = answers[questionId];
                const isHighlighted = isRelevant(selectedValue);
                const questionNum = getQuestionNumber(questionId);

                return (
                  <TableRow key={questionId} className={isHighlighted ? "bg-orange-50" : ""}>
                    <TableCell className="p-2 text-sm whitespace-normal">
                      <span className="text-muted-foreground mr-1">{questionNum}.</span>
                      {OBC_QUESTION_LABELS[questionId]}
                    </TableCell>
                    {SCALE_OPTIONS.map((value) => (
                      <TableCell key={value} className="px-1 py-1 text-center">
                        <div
                          className={`w-4 h-4 rounded-full border-[1.5px] mx-auto flex items-center justify-center ${
                            selectedValue === value
                              ? isHighlighted
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-primary bg-primary text-primary-foreground"
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
        )}
      </CardContent>
    </Card>
  );
}

export function OBCSummary({ answers }: OBCSummaryProps) {
  return (
    <div className="space-y-4">
      <OBCSection
        title="Aktivitäten während des Schlafs"
        questions={SLEEP_QUESTIONS}
        answers={answers}
        options={OBC_SLEEP_OPTIONS}
      />
      <OBCSection
        title="Aktivitäten im Wachzustand"
        questions={WAKING_QUESTIONS}
        answers={answers}
        options={OBC_WAKING_OPTIONS}
      />
    </div>
  );
}
