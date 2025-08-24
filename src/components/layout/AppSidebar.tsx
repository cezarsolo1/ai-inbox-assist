import { Inbox, MessageSquare, Building2, Users, LogOut, Ticket, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigation = [
  { nameKey: "navigation.inbox", href: "/", icon: Inbox },
  { nameKey: "navigation.tickets", href: "/tickets", icon: Ticket },
  { nameKey: "navigation.statistics", href: "/statistics", icon: BarChart3 },
  { nameKey: "navigation.properties", href: "/properties", icon: Building2 },
  { nameKey: "navigation.tenants", href: "/tenants", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { open } = useSidebar();
  const { t } = useTranslation();

  const isActive = (path: string) => 
    location.pathname === path || 
    (path !== "/" && location.pathname.startsWith(path));

  return (
    <Sidebar className="bg-gradient-sidebar border-r border-sidebar-border">
      {/* Logo/Brand */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          {open && (
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">{t("app.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.mainNavigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.nameKey}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.nameKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        {open && (
          <div className="px-3 py-2 bg-muted/30 rounded-md mx-4 mb-3">
            <div className="text-xs text-muted-foreground">{t("auth.signedInAs")}</div>
            <div className="text-sm text-sidebar-foreground truncate">{user?.email}</div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span>{t("auth.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {open && (
          <div className="text-xs text-muted-foreground text-center px-4 pb-2">
            {t("app.version")}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}