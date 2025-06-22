
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
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
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/layout/AdminRoute";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading, signOut } = useSupabaseAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleMobileMenu = () => {
    console.log('Toggling mobile menu:', !isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menu when route changes
  const handleRouteChange = () => {
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen elite-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-elite-champagne-300 border-t-elite-champagne-600 rounded-full animate-spin mx-auto"></div>
          <p className="font-playfair text-elite-charcoal-700">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Convert Supabase user to app user format
  const appUser = {
    id: user.id,
    name: user.user_metadata?.nome_profissional_ou_salao || user.email?.split('@')[0] || 'Usuário',
    email: user.email || '',
    role: 'professional' as const,
    status: 'active' as const,
    createdAt: new Date(user.created_at),
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BusinessParamsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AuthWrapper>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </AuthWrapper>
            } />
            
            {/* Regular User Routes */}
            <Route path="/*" element={
              <AuthWrapper>
                <div className="min-h-screen flex w-full bg-elite-pearl-50">
                  <Sidebar 
                    userRole={appUser.role} 
                    isMobileMenuOpen={isMobileMenuOpen}
                    onCloseMobileMenu={handleCloseMobileMenu}
                  />
                  
                  <div className="flex-1 flex flex-col min-w-0">
                    <Header 
                      user={appUser} 
                      onLogout={handleLogout}
                      onToggleMobileMenu={handleToggleMobileMenu}
                    />
                    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
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
              </AuthWrapper>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </BusinessParamsProvider>
    </QueryClientProvider>
  );
};

export default App;
