import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import InboxPage from "@/pages/inbox";
import InboxSetupPage from "@/pages/inbox-setup";
import ConversationPage from "@/pages/conversation";
import TicketsPage from "@/pages/tickets";
import TicketDetailPage from "@/pages/ticket-detail";
import VendorConfirmationPage from "@/pages/vendor-confirmation";
import PropertiesPage from "@/pages/properties";
import TenantsPage from "@/pages/tenants";
import StatisticsPage from "@/pages/statistics";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <TicketsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/inbox",
    element: (
      <ProtectedRoute>
        <Layout>
          <InboxPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/inbox/setup",
    element: (
      <ProtectedRoute>
        <Layout>
          <InboxSetupPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/conversation/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <ConversationPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/tickets",
    element: (
      <ProtectedRoute>
        <Layout>
          <TicketsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/tickets/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <TicketDetailPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/vendor/:jobId",
    element: <VendorConfirmationPage />
  },
  {
    path: "/properties",
    element: (
      <ProtectedRoute>
        <Layout>
          <PropertiesPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/tenants",
    element: (
      <ProtectedRoute>
        <Layout>
          <TenantsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/tenants/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <TenantsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "/statistics",
    element: (
      <ProtectedRoute>
        <Layout>
          <StatisticsPage />
        </Layout>
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;