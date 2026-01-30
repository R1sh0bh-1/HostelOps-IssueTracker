import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { ThemeProvider } from "next-themes";
import ReportIssue from "./pages/ReportIssue";
import MyIssues from "./pages/MyIssues";
import Profile from "./pages/Profile";
import ManagementDashboard from "./pages/management/ManagementDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import LostFound from "./pages/LostFound";
import { StudentFeedbackPanel } from "./pages/StudentFeedbackPanel";
import { AdminFeedbackAnalytics } from "./pages/AdminFeedbackAnalytics";
import { SocketProvider } from "@/context/SocketContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationListener } from "@/components/NotificationListener";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SocketProvider>
        <AuthProvider>
          <NotificationProvider>
            <NotificationListener />
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  {/* Default route - redirects based on role */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRedirect />
                      </ProtectedRoute>
                    }
                  />
                  {/* Student Dashboard - only for students */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report"
                    element={
                      <ProtectedRoute>
                        <ReportIssue />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-issues"
                    element={
                      <ProtectedRoute>
                        <MyIssues />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lostfound"
                    element={
                      <ProtectedRoute>
                        <LostFound />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/management"
                    element={
                      <ProtectedRoute>
                        <ManagementDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/feedback"
                    element={
                      <ProtectedRoute>
                        <StudentFeedbackPanel />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/feedback/analytics"
                    element={
                      <ProtectedRoute>
                        <AdminFeedbackAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </SocketProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
