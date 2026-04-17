import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContaControl {
  id: string;
  user_id: string;
  nome: string;
  observacao?: string;
  valor_planejado: number;
  valor_real?: number;
  data_vencimento?: string;
  pago: boolean;
  tipo_despesa: 'indireta' | 'direta';
  categoria_id?: string;
  mes_referencia: string;
  created_at: string;
  updated_at: string;
}

export type ContaControlInsert = Omit<ContaControl, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const useContaControl = (mesReferencia: string) => {
  const queryClient = useQueryClient();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['controle-contas', mesReferencia],
    queryFn: async (): Promise<ContaControl[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('controle_contas' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('mes_referencia', mesReferencia)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('controle_contas table not found, using empty data', error);
        return [];
      }
      return data || [];
    },
  });

  const addConta = useMutation({
    mutationFn: async (conta: ContaControlInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('controle_contas' as any)
        .insert({ ...conta, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controle-contas', mesReferencia] });
    },
  });

  const updateConta = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContaControl> & { id: string }) => {
      const { data, error } = await supabase
        .from('controle_contas' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controle-contas', mesReferencia] });
    },
  });

  const deleteConta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('controle_contas' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controle-contas', mesReferencia] });
    },
  });

  // Marca como pago e sincroniza com Despesas Indiretas/Diretas
  const marcarComoPago = useMutation({
    mutationFn: async ({
      conta,
      valorReal,
      updateExpenseValue,
    }: {
      conta: ContaControl;
      valorReal: number;
      updateExpenseValue?: (categoriaId: string, valor: number) => Promise<void>;
    }) => {
      // 1. Atualiza a conta como paga
      const { error } = await supabase
        .from('controle_contas' as any)
        .update({
          pago: true,
          valor_real: valorReal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conta.id);

      if (error) throw error;

      // 2. Sincroniza com a despesa vinculada se houver categoria
      if (conta.categoria_id && updateExpenseValue) {
        await updateExpenseValue(conta.categoria_id, valorReal);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controle-contas', mesReferencia] });
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-values'] });
      queryClient.invalidateQueries({ queryKey: ['direct-expense-values'] });
    },
  });

  const totalPlanejado = contas.reduce((sum, c) => sum + c.valor_planejado, 0);
  const totalPago = contas.filter(c => c.pago).reduce((sum, c) => sum + (c.valor_real || 0), 0);
  const totalPendente = contas.filter(c => !c.pago).reduce((sum, c) => sum + c.valor_planejado, 0);

  return {
    contas,
    isLoading,
    addConta,
    updateConta,
    deleteConta,
    marcarComoPago,
    totalPlanejado,
    totalPago,
    totalPendente,
  };
};
