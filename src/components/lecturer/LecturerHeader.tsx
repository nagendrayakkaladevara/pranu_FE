import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationHistory } from "@/components/NotificationHistory";
import { UserMenu } from "@/components/UserMenu";
import vishnuLogo from "@/assets/vishnulogo.png";

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
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-14 min-h-[3.5rem]">
        <SidebarTrigger className="-ml-1 size-9 sm:size-7 touch-manipulation shrink-0" />
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <span className="inline-flex shrink-0 p-1.5 dark:bg-white">
          <img
            src={vishnuLogo}
            alt="Vishnu Engineering College"
            className="h-7 sm:h-8 w-auto"
          />
        </span>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          <h1 className="font-display font-semibold text-sm truncate hidden sm:block">
            {title}
          </h1>
          <NotificationHistory />
          <UserMenu mobileOnly={false} />
        </div>
      </div>
    </header>
  );
}
