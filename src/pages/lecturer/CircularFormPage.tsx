import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type {
  CircularType,
  TargetType,
  CircularPriority,
  CreateCircularPayload,
} from "@/types/circular";
import type { Class, PaginatedClasses } from "@/types/admin";
import { useCirculars } from "@/hooks/useCirculars";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function CircularFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { createCircular, updateCircular, getCircular } = useCirculars();

  const [loadingCircular, setLoadingCircular] = useState(isEditing);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<CircularType>("ANNOUNCEMENT");
  const [targetType, setTargetType] = useState<TargetType>("CLASS");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [priority, setPriority] = useState<CircularPriority>("NORMAL");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setClassesLoading(true);
    try {
      const data = await api.get<PaginatedClasses>("/classes?limit=100");
      setClasses(data.classes);
    } catch {
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      setLoadingCircular(true);
      getCircular(id)
        .then((c) => {
          setTitle(c.title ?? "");
          setContent(c.content ?? "");
          setType((c.type ?? "ANNOUNCEMENT") as CircularType);
          setTargetType((c.targetType ?? "CLASS") as TargetType);
          setTargetClassId(
            typeof c.targetClassId === "object"
              ? c.targetClassId?.id ?? ""
              : c.targetClassId ?? "",
          );
          setTargetDepartment(c.targetDepartment ?? "");
          setPriority((c.priority ?? "NORMAL") as CircularPriority);
          setIsPinned(c.isPinned ?? false);
        })
        .catch(() => {
          toast.error("Failed to load circular");
          navigate("/lecturer/circulars");
        })
        .finally(() => setLoadingCircular(false));
    } else if (!isEditing) {
      fetchClasses();
    }
  }, [id, isEditing, getCircular, navigate, fetchClasses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (title.length > 200) {
      toast.error("Title must be at most 200 characters");
      return;
    }
    if (targetType === "CLASS" && !targetClassId) {
      toast.error("Please select a class");
      return;
    }
    if (targetType === "DEPARTMENT" && !targetDepartment.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        await updateCircular(id, {
          title: title.trim(),
          content: content.trim(),
          priority,
          isPinned,
        });
      } else {
        const payload: CreateCircularPayload = {
          type,
          title: title.trim(),
          content: content.trim(),
          targetType,
          priority,
          isPinned,
        };
        if (targetType === "CLASS") payload.targetClassId = targetClassId;
        if (targetType === "DEPARTMENT") payload.targetDepartment = targetDepartment.trim();
        await createCircular(payload);
      }
      toast.success(isEditing ? "Circular updated" : "Circular published");
      navigate("/lecturer/circulars");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCircular) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate("/lecturer/circulars")}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Circulars
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {isEditing ? "Edit Circular" : "Publish Circular / Notice / Announcement"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the circular details."
              : "Create a circular, notice, or announcement for students."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="circ-title">Title</Label>
              <Input
                id="circ-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exam Schedule Update"
                maxLength={201}
                required
              />
              <p className="text-[11px] text-muted-foreground">{title.length}/200</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="circ-content">Content</Label>
              <textarea
                id="circ-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the full content..."
                required
                rows={5}
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50"
              />
            </div>

            {!isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="circ-type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as CircularType)}>
                    <SelectTrigger id="circ-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIRCULAR">Circular</SelectItem>
                      <SelectItem value="NOTICE">Notice</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circ-target">Target</Label>
                  <Select
                    value={targetType}
                    onValueChange={(v) => {
                      setTargetType(v as TargetType);
                      setTargetClassId("");
                      setTargetDepartment("");
                    }}
                  >
                    <SelectTrigger id="circ-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLASS">Specific Class</SelectItem>
                      <SelectItem value="DEPARTMENT">Department</SelectItem>
                      <SelectItem value="ALL">All Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {targetType === "CLASS" && (
                  <div className="space-y-2">
                    <Label htmlFor="circ-class">Class</Label>
                    {classesLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Select
                        value={targetClassId}
                        onValueChange={setTargetClassId}
                      >
                        <SelectTrigger id="circ-class">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} ({cls.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {targetType === "DEPARTMENT" && (
                  <div className="space-y-2">
                    <Label htmlFor="circ-dept">Department</Label>
                    <Input
                      id="circ-dept"
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="circ-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as CircularPriority)}
                >
                  <SelectTrigger id="circ-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-sm">Pin to top</span>
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/lecturer/circulars")}
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
                "Publish"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
