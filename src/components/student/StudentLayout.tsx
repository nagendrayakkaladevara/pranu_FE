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
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
