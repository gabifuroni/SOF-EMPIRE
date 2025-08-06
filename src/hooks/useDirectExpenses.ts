import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface DirectExpenseCategory {
  id: string;
  user_id: string;
  nome_categoria: string;
  is_predefinida: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectExpenseValue {
  id: string;
  user_id: string;
  categoria_id: string;
  valor_mensal: number;
  mes_referencia: string;
  created_at: string;
  updated_at: string;
}

export interface DirectExpenseWithCategory extends DirectExpenseValue {
  category_name: string;
}

export const useDirectExpenseCategories = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['direct-expense-categories', user?.id],
    queryFn: async (): Promise<DirectExpenseCategory[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('despesas_diretas_categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_categoria');

      if (error) {
        console.error('Error fetching direct expense categories:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const addCategory = useMutation({
    mutationFn: async (categoryName: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_diretas_categorias')
        .insert({
          user_id: user.id,
          nome_categoria: categoryName,
          is_predefinida: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-expense-categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, categoryName }: { id: string; categoryName: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_diretas_categorias')
        .update({ nome_categoria: categoryName })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-expense-categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('despesas_diretas_categorias')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['direct-expense-values'] });
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

export const useDirectExpenseValues = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['direct-expense-values', user?.id],
    queryFn: async (): Promise<DirectExpenseWithCategory[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('despesas_diretas_valores')
        .select(`
          *,
          despesas_diretas_categorias!inner(nome_categoria)
        `)
        .eq('user_id', user.id)
        .order('mes_referencia', { ascending: false });

      if (error) {
        console.error('Error fetching direct expense values:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        category_name: item.despesas_diretas_categorias?.nome_categoria || 'Categoria desconhecida'
      }));
    },
    enabled: !!user?.id,
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
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_diretas_valores')
        .insert({
          user_id: user.id,
          categoria_id,
          mes_referencia,
          valor_mensal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-expense-values'] });
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
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_diretas_valores')
        .update({ valor_mensal })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-expense-values'] });
    },
  });

  const upsertExpenseValue = useMutation({
    mutationFn: async ({ 
      categoria_id, 
      mes_referencia, 
      valor_mensal 
    }: {
      categoria_id: string;
      mes_referencia: string;
      valor_mensal: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_diretas_valores')
        .upsert({
          user_id: user.id,
          categoria_id,
          mes_referencia,
          valor_mensal,
        }, {
          onConflict: 'user_id,categoria_id,mes_referencia'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-expense-values'] });
    },
  });

  const deleteExpenseValue = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('despesas_diretas_valores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct-expense-values'] });
    },
  });

  const getExpensesByMonth = (month: string) => {
    return expenses.filter(expense => expense.mes_referencia === month);
  };

  const getTotalByMonth = (month: string) => {
    return getExpensesByMonth(month).reduce((total, expense) => total + expense.valor_mensal, 0);
  };

  const getTotalByMonthAndYear = (month: number, year: number) => {
    const dateString = `${year}-${month.toString().padStart(2, '0')}-01`;
    return expenses
      .filter(expense => expense.mes_referencia === dateString)
      .reduce((total, expense) => total + expense.valor_mensal, 0);
  };

  return {
    expenses,
    isLoading,
    addExpenseValue,
    updateExpenseValue,
    upsertExpenseValue,
    deleteExpenseValue,
    getExpensesByMonth,
    getTotalByMonth,
    getTotalByMonthAndYear,
  };
};
