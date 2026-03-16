import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationHistory } from "@/components/NotificationHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";

const PAGE_TITLES: Record<string, string> = {
  "/student": "Dashboard",
  "/student/quizzes": "My Quizzes",
  "/student/results": "Results",
};

export function StudentHeader() {
  const { pathname } = useLocation();
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.includes("/attempt") ? "Quiz Attempt" : "Student");

  return (
    <header className="border-b border-border bg-card backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3 px-4 h-14">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="font-display font-semibold text-sm">{title}</h1>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <NotificationHistory />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
