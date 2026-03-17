import type { Circular } from "@/types/circular";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  CIRCULAR: "Circular",
  NOTICE: "Notice",
  ANNOUNCEMENT: "Announcement",
};

function targetDisplay(c: Circular): string {
  if (c.targetType === "CLASS" && c.targetClassId) {
    const ref = typeof c.targetClassId === "object" ? c.targetClassId : null;
    return ref?.name ?? String(c.targetClassId);
  }
  if (c.targetType === "DEPARTMENT") return c.targetDepartment ?? "—";
  return "All Students";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CircularDetailDialogProps {
  circular: Circular | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CircularDetailDialog({
  circular,
  open,
  onOpenChange,
}: CircularDetailDialogProps) {
  if (!circular) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[11px]">
              {TYPE_LABELS[circular.type] ?? circular.type}
            </Badge>
            <Badge
              variant={
                circular.priority === "URGENT"
                  ? "destructive"
                  : circular.priority === "HIGH"
                    ? "default"
                    : "secondary"
              }
              className="text-[11px]"
            >
              {circular.priority}
            </Badge>
          </div>
          <DialogTitle className="font-display text-lg pt-1">
            {circular.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>By {circular.publishedBy.name}</span>
            <span>•</span>
            <span>{formatDate(circular.createdAt)}</span>
            <span>•</span>
            <span>Target: {targetDisplay(circular)}</span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {circular.content}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
