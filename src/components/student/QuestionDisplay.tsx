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
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-2 break-words">
          Question {questionIndex + 1} of {totalQuestions} &middot;{" "}
          {question.marks} mark{question.marks !== 1 ? "s" : ""}
          {question.type === "SUBJECTIVE" && (
            <span className="ml-2 text-amber-500">(Subjective)</span>
          )}
          {question.type === "FILL_IN_BLANK" && (
            <span className="ml-2 text-blue-500">(Fill in the blank)</span>
          )}
        </p>
        <h3 className="font-display text-base sm:text-lg font-semibold leading-relaxed break-words">
          {question.text}
        </h3>
      </div>

      {question.type === "SUBJECTIVE" ? (
        <textarea
          className="w-full min-w-0 min-h-[120px] rounded-xl border border-border bg-card p-4 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary box-border"
          placeholder="Type your answer here..."
          value={textAnswer ?? ""}
          onChange={(e) => onTextAnswerChange?.(e.target.value)}
        />
      ) : question.type === "FILL_IN_BLANK" ? (
        <input
          type="text"
          className="w-full min-w-0 rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary box-border"
          placeholder="Type your answer..."
          value={textAnswer ?? ""}
          onChange={(e) => onTextAnswerChange?.(e.target.value)}
        />
      ) : (
        <div className="min-w-0 space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={`w-full min-w-0 text-left rounded-xl border p-3 sm:p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-border/60 hover:bg-card/80"
                }`}
              >
                <span className="text-sm break-words">{option.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
