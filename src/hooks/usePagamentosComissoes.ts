import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface PagamentoComissao {
  id: string;
  colaboradora_id: string;
  colaboradora_nome: string;
  mes_referencia: string;
  valor_faturado: number;
  percentual_comissao: number;
  valor_comissao: number;
  status: 'pendente' | 'pago';
  data_pagamento: string | null;
  created_at: string;
}

export const usePagamentosComissoes = (mesReferencia?: string) => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  const { data: pagamentos = [], isLoading } = useQuery({
    queryKey: ['pagamentos-comissoes', user?.id, mesReferencia],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = (supabase as any)
        .from('pagamentos_comissoes')
        .select('*')
        .eq('user_id', user.id)
        .order('colaboradora_nome');
      if (mesReferencia) query = query.eq('mes_referencia', mesReferencia);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PagamentoComissao[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  const upsertPagamento = useMutation({
    mutationFn: async (payload: Omit<PagamentoComissao, 'id' | 'created_at'>) => {
      if (!user?.id) throw new Error('Não autenticado');
      // Try update first, then insert
      const { data: existing } = await (supabase as any)
        .from('pagamentos_comissoes')
        .select('id')
        .eq('user_id', user.id)
        .eq('colaboradora_id', payload.colaboradora_id)
        .eq('mes_referencia', payload.mes_referencia)
        .single();

      if (existing) {
        const { data, error } = await (supabase as any)
          .from('pagamentos_comissoes')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await (supabase as any)
          .from('pagamentos_comissoes')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos-comissoes', user?.id] });
    },
  });

  const marcarComoPago = useMutation({
    mutationFn: async ({ id, data_pagamento }: { id: string; data_pagamento: string }) => {
      const { data, error } = await (supabase as any)
        .from('pagamentos_comissoes')
        .update({ status: 'pago', data_pagamento, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos-comissoes', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  return { pagamentos, isLoading, upsertPagamento, marcarComoPago };
};
