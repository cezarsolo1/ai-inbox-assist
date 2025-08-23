import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 relative">
          {/* Toggle Button - Always visible in top-left */}
          <div className="absolute top-4 left-4 z-50">
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