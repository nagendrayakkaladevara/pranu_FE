import type { Question } from "@/types/lecturer";
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

const DIFFICULTY_CLASSES: Record<string, string> = {
  EASY: "bg-green-500/15 text-green-400 border-green-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  HARD: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface QuestionsTableProps {
  questions: Question[];
  isLoading: boolean;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}

export function QuestionsTable({
  questions,
  isLoading,
  onEdit,
  onDelete,
}: QuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No questions found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[300px]">Question</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-medium max-w-[400px] truncate">
                {q.text}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {q.subject}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={DIFFICULTY_CLASSES[q.difficulty] ?? ""}
                >
                  {q.difficulty}
                </Badge>
              </TableCell>
              <TableCell>{q.marks}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(q)}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(q)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
