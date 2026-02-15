import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/auth";
import type { PaginatedUsers } from "@/types/admin";
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
import { Skeleton } from "@/components/ui/skeleton";

interface AssignUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  role: UserRole;
  alreadyAssigned: string[];
  onAssign: (userIds: string[]) => Promise<void>;
}

export function AssignUsersDialog({
  open,
  onOpenChange,
  title,
  description,
  role,
  alreadyAssigned,
  onAssign,
}: AssignUsersDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("role", role);
      params.set("limit", "50");
      if (search) params.set("name", search);

      const data = await api.get<PaginatedUsers>(`/users?${params}`);
      setUsers(data.users);
    } catch {
      // Silently fail — user can retry
    } finally {
      setIsLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    if (open) {
      setSelected(new Set(alreadyAssigned));
      fetchUsers();
    }
  }, [open, alreadyAssigned, fetchUsers]);

  const toggleUser = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(Array.from(selected));
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No {role.toLowerCase()}s found.
            </p>
          ) : (
            users.map((user) => {
              const isChecked = selected.has(user.id);
              return (
                <label
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleUser(user.id)}
                    className="rounded border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : `Assign (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
