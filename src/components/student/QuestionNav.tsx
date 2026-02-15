interface QuestionNavProps {
  totalQuestions: number;
  currentIndex: number;
  answeredSet: Set<string>;
  bookmarkedSet?: Set<string>;
  questionIds: string[];
  onJump: (index: number) => void;
}

export function QuestionNav({
  totalQuestions,
  currentIndex,
  answeredSet,
  bookmarkedSet,
  questionIds,
  onJump,
}: QuestionNavProps) {
  const bookmarkCount = bookmarkedSet?.size ?? 0;

  return (
    <nav className="rounded-xl border border-border bg-card p-4" aria-label="Question navigation">
      <h4 className="font-display text-sm font-semibold mb-3">Questions</h4>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = answeredSet.has(questionIds[i]);
          const isBookmarked = bookmarkedSet?.has(questionIds[i]) ?? false;

          let classes =
            "w-full aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-colors relative ";

          if (isCurrent) {
            classes += "bg-primary text-primary-foreground";
          } else if (isAnswered) {
            classes += "bg-green-500/20 text-green-400 border border-green-500/30";
          } else {
            classes += "bg-muted/50 text-muted-foreground border border-border hover:bg-muted";
          }

          return (
            <button
              key={i}
              type="button"
              className={classes}
              onClick={() => onJump(i)}
              aria-label={`Question ${i + 1}${isCurrent ? " (current)" : ""}${isAnswered ? " (answered)" : " (unanswered)"}${isBookmarked ? " (bookmarked)" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {i + 1}
              {isBookmarked && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          <span>Answered ({answeredSet.size})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted/50 border border-border" />
          <span>Unanswered ({totalQuestions - answeredSet.size})</span>
        </div>
        {bookmarkCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Bookmarked ({bookmarkCount})</span>
          </div>
        )}
      </div>
    </nav>
  );
}
