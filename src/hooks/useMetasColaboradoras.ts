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

      if (error) {
        console.warn('metas_colaboradoras query error:', error);
        return [];
      }
      return (data as MetaColaboradora[]) || [];
    },
  });

  const upsertAllMetas = useMutation({
    mutationFn: async (allMetas: MetaColaboradora[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing records for this user+month, then insert fresh ones
      const { error: deleteError } = await supabase
        .from('metas_colaboradoras' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('mes_referencia', mesReferencia);

      if (deleteError) {
        console.error('delete error:', deleteError);
        throw new Error(`Erro ao limpar metas antigas: ${deleteError.message}`);
      }

      const inserts = allMetas
        .filter(m => m.meta_faturamento > 0 || m.meta_atendimentos > 0)
        .map(m => ({
          user_id: user.id,
          colaboradora_id: m.colaboradora_id,
          colaboradora_nome: m.colaboradora_nome,
          mes_referencia: mesReferencia,
          meta_faturamento: m.meta_faturamento,
          meta_atendimentos: m.meta_atendimentos,
        }));

      if (inserts.length === 0) return; // nada para inserir

      const { error: insertError } = await supabase
        .from('metas_colaboradoras' as any)
        .insert(inserts);

      if (insertError) {
        console.error('insert error:', insertError);
        throw new Error(`Erro ao salvar metas: ${insertError.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-colaboradoras', mesReferencia] });
    },
  });

  return { metas, isLoading, upsertAllMetas };
};
