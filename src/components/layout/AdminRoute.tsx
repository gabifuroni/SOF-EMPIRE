
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen symbol-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-symbol-gold/30 border-t-symbol-gold rounded-full animate-spin mx-auto"></div>
          <p className="font-playfair text-symbol-gray-700">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
