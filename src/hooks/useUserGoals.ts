import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserGoals {
  id?: string;
  tipoMeta: 'financeira' | 'atendimentos';
  valorMetaMensal: number;
  metaAtendimentosMensal?: number;
}

export const useUserGoals = () => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['user-goals'],
    queryFn: async (): Promise<UserGoals | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('metas_usuario')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      if (!data) return null;

      return {
        id: data.id,
        tipoMeta: data.tipo_meta as 'financeira' | 'atendimentos',
        valorMetaMensal: Number(data.valor_meta_mensal),
        metaAtendimentosMensal: data.meta_atendimentos_mensal || undefined,
      };
    },
  });

  const saveGoals = useMutation({
    mutationFn: async (newGoals: Omit<UserGoals, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('metas_usuario')
        .upsert({
          user_id: user.id,
          tipo_meta: newGoals.tipoMeta,
          valor_meta_mensal: newGoals.valorMetaMensal,
          meta_atendimentos_mensal: newGoals.metaAtendimentosMensal || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
    },
  });

  return {
    goals,
    isLoading,
    saveGoals,
  };
};
