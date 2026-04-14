import { useQuery } from '@tanstack/react-query';
import { useSupabaseAuth } from './useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const { user, loading } = useSupabaseAuth();

  const { data: isAdmin = false, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) return false;
      return data.role === 'admin';
    },
    enabled: !!user?.id && !loading,
    staleTime: 1000 * 60 * 10,
  });

  return {
    user,
    isAdmin,
    loading: loading || isCheckingAdmin,
  };
};
