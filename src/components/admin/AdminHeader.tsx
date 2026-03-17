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
      <div className="flex items-center gap-3 px-4 h-14">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <img
          src={vishnuLogo}
          alt="Vishnu Engineering College"
          className="h-8 w-auto"
        />

        <div className="ml-auto flex items-center gap-3">
          <h1 className="font-display font-semibold text-sm">{title}</h1>
          <NotificationHistory />
          <UserMenu mobileOnly={false} />
        </div>
      </div>
    </header>
  );
}
