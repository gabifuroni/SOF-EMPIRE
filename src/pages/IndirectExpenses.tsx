import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import ExpensesHeader from "@/components/expenses/ExpensesHeader";
import ExpensesSummaryCards from "@/components/expenses/ExpensesSummaryCards";
import IndirectExpensesTable from "@/components/expenses/IndirectExpensesTable";
import DirectExpensesTable from "@/components/expenses/DirectExpensesTable";
import {
  useIndirectExpenseCategories,
  useIndirectExpenseValues,
} from "@/hooks/useIndirectExpenses";
import {
  useDirectExpenseCategories,
  useDirectExpenseValues,
} from "@/hooks/useDirectExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import {
  convertExpenseCategoryFromDb,
  convertMonthlyExpenseFromDb,
} from "@/utils/typeConverters";
import type { ExpenseCategory, MonthlyExpense } from "@/types";

interface DirectExpenseCategory {
  id: string;
  name: string;
  isCustom: boolean;
}

interface DirectExpenseValue {
  categoryId: string;
  value: number;
}

const MONTHS = [
  { key: "january", label: "Janeiro" },
  { key: "february", label: "Fevereiro" },
  { key: "march", label: "Março" },
  { key: "april", label: "Abril" },
  { key: "may", label: "Maio" },
  { key: "june", label: "Junho" },
  { key: "july", label: "Julho" },
  { key: "august", label: "Agosto" },
  { key: "september", label: "Setembro" },
  { key: "october", label: "Outubro" },
  { key: "november", label: "Novembro" },
  { key: "december", label: "Dezembro" },
];

const IndirectExpenses = () => {
  const { user } = useSupabaseAuth();
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return MONTHS[currentMonth].key;  });

  // Indirect expenses hooks
  const {
    categories,
    isLoading: categoriesLoading,
    addCategory,
    updateCategory,
    updateCategoryFixed,
    deleteCategory,
  } = useIndirectExpenseCategories();

  const {
    expenses,
    isLoading: expensesLoading,
    addExpenseValue,
    updateExpenseValue,
    deleteExpenseValue,
    getTotalByMonth,
  } = useIndirectExpenseValues();

  // Direct expenses hooks
  const {
    categories: directCategories,
    isLoading: directCategoriesLoading,
    addCategory: addDirectCategory,
    updateCategory: updateDirectCategory,
    deleteCategory: deleteDirectCategory,
  } = useDirectExpenseCategories();

  const {
    expenses: directExpenses,
    isLoading: directExpensesLoading,
    addExpenseValue: addDirectExpenseValue,
    updateExpenseValue: updateDirectExpenseValue,
    upsertExpenseValue: upsertDirectExpenseValue,
    deleteExpenseValue: deleteDirectExpenseValue,
    getTotalByMonth: getDirectTotalByMonth,
    getTotalByMonthAndYear: getDirectTotalByMonthAndYear,
  } = useDirectExpenseValues();

  // Hook para transações (fluxo de caixa)
  const { addTransaction } = useTransactions();

  // State for indirect expenses
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [tempExpenseValues, setTempExpenseValues] = useState<Record<string, number>>({});

  // State for direct expenses
  const [tempDirectExpenseValues, setTempDirectExpenseValues] = useState<Record<string, number>>({});
  const [newDirectCategoryName, setNewDirectCategoryName] = useState("");
  const [showAddDirectCategory, setShowAddDirectCategory] = useState(false);

  // Convert database categories to expected format
  const convertedCategories: ExpenseCategory[] = categories.map(
    convertExpenseCategoryFromDb
  );

  // Create simple monthly expenses structure from database data
  const convertedExpenses: MonthlyExpense[] = convertedCategories.map(
    (category) => {
      const categoryExpenses = expenses.filter(
        (exp) => exp.categoria_id === category.id
      );
      return convertMonthlyExpenseFromDb(
        categoryExpenses,
        category.id,
        parseInt(selectedYear)
      );
    }
  );

  // Clear temp values when month or year changes
  useEffect(() => {
    setTempExpenseValues({});
    setTempDirectExpenseValues({});
  }, [selectedMonth, selectedYear]);

  // INDIRECT EXPENSES FUNCTIONS
  const getExpenseForCategory = (categoryId: string): MonthlyExpense => {
    return (
      convertedExpenses.find((exp) => exp.categoryId === categoryId) || {
        categoryId,
        year: parseInt(selectedYear),
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
      }
    );
  };

  const updateExpense = (categoryId: string, value: number) => {
    setTempExpenseValues((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };
  const saveExpenseValues = async () => {
    if (!user) {
      console.error('No user found!');
      return;
    }

    try {
      console.log('=== INICIANDO SALVAMENTO DE DESPESAS INDIRETAS ===');
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;

      console.log('Saving indirect expense values for date:', dateString);
      console.log('Temp values to save:', tempExpenseValues);
      console.log('User ID:', user.id);
      console.log('Categories available:', categories);

      const savePromises = Object.entries(tempExpenseValues).map(
        async ([categoryId, value]) => {
          const existingExpense = expenses.find(
            (exp) =>
              exp.categoria_id === categoryId &&
              exp.mes_referencia === dateString
          );

          console.log('Processing category:', categoryId, 'value:', value, 'existing:', existingExpense);

          let result;
          if (existingExpense) {
            result = await updateExpenseValue.mutateAsync({
              id: existingExpense.id,
              valor_mensal: value,
            });
          } else {
            result = await addExpenseValue.mutateAsync({
              categoria_id: categoryId,
              mes_referencia: dateString,
              valor_mensal: value,
            });
          }          // Integração com fluxo de caixa
          const category = categories.find(cat => cat.id === categoryId);
          const isFixed = category?.is_fixed || false;

          // Primeiro, remover TODAS as transações existentes desta categoria
          try {
            const { data: existingTransactions } = await supabase
              .from('transacoes_financeiras')
              .select('id')
              .eq('user_id', user?.id)
              .eq('category', 'Despesas Indiretas')
              .ilike('description', `%Despesa Indireta: ${category?.nome_categoria_despesa || ''}%`);

            if (existingTransactions && existingTransactions.length > 0) {
              await supabase
                .from('transacoes_financeiras')
                .delete()
                .in('id', existingTransactions.map(t => t.id));
              console.log(`Removed ${existingTransactions.length} existing transactions for category ${category?.nome_categoria_despesa}`);
            }
          } catch (error) {
            console.error('Error removing existing indirect expense transactions:', error);
          }

          // Criar novas transações apenas se valor > 0
          console.log(`Checking if should create transactions: value=${value}, isFixed=${isFixed}`);
          if (value > 0) {
            console.log(`Creating transactions for category ${category?.nome_categoria_despesa}`);
            if (isFixed) {
              console.log('Creating 12 fixed transactions...');
              // Se é despesa fixa, criar 12 transações (uma para cada mês)
              const cashFlowPromises = MONTHS.map(async (month, index) => {
                const monthDate = `${selectedYear}-${(index + 1).toString().padStart(2, "0")}-01`;
                console.log(`Creating fixed transaction for month ${monthDate}`);
                try {
                  const result = await addTransaction.mutateAsync({
                    description: `Despesa Indireta: ${category?.nome_categoria_despesa || 'Categoria desconhecida'}`,
                    valor: -value, // Valor negativo para saída
                    tipo_transacao: 'SAIDA' as const,
                    date: monthDate,
                    category: 'Despesas Indiretas',
                    payment_method: null,
                    is_recurring: true,
                    recurring_frequency: 'monthly',
                  });
                  console.log(`Fixed transaction created successfully:`, result);
                  return result;
                } catch (error) {
                  console.error(`Error creating fixed transaction for month ${monthDate}:`, error);
                  throw error;
                }
              });
              await Promise.all(cashFlowPromises);
              console.log(`Created 12 fixed transactions for category ${category?.nome_categoria_despesa} with value ${-value} each`);
            } else {
              console.log('Creating single transaction...');
              // Se não é fixa, criar apenas uma transação no mês selecionado
              try {
                const result = await addTransaction.mutateAsync({
                  description: `Despesa Indireta: ${category?.nome_categoria_despesa || 'Categoria desconhecida'}`,
                  valor: -value, // Valor negativo para saída
                  tipo_transacao: 'SAIDA' as const,
                  date: dateString,
                  category: 'Despesas Indiretas',
                  payment_method: null,
                  is_recurring: false,
                });
                console.log(`Single transaction created successfully:`, result);
              } catch (error) {
                console.error('Error creating single transaction:', error);
                throw error;
              }
              console.log(`Created single transaction for category ${category?.nome_categoria_despesa} with value ${-value}`);
            }
          } else {
            console.log(`No transactions created for category ${category?.nome_categoria_despesa} - value is ${value} (removed/zero)`);
          }

          return result;
        }
      );

      await Promise.all(savePromises);
      setTempExpenseValues({});
      
      // Limpar transações órfãs após salvar
      await cleanOrphanTransactions();
      
      toast.success("Despesas indiretas salvas e integradas ao fluxo de caixa com sucesso!");
    } catch (error) {
      console.error("Error saving indirect expense values:", error);
      toast.error("Erro ao salvar despesas indiretas. Tente novamente.");
    }
  };

  const getTempExpenseValue = (categoryId: string): number => {
    if (tempExpenseValues[categoryId] !== undefined) {
      return tempExpenseValues[categoryId];
    }
    
    // Buscar o valor no banco para o mês e ano selecionados
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    
    const expenseValue = expenses.find(
      (exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString
    );
    return expenseValue?.valor_mensal || 0;
  };
  const toggleFixedExpense = async (categoryId: string, isFixed: boolean) => {
    try {
      // Update the database
      await updateCategoryFixed.mutateAsync({ id: categoryId, isFixed });
      
      // If marking as fixed and there's a current value, apply it to all 12 months
      if (isFixed) {
        const currentValue = getTempExpenseValue(categoryId);
        if (currentValue > 0) {
          // Create entries for all 12 months with the current value
          const savePromises = MONTHS.map(async (month, index) => {
            const monthNumber = index + 1;
            const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
            
            const existingExpense = expenses.find(
              (exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString
            );

            if (existingExpense) {
              return updateExpenseValue.mutateAsync({
                id: existingExpense.id,
                valor_mensal: currentValue,
              });
            } else {
              return addExpenseValue.mutateAsync({
                categoria_id: categoryId,
                mes_referencia: dateString,
                valor_mensal: currentValue,
              });
            }
          });

          await Promise.all(savePromises);
        }
      }
      
      toast.success(
        `Despesa ${isFixed ? "marcada como fixa" : "desmarcada como fixa"}`
      );
    } catch (error) {
      console.error("Error toggling fixed expense:", error);
      toast.error("Erro ao atualizar configuração de despesa fixa");
    }
  };

  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;

    addCategory.mutate(newCategoryName.trim(), {
      onSuccess: () => {
        setNewCategoryName("");
        setShowAddCategory(false);
        toast.success("Nova categoria adicionada com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao adicionar categoria");
      },
    });
  };
  const removeCategory = async (categoryId: string) => {
    if (!user) return;

    try {
      const categoryName = categories.find(cat => cat.id === categoryId)?.nome_categoria_despesa;
      
      // Remove related transactions first
      await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('user_id', user.id)
        .eq('category', 'Despesas Indiretas')
        .ilike('description', `%Despesa Indireta: ${categoryName}%`);

      // Remove the category using the hook
      await deleteCategory.mutateAsync(categoryId);

      toast.success("Categoria removida com sucesso!");
    } catch (error) {
      console.error("Error removing indirect category:", error);
      toast.error("Erro ao remover categoria");
    }
  };

  const editCategory = async (categoryId: string, newName: string) => {
    if (!user) return;

    try {
      const oldName = categories.find(cat => cat.id === categoryId)?.nome_categoria_despesa;
      
      await updateCategory.mutateAsync({ 
        id: categoryId, 
        categoryName: newName 
      });

      // Update related transaction descriptions
      if (oldName && oldName !== newName) {
        try {
          const { data: relatedTransactions } = await supabase
            .from('transacoes_financeiras')
            .select('id')
            .eq('user_id', user.id)
            .eq('category', 'Despesas Indiretas')
            .ilike('description', `%Despesa Indireta: ${oldName}%`);

          if (relatedTransactions && relatedTransactions.length > 0) {
            await supabase
              .from('transacoes_financeiras')
              .update({
                description: `Despesa Indireta: ${newName}`
              })
              .in('id', relatedTransactions.map(t => t.id));
          }
        } catch (error) {
          console.error("Error updating transaction descriptions:", error);
        }
      }
      
      toast.success("Categoria atualizada com sucesso!");
    } catch (error) {
      console.error("Error editing indirect category:", error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  const calculateHasUnsavedChanges = () => {
    return Object.entries(tempExpenseValues).some(([categoryId, tempValue]) => {
      const currentValue = getTempExpenseValue(categoryId);
      // Compare with the actual saved value from database
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
      
      const expenseValue = expenses.find(
        (exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString
      );
      const savedValue = expenseValue?.valor_mensal || 0;
      return tempValue !== savedValue;
    });
  };

  const calculateMonthTotal = () => {
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    
    return convertedCategories.reduce((total, category) => {
      const tempValue = tempExpenseValues[category.id];
      if (tempValue !== undefined) {
        return total + tempValue;
      }

      const expenseValue = expenses.find(
        (exp) => exp.categoria_id === category.id && exp.mes_referencia === dateString
      );
      return total + (expenseValue?.valor_mensal || 0);
    }, 0);
  };
  const calculateYearlyTotal = (categoryId: string) => {
    // Find the category to check if it's fixed
    const category = categories.find(cat => cat.id === categoryId);
    const isFixed = category?.is_fixed || false;
    
    if (isFixed) {
      // For fixed expenses, multiply current month value by 12
      const currentValue = getTempExpenseValue(categoryId);
      return currentValue * 12;
    } else {
      // For variable expenses, sum all saved values
      return expenses
        .filter(exp => exp.categoria_id === categoryId)
        .reduce((total, exp) => total + exp.valor_mensal, 0);
    }
  };

  // DIRECT EXPENSES FUNCTIONS
  const updateDirectExpense = (categoryId: string, value: number) => {
    setTempDirectExpenseValues((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };
  const saveDirectExpenseValues = async () => {
    if (!user) return;

    try {
      console.log('=== INICIANDO SALVAMENTO DE DESPESAS DIRETAS ===');
      console.log('tempDirectExpenseValues:', tempDirectExpenseValues);
      console.log('directCategories:', directCategories);
      
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
      console.log('dateString:', dateString);

      const savePromises = Object.entries(tempDirectExpenseValues).map(
        async ([categoryId, value]) => {
          console.log(`Processing category ${categoryId} with value ${value}`);
          const category = directCategories.find((cat) => cat.id === categoryId);
          if (!category) {
            console.log(`Category ${categoryId} not found!`);
            return;
          }

          console.log(`Found category: ${category.nome_categoria}`);

          // 1. Remover transações existentes para esta categoria e mês
          const deleteResult = await supabase
            .from('transacoes_financeiras')
            .delete()
            .eq('user_id', user.id)
            .eq('category', 'Despesas Diretas')
            .eq('date', dateString)
            .ilike('description', `%Despesa Direta: ${category?.nome_categoria}%`);

          console.log(`Delete result for ${category?.nome_categoria}:`, deleteResult);

          // 2. Upsert do valor da despesa direta
          const result = await upsertDirectExpenseValue.mutateAsync({
            categoria_id: categoryId,
            mes_referencia: dateString,
            valor_mensal: value,
          });

          console.log(`Upsert result for ${category?.nome_categoria}:`, result);

          // 3. Criar nova transação apenas se valor > 0
          if (value > 0) {
            const transactionData = {
              description: `Despesa Direta: ${category?.nome_categoria || 'Categoria desconhecida'}`,
              valor: -value, // Valor negativo para saída (consistente com despesas indiretas)
              tipo_transacao: 'SAIDA' as const,
              date: dateString,
              category: 'Despesas Diretas',
              payment_method: 'Dinheiro',
              is_recurring: false,
            };
            
            console.log(`Creating transaction for ${category?.nome_categoria}:`, transactionData);
            
            const transactionResult = await addTransaction.mutateAsync(transactionData);
            console.log(`Transaction created:`, transactionResult);
          } else {
            console.log(`No transaction created for ${category?.nome_categoria} - value is ${value} (removed/zero)`);
          }

          return result;
        }
      );

      await Promise.all(savePromises);
      setTempDirectExpenseValues({});
      
      // Limpar transações órfãs após salvar
      await cleanOrphanTransactions();
      
      console.log('=== SALVAMENTO CONCLUÍDO ===');
      toast.success("Despesas diretas salvas e integradas ao fluxo de caixa com sucesso!");
    } catch (error) {
      console.error("Error saving direct expense values:", error);
      toast.error("Erro ao salvar despesas diretas. Tente novamente.");
    }
  };

  const addNewDirectCategory = async () => {
    if (!newDirectCategoryName.trim()) return;

    try {
      await addDirectCategory.mutateAsync(newDirectCategoryName.trim());

      setNewDirectCategoryName("");
      setShowAddDirectCategory(false);
      toast.success("Nova categoria de despesa direta adicionada!");
    } catch (error) {
      console.error("Error adding direct category:", error);
      toast.error("Erro ao adicionar categoria de despesa direta");
    }
  };

  const removeDirectCategory = async (categoryId: string) => {
    if (!user) return;

    try {
      const categoryName = directCategories.find(cat => cat.id === categoryId)?.nome_categoria;
      
      // Remove related transactions first
      await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('user_id', user.id)
        .eq('category', 'Despesas Diretas')
        .ilike('description', `%Despesa Direta: ${categoryName}%`);

      // Remove the category using the hook
      await deleteDirectCategory.mutateAsync(categoryId);

      toast.success("Categoria de despesa direta removida com sucesso!");
    } catch (error) {
      console.error("Error removing direct category:", error);
      toast.error("Erro ao remover categoria de despesa direta");
    }
  };

  const editDirectCategory = async (categoryId: string, newName: string) => {
    if (!user) return;

    try {
      const oldName = directCategories.find(cat => cat.id === categoryId)?.nome_categoria;
      
      await updateDirectCategory.mutateAsync({ 
        id: categoryId, 
        categoryName: newName 
      });

      // Update related transaction descriptions
      if (oldName && oldName !== newName) {
        try {
          const { data: relatedTransactions } = await supabase
            .from('transacoes_financeiras')
            .select('id')
            .eq('user_id', user.id)
            .eq('category', 'Despesas Diretas')
            .ilike('description', `%Despesa Direta: ${oldName}%`);

          if (relatedTransactions && relatedTransactions.length > 0) {
            await supabase
              .from('transacoes_financeiras')
              .update({
                description: `Despesa Direta: ${newName}`
              })
              .in('id', relatedTransactions.map(t => t.id));
          }
        } catch (error) {
          console.error("Error updating transaction descriptions:", error);
        }
      }
      
      toast.success("Categoria de despesa direta atualizada com sucesso!");
    } catch (error) {
      console.error("Error editing direct category:", error);
      toast.error("Erro ao atualizar categoria de despesa direta");
    }
  };

  const getTempDirectExpenseValue = (categoryId: string): number => {
    if (tempDirectExpenseValues[categoryId] !== undefined) {
      return tempDirectExpenseValues[categoryId];
    }
    
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    
    const expenseValue = directExpenses.find(
      (exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString
    );
    return expenseValue?.valor_mensal || 0;
  };

  const calculateDirectMonthTotal = () => {
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    
    return directCategories.reduce((total, category) => {
      const tempValue = tempDirectExpenseValues[category.id];
      if (tempValue !== undefined) {
        return total + tempValue;
      }

      const expenseValue = directExpenses.find(
        (exp) => exp.categoria_id === category.id && exp.mes_referencia === dateString
      );
      return total + (expenseValue?.valor_mensal || 0);
    }, 0);
  };

  const calculateHasUnsavedDirectChanges = () => {
    return Object.entries(tempDirectExpenseValues).some(([categoryId, tempValue]) => {
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
      
      const expenseValue = directExpenses.find(
        (exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString
      );
      const savedValue = expenseValue?.valor_mensal || 0;
      return tempValue !== savedValue;
    });
  };

  // Função para limpar transações órfãs (sem despesas correspondentes)
  const cleanOrphanTransactions = async () => {
    if (!user) return;

    try {
      // Buscar todas as transações de despesas
      const { data: allExpenseTransactions } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .in('category', ['Despesas Diretas', 'Despesas Indiretas']);

      if (!allExpenseTransactions) return;

      const transactionsToDelete: string[] = [];

      // Verificar transações de despesas diretas
      const directTransactions = allExpenseTransactions.filter(t => t.category === 'Despesas Diretas');
      for (const transaction of directTransactions) {
        const categoryName = transaction.description?.replace('Despesa Direta: ', '');
        const category = directCategories.find(cat => cat.nome_categoria === categoryName);
        
        if (!category) {
          // Categoria não existe mais
          transactionsToDelete.push(transaction.id);
          continue;
        }

        // Verificar se existe valor para esta categoria e data
        const hasValue = directExpenses.some(exp => 
          exp.categoria_id === category.id && 
          exp.mes_referencia === transaction.date &&
          exp.valor_mensal > 0
        );

        if (!hasValue) {
          transactionsToDelete.push(transaction.id);
        }
      }

      // Verificar transações de despesas indiretas
      const indirectTransactions = allExpenseTransactions.filter(t => t.category === 'Despesas Indiretas');
      for (const transaction of indirectTransactions) {
        const categoryName = transaction.description?.replace('Despesa Indireta: ', '');
        const category = categories.find(cat => cat.nome_categoria_despesa === categoryName);
        
        if (!category) {
          // Categoria não existe mais
          transactionsToDelete.push(transaction.id);
          continue;
        }

        // Verificar se existe valor para esta categoria e data
        const hasValue = expenses.some(exp => 
          exp.categoria_id === category.id && 
          exp.mes_referencia === transaction.date &&
          exp.valor_mensal > 0
        );

        if (!hasValue) {
          transactionsToDelete.push(transaction.id);
        }
      }

      // Deletar transações órfãs
      if (transactionsToDelete.length > 0) {
        await supabase
          .from('transacoes_financeiras')
          .delete()
          .in('id', transactionsToDelete);
        
        console.log(`Cleaned ${transactionsToDelete.length} orphan transactions`);
        toast.success(`${transactionsToDelete.length} transações órfãs foram removidas do fluxo de caixa`);
      }
    } catch (error) {
      console.error('Error cleaning orphan transactions:', error);
    }
  };

  // Calculate summary metrics
  const hasUnsavedChanges = calculateHasUnsavedChanges();
  const hasUnsavedDirectChanges = calculateHasUnsavedDirectChanges();
  const indirectMonthTotal = calculateMonthTotal();
  const directMonthTotal = calculateDirectMonthTotal();
  const totalMonthExpenses = indirectMonthTotal + directMonthTotal;
    // Calculate fixed expenses total based on categories marked as fixed in database
  const fixedExpensesTotal = categories
    .filter((cat) => cat.is_fixed)
    .reduce((sum, cat) => {
      const tempValue = tempExpenseValues[cat.id];
      if (tempValue !== undefined) {
        return sum + tempValue;
      }
      
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
      
      const expenseValue = expenses.find(
        (exp) => exp.categoria_id === cat.id && exp.mes_referencia === dateString
      );
      return sum + (expenseValue?.valor_mensal || 0);
    }, 0);
  
  const variableExpenses = (totalMonthExpenses - fixedExpensesTotal);

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      <ExpensesHeader
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />



      <ExpensesSummaryCards
        totalCategories={convertedCategories.length + directCategories.length}
        monthTotal={totalMonthExpenses}
        fixedExpensesTotal={fixedExpensesTotal}
        variableExpenses={variableExpenses}
        directExpensesTotal={directMonthTotal}
        indirectExpensesTotal={indirectMonthTotal}
      />

      <div className="symbol-card p-2 shadow-lg">
        <Tabs defaultValue="indirect" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="indirect"
              className="bg-symbol-beige text-symbol-black font-medium py-3 px-6 data-[state=active]:bg-symbol-gold data-[state=active]:text-symbol-black data-[state=active]:shadow-none border-none rounded-none text-sm uppercase tracking-wide transition-all duration-300"
            >
              Despesas Indiretas
            </TabsTrigger>
            <TabsTrigger
              value="direct"
              className="bg-symbol-beige text-symbol-black font-medium py-3 px-6 data-[state=active]:bg-symbol-gold data-[state=active]:text-symbol-black data-[state=active]:shadow-none border-none rounded-none text-sm uppercase tracking-wide transition-all duration-300"
            >
              Despesas Diretas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="indirect" className="mt-6">            <IndirectExpensesTable
              categories={convertedCategories}
              expenses={convertedExpenses}
              fixedExpenses={categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.is_fixed }), {})}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              newCategoryName={newCategoryName}
              showAddCategory={showAddCategory}
              hasUnsavedChanges={hasUnsavedChanges}
              onUpdateExpense={updateExpense}
              onSaveExpenseValues={saveExpenseValues}
              onToggleFixedExpense={toggleFixedExpense}
              onRemoveCategory={removeCategory}
              onAddNewCategory={addNewCategory}
              onEditCategory={editCategory}
              onSetNewCategoryName={setNewCategoryName}
              onSetShowAddCategory={setShowAddCategory}
              getExpenseForCategory={getExpenseForCategory}
              getTempExpenseValue={getTempExpenseValue}
              calculateYearlyTotal={calculateYearlyTotal}
              calculateMonthTotal={calculateMonthTotal}
            />
          </TabsContent>

          <TabsContent value="direct" className="mt-6">
            <DirectExpensesTable
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              categories={directCategories.map(cat => ({
                id: cat.id,
                name: cat.nome_categoria,
                isCustom: !cat.is_predefinida
              }))}
              expenseValues={directExpenses
                .filter(exp => {
                  const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
                  const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
                  return exp.mes_referencia === dateString;
                })
                .map(exp => ({
                  categoryId: exp.categoria_id,
                  value: exp.valor_mensal
                }))}
              tempExpenseValues={tempDirectExpenseValues}
              hasUnsavedChanges={hasUnsavedDirectChanges}
              newCategoryName={newDirectCategoryName}
              showAddCategory={showAddDirectCategory}
              onUpdateExpense={updateDirectExpense}
              onSaveExpenseValues={saveDirectExpenseValues}
              onAddNewCategory={addNewDirectCategory}
              onRemoveCategory={removeDirectCategory}
              onEditCategory={editDirectCategory}
              onSetNewCategoryName={setNewDirectCategoryName}
              onSetShowAddCategory={setShowAddDirectCategory}
              getTempExpenseValue={getTempDirectExpenseValue}
              calculateMonthTotal={calculateDirectMonthTotal}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IndirectExpenses;
