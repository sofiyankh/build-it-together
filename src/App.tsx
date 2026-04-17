import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/modules/auth";
import { NotificationsProvider } from "@/modules/notifications";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import PortfolioPage from "./pages/PortfolioPage";
import PortalLayout from "./components/portal/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalProjects from "./pages/portal/PortalProjects";
import PortalMessages from "./pages/portal/PortalMessages";
import PortalFiles from "./pages/portal/PortalFiles";
import PortalDeployments from "./pages/portal/PortalDeployments";
import PortalSupport from "./pages/portal/PortalSupport";
import PortalBilling from "./pages/portal/PortalBilling";
import PortalSettings from "./pages/portal/PortalSettings";
import { AdminGuard } from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminClients from "./pages/admin/AdminClients";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuditLog from "./pages/admin/AdminAuditLog";

const queryClient = new QueryClient();

const PortalRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <PortalLayout>{children}</PortalLayout>
  </ProtectedRoute>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <AdminGuard>
    <AdminLayout>{children}</AdminLayout>
  </AdminGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />

            {/* Portal routes */}
            <Route path="/portal" element={<PortalRoute><PortalDashboard /></PortalRoute>} />
            <Route path="/portal/projects" element={<PortalRoute><PortalProjects /></PortalRoute>} />
            <Route path="/portal/messages" element={<PortalRoute><PortalMessages /></PortalRoute>} />
            <Route path="/portal/files" element={<PortalRoute><PortalFiles /></PortalRoute>} />
            <Route path="/portal/deployments" element={<PortalRoute><PortalDeployments /></PortalRoute>} />
            <Route path="/portal/support" element={<PortalRoute><PortalSupport /></PortalRoute>} />
            <Route path="/portal/billing" element={<PortalRoute><PortalBilling /></PortalRoute>} />
            <Route path="/portal/settings" element={<PortalRoute><PortalSettings /></PortalRoute>} />


            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/admin/clients" element={<AdminRoute><AdminClients /></AdminRoute>} />
            <Route path="/admin/projects" element={<AdminRoute><AdminProjects /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
            <Route path="/admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />
            <Route path="/admin/team" element={<AdminRoute><AdminTeam /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/audit" element={<AdminRoute><AdminAuditLog /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
