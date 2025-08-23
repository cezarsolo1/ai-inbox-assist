import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Inbox, MessageSquare, Building2, Users, LogOut, Ticket } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Inbox", href: "/", icon: Inbox },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Tenants", href: "/tenants", icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-sidebar border-r border-sidebar-border">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">Smart Inbox</h1>
            <p className="text-xs text-muted-foreground">Property Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/" && location.pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-11 text-sidebar-foreground",
                  isActive && "bg-primary text-primary-foreground shadow-soft"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-3 py-2 bg-muted/30 rounded-md">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="text-sm text-sidebar-foreground truncate">{user?.email}</div>
        </div>
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-accent-foreground h-9"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <div className="text-xs text-muted-foreground text-center">
          Version 1.0.0 MVP
        </div>
      </div>
    </div>
  );
}