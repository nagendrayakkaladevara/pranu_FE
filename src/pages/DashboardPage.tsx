import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const ROLE_CONFIG = {
  ADMIN: {
    title: "Admin Dashboard",
    subtitle: "Manage users, classes, and view organization analytics",
    color: "from-primary/20 to-primary/5",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  LECTURER: {
    title: "Lecturer Dashboard",
    subtitle: "Create quizzes, manage question banks, and track performance",
    color: "from-blue-500/20 to-blue-500/5",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  STUDENT: {
    title: "Student Dashboard",
    subtitle: "View upcoming quizzes, attempt exams, and check your results",
    color: "from-amber-500/20 to-amber-500/5",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
} as const;

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const config = ROLE_CONFIG[user.role];

  return (
    <div className="noise-overlay min-h-screen">
      {/* Top bar */}
      <header className="border-b border-border bg-card backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                <path d="m9 9.5 2 2 4-4" />
              </svg>
            </div>
            <span className="font-display font-bold text-sm tracking-tight">ECQES</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-sm font-display font-bold text-primary">
                {user.name.charAt(0)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="ml-1.5 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome hero */}
        <div
          className={`rounded-2xl bg-gradient-to-br ${config.color} border border-border p-8 mb-8 animate-fade-up`}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border text-primary shrink-0">
              {config.icon}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Welcome back, {user.name.split(" ")[0]}
              </h1>
              <p className="mt-1 text-muted-foreground text-sm">
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Coming Soon", desc: "Feature modules will appear here as they are built" },
            { label: "Under Construction", desc: "Quiz management, analytics, and more" },
            { label: "Stay Tuned", desc: "This dashboard will grow with each feature" },
          ].map((card, i) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-6 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mb-4">
                <div className="w-4 h-4 rounded-sm bg-border/60" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground">
                {card.label}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
