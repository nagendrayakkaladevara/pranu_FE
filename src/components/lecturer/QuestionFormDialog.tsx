import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type {
  Question,
  Difficulty,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/lecturer";
import { useSubjectTopics } from "@/hooks/useSubjectTopics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question | null;
  onSubmit: (
    data: CreateQuestionPayload | UpdateQuestionPayload,
  ) => Promise<void>;
}

interface OptionDraft {
  text: string;
  isCorrect: boolean;
}

const EMPTY_OPTION: OptionDraft = { text: "", isCorrect: false };

export function QuestionFormDialog({
  open,
  onOpenChange,
  question,
  onSubmit,
}: QuestionFormDialogProps) {
  const isEditing = !!question;
  const { subjects: subjectSuggestions, topics: topicSuggestions } = useSubjectTopics();
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState<OptionDraft[]>([
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setText(question?.text ?? "");
      setSubject(question?.subject ?? "");
      setTopic(question?.topic ?? "");
      setDifficulty(question?.difficulty ?? "EASY");
      setMarks(question?.marks ?? 1);
      setOptions(
        question?.options?.length
          ? question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
          : [
              { ...EMPTY_OPTION },
              { ...EMPTY_OPTION },
              { ...EMPTY_OPTION },
              { ...EMPTY_OPTION },
            ],
      );
      setError(null);
    }
  }, [open, question]);

  const updateOption = (index: number, patch: Partial<OptionDraft>) => {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (i !== index) {
          // If marking this option as correct, unmark others
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await onSubmit({
          text,
          subject,
          topic,
          difficulty,
          marks,
          options: options.map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          })),
        } as UpdateQuestionPayload);
      } else {
        await onSubmit({
          text,
          type: "MCQ",
          subject,
          topic,
          difficulty,
          marks,
          options: options.map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          })),
        } as CreateQuestionPayload);
      }
      onOpenChange(false);
      toast.success(isEditing ? "Question updated" : "Question created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit Question" : "Create Question"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update question details and options."
              : "Add a new MCQ to your question bank."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-text">Question Text</Label>
            <Input
              id="q-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your question..."
              required
              autoFocus
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</>
              ) : (
                isEditing ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
