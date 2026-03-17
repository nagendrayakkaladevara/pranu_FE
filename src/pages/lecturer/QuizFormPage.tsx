import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { HelpTip } from "@/components/HelpTip";
import type {
  CreateQuizPayload,
  UpdateQuizPayload,
} from "@/types/lecturer";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function QuizFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { createQuiz, updateQuiz, getQuizDetail } = useQuizzes();

  const [loadingQuiz, setLoadingQuiz] = useState(isEditing);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passMarks, setPassMarks] = useState(40);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      setLoadingQuiz(true);
      getQuizDetail(id)
        .then((q) => {
          setTitle(q.title ?? "");
          setDescription(q.description ?? "");
          setTotalMarks(q.totalMarks ?? 100);
          setDurationMinutes(q.durationMinutes ?? 30);
          setPassMarks(q.passMarks ?? 40);
          setShuffleQuestions(q.shuffleQuestions ?? false);
          setStartTime(toDatetimeLocal(q.startTime));
          setEndTime(toDatetimeLocal(q.endTime));
        })
        .catch(() => {
          toast.error("Failed to load quiz");
          navigate("/lecturer/quizzes");
        })
        .finally(() => setLoadingQuiz(false));
    }
  }, [id, isEditing, getQuizDetail, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passMarks > totalMarks) {
      setError("Pass marks cannot exceed total marks.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Start time and end time are required.");
      return;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }
    if (!isEditing && start < new Date()) {
      setError("Start time cannot be in the past.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description: description || undefined,
        totalMarks,
        durationMinutes,
        passMarks,
        shuffleQuestions,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };
      if (isEditing && id) {
        await updateQuiz(id, payload as UpdateQuizPayload);
      } else {
        const created = await createQuiz(payload as CreateQuizPayload);
        navigate(`/lecturer/quizzes/${created.id}`);
      }
      toast.success(isEditing ? "Quiz updated" : "Quiz created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingQuiz) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate("/lecturer/quizzes")}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Quizzes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {isEditing ? "Edit Quiz" : "Create Quiz"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update quiz settings."
              : "Configure a new quiz."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Title</Label>
              <Input
                id="quiz-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Quiz 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-desc">Description</Label>
              <Input
                id="quiz-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quiz-marks">Total Marks</Label>
                <Input
                  id="quiz-marks"
                  type="number"
                  min={1}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-duration">Duration (min)</Label>
                <Input
                  id="quiz-duration"
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-pass">
                  Pass Marks
                  <HelpTip text="Minimum marks required to pass. Must be less than or equal to total marks." />
                </Label>
                <Input
                  id="quiz-pass"
                  type="number"
                  min={0}
                  value={passMarks}
                  onChange={(e) => setPassMarks(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quiz-start">Start Time</Label>
                <Input
                  id="quiz-start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-end">End Time</Label>
                <Input
                  id="quiz-end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="quiz-shuffle"
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="accent-primary"
              />
              <Label htmlFor="quiz-shuffle" className="cursor-pointer">
                Shuffle questions for each student
              </Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>

          <CardFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/lecturer/quizzes")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
