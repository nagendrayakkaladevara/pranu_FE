import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import type { Class, CreateClassPayload, UpdateClassPayload } from "@/types/admin";
import type { User } from "@/types/auth";
import { useClasses } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClassCard } from "@/components/admin/ClassCard";
import { ClassFormDialog } from "@/components/admin/ClassFormDialog";
import { AssignUsersDialog } from "@/components/admin/AssignUsersDialog";
import { BulkAssignDialog } from "@/components/admin/BulkAssignDialog";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { ErrorState } from "@/components/ErrorState";

export default function ClassesPage() {
  const {
    classes,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    setSearch,
    setPage,
    createClass,
    updateClass,
    deleteClass,
    getClassDetail,
    assignStudents,
    bulkAssignStudentsByEmail,
    assignLecturers,
    refetch,
  } = useClasses();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Assign dialogs
  const [assignStudentsTarget, setAssignStudentsTarget] = useState<Class | null>(null);
  const [assignLecturersTarget, setAssignLecturersTarget] = useState<Class | null>(null);
  const [bulkAssignTarget, setBulkAssignTarget] = useState<Class | null>(null);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
    },
    [searchInput, setSearch],
  );

  const handleCreate = useCallback(() => {
    setEditingClass(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((cls: Class) => {
    setEditingClass(cls);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateClassPayload | UpdateClassPayload) => {
      if (editingClass) {
        await updateClass(editingClass.id, data as UpdateClassPayload);
      } else {
        await createClass(data as CreateClassPayload);
      }
    },
    [editingClass, updateClass, createClass],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteClass(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Class deleted");
    } catch {
      toast.error("Failed to delete class");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteClass]);

  const openAssignStudents = useCallback(
    async (cls: Class) => {
      const detail = await getClassDetail(cls.id);
      const ids = (detail.students as User[]).map((s) => s.id);
      setAssignedIds(ids);
      setAssignStudentsTarget(cls);
    },
    [getClassDetail],
  );

  const openAssignLecturers = useCallback(
    async (cls: Class) => {
      const detail = await getClassDetail(cls.id);
      const ids = (detail.lecturers as User[]).map((l) => l.id);
      setAssignedIds(ids);
      setAssignLecturersTarget(cls);
    },
    [getClassDetail],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-bold">Classes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage classes and assign students & lecturers.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative max-w-sm animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </form>

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
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No classes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onAssignStudents={openAssignStudents}
                onAssignLecturers={openAssignLecturers}
                onBulkAssignStudents={setBulkAssignTarget}
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
      <ClassFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cls={editingClass}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Students */}
      {assignStudentsTarget && (
        <AssignUsersDialog
          open={!!assignStudentsTarget}
          onOpenChange={(open) => !open && setAssignStudentsTarget(null)}
          title={`Assign Students to ${assignStudentsTarget.name}`}
          description="Select students to assign to this class."
          role="STUDENT"
          alreadyAssigned={assignedIds}
          onAssign={async (ids) => {
            await assignStudents(assignStudentsTarget.id, { studentIds: ids });
          }}
        />
      )}

      {/* Assign Lecturers */}
      {assignLecturersTarget && (
        <AssignUsersDialog
          open={!!assignLecturersTarget}
          onOpenChange={(open) => !open && setAssignLecturersTarget(null)}
          title={`Assign Lecturers to ${assignLecturersTarget.name}`}
          description="Select lecturers to assign to this class."
          role="LECTURER"
          alreadyAssigned={assignedIds}
          onAssign={async (ids) => {
            await assignLecturers(assignLecturersTarget.id, { lecturerIds: ids });
          }}
        />
      )}

      {/* Bulk Assign Students via CSV */}
      {bulkAssignTarget && (
        <BulkAssignDialog
          open={!!bulkAssignTarget}
          onOpenChange={(open) => !open && setBulkAssignTarget(null)}
          className={bulkAssignTarget.name}
          onAssign={async (emails) => {
            await bulkAssignStudentsByEmail(bulkAssignTarget.id, emails);
          }}
        />
      )}
    </div>
  );
}
