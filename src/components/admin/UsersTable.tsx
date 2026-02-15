import type { User } from "@/types/auth";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserStatusToggle } from "./UserStatusToggle";

const ROLE_VARIANT: Record<string, string> = {
  ADMIN: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  LECTURER: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  STUDENT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
}

export function UsersTable({ users, isLoading, onEdit, onDelete, onToggleActive }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No users found.</p>
      </div>
    );
  }

  return (
    <>
    {/* Mobile card view */}
    <div className="md:hidden space-y-3">
      {users.map((user) => (
        <div key={user.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{user.name}</span>
            <div className="flex items-center gap-1">
              <UserStatusToggle user={user} onToggle={onToggleActive} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${user.name}`}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Pencil className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive focus:text-destructive">
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={ROLE_VARIANT[user.role] ?? ""}>{user.role}</Badge>
            <Badge variant="outline" className={user.isActive ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      ))}
    </div>

    {/* Desktop table view */}
    <div className="hidden md:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={ROLE_VARIANT[user.role] ?? ""}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={user.isActive
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                  }
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <UserStatusToggle user={user} onToggle={onToggleActive} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
