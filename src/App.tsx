import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import LoginPage from "./pages/Login";
import Index from "./pages/Index";
import ToolsPage from "./pages/Tools";
import ToolDetailPage from "./pages/ToolDetail";
import ProfilePage from "./pages/Profile";
import TransactionsPage from "./pages/Transactions";
import AdminUsersPage from "./pages/admin/Users";
import AdminToolsPage from "./pages/admin/Tools";
import AdminTransactionsPage from "./pages/admin/Transactions";
import AdminMaintenancePage from "./pages/admin/Maintenance";
import WorkLogsPage from "./pages/WorkLogs";
import ChatPage from "./pages/Chat";
import AdminReportsPage from "./pages/admin/Reports";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route index element={<Index />} />
                    <Route path="tools" element={<ToolsPage />} />
                    <Route path="tools/:id" element={<ToolDetailPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="work-logs" element={<WorkLogsPage />} />
                    <Route path="chat" element={<ChatPage />} />

                    {/* Admin Routes */}
                    <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                    <Route path="admin/tools" element={<AdminRoute><AdminToolsPage /></AdminRoute>} />
                    <Route path="admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />
                    <Route path="admin/maintenance" element={<AdminRoute><AdminMaintenancePage /></AdminRoute>} />
                    <Route path="admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
