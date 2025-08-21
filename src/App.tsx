import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import InboxPage from "./pages/inbox";
import InboxSetupPage from "./pages/inbox-setup";
import ConversationPage from "./pages/conversation";
import TemplatesPage from "./pages/templates";
import PropertiesPage from "./pages/properties";
import TenantsPage from "./pages/tenants";
import RACIMatrixPage from "./pages/raci-matrix";
import AuthPage from "./pages/auth";
import NotFound from "./pages/NotFound";
import TenantWelcome from "./pages/tenant-welcome";
import TenantFileTicket from "./pages/tenant-file-ticket";
import UserManagementPage from "./pages/user-management";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Tenant Routes */}
            <Route path="/tenant" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['tenant']} redirectTo="/auth">
                  <TenantWelcome />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/tenant/file-ticket" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['tenant']} redirectTo="/auth">
                  <TenantFileTicket />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <InboxPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/inbox" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <InboxPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/inbox/setup" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <InboxSetupPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/conversation/:id" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <ConversationPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <TemplatesPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/properties" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <PropertiesPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/tenants" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <TenantsPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/tenants/:id" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <TenantsPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/raci-matrix" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <RACIMatrixPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <div className="p-8 text-center text-muted-foreground">Settings page coming soon...</div>
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']} redirectTo="/tenant">
                  <Layout>
                    <UserManagementPage />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
