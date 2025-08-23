import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isTicketDetailPage = location.pathname.startsWith('/tickets/') && location.pathname.split('/').length === 3;
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 relative">
          {/* Toggle Button - Positioned to avoid conflict with back button on ticket detail pages */}
          <div className={`absolute top-4 z-50 ${isTicketDetailPage ? 'left-16' : 'left-4'}`}>
            <SidebarTrigger
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent"
            />
          </div>
          
          {/* Page Content */}
          <div className="h-screen overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}