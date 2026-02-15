import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12 rounded-xl border border-destructive/20 bg-destructive/5">
      <AlertCircle className="size-8 mx-auto text-destructive mb-3" />
      <p className="text-sm text-destructive mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
