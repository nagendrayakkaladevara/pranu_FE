import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Info,
  Shield,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "hierarchy", label: "Role Hierarchy" },
  { id: "admin-guide", label: "Admin Guide" },
  { id: "lecturer-guide", label: "Lecturer Guide" },
  { id: "student-guide", label: "Student Guide" },
  { id: "features", label: "Features" },
] as const;

export default function AboutPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("overview");

  const isInLayout =
    location.pathname.startsWith("/admin/about") ||
    location.pathname.startsWith("/lecturer/about") ||
    location.pathname.startsWith("/student/about");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const content = (
    <div className="max-w-3xl">
      {/* Jump links - compact horizontal */}
      <nav
        className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-border"
        aria-label="Page sections"
      >
        {SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeSection === id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Overview */}
      <section id="overview" className="scroll-mt-6 mb-12">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/60">
          Overview
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          VECQES digitizes quiz examinations across the college, reducing manual effort for exam creation and evaluation. The system provides detailed performance analytics at class, lecturer, and student levels while ensuring exam integrity, fairness, and scalability.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Digitize", desc: "Paper to digital quizzes" },
            { title: "Automate", desc: "Instant MCQ grading" },
            { title: "Analyze", desc: "Performance insights" },
            { title: "Scale", desc: "Concurrent attempts" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-card/50 px-4 py-3"
            >
              <h3 className="font-display font-semibold text-foreground text-sm">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Hierarchy */}
      <section id="hierarchy" className="scroll-mt-6 mb-12">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/60">
          Role Hierarchy
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <RoleCard role="Admin" desc="System & user management" level={1} />
          <ChevronRight className="size-5 text-muted-foreground hidden sm:block" />
          <div className="flex flex-col sm:flex-row gap-3">
            <RoleCard role="Lecturer" desc="Quizzes & question banks" level={2} />
            <RoleCard role="Student" desc="Attempt quizzes & results" level={2} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Admins manage lecturers and students. Lecturers create quizzes for assigned classes. Students attempt quizzes published to their class.
        </p>
      </section>

      {/* Admin Guide */}
      <section id="admin-guide" className="scroll-mt-6 mb-12">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/60 flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          Admin Guide
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card/50 p-4 border-l-4 border-l-primary/50">
            <h3 className="font-display font-medium text-foreground text-sm mb-2">
              What Admins Can Do
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Create, edit, activate, deactivate Lecturers and Students</li>
              <li>• Bulk upload students via CSV</li>
              <li>• Create classes (e.g., CSE-3A, ECE-2B)</li>
              <li>• Assign students and lecturers to classes</li>
              <li>• View organization-wide analytics</li>
            </ul>
          </div>
          <StepList
            title="How to Get Started"
            steps={[
              "Log in with admin credentials",
              "Go to Users to add lecturers and students (or bulk upload via CSV)",
              "Create classes and assign students and lecturers",
              "Use Overview for analytics",
            ]}
          />
        </div>
      </section>

      {/* Lecturer Guide */}
      <section id="lecturer-guide" className="scroll-mt-6 mb-12">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/60 flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          Lecturer Guide
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card/50 p-4 border-l-4 border-l-primary/50">
            <h3 className="font-display font-medium text-foreground text-sm mb-2">
              What Lecturers Can Do
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Create question banks with MCQs (Easy / Medium / Hard)</li>
              <li>• Create quizzes from question banks</li>
              <li>• Configure duration, marks, negative marking, shuffle</li>
              <li>• Schedule and publish quizzes to assigned classes</li>
              <li>• View per-quiz, per-class, per-student analytics</li>
            </ul>
          </div>
          <StepList
            title="How to Create & Publish a Quiz"
            steps={[
              "Go to Questions and add MCQs (or bulk import)",
              "Go to Quizzes and create a new quiz",
              "Add questions, set duration, marks, pass criteria",
              "Schedule the quiz (start and end time)",
              "Publish to assigned classes",
              "Monitor attempts and view Analytics",
            ]}
          />
        </div>
      </section>

      {/* Student Guide */}
      <section id="student-guide" className="scroll-mt-6 mb-12">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/60 flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          Student Guide
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card/50 p-4 border-l-4 border-l-primary/50">
            <h3 className="font-display font-medium text-foreground text-sm mb-2">
              What Students Can Do
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• View assigned quizzes on the dashboard</li>
              <li>• Attempt quizzes within the scheduled time window</li>
              <li>• Submit manually or auto-submit when time expires</li>
              <li>• View scores and correct/incorrect answers (if enabled)</li>
              <li>• Track personal performance history</li>
            </ul>
          </div>
          <StepList
            title="How to Attempt a Quiz"
            steps={[
              "Log in and check My Quizzes for available assignments",
              "Click Start (ensure you're within the scheduled window)",
              "Answer each question; use navigation to move between questions",
              "Submit when done or wait for auto-submit",
              "View your score and results under Results",
            ]}
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-6 mb-12">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border/60 flex items-center gap-2">
          <Target className="size-5 text-primary" />
          Key Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { title: "Auth & RBAC", items: ["Role-based login", "Password reset"] },
            { title: "User Management", items: ["CRUD", "Bulk CSV upload"] },
            { title: "Class Management", items: ["Create classes", "Assign users"] },
            { title: "Question Banks", items: ["MCQs", "Difficulty levels"] },
            { title: "Quiz Management", items: ["Create & schedule", "Publish"] },
            { title: "Evaluation", items: ["Auto grading", "Results"] },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card/50 p-4"
            >
              <h3 className="font-display font-medium text-foreground text-sm mb-2">
                {f.title}
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                {f.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          MVP: MCQ-only quizzes with automatic evaluation. Proctoring and mobile app planned for future releases.
        </p>
      </section>

      {/* Footer CTA - only when standalone */}
      {!isInLayout && (
        <footer className="pt-6 border-t border-border">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <h3 className="font-display font-semibold text-foreground mb-1">
              Ready to get started?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to access your role-specific dashboard.
            </p>
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </footer>
      )}
    </div>
  );

  if (isInLayout) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            User Guide
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            About VECQES
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Application overview and how-to guides for each role
          </p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link to="/login">
            <ArrowLeft className="size-4 mr-2" />
            Back to Login
          </Link>
        </Button>

        <header className="mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Info className="size-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            About VECQES
          </h1>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Vishnu Engineering College Quiz Examination System — a centralized platform for quiz-based examinations with role-based access, automatic evaluation, and performance analytics.
          </p>
        </header>

        {content}

        <p className="text-center text-xs text-muted-foreground/60 mt-12">
          &copy; 2026 VECQES. Secure examination platform.
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  role,
  desc,
  level,
}: {
  role: string;
  desc: string;
  level: number;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 min-w-[140px] text-center ${
        level === 1
          ? "border-primary bg-primary/10"
          : "border-border bg-card/50"
      }`}
    >
      <div
        className={`inline-flex items-center justify-center w-8 h-8 rounded-md mb-2 ${
          level === 1 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {level === 1 ? (
          <Shield className="size-4" />
        ) : role === "Lecturer" ? (
          <GraduationCap className="size-4" />
        ) : (
          <BookOpen className="size-4" />
        )}
      </div>
      <h3 className="font-display font-semibold text-foreground text-sm">
        {role}
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function StepList({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h3 className="font-display font-medium text-foreground text-sm mb-2">
        {title}
      </h3>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-muted-foreground">
            <span className="inline-flex shrink-0 w-5 h-5 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-display font-semibold">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
