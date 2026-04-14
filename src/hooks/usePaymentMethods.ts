import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PaymentMethod = Tables<'config_formas_pagamento'>;
type PaymentMethodInsert = TablesInsert<'config_formas_pagamento'>;
type PaymentMethodUpdate = TablesUpdate<'config_formas_pagamento'>;

export const usePaymentMethods = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['paymentMethods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('config_formas_pagamento')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_metodo', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return await initializeDefaultPaymentMethods(user.id);
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const initializeDefaultPaymentMethods = async (userId: string) => {
    const defaultMethods = [
      { user_id: userId, nome_metodo: 'Crédito', taxa_percentual: 3.20, percentual_distribuicao: 50.0, prazo_recebimento_dias: 30, is_ativo: true },
      { user_id: userId, nome_metodo: 'Crédito Parcelado', taxa_percentual: 6.34, percentual_distribuicao: 5.0, prazo_recebimento_dias: 30, is_ativo: true },
      { user_id: userId, nome_metodo: 'Débito', taxa_percentual: 1.39, percentual_distribuicao: 15.0, prazo_recebimento_dias: 1, is_ativo: true },
      { user_id: userId, nome_metodo: 'Dinheiro/Pix', taxa_percentual: 0.00, percentual_distribuicao: 30.0, prazo_recebimento_dias: 0, is_ativo: true },
    ];

    const { data, error } = await supabase
      .from('config_formas_pagamento')
      .insert(defaultMethods)
      .select();

    if (error) throw error;
    return data;
  };

  const addPaymentMethod = useMutation({
    mutationFn: async (paymentMethod: Omit<PaymentMethodInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('config_formas_pagamento')
        .insert({ ...paymentMethod, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', user?.id] });
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async ({ id, ...updates }: PaymentMethodUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('config_formas_pagamento')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', user?.id] });
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_formas_pagamento')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', user?.id] });
    },
  });

  const calculateWeightedAverageRate = (): number => {
    const activeMethods = paymentMethods.filter(m => m.is_ativo);
    const totalDistribution = activeMethods.reduce((sum, m) => sum + (m.percentual_distribuicao || 0), 0);
    if (totalDistribution === 0) return 0;
    const weightedSum = activeMethods.reduce((sum, m) => sum + (m.taxa_percentual * (m.percentual_distribuicao || 0)), 0);
    return weightedSum / totalDistribution;
  };

  return {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    calculateWeightedAverageRate,
    initializeDefaultPaymentMethods: () => user?.id ? initializeDefaultPaymentMethods(user.id) : Promise.reject('Not authenticated'),
  };
};
