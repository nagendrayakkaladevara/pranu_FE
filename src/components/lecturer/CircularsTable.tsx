import { Pin, Pencil, Trash2 } from "lucide-react";
import type { Circular, CircularType, CircularPriority } from "@/types/circular";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABELS: Record<CircularType, string> = {
  CIRCULAR: "Circular",
  NOTICE: "Notice",
  ANNOUNCEMENT: "Announcement",
};

const PRIORITY_VARIANTS: Record<CircularPriority, "outline" | "default" | "secondary" | "destructive"> = {
  LOW: "outline",
  NORMAL: "secondary",
  HIGH: "default",
  URGENT: "destructive",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function targetDisplay(c: Circular): string {
  if (c.targetType === "CLASS" && c.targetClassId) {
    const ref = typeof c.targetClassId === "object" ? c.targetClassId : null;
    return ref?.name ?? (typeof c.targetClassId === "string" ? c.targetClassId : "—");
  }
  if (c.targetType === "DEPARTMENT") return c.targetDepartment ?? "—";
  return "All Students";
}

interface CircularsTableProps {
  circulars: Circular[];
  isLoading: boolean;
  onEdit?: (c: Circular) => void;
  onDelete?: (c: Circular) => void;
  showActions?: boolean;
}

export function CircularsTable({
  circulars,
  isLoading,
  onEdit,
  onDelete,
  showActions = true,
}: CircularsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Published</TableHead>
              {showActions && <TableHead className="w-[100px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                {showActions && <TableCell />}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (circulars.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card py-16 text-center">
        <p className="text-muted-foreground text-sm">No circulars found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Published</TableHead>
            {showActions && <TableHead className="w-[100px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {circulars.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {c.isPinned && (
                    <span title="Pinned">
                      <Pin className="size-3.5 text-primary shrink-0" />
                    </span>
                  )}
                  <span className="font-medium truncate max-w-[200px]" title={c.title}>
                    {c.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[11px]">
                  {TYPE_LABELS[c.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {targetDisplay(c)}
              </TableCell>
              <TableCell>
                <Badge variant={PRIORITY_VARIANTS[c.priority]} className="text-[11px]">
                  {c.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(c.createdAt)}
              </TableCell>
              {showActions && onEdit && onDelete && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEdit(c)}
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(c)}
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
