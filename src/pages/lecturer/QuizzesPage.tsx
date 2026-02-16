import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import type {
  Quiz,
  QuizStatus,
  CreateQuizPayload,
  UpdateQuizPayload,
} from "@/types/lecturer";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuizCard } from "@/components/lecturer/QuizCard";
import { QuizFormDialog } from "@/components/lecturer/QuizFormDialog";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { ErrorState } from "@/components/ErrorState";

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = (searchParams.get("status") as QuizStatus) || undefined;
  const initialSearch = searchParams.get("q") ?? "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const {
    quizzes,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    status,
    setStatus,
    setSearch,
    setPage,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    refetch,
  } = useQuizzes({ status: initialStatus, search: initialSearch, page: initialPage });

  useEffect(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (status) params.set("status", status); else params.delete("status");
      if (page > 1) params.set("page", String(page)); else params.delete("page");
      return params;
    }, { replace: true });
  }, [status, page, setSearchParams]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSearch);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
    },
    [searchInput, setSearch],
  );

  const handleCreate = useCallback(() => {
    setEditingQuiz(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormOpen(true);
  }, []);

  const handleView = useCallback(
    (quiz: Quiz) => {
      navigate(`/lecturer/quizzes/${quiz.id}`);
    },
    [navigate],
  );

  const handleFormSubmit = useCallback(
    async (data: CreateQuizPayload | UpdateQuizPayload) => {
      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, data as UpdateQuizPayload);
      } else {
        await createQuiz(data as CreateQuizPayload);
      }
    },
    [editingQuiz, updateQuiz, createQuiz],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteQuiz(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteQuiz]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-bold">Quizzes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create, configure, and publish quizzes.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select
          value={status ?? "ALL"}
          onValueChange={(v) =>
            setStatus(v === "ALL" ? undefined : (v as QuizStatus))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No quizzes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onView={handleView}
              />
            ))}
          </div>
        )}

        {!isLoading && totalPages > 0 && (
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create/Edit Dialog */}
      <QuizFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        quiz={editingQuiz}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.title}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
