import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { StudentSidebar } from "./StudentSidebar";
import { StudentHeader } from "./StudentHeader";

export function StudentLayout() {
  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset>
        <StudentHeader />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
