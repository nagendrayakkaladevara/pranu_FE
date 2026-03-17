import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationHistory } from "@/components/NotificationHistory";
import { UserMenu } from "@/components/UserMenu";
import vishnuLogo from "@/assets/vishnulogo.png";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "User Management",
  "/admin/classes": "Class Management",
};

export function AdminHeader() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Admin";

  return (
    <header className="border-b border-border bg-card backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-14 min-h-[3.5rem]">
        <SidebarTrigger className="-ml-1 size-9 sm:size-7 touch-manipulation shrink-0" />
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <img
          src={vishnuLogo}
          alt="Vishnu Engineering College"
          className="h-7 sm:h-8 w-auto shrink-0"
        />

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
