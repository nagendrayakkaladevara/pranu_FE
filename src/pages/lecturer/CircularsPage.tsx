import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type {
  Circular,
  CircularType,
  TargetType,
  CircularPriority,
} from "@/types/circular";
import { useCirculars } from "@/hooks/useCirculars";
import { Button } from "@/components/ui/button";
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
import { CircularsTable } from "@/components/lecturer/CircularsTable";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { ErrorState } from "@/components/ErrorState";

export default function CircularsPage() {
  const {
    circulars,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    type,
    setType,
    targetType,
    setTargetType,
    priority,
    setPriority,
    myOnly,
    setMyOnly,
    setPage,
    deleteCircular,
    refetch,
  } = useCirculars();

  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Circular | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = useCallback(() => {
    navigate("/lecturer/circulars/new");
  }, [navigate]);

  const handleEdit = useCallback(
    (c: Circular) => {
      navigate(`/lecturer/circulars/${c.id}/edit`);
    },
    [navigate],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCircular(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Circular deleted");
    } catch {
      toast.error("Failed to delete circular");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteCircular]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-bold">Circulars & Notices</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Publish circulars, notices, and announcements to students.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-2" />
          Publish
        </Button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <Select
          value={type ?? "ALL"}
          onValueChange={(v) => setType(v === "ALL" ? undefined : (v as CircularType))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CIRCULAR">Circular</SelectItem>
            <SelectItem value="NOTICE">Notice</SelectItem>
            <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={targetType ?? "_ALL"}
          onValueChange={(v) =>
            setTargetType(v === "_ALL" ? undefined : (v as TargetType))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Targets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_ALL">All Targets</SelectItem>
            <SelectItem value="CLASS">Class</SelectItem>
            <SelectItem value="DEPARTMENT">Department</SelectItem>
            <SelectItem value="ALL">All Students</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priority ?? "ALL"}
          onValueChange={(v) =>
            setPriority(v === "ALL" ? undefined : (v as CircularPriority))
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={myOnly}
            onChange={(e) => setMyOnly(e.target.checked)}
            className="accent-primary rounded"
          />
          <span className="text-sm text-muted-foreground">My circulars only</span>
        </label>
      </div>

      {/* Table */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!error && (
          <CircularsTable
            circulars={circulars}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            showActions
          />
        )}
        {!error && !isLoading && totalPages > 0 && (
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Circular</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this circular? This action cannot
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
    </div>
  );
}
