import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Transaction = Tables<'transacoes_financeiras'>;
type TransactionInsert = TablesInsert<'transacoes_financeiras'>;

interface DateRange {
  start?: string;
  end?: string;
}

export const useTransactions = (dateRange?: DateRange) => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id, dateRange],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (dateRange?.start) query = query.gte('date', dateRange.start);
      if (dateRange?.end) query = query.lte('date', dateRange.end);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<TransactionInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });

  return { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction };
};
