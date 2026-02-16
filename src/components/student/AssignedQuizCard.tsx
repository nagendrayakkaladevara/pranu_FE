import { Clock, FileQuestion, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AssignedQuiz } from "@/types/student";

const AVAILABILITY_CLASSES: Record<string, string> = {
  UPCOMING: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  ACTIVE: "bg-green-500/15 text-green-400 border-green-500/30",
  ENDED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const ATTEMPT_STATUS_CLASSES: Record<string, string> = {
  STARTED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SUBMITTED: "bg-green-500/15 text-green-400 border-green-500/30",
  EXPIRED: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface AssignedQuizCardProps {
  quiz: AssignedQuiz;
  onStartQuiz: (quiz: AssignedQuiz) => void;
}

export function AssignedQuizCard({ quiz, onStartQuiz }: AssignedQuizCardProps) {
  const questionCount =
    quiz._count?.questions ??
    (Array.isArray(quiz.questions) ? quiz.questions.length : 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="font-display font-semibold text-base truncate">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {quiz.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge
          variant="outline"
          className={quiz.availability ? AVAILABILITY_CLASSES[quiz.availability] ?? "" : ""}
        >
          {quiz.availability ?? "ACTIVE"}
        </Badge>
        {quiz.lastAttemptStatus && (
          <Badge
            variant="outline"
            className={ATTEMPT_STATUS_CLASSES[quiz.lastAttemptStatus] ?? ""}
          >
            {quiz.lastAttemptStatus.replace("_", " ")}
          </Badge>
        )}
        <Badge variant="outline">{quiz.totalMarks} marks</Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <span>{quiz.durationMinutes}m</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileQuestion className="size-4" />
          <span>
            {questionCount} Q{questionCount !== 1 ? "s" : ""}
          </span>
        </div>
        {(quiz.attemptCount ?? 0) > 0 && (
          <span className="text-xs">
            {quiz.attemptCount} attempt{quiz.attemptCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        {quiz.startTime && (
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            <span>Start: {formatDate(quiz.startTime)}</span>
          </div>
        )}
        {quiz.endTime && (
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            <span>End: {formatDate(quiz.endTime)}</span>
          </div>
        )}
      </div>

      {(quiz.canAttempt !== false) && quiz.availability === "ACTIVE" && (
        <Button className="w-full" onClick={() => onStartQuiz(quiz)}>
          Start Quiz
        </Button>
      )}
    </div>
  );
}
