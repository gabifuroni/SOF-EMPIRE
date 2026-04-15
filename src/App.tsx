import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BusinessParamsProvider } from "@/contexts/BusinessParamsContext";
import AuthWrapper from "@/components/common/AuthWrapper";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Services from "./pages/Services";
import Materials from "./pages/Materials";
import CashFlow from "./pages/CashFlow";
import DailyCashFlow from "./pages/DailyCashFlow";
import IndirectExpenses from "./pages/IndirectExpenses";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import PaymentSettings from "./pages/PaymentSettings";
import Index from "./pages/Index";
import AdminRoute from "./components/layout/AdminRoute";
import AdminRedirect from "./components/layout/AdminRedirect";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading, signOut } = useSupabaseAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  if (loading || adminLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #2a2a38', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#9090a8', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Carregando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const appUser = {
    id: user.id,
    name: user.user_metadata?.nome_profissional_ou_salao || user.email?.split('@')[0] || 'Usuário',
    email: user.email || '',
    role: isAdmin ? 'admin' as const : 'professional' as const,
    status: 'active' as const,
    createdAt: new Date(user.created_at),
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <BusinessParamsProvider>
      <BrowserRouter>
        <AuthWrapper>
          <Routes>
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            <Route path="/*" element={
              <AdminRedirect>
                {/* Full dark layout */}
                <div style={{ minHeight: '100vh', display: 'flex', width: '100%', background: '#0f0f17' }}>
                  <Sidebar
                    userRole={appUser.role}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onCloseMobileMenu={handleCloseMobileMenu}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0f0f17' }}>
                    <Header
                      user={appUser}
                      onLogout={handleLogout}
                      onToggleMobileMenu={handleToggleMobileMenu}
                    />
                    <main style={{ flex: 1, overflowY: 'auto', background: '#0f0f17' }}>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/daily-cash-flow" element={<DailyCashFlow />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/materials" element={<Materials />} />
                        <Route path="/cash-flow" element={<CashFlow />} />
                        <Route path="/expenses" element={<IndirectExpenses />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/payment-settings" element={<PaymentSettings />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </AdminRedirect>
            } />
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </BusinessParamsProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
