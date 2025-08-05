import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import InboxPage from "./pages/inbox";
import ConversationPage from "./pages/conversation";
import TemplatesPage from "./pages/templates";
import PropertiesPage from "./pages/properties";
import TenantsPage from "./pages/tenants";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<InboxPage />} />
            <Route path="/conversation/:id" element={<ConversationPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/tenants/:id" element={<TenantsPage />} />
            <Route path="/settings" element={<div className="p-8 text-center text-muted-foreground">Settings page coming soon...</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
