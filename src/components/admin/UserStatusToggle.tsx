import { useState } from "react";
import type { User } from "@/types/auth";
import { Button } from "@/components/ui/button";

interface UserStatusToggleProps {
  user: User;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
}

export function UserStatusToggle({ user, onToggle }: UserStatusToggleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(user.id, !user.isActive);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={user.isActive
        ? "text-destructive hover:text-destructive"
        : "text-emerald hover:text-emerald"
      }
    >
      {isLoading ? "..." : user.isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
