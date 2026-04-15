import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

const PortalRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <PortalLayout>{children}</PortalLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
