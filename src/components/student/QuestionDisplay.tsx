import type { AttemptQuestion } from "@/types/student";

interface QuestionDisplayProps {
  question: AttemptQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

export function QuestionDisplay({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
}: QuestionDisplayProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Question {questionIndex + 1} of {totalQuestions} &middot;{" "}
          {question.marks} mark{question.marks !== 1 ? "s" : ""}
        </p>
        <h3 className="font-display text-lg font-semibold leading-relaxed">
          {question.text}
        </h3>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option._id;
          return (
            <button
              key={option._id}
              type="button"
              onClick={() => onSelectOption(option._id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-border/60 hover:bg-card/80"
              }`}
            >
              <span className="text-sm">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
