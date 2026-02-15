import { CheckCircle2, XCircle } from "lucide-react";
import type { QuestionResult } from "@/types/student";

interface AttemptResultCardProps {
  result: QuestionResult;
  index: number;
}

export function AttemptResultCard({ result, index }: AttemptResultCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 mr-2">
          <p className="text-xs text-muted-foreground mb-1">
            Question {index + 1} &middot; {result.question.marks} mark
            {result.question.marks !== 1 ? "s" : ""}
          </p>
          <h4 className="font-display font-semibold text-sm leading-relaxed">
            {result.question.text}
          </h4>
        </div>
        <div className="shrink-0">
          {result.isCorrect ? (
            <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-green-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <XCircle className="size-4 text-red-400" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {result.options.map((option) => {
          const isCorrect = option._id === result.correctOptionId;
          const isSelected = option._id === result.selectedOptionId;

          let classes = "rounded-lg border p-3 text-sm ";
          if (isCorrect) {
            classes +=
              "border-green-500/30 bg-green-500/10 text-green-400";
          } else if (isSelected && !isCorrect) {
            classes +=
              "border-red-500/30 bg-red-500/10 text-red-400 line-through";
          } else {
            classes += "border-border/50 bg-transparent text-muted-foreground";
          }

          return (
            <div key={option._id} className={classes}>
              <span>{option.text}</span>
              {isCorrect && (
                <span className="ml-2 text-xs font-medium">(Correct)</span>
              )}
              {isSelected && !isCorrect && (
                <span className="ml-2 text-xs font-medium">(Your answer)</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Marks awarded:{" "}
        <span className="font-semibold">
          {result.marksAwarded}/{result.question.marks}
        </span>
      </div>
    </div>
  );
}
