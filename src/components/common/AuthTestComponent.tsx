import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// This component is for testing JWT expiration functionality
// Should be removed in production
const AuthTestComponent = () => {
  const forceTokenExpiry = async () => {
    try {
      // Sign out to simulate token expiry
      await supabase.auth.signOut();
      toast.info('Simulando expiração de token...', {
        duration: 2000,
        position: 'top-center'
      });
    } catch (error) {
      console.error('Error forcing token expiry:', error);
    }
  };

  const checkCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        return;
      }

      if (session?.access_token) {
        const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]));
        const expirationTime = new Date(tokenPayload.exp * 1000);
        const currentTime = new Date();
        const timeUntilExpiry = expirationTime.getTime() - currentTime.getTime();
        
        toast.info(
          `Token expira em: ${Math.round(timeUntilExpiry / 1000 / 60)} minutos`,
          {
            duration: 5000,
            position: 'top-center'
          }
        );
      } else {
        toast.warning('Nenhuma sessão ativa encontrada');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      toast.error('Erro ao verificar sessão');
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <Button
        onClick={checkCurrentSession}
        variant="outline"
        size="sm"
        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        Verificar Token
      </Button>
      <Button
        onClick={forceTokenExpiry}
        variant="outline"
        size="sm"
        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
      >
        Simular Expiração
      </Button>
    </div>
  );
};

export default AuthTestComponent;
