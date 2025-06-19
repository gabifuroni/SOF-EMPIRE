import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PaymentMethod = Tables<'config_formas_pagamento'>;
type PaymentMethodInsert = TablesInsert<'config_formas_pagamento'>;
type PaymentMethodUpdate = TablesUpdate<'config_formas_pagamento'>;

export const usePaymentMethods = () => {
  const queryClient = useQueryClient();

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('config_formas_pagamento')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_metodo', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const addPaymentMethod = useMutation({
    mutationFn: async (paymentMethod: Omit<PaymentMethodInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('config_formas_pagamento')
        .insert({
          ...paymentMethod,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
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
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
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
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });

  // Função para calcular a taxa média ponderada
  const calculateWeightedAverageRate = (): number => {
    const activeMethods = paymentMethods.filter(method => method.is_ativo);
    const totalDistribution = activeMethods.reduce((sum, method) => sum + (method.prazo_recebimento_dias || 0), 0);
    
    if (totalDistribution === 0) return 0;
    
    const weightedSum = activeMethods.reduce((sum, method) => 
      sum + (method.taxa_percentual * (method.prazo_recebimento_dias || 0)), 0
    );
    
    return weightedSum / totalDistribution;
  };

  return {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    calculateWeightedAverageRate,
  };
};
