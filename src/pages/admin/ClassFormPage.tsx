import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { CreateClassPayload, UpdateClassPayload } from "@/types/admin";
import { useClasses } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { createClass, updateClass, getClassDetail } = useClasses();

  const [loadingClass, setLoadingClass] = useState(isEditing);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      setLoadingClass(true);
      getClassDetail(id)
        .then((c) => {
          setName(c.name ?? "");
          setDepartment(c.department ?? "");
          setAcademicYear(c.academicYear ?? "");
          setSemester(c.semester ?? 1);
        })
        .catch(() => {
          toast.error("Failed to load class");
          navigate("/admin/classes");
        })
        .finally(() => setLoadingClass(false));
    }
  }, [id, isEditing, getClassDetail, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        await updateClass(id, { name, department, academicYear, semester } as UpdateClassPayload);
      } else {
        await createClass({ name, department, academicYear, semester } as CreateClassPayload);
      }
      toast.success(isEditing ? "Class updated" : "Class created");
      navigate("/admin/classes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingClass) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate("/admin/classes")}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Classes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {isEditing ? "Edit Class" : "Create Class"}
          </CardTitle>
          <CardDescription>
            {isEditing ? "Update class details." : "Add a new class to the system."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                placeholder="e.g., CSE-3A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>

          <CardFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/classes")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
