import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Question, PaginatedQuestions } from "@/types/lecturer";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DIFFICULTY_CLASSES: Record<string, string> = {
  EASY: "bg-green-500/15 text-green-400 border-green-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  HARD: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface AddQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingQuestionIds: string[];
  onAdd: (questionIds: string[]) => Promise<void>;
}

export function AddQuestionsDialog({
  open,
  onOpenChange,
  existingQuestionIds,
  onAdd,
}: AddQuestionsDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (search) params.set("search", search);
      params.set("sortBy", "createdAt:desc");

      const data = await api.get<PaginatedQuestions>(`/questions?${params}`);
      setQuestions(data.questions);
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(new Set());
      setSearchInput("");
      fetchQuestions("");
    }
  }, [open, fetchQuestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions(searchInput);
  };

  const toggleQuestion = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAdd(Array.from(selected));
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingSet = new Set(existingQuestionIds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Add Questions</DialogTitle>
          <DialogDescription>
            Search and select questions to add to this quiz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No questions found.
            </p>
          ) : (
            questions.map((q) => {
              const alreadyAdded = existingSet.has(q.id);
              const isSelected = selected.has(q.id);
              return (
                <label
                  key={q.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    alreadyAdded
                      ? "opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected || alreadyAdded}
                    disabled={alreadyAdded}
                    onChange={() => !alreadyAdded && toggleQuestion(q.id)}
                    className="accent-primary mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${DIFFICULTY_CLASSES[q.difficulty] ?? ""}`}
                      >
                        {q.difficulty}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {q.subject} &middot; {q.marks} marks
                      </span>
                      {alreadyAdded && (
                        <span className="text-[10px] text-muted-foreground">
                          (already added)
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selected.size === 0 || isSubmitting}
          >
            {isSubmitting
              ? "Adding..."
              : `Add ${selected.size} Question${selected.size !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
