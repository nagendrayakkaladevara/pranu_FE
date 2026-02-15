import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDashboardPath } from "@/lib/routing";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const loggedInUser = await login({ email, password });
      navigate(getRoleDashboardPath(loggedInUser.role), { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      setError(message);
    }
  }

  return (
    <div className="noise-overlay relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[460px] px-6">
        {/* Logo + Brand */}
        <div className="text-center mb-10 animate-fade-up mt-[3rem]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 glow-teal">
            <svg
              width="28"
              height="28"
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
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            ECQES
          </h1>
          <p className="mt-2 text-muted-foreground text-sm font-body">
            Engineering College Quiz Examination System
          </p>
        </div>

        {/* Login Card */}
        <div
          className="animated-border p-8 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@ecqes.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/50 border-border/60 placeholder:text-muted-foreground/40 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-background/50 border-border/60 placeholder:text-muted-foreground/40 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all duration-200"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground font-display font-semibold text-sm tracking-wide hover:brightness-110 transition-all duration-200 glow-teal"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Reset it here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div
          className="mt-6 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="rounded-xl border border-border bg-card backdrop-blur-sm p-4">
            <p className="text-xs font-display font-medium text-muted-foreground mb-3 uppercase tracking-widest">
              Demo Accounts
            </p>
            <div className="space-y-2">
              {[
                { role: "Admin", email: "admin@ecqes.edu", pw: "admin123" },
                { role: "Lecturer", email: "lecturer@ecqes.edu", pw: "lecturer123" },
                { role: "Student", email: "student@ecqes.edu", pw: "student123" },
              ].map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => {
                    setEmail(demo.email);
                    setPassword(demo.pw);
                    setError("");
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-200 group"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-[10px] font-display font-bold">
                      {demo.role[0]}
                    </span>
                    <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                      {demo.role}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground/60 font-mono">
                    {demo.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-[11px] text-muted-foreground/40 mt-8 font-body animate-fade-up"
          style={{ animationDelay: "0.45s" }}
        >
          &copy; 2026 ECQES. Secure examination platform.
        </p>
      </div>
    </div>
  );
}
