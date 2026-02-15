import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Class, PaginatedClasses } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PublishQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedClassIds: string[];
  onPublish: (classIds: string[]) => Promise<void>;
}

export function PublishQuizDialog({
  open,
  onOpenChange,
  assignedClassIds,
  onPublish,
}: PublishQuizDialogProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<PaginatedClasses>("/classes?limit=100");
      setClasses(data.classes);
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(new Set(assignedClassIds));
      fetchClasses();
    }
  }, [open, fetchClasses, assignedClassIds]);

  const toggleClass = (id: string) => {
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
      await onPublish(Array.from(selected));
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Publish to Classes</DialogTitle>
          <DialogDescription>
            Select classes to publish this quiz to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No classes found.
            </p>
          ) : (
            classes.map((cls) => {
              const isSelected = selected.has(cls.id);
              return (
                <label
                  key={cls.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleClass(cls.id)}
                    className="accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{cls.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">
                        {cls.department}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {cls.academicYear} &middot; Sem {cls.semester}
                      </span>
                    </div>
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
