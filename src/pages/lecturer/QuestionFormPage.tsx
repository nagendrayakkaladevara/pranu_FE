import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import type {
  Question,
  QuestionType,
  Difficulty,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/lecturer";
import { useSubjectTopics } from "@/hooks/useSubjectTopics";
import { useQuestions } from "@/hooks/useQuestions";
import { api } from "@/lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface OptionDraft {
  text: string;
  isCorrect: boolean;
}

const EMPTY_OPTION: OptionDraft = { text: "", isCorrect: false };

export default function QuestionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { createQuestion, updateQuestion } = useQuestions();
  const { subjects: subjectSuggestions, topics: topicSuggestions } = useSubjectTopics();

  const [loadingQuestion, setLoadingQuestion] = useState(isEditing);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<QuestionType>("MCQ");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState<OptionDraft[]>([
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
  ]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      setLoadingQuestion(true);
      api
        .get<Question>(`/questions/${id}`)
        .then((q) => {
          setText(q.text ?? "");
          setSubject(q.subject ?? "");
          setTopic(q.topic ?? "");
          setType((q.type ?? "MCQ") as QuestionType);
          setDifficulty(q.difficulty ?? "EASY");
          setMarks(q.marks ?? 1);
          setOptions(
            q.options?.length
              ? q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
              : [
                  { ...EMPTY_OPTION },
                  { ...EMPTY_OPTION },
                  { ...EMPTY_OPTION },
                  { ...EMPTY_OPTION },
                ],
          );
          setCorrectAnswers(q.correctAnswers?.length ? q.correctAnswers : [""]);
        })
        .catch(() => {
          toast.error("Failed to load question");
          navigate("/lecturer/questions");
        })
        .finally(() => setLoadingQuestion(false));
    }
  }, [id, isEditing, navigate]);

  const updateOption = (index: number, patch: Partial<OptionDraft>) => {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (i !== index) {
          if (patch.isCorrect) return { ...o, isCorrect: false };
          return o;
        }
        return { ...o, ...patch };
      }),
    );
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { ...EMPTY_OPTION }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addCorrectAnswer = () => {
    setCorrectAnswers((prev) => [...prev, ""]);
  };

  const updateCorrectAnswer = (index: number, value: string) => {
    setCorrectAnswers((prev) =>
      prev.map((a, i) => (i === index ? value : a)),
    );
  };

  const removeCorrectAnswer = (index: number) => {
    if (correctAnswers.length <= 1) return;
    setCorrectAnswers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (type === "MCQ") {
      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setError("At least one option must be marked as correct.");
        return;
      }
      const hasEmpty = options.some((o) => !o.text.trim());
      if (hasEmpty) {
        setError("All options must have text.");
        return;
      }
    } else if (type === "FILL_IN_BLANK") {
      const validAnswers = correctAnswers.filter((a) => a.trim());
      if (validAnswers.length === 0) {
        setError("At least one correct answer is required.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const basePayload = { text, subject, topic, difficulty, marks };

      if (isEditing && id) {
        const updatePayload: UpdateQuestionPayload = { ...basePayload };
        if (type === "MCQ") {
          updatePayload.options = options.map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          }));
        } else if (type === "FILL_IN_BLANK") {
          updatePayload.correctAnswers = correctAnswers
            .map((a) => a.trim())
            .filter(Boolean);
        }
        await updateQuestion(id, updatePayload);
      } else {
        const createPayload: CreateQuestionPayload = {
          ...basePayload,
          type,
        };
        if (type === "MCQ") {
          createPayload.options = options.map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          }));
        } else if (type === "FILL_IN_BLANK") {
          createPayload.correctAnswers = correctAnswers
            .map((a) => a.trim())
            .filter(Boolean);
        }
        await createQuestion(createPayload);
      }
      toast.success(isEditing ? "Question updated" : "Question created");
      navigate("/lecturer/questions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingQuestion) {
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
        onClick={() => navigate("/lecturer/questions")}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Question Bank
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {isEditing ? "Edit Question" : "Create Question"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update question details and options."
              : "Add a new question to your question bank (MCQ or Fill-in-the-blank)."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-text">Question Text</Label>
              <Input
                id="q-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your question..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="q-subject">Subject</Label>
                <Input
                  id="q-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  required
                  list="subject-suggestions"
                />
                <datalist id="subject-suggestions">
                  {subjectSuggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-topic">Topic</Label>
                <Input
                  id="q-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Calculus"
                  required
                  list="topic-suggestions"
                />
                <datalist id="topic-suggestions">
                  {topicSuggestions.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="q-type">Question Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as QuestionType)}
              >
                <SelectTrigger id="q-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value="FILL_IN_BLANK">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="q-difficulty">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as Difficulty)}
                >
                  <SelectTrigger id="q-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-marks">Marks</Label>
                <Input
                  id="q-marks"
                  type="number"
                  min={1}
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {type === "MCQ" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="size-3 mr-1" />
                    Add
                  </Button>
                </div>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => updateOption(i, { isCorrect: true })}
                      className="accent-primary"
                      title="Mark as correct"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => updateOption(i, { text: e.target.value })}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeOption(i)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground">
                  Select the radio button next to the correct answer.
                </p>
              </div>
            )}

            {type === "FILL_IN_BLANK" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Correct Answers</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCorrectAnswer}
                  >
                    <Plus className="size-3 mr-1" />
                    Add
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Add one or more acceptable answers (case-insensitive matching).
                </p>
                {correctAnswers.map((ans, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={ans}
                      onChange={(e) => updateCorrectAnswer(i, e.target.value)}
                      placeholder={`Answer ${i + 1}`}
                      className="flex-1"
                    />
                    {correctAnswers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCorrectAnswer(i)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/lecturer/questions")}
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
