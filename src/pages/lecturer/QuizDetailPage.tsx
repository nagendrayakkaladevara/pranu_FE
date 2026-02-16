import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Send, Clock, FileQuestion } from "lucide-react";
import { api } from "@/lib/api";
import type { Quiz, Question } from "@/types/lecturer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddQuestionsDialog } from "@/components/lecturer/AddQuestionsDialog";
import { PublishQuizDialog } from "@/components/lecturer/PublishQuizDialog";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  PUBLISHED: "bg-green-500/15 text-green-400 border-green-500/30",
  ARCHIVED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const DIFFICULTY_CLASSES: Record<string, string> = {
  EASY: "bg-green-500/15 text-green-400 border-green-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  HARD: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addQuestionsOpen, setAddQuestionsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const fetchQuiz = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await api.get<any>(`/quizzes/${id}`);
      // Backend wraps questions as { question: {...} } and classes as { class: {...} }
      // Unwrap them for frontend consumption
      if (Array.isArray(data.questions)) {
        data.questions = data.questions.map((q: { question?: Question } | Question | string) =>
          typeof q === "object" && q !== null && "question" in q ? q.question : q,
        );
      }
      if (Array.isArray(data.assignedClasses)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.assignedClasses = data.assignedClasses.map((c: any) =>
          typeof c === "object" && c !== null && "class" in c ? c.class.id ?? c.class : c,
        );
      }
      setQuiz(data as Quiz);
    } catch {
      // navigate back on error
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAddQuestions = async (questionIds: string[]) => {
    if (!id) return;
    await api.post(`/quizzes/${id}/questions`, { questionIds });
    await fetchQuiz();
  };

  const handlePublish = async (classIds: string[]) => {
    if (!id) return;
    await api.post(`/quizzes/${id}/publish`, { classIds });
    await fetchQuiz();
  };

  const questions = (quiz?.questions ?? []) as Question[];
  const existingQuestionIds = questions.map((q) =>
    typeof q === "string" ? q : q.id,
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Quiz not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/lecturer/quizzes")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Quizzes
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <Breadcrumbs items={[
          { label: "Quizzes", href: "/lecturer/quizzes" },
          { label: quiz.title },
        ]} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold">{quiz.title}</h2>
              <Badge
                variant="outline"
                className={STATUS_CLASSES[quiz.status] ?? ""}
              >
                {quiz.status}
              </Badge>
            </div>
            {quiz.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {quiz.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAddQuestionsOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              Add Questions
            </Button>
            <Button onClick={() => setPublishOpen(true)}>
              <Send className="size-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="size-4" />
            <span className="text-xs">Duration</span>
          </div>
          <p className="font-display font-bold text-lg">
            {quiz.durationMinutes} min
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Marks</p>
          <p className="font-display font-bold text-lg">{quiz.totalMarks}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Pass Marks</p>
          <p className="font-display font-bold text-lg">{quiz.passMarks ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileQuestion className="size-4" />
            <span className="text-xs">Questions</span>
          </div>
          <p className="font-display font-bold text-lg">{questions.length}</p>
        </div>
      </div>

      {/* Questions List */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h3 className="font-display font-semibold text-lg mb-3">Questions</h3>
        {questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">
            <p className="text-sm">No questions added yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setAddQuestionsOpen(true)}
            >
              <Plus className="size-4 mr-1" />
              Add Questions
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, i) => (
                  <TableRow key={typeof q === "string" ? q : q.id}>
                    <TableCell className="text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {typeof q === "string" ? q : q.text}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {typeof q === "string" ? "—" : q.subject}
                    </TableCell>
                    <TableCell>
                      {typeof q !== "string" && (
                        <Badge
                          variant="outline"
                          className={DIFFICULTY_CLASSES[q.difficulty] ?? ""}
                        >
                          {q.difficulty}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof q === "string" ? "—" : q.marks}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddQuestionsDialog
        open={addQuestionsOpen}
        onOpenChange={setAddQuestionsOpen}
        existingQuestionIds={existingQuestionIds}
        onAdd={handleAddQuestions}
      />
      <PublishQuizDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        assignedClassIds={quiz.assignedClasses}
        onPublish={handlePublish}
      />
    </div>
  );
}
