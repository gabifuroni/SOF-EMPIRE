import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface UserGoals {
  id?: string;
  tipoMeta: 'financeira' | 'atendimentos';
  valorMetaMensal: number;
  metaAtendimentosMensal?: number;
}

export const useUserGoals = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['user-goals', user?.id],
    queryFn: async (): Promise<UserGoals | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('metas_usuario')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        id: data.id,
        tipoMeta: data.tipo_meta as 'financeira' | 'atendimentos',
        valorMetaMensal: Number(data.valor_meta_mensal),
        metaAtendimentosMensal: data.meta_atendimentos_mensal || undefined,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const saveGoals = useMutation({
    mutationFn: async (newGoals: Omit<UserGoals, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const goalData = {
        user_id: user.id,
        tipo_meta: newGoals.tipoMeta,
        valor_meta_mensal: newGoals.valorMetaMensal,
        meta_atendimentos_mensal: newGoals.metaAtendimentosMensal || null,
      };

      // Upsert direto — evita a lógica manual de update/insert que pode falhar
      const { data, error } = await supabase
        .from('metas_usuario')
        .upsert(goalData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals', user?.id] });
    },
  });

  return { goals, isLoading, saveGoals };
};
