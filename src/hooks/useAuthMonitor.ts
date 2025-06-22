import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

export const useAuthMonitor = () => {
  const [isTokenExpiring, setIsTokenExpiring] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;    const checkTokenExpiry = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          handleLogout();
          return;
        }

        if (!session?.access_token) {
          handleLogout();
          return;
        }

        // Decode JWT to get expiration time
        const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // If token is already expired
        if (timeUntilExpiry <= 0) {
          handleLogout();
          return;
        }

        // Try to refresh token 5 minutes before expiry
        const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes in milliseconds
        
        if (refreshTime > 0) {
          timeoutId = setTimeout(async () => {
            try {
              const { data, error } = await supabase.auth.refreshSession();
              if (error) {
                console.error('Error refreshing session:', error);
                handleLogout();
              } else if (data.session) {
                console.log('Session refreshed successfully');
                // Restart the monitoring with the new session
                checkTokenExpiry();
              }
            } catch (error) {
              console.error('Error during token refresh:', error);
              handleLogout();
            }
          }, refreshTime);
        }

        // Show warning 2 minutes before expiry
        const warningTime = timeUntilExpiry - (2 * 60 * 1000); // 2 minutes in milliseconds
        
        if (warningTime > 0) {
          warningTimeoutId = setTimeout(() => {
            setIsTokenExpiring(true);
            toast.warning(
              'Sua sessão expirará em 2 minutos. Por favor, salve seu trabalho.',
              {
                duration: 10000,
                position: 'top-center'
              }
            );
          }, warningTime);
        } else {
          // If we're already in the warning period
          setIsTokenExpiring(true);
        }

        // Set final timeout for automatic logout when token expires
        const logoutTimeoutId = setTimeout(() => {
          handleLogout();
        }, timeUntilExpiry);

        // Store the logout timeout separately so we can clear it if token gets refreshed
        return logoutTimeoutId;

      } catch (error) {
        console.error('Error checking token expiry:', error);
        handleLogout();
      }
    };

    const handleLogout = async () => {
      setIsTokenExpiring(false);
      
      toast.error(
        'Sua sessão expirou. Você será redirecionado para a página de login.',
        {
          duration: 5000,
          position: 'top-center'
        }
      );

      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }

      // Redirect to login after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    };

    const handleAuthStateChange = (event: string, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        setIsTokenExpiring(false);
        checkTokenExpiry();
      } else if (event === 'SIGNED_OUT') {
        setIsTokenExpiring(false);
        clearTimeout(timeoutId);
        clearTimeout(warningTimeoutId);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setIsTokenExpiring(false);
        clearTimeout(timeoutId);
        clearTimeout(warningTimeoutId);
        checkTokenExpiry();
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial check
    checkTokenExpiry();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { isTokenExpiring };
};
