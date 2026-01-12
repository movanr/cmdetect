/**
 * Individual question item display
 */

interface QuestionItemProps {
  questionId: string;
  questionText: string;
  answer: string;
  className?: string;
}

export function QuestionItem({
  questionId,
  questionText,
  answer,
  className,
}: QuestionItemProps) {
  return (
    <div className={`border-b border-border py-3 last:border-b-0 ${className || ""}`}>
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
          {questionId}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{questionText}</p>
          <p className="mt-1 font-medium">{answer}</p>
        </div>
      </div>
    </div>
  );
}
