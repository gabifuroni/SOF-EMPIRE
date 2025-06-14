
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePatentes = () => {
  const { data: patentes = [], isLoading } = useQuery({
    queryKey: ['patentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patentes')
        .select('*')
        .order('faturamento_minimo_necessario', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return {
    patentes,
    isLoading,
  };
};
