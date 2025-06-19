import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type IndirectExpenseCategory = Tables<'despesas_indiretas_categorias'>;
type IndirectExpenseValue = Tables<'despesas_indiretas_valores'>;

export interface IndirectExpenseWithCategory extends IndirectExpenseValue {
  category_name: string;
}

export const useIndirectExpenseCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['indirect-expense-categories'],
    queryFn: async (): Promise<IndirectExpenseCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_indiretas_categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_categoria_despesa', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const addCategory = useMutation({
    mutationFn: async (categoryName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_indiretas_categorias')
        .insert({
          nome_categoria_despesa: categoryName,
          user_id: user.id,
          is_predefinida: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, categoryName }: { id: string; categoryName: string }) => {
      const { data, error } = await supabase
        .from('despesas_indiretas_categorias')
        .update({ nome_categoria_despesa: categoryName })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas_indiretas_categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-categories'] });
    },
  });

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};

export const useIndirectExpenseValues = () => {
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['indirect-expense-values'],
    queryFn: async (): Promise<IndirectExpenseWithCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_indiretas_valores')
        .select(`
          *,
          despesas_indiretas_categorias!inner(nome_categoria_despesa)
        `)
        .eq('user_id', user.id)
        .order('mes_referencia', { ascending: true });
      
      if (error) throw error;
        return data.map(item => ({
        ...item,
        category_name: (item as unknown as { despesas_indiretas_categorias: { nome_categoria_despesa: string } }).despesas_indiretas_categorias.nome_categoria_despesa,
      }));
    },
  });

  const addExpenseValue = useMutation({
    mutationFn: async ({ 
      categoria_id, 
      mes_referencia, 
      valor_mensal 
    }: {
      categoria_id: string;
      mes_referencia: string;
      valor_mensal: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_indiretas_valores')
        .insert({
          categoria_id,
          mes_referencia,
          valor_mensal,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-values'] });
    },
  });

  const updateExpenseValue = useMutation({
    mutationFn: async ({ 
      id, 
      valor_mensal 
    }: {
      id: string;
      valor_mensal: number;
    }) => {
      const { data, error } = await supabase
        .from('despesas_indiretas_valores')
        .update({ valor_mensal })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-values'] });
    },
  });

  const deleteExpenseValue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas_indiretas_valores')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-values'] });
    },
  });

  const getExpensesByMonth = (month: string) => {
    return expenses.filter(expense => expense.mes_referencia === month);
  };

  const getTotalByMonth = (month: string) => {
    return getExpensesByMonth(month).reduce((total, expense) => total + expense.valor_mensal, 0);
  };

  return {
    expenses,
    isLoading,
    addExpenseValue,
    updateExpenseValue,
    deleteExpenseValue,
    getExpensesByMonth,
    getTotalByMonth,
  };
};
