import type { AttemptQuestion } from "@/types/student";

interface QuestionDisplayProps {
  question: AttemptQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  textAnswer?: string;
  onTextAnswerChange?: (text: string) => void;
}

export function QuestionDisplay({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  textAnswer,
  onTextAnswerChange,
}: QuestionDisplayProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Question {questionIndex + 1} of {totalQuestions} &middot;{" "}
          {question.marks} mark{question.marks !== 1 ? "s" : ""}
          {question.type === "SUBJECTIVE" && (
            <span className="ml-2 text-amber-500">(Subjective)</span>
          )}
        </p>
        <h3 className="font-display text-lg font-semibold leading-relaxed">
          {question.text}
        </h3>
      </div>

      {question.type === "SUBJECTIVE" ? (
        <textarea
          className="w-full min-h-[120px] rounded-xl border border-border bg-card p-4 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
          placeholder="Type your answer here..."
          value={textAnswer ?? ""}
          onChange={(e) => onTextAnswerChange?.(e.target.value)}
        />
      ) : (
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(option.id)}
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
      )}
    </div>
  );
}
