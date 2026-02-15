import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="noise-overlay relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[460px] px-6">
        {/* Logo + Brand */}
        <div className="text-center mb-10 animate-fade-up">
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

        {/* Card */}
        <div
          className="animated-border p-8 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Forgot Password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5">
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
                  <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  <path d="m16 19 2 2 4-4" />
                </svg>
                If an account exists for <strong>{email}</strong>, you'll receive a password reset email shortly.
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
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
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p
          className="text-center text-[11px] text-muted-foreground/40 mt-8 font-body animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          &copy; 2026 ECQES. Secure examination platform.
        </p>
      </div>
    </div>
  );
}
