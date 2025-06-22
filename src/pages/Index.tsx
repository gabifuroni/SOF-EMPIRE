
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSupabaseAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    // Aguardar ambos os loadings terminarem
    if (authLoading || adminLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Redirecionar baseado no role real do usuário
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  return (
    <div className="min-h-screen elite-gradient flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-elite-champagne-300 border-t-elite-champagne-600 rounded-full animate-spin mx-auto"></div>
        <p className="font-playfair text-elite-charcoal-700">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
