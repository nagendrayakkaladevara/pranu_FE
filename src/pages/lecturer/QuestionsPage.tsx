import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, Upload } from "lucide-react";
import type {
  Question,
  Difficulty,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/lecturer";
import { useQuestions } from "@/hooks/useQuestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { QuestionsTable } from "@/components/lecturer/QuestionsTable";
import { QuestionFormDialog } from "@/components/lecturer/QuestionFormDialog";
import { BulkQuestionImportDialog } from "@/components/lecturer/BulkQuestionImportDialog";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { ErrorState } from "@/components/ErrorState";

export default function QuestionsPage() {
  const {
    questions,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    difficulty,
    setDifficulty,
    setSearch,
    setPage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    refetch,
  } = useQuestions();

  const [formOpen, setFormOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
    },
    [searchInput, setSearch],
  );

  const handleEdit = useCallback((q: Question) => {
    setEditingQuestion(q);
    setFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingQuestion(null);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateQuestionPayload | UpdateQuestionPayload) => {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, data as UpdateQuestionPayload);
      } else {
        await createQuestion(data as CreateQuestionPayload);
      }
    },
    [editingQuestion, updateQuestion, createQuestion],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteQuestion(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteQuestion]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-bold">Question Bank</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your MCQ question bank.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
            <Upload className="size-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="size-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select
          value={difficulty ?? "ALL"}
          onValueChange={(v) =>
            setDifficulty(v === "ALL" ? undefined : (v as Difficulty))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Difficulties</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!error && <QuestionsTable
          questions={questions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />}
        {!error && !isLoading && totalPages > 0 && (
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create/Edit Dialog */}
      <QuestionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        question={editingQuestion}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone.
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

      {/* Bulk Import */}
      <BulkQuestionImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onImport={createQuestion}
      />
    </div>
  );
}
