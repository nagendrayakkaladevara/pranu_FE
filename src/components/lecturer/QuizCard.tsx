import type { Quiz, Question } from "@/types/lecturer";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Clock,
  FileQuestion,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  PUBLISHED: "bg-green-500/15 text-green-400 border-green-500/30",
  ARCHIVED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

interface QuizCardProps {
  quiz: Quiz;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
  onView: (quiz: Quiz) => void;
  onClone?: (quiz: Quiz) => void;
}

export function QuizCard({ quiz, onEdit, onDelete, onView, onClone }: QuizCardProps) {
  const questionCount =
    quiz._count?.questions ?? (quiz.questions as (string | Question)[])?.length ?? 0;
  const classCount = quiz._count?.assignedClasses ?? quiz.assignedClasses?.length ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="font-display font-semibold text-base truncate">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {quiz.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Actions for ${quiz.title}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(quiz)}>
              <Eye className="size-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(quiz)}>
              <Pencil className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {onClone && (
              <DropdownMenuItem onClick={() => onClone(quiz)}>
                <Copy className="size-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(quiz)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline" className={STATUS_CLASSES[quiz.status] ?? ""}>
          {quiz.status}
        </Badge>
        <Badge variant="outline">{quiz.totalMarks} marks</Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <span>{quiz.durationMinutes}m</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileQuestion className="size-4" />
          <span>
            {questionCount} Q{questionCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <GraduationCap className="size-4" />
          <span>
            {classCount} class{classCount !== 1 ? "es" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
