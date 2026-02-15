import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LecturerSidebar } from "./LecturerSidebar";
import { LecturerHeader } from "./LecturerHeader";

export function LecturerLayout() {
  return (
    <SidebarProvider>
      <LecturerSidebar />
      <SidebarInset>
        <LecturerHeader />
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
