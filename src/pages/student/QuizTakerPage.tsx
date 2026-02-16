import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Send, Bookmark, BookmarkCheck } from "lucide-react";
import { api } from "@/lib/api";
import type {
  AttemptDetail,
  SubmitAttemptPayload,
  StartAttemptResponse,
} from "@/types/student";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizTimer } from "@/components/student/QuizTimer";
import { QuestionDisplay } from "@/components/student/QuestionDisplay";
import { QuestionNav } from "@/components/student/QuestionNav";
import { SubmitConfirmDialog } from "@/components/student/SubmitConfirmDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

export default function QuizTakerPage() {
  const { id: quizId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [textAnswers, setTextAnswers] = useState<Map<string, string>>(new Map());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const storageKey = `quiz_answers_${quizId}`;

  // Start or resume attempt
  useEffect(() => {
    if (!quizId) return;

    async function startAttempt() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.post<StartAttemptResponse>(
          `/exam/quizzes/${quizId}/start`,
          {},
        );
        // Map backend response to AttemptDetail for UI
        const detail: AttemptDetail = {
          id: data.attempt.id,
          quizId: data.attempt.quiz,
          quizTitle: "", // Not returned by start endpoint; set from quiz list
          status: data.attempt.status,
          durationMinutes: 0, // Will be computed from quiz settings
          startTime: data.attempt.startTime,
          endTime: null,
          questions: data.questions,
          answers: data.attempt.responses ?? [],
        };
        setAttempt(detail);
        // Restore from sessionStorage first, then from API
        const saved = sessionStorage.getItem(`quiz_answers_${quizId}`);
        if (saved) {
          try {
            const parsed: [string, string][] = JSON.parse(saved);
            setAnswers(new Map(parsed));
          } catch {
            sessionStorage.removeItem(`quiz_answers_${quizId}`);
          }
        } else if (detail.answers?.length) {
          const restored = new Map<string, string>();
          for (const a of detail.answers) {
            if (a.selectedOptionId) {
              restored.set(a.questionId, a.selectedOptionId);
            }
          }
          setAnswers(restored);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start quiz attempt",
        );
      } finally {
        setIsLoading(false);
      }
    }
    startAttempt();
  }, [quizId]);

  const currentQuestion = attempt?.questions[currentIndex] ?? null;
  const totalQuestions = attempt?.questions.length ?? 0;
  const questionIds = useMemo(
    () => attempt?.questions.map((q) => q.id) ?? [],
    [attempt],
  );
  const answeredSet = useMemo(
    () => new Set([...answers.keys(), ...textAnswers.keys()]),
    [answers, textAnswers],
  );

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(currentQuestion.id, optionId);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(Array.from(next.entries())));
        } catch { /* quota exceeded — ignore */ }
        return next;
      });
    },
    [currentQuestion, storageKey],
  );

  const handleTextAnswer = useCallback(
    (text: string) => {
      if (!currentQuestion) return;
      setTextAnswers((prev) => {
        const next = new Map(prev);
        if (text) {
          next.set(currentQuestion.id, text);
        } else {
          next.delete(currentQuestion.id);
        }
        return next;
      });
    },
    [currentQuestion],
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1));
  }, [totalQuestions]);

  const handleJump = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard shortcuts for quiz navigation
  useKeyboardShortcut({ key: "ArrowLeft", handler: handlePrev });
  useKeyboardShortcut({ key: "ArrowRight", handler: handleNext });

  // Warn before accidental navigation away from active quiz
  useEffect(() => {
    if (!attempt || submittedRef.current) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [attempt]);

  // Detect tab/window switching and warn the student
  const tabSwitchCount = useRef(0);
  useEffect(() => {
    if (!attempt || submittedRef.current) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        toast.warning(
          `Tab switch detected (${tabSwitchCount.current}). Please stay on this page during the quiz.`,
          { duration: 5000 },
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [attempt]);

  const toggleBookmark = useCallback(() => {
    if (!currentQuestion) return;
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  }, [currentQuestion]);

  const doSubmit = useCallback(async () => {
    if (!attempt || submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);

    try {
      const mcqResponses = Array.from(answers.entries()).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        }),
      );
      const subjectiveResponses = Array.from(textAnswers.entries()).map(
        ([questionId, textAnswer]) => ({
          questionId,
          textAnswer,
        }),
      );
      const payload: SubmitAttemptPayload = {
        responses: [...mcqResponses, ...subjectiveResponses],
      };
      await api.post(`/exam/attempts/${attempt.id}/submit`, payload);
      sessionStorage.removeItem(storageKey);
      navigate("/student/results", { replace: true });
    } catch (err) {
      submittedRef.current = false;
      const message = err instanceof Error ? err.message : "Failed to submit quiz";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  }, [attempt, answers, textAnswers, navigate, storageKey]);

  const handleTimerExpired = useCallback(() => {
    doSubmit();
  }, [doSubmit]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="p-6">
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <p className="text-sm text-destructive mb-4">
            {error ?? "Unable to load quiz."}
          </p>
          <Button variant="outline" onClick={() => navigate("/student/quizzes")}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // Compute end time for timer
  const timerEndTime =
    attempt.endTime ??
    new Date(
      new Date(attempt.startTime).getTime() +
        attempt.durationMinutes * 60 * 1000,
    ).toISOString();

  return (
    <div className="p-6 animate-fade-up">
      <Breadcrumbs items={[
        { label: "Quizzes", href: "/student/quizzes" },
        { label: attempt.quizTitle },
      ]} />
      {/* Header with title + timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold truncate">
            {attempt.quizTitle}
          </h2>
        </div>
        <QuizTimer endTime={timerEndTime} onExpired={handleTimerExpired} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        {/* Main question area */}
        <div className="rounded-xl border border-border bg-card p-6">
          {currentQuestion && (
            <QuestionDisplay
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={totalQuestions}
              selectedOptionId={answers.get(currentQuestion.id) ?? null}
              onSelectOption={handleSelectOption}
              textAnswer={textAnswers.get(currentQuestion.id)}
              onTextAnswerChange={handleTextAnswer}
            />
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBookmark}
              aria-label={currentQuestion && bookmarked.has(currentQuestion.id) ? "Remove bookmark" : "Bookmark for review"}
              className={currentQuestion && bookmarked.has(currentQuestion.id) ? "text-amber-500" : "text-muted-foreground"}
            >
              {currentQuestion && bookmarked.has(currentQuestion.id) ? (
                <BookmarkCheck className="size-4 mr-1" />
              ) : (
                <Bookmark className="size-4 mr-1" />
              )}
              {currentQuestion && bookmarked.has(currentQuestion.id) ? "Bookmarked" : "Bookmark"}
            </Button>

            {currentIndex === totalQuestions - 1 ? (
              <Button onClick={() => setShowSubmitDialog(true)}>
                <Send className="size-4 mr-1" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Question navigation sidebar */}
        <div className="hidden lg:block">
          <QuestionNav
            totalQuestions={totalQuestions}
            currentIndex={currentIndex}
            answeredSet={answeredSet}
            bookmarkedSet={bookmarked}
            questionIds={questionIds}
            onJump={handleJump}
          />

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSubmitDialog(true)}
            >
              <Send className="size-4 mr-1" />
              Submit Quiz
            </Button>
          </div>
        </div>
      </div>

      <SubmitConfirmDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        answeredCount={answeredSet.size}
        totalQuestions={totalQuestions}
        isSubmitting={isSubmitting}
        onConfirm={doSubmit}
      />
    </div>
  );
}
