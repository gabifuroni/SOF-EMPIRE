import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminRedirectProps {
  children: React.ReactNode;
}

const AdminRedirect = ({ children }: AdminRedirectProps) => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && isAdmin) {
      // Se é admin e não está na rota admin, redirecionar
      if (!window.location.pathname.startsWith('/admin')) {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAdmin, loading, navigate]);

  // Se é admin e não está no painel admin, não renderizar até redirecionar
  if (isAdmin && !window.location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen symbol-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-symbol-gold/30 border-t-symbol-gold rounded-full animate-spin mx-auto"></div>
          <p className="font-playfair text-symbol-gray-700">Redirecionando para painel administrativo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRedirect;
