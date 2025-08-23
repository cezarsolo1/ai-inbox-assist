import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isTicketDetailPage = location.pathname.startsWith('/tickets/') && location.pathname.split('/').length === 3;
  const [showSidebarTrigger, setShowSidebarTrigger] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show trigger when mouse is within 50px of left edge
      const shouldShow = e.clientX <= 50;
      setShowSidebarTrigger(shouldShow);
    };

    // Add a small delay before hiding to prevent flickering
    let timeoutId: NodeJS.Timeout;
    const handleMouseLeave = () => {
      timeoutId = setTimeout(() => setShowSidebarTrigger(false), 100);
    };

    const handleMouseEnter = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 relative">
          {/* Toggle Button - Appears on hover near left edge */}
          <div 
            className={`absolute top-4 z-50 transition-all duration-300 ${
              isTicketDetailPage ? 'left-16' : 'left-4'
            } ${
              showSidebarTrigger 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-2 pointer-events-none'
            }`}
          >
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