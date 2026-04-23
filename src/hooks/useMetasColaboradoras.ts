import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MetaColaboradora {
  id?: string;
  colaboradora_id: string;
  colaboradora_nome: string;
  mes_referencia: string;
  meta_faturamento: number;
  meta_atendimentos: number;
}

export const useMetasColaboradoras = (mesReferencia: string) => {
  const queryClient = useQueryClient();

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ['metas-colaboradoras', mesReferencia],
    queryFn: async (): Promise<MetaColaboradora[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('metas_colaboradoras' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('mes_referencia', mesReferencia);

      if (error) { console.warn('metas_colaboradoras error:', error); return []; }
      return data || [];
    },
  });

  const upsertMeta = useMutation({
    mutationFn: async (meta: MetaColaboradora) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('metas_colaboradoras' as any)
        .upsert({
          user_id: user.id,
          colaboradora_id: meta.colaboradora_id,
          colaboradora_nome: meta.colaboradora_nome,
          mes_referencia: mesReferencia,
          meta_faturamento: meta.meta_faturamento,
          meta_atendimentos: meta.meta_atendimentos,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,colaboradora_id,mes_referencia' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-colaboradoras', mesReferencia] });
    },
  });

  const upsertAllMetas = useMutation({
    mutationFn: async (allMetas: MetaColaboradora[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const inserts = allMetas.map(m => ({
        user_id: user.id,
        colaboradora_id: m.colaboradora_id,
        colaboradora_nome: m.colaboradora_nome,
        mes_referencia: mesReferencia,
        meta_faturamento: m.meta_faturamento,
        meta_atendimentos: m.meta_atendimentos,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('metas_colaboradoras' as any)
        .upsert(inserts, { onConflict: 'user_id,colaboradora_id,mes_referencia' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-colaboradoras', mesReferencia] });
    },
  });

  return { metas, isLoading, upsertMeta, upsertAllMetas };
};
