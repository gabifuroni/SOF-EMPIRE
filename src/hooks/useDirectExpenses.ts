import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DirectExpenseCategory {
  id: string;
  user_id: string;
  nome_categoria: string;
  is_predefinida: boolean;
  created_at: string;
  updated_at: string;
}

interface DirectExpenseValue {
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

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['direct-expense-categories'],
    queryFn: async (): Promise<DirectExpenseCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categorias_despesas')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_categoria', { ascending: true });
      
      if (error) throw error;
      return data.map(item => ({
        ...item,
        nome_categoria: item.nome_categoria
      }));
    },
  });

  const addCategory = useMutation({
    mutationFn: async (categoryName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categorias_despesas')
        .insert({
          nome_categoria: categoryName,
          user_id: user.id,
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
      const { data, error } = await supabase
        .from('categorias_despesas')
        .update({ nome_categoria: categoryName })
        .eq('id', id)
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
      // Primeiro, deletar todos os valores relacionados à categoria
      const { error: valuesError } = await supabase
        .from('despesas_diretas_valores')
        .delete()
        .eq('categoria_id', id);

      if (valuesError) throw valuesError;

      // Depois, deletar a categoria
      const { error } = await supabase
        .from('categorias_despesas')
        .delete()
        .eq('id', id);

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
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['direct-expense-values'],
    queryFn: async (): Promise<DirectExpenseWithCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('despesas_diretas_valores')
        .select(`
          *,
          categorias_despesas(nome_categoria)
        `)
        .eq('user_id', user.id)
        .order('mes_referencia', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        category_name: item.categorias_despesas?.nome_categoria || 'Unknown',
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
        .from('despesas_diretas_valores')
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
      const { data, error } = await supabase
        .from('despesas_diretas_valores')
        .update({ valor_mensal })
        .eq('id', id)
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
      const { error } = await supabase
        .from('despesas_diretas_valores')
        .delete()
        .eq('id', id);

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
