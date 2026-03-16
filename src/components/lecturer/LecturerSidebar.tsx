import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileQuestion,
  ClipboardList,
  Megaphone,
  BarChart3,
  Info,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/lecturer" },
  { label: "Questions", icon: FileQuestion, path: "/lecturer/questions" },
  { label: "Quizzes", icon: ClipboardList, path: "/lecturer/quizzes" },
  { label: "Circulars", icon: Megaphone, path: "/lecturer/circulars" },
  { label: "Analytics", icon: BarChart3, path: "/lecturer/analytics" },
  { label: "About", icon: Info, path: "/lecturer/about" },
];

export function LecturerSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/lecturer") return pathname === "/lecturer";
    return pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
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
          <div>
            <span className="font-display font-bold text-sm tracking-tight">
              VECQES
            </span>
            <p className="text-[10px] text-muted-foreground">Lecturer Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
