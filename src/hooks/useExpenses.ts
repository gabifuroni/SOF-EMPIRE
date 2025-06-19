import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Representa uma categoria de despesa direta
type ExpenseCategory = Tables<'categorias_despesas'>;

// Como não temos uma tabela de despesas diretas ainda, vamos criar um tipo temporário
// que armazena as despesas como dados JSON em uma estrutura simples
export interface DirectExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  monthlyAmount: number;
}

export const useExpenseCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async (): Promise<ExpenseCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categorias_despesas')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_categoria', { ascending: true });
      
      if (error) throw error;
      return data;
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
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias_despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
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

// Por enquanto, vamos usar uma implementação local para as despesas diretas
// até decidirmos se vamos criar uma nova tabela ou usar uma abordagem diferente
export const useDirectExpenses = () => {
  // Como não temos uma tabela específica ainda, vamos usar localStorage como fallback
  // Em um cenário ideal, isso seria substituído por uma tabela no Supabase
  
  const getExpensesFromStorage = (): DirectExpense[] => {
    const stored = localStorage.getItem('direct-expenses');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  };

  const saveExpensesToStorage = (expenses: DirectExpense[]) => {
    localStorage.setItem('direct-expenses', JSON.stringify(expenses));
  };

  // Implementação simples usando estado local
  // Em produção, isso deveria ser conectado ao Supabase
  const addExpense = (expense: Omit<DirectExpense, 'id'>) => {
    const expenses = getExpensesFromStorage();
    const newExpense: DirectExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    expenses.push(newExpense);
    saveExpensesToStorage(expenses);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<DirectExpense>) => {
    const expenses = getExpensesFromStorage();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates };
      saveExpensesToStorage(expenses);
    }
  };

  const deleteExpense = (id: string) => {
    const expenses = getExpensesFromStorage();
    const filtered = expenses.filter(e => e.id !== id);
    saveExpensesToStorage(filtered);
  };

  const getExpenses = (): DirectExpense[] => {
    return getExpensesFromStorage();
  };

  return {
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenses,
  };
};
