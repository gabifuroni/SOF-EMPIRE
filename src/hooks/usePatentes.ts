
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Patente = Tables<'patentes'>;

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

  const getCurrentPatente = (revenue: number): Patente | null => {
    if (!patentes.length) return null;
    
    const sortedPatentes = [...patentes].sort((a, b) => 
      b.faturamento_minimo_necessario - a.faturamento_minimo_necessario
    );
    
    return sortedPatentes.find(p => revenue >= p.faturamento_minimo_necessario) || patentes[0];
  };

  const getNextPatente = (revenue: number): Patente | null => {
    if (!patentes.length) return null;
    
    const sortedPatentes = [...patentes].sort((a, b) => 
      a.faturamento_minimo_necessario - b.faturamento_minimo_necessario
    );
    
    return sortedPatentes.find(p => revenue < p.faturamento_minimo_necessario) || null;
  };

  return {
    patentes,
    isLoading,
    getCurrentPatente,
    getNextPatente,
  };
};
