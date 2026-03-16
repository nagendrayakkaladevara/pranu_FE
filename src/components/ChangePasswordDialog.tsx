import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { changePassword } from "@/lib/api";
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
import { toast } from "sonner";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [invalidFields, setInvalidFields] = useState<{
    current: boolean;
    new: boolean;
    confirm: boolean;
  }>({ current: false, new: false, confirm: false });

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setInvalidFields({ current: false, new: false, confirm: false });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInvalidFields({ current: false, new: false, confirm: false });

    if (!currentPassword.trim()) {
      setError("Current password is required");
      setInvalidFields({ current: true, new: false, confirm: false });
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setInvalidFields({ current: false, new: true, confirm: false });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setInvalidFields({ current: false, new: true, confirm: true });
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      setInvalidFields({ current: true, new: true, confirm: false });
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      resetForm();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setError(msg);
      if (msg.includes("Current password") && msg.includes("incorrect")) {
        setInvalidFields({ current: true, new: false, confirm: false });
      } else if (msg.includes("New password") && msg.includes("8 characters")) {
        setInvalidFields({ current: false, new: true, confirm: false });
      } else if (msg.includes("different from current")) {
        setInvalidFields({ current: true, new: true, confirm: false });
      } else {
        setInvalidFields({ current: true, new: false, confirm: false });
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <KeyRound className="size-4 text-primary" />
            </div>
            <DialogTitle>Change password</DialogTitle>
          </div>
          <DialogDescription>
            Enter your current password and choose a new one. Your new password must be at least 8 characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (error) setError("");
                if (invalidFields.current) setInvalidFields((p) => ({ ...p, current: false }));
              }}
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={invalidFields.current}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError("");
                if (invalidFields.new) setInvalidFields((p) => ({ ...p, new: false }));
              }}
              autoComplete="new-password"
              disabled={isLoading}
              minLength={8}
              aria-invalid={invalidFields.new}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
                if (invalidFields.confirm) setInvalidFields((p) => ({ ...p, confirm: false }));
              }}
              autoComplete="new-password"
              disabled={isLoading}
              minLength={8}
              aria-invalid={invalidFields.confirm}
              className="h-10"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Changing..." : "Change password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
