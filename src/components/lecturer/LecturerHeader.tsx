import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationHistory } from "@/components/NotificationHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";

const PAGE_TITLES: Record<string, string> = {
  "/lecturer": "Dashboard",
  "/lecturer/questions": "Question Bank",
  "/lecturer/quizzes": "Quiz Management",
  "/lecturer/analytics": "Analytics",
};

export function LecturerHeader() {
  const { pathname } = useLocation();

  // Handle dynamic routes like /lecturer/quizzes/:id
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/lecturer/quizzes/") ? "Quiz Detail" : "Lecturer");

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
