import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onConfirm,
}: SubmitConfirmDialogProps) {
  const unanswered = totalQuestions - answeredCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Submit Quiz</DialogTitle>
          <DialogDescription>
            You have answered{" "}
            <strong>
              {answeredCount} of {totalQuestions}
            </strong>{" "}
            questions.
            {unanswered > 0 && (
              <>
                {" "}
                <span className="text-amber-400">
                  {unanswered} question{unanswered !== 1 ? "s" : ""} remain
                  unanswered.
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue Quiz
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
