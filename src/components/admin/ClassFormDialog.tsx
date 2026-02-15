import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Class, CreateClassPayload, UpdateClassPayload } from "@/types/admin";
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
import { Label } from "@/components/ui/label";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cls?: Class | null;
  onSubmit: (data: CreateClassPayload | UpdateClassPayload) => Promise<void>;
}

export function ClassFormDialog({ open, onOpenChange, cls, onSubmit }: ClassFormDialogProps) {
  const isEditing = !!cls;
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(cls?.name ?? "");
      setDepartment(cls?.department ?? "");
      setAcademicYear(cls?.academicYear ?? "");
      setSemester(cls?.semester ?? 1);
      setError(null);
    }
  }, [open, cls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ name, department, academicYear, semester });
      onOpenChange(false);
      toast.success(isEditing ? "Class updated" : "Class created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit Class" : "Create Class"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update class details." : "Add a new class to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              placeholder="e.g., CSE-3A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Computer Science"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="academic-year">Academic Year</Label>
            <Input
              id="academic-year"
              placeholder="e.g., 2025-2026"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              type="number"
              min={1}
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</>
              ) : (
                isEditing ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
