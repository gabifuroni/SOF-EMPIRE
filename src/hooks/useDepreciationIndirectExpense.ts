import { useCallback } from 'react';
import { useIndirectExpenseCategories, useIndirectExpenseValues } from './useIndirectExpenses';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useDepreciationIndirectExpense = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useIndirectExpenseCategories();
  
  const { 
    addExpenseValue, 
    updateExpenseValue, 
    deleteExpenseValue 
  } = useIndirectExpenseValues();

  const DEPRECIATION_CATEGORY_NAME = 'Depreciação Mensal';

  // Verificar se a categoria de depreciação existe
  const depreciationCategory = categories.find(
    cat => cat.nome_categoria_despesa === DEPRECIATION_CATEGORY_NAME
  );

  const addDepreciationToIndirectExpenses = useCallback(async (depreciacaoMensal: number) => {
    try {
      console.log('Adding depreciation to indirect expenses using direct Supabase calls...');
      
      // Usar Supabase diretamente para melhor controle
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let categoryId: string;

      if (depreciationCategory) {
        categoryId = depreciationCategory.id;
        console.log('Using existing category:', categoryId);
      } else {
        // Criar nova categoria
        console.log('Creating new depreciation category...');
        const { data: newCategory, error: categoryError } = await supabase
          .from('despesas_indiretas_categorias')
          .insert({
            nome_categoria_despesa: DEPRECIATION_CATEGORY_NAME,
            user_id: user.id,
            is_predefinida: false,
            is_fixed: true,
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
        console.log('New category created:', categoryId);
      }

      // Criar/atualizar valores para todos os 12 meses do ano atual
      const currentYear = new Date().getFullYear();
      
      for (let month = 1; month <= 12; month++) {
        const mesReferencia = `${currentYear}-${String(month).padStart(2, '0')}-01`;
        
        try {
          // Verificar se já existe um valor para este mês
          const { data: existingValue } = await supabase
            .from('despesas_indiretas_valores')
            .select('id')
            .eq('categoria_id', categoryId)
            .eq('mes_referencia', mesReferencia)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingValue) {
            // Atualizar valor existente
            const { error: updateError } = await supabase
              .from('despesas_indiretas_valores')
              .update({ valor_mensal: depreciacaoMensal })
              .eq('id', existingValue.id);

            if (updateError) {
              console.error(`Error updating month ${month}:`, updateError);
            } else {
              console.log(`Updated month ${month} with value ${depreciacaoMensal}`);
            }
          } else {
            // Criar novo valor
            const { error: insertError } = await supabase
              .from('despesas_indiretas_valores')
              .insert({
                categoria_id: categoryId,
                mes_referencia: mesReferencia,
                valor_mensal: depreciacaoMensal,
                user_id: user.id,
              });

            if (insertError) {
              console.error(`Error inserting month ${month}:`, insertError);
            } else {
              console.log(`Created month ${month} with value ${depreciacaoMensal}`);
            }
          }
        } catch (error) {
          console.error(`Error processing month ${month}:`, error);
        }
      }

      console.log('Finished processing all 12 months');
      
      // Aguardar um pouco antes de invalidar as queries para garantir que os dados foram persistidos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidar queries manualmente
      console.log('Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['indirect-expense-values'] });
      
      // Aguardar mais um pouco para garantir que as queries foram recarregadas
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error adding depreciation to indirect expenses:', error);
      return false;
    }
  }, [depreciationCategory]);

  const removeDepreciationFromIndirectExpenses = useCallback(async () => {
    try {
      if (!depreciationCategory) {
        console.log('No depreciation category to remove');
        return true;
      }

      console.log('Removing depreciation from indirect expenses...');
      
      // Deletar a categoria (isso também deletará todos os valores relacionados)
      await deleteCategory.mutateAsync(depreciationCategory.id);
      
      toast({
        title: "Sucesso!",
        description: "Depreciação removida das despesas indiretas!",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error removing depreciation from indirect expenses:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover depreciação das despesas indiretas.",
        variant: "destructive"
      });
      return false;
    }
  }, [depreciationCategory, deleteCategory, toast]);

  return {
    hasDepreciationCategory: !!depreciationCategory,
    depreciationCategory,
    addDepreciationToIndirectExpenses,
    removeDepreciationFromIndirectExpenses,
  };
};