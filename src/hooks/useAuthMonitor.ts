import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthMonitor = () => {
  const [isTokenExpiring, setIsTokenExpiring] = useState(false);

  useEffect(() => {
    let warningShown = false;

    // Apenas monitora eventos de auth do Supabase — não interfere no refresh automático
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsTokenExpiring(false);
        warningShown = false;
      }

      // Avisa apenas quando o token está realmente prestes a vencer (sem forçar logout)
      if (session?.expires_at && !warningShown) {
        const expiresAt = session.expires_at * 1000;
        const timeUntilExpiry = expiresAt - Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        if (timeUntilExpiry > 0 && timeUntilExpiry < thirtyMinutes) {
          setIsTokenExpiring(true);
          warningShown = true;
          toast.warning('Sua sessão expirará em breve. Salve seu trabalho.', {
            duration: 20000,
            position: 'top-center',
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isTokenExpiring };
};
