import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { Plus, Search, Upload } from "lucide-react";
import type { User, UserRole } from "@/types/auth";
import type { CreateUserPayload, UpdateUserPayload } from "@/types/admin";
import { useUsers } from "@/hooks/useUsers";
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
import { UsersTable } from "@/components/admin/UsersTable";
import { UserFormDialog } from "@/components/admin/UserFormDialog";
import { BulkUploadDialog } from "@/components/admin/BulkUploadDialog";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { ErrorState } from "@/components/ErrorState";

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as UserRole) || undefined;
  const initialSearch = searchParams.get("q") ?? "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const {
    users,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    role,
    setRole,
    setSearch,
    setPage,
    createUser,
    updateUser,
    deleteUser,
    bulkCreateUsers,
    toggleActive,
    refetch,
  } = useUsers({ role: initialRole, name: initialSearch, page: initialPage });

  // Sync filter state back to URL
  useEffect(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (role) params.set("role", role); else params.delete("role");
      if (page > 1) params.set("page", String(page)); else params.delete("page");
      return params;
    }, { replace: true });
  }, [role, page, setSearchParams]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcut({
    key: "k",
    ctrlOrMeta: true,
    preventDefault: true,
    handler: () => searchInputRef.current?.focus(),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSearch);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
    },
    [searchInput, setSearch],
  );

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingUser(null);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateUserPayload | UpdateUserPayload) => {
      if (editingUser) {
        await updateUser(editingUser.id, data as UpdateUserPayload);
      } else {
        await createUser(data as CreateUserPayload);
      }
    },
    [editingUser, updateUser, createUser],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteUser]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="font-display text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage lecturers, students, and admins.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <Upload className="size-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="size-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search by name... (Ctrl+K)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select
          value={role ?? "ALL"}
          onValueChange={(v) => setRole(v === "ALL" ? undefined : (v as UserRole))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="LECTURER">Lecturer</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!error && <UsersTable
          users={users}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onToggleActive={async (id, isActive) => {
            await toggleActive(id, isActive);
          }}
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
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete User</DialogTitle>
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

      {/* Bulk Upload */}
      <BulkUploadDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onUpload={bulkCreateUsers}
      />
    </div>
  );
}
