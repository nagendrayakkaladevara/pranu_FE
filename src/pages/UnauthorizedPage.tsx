import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDashboardPath } from "@/lib/routing";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6 animate-fade-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-destructive"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          You don't have permission to view this page.
        </p>
        <Button
          onClick={() => navigate(user ? getRoleDashboardPath(user.role) : "/login")}
          className="bg-primary text-primary-foreground font-display font-semibold"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
