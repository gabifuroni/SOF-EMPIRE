import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ExpensesHeader from '@/components/expenses/ExpensesHeader';
import ExpensesSummaryCards from '@/components/expenses/ExpensesSummaryCards';
import IndirectExpensesTable from '@/components/expenses/IndirectExpensesTable';
import DirectExpensesTable from '@/components/expenses/DirectExpensesTable';
import { useIndirectExpenseCategories, useIndirectExpenseValues } from '@/hooks/useIndirectExpenses';
import { convertExpenseCategoryFromDb, convertMonthlyExpenseFromDb } from '@/utils/typeConverters';
import type { ExpenseCategory, MonthlyExpense } from '@/types';

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
  { key: 'january', label: 'Janeiro' },
  { key: 'february', label: 'Fevereiro' },
  { key: 'march', label: 'Março' },
  { key: 'april', label: 'Abril' },
  { key: 'may', label: 'Maio' },
  { key: 'june', label: 'Junho' },
  { key: 'july', label: 'Julho' },
  { key: 'august', label: 'Agosto' },
  { key: 'september', label: 'Setembro' },
  { key: 'october', label: 'Outubro' },
  { key: 'november', label: 'Novembro' },
  { key: 'december', label: 'Dezembro' },
];

const IndirectExpenses = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return MONTHS[currentMonth].key;
  });
  
  const { 
    categories, 
    isLoading: categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory 
  } = useIndirectExpenseCategories();
  
  const { 
    expenses, 
    isLoading: expensesLoading,
    addExpenseValue,
    updateExpenseValue,
    deleteExpenseValue,
    getTotalByMonth 
  } = useIndirectExpenseValues();  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, boolean>>({});
  const [tempExpenseValues, setTempExpenseValues] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Direct expenses state
  const [directCategories, setDirectCategories] = useState<DirectExpenseCategory[]>([
    { id: '1', name: 'Material de Construção', isCustom: false },
    { id: '2', name: 'Mão de Obra', isCustom: false },
    { id: '3', name: 'Transporte', isCustom: false },
    { id: '4', name: 'Equipamentos', isCustom: false },
  ]);
  const [directExpenseValues, setDirectExpenseValues] = useState<DirectExpenseValue[]>([]);
  const [tempDirectExpenseValues, setTempDirectExpenseValues] = useState<Record<string, number>>({});
  const [hasUnsavedDirectChanges, setHasUnsavedDirectChanges] = useState(false);
  const [newDirectCategoryName, setNewDirectCategoryName] = useState('');
  const [showAddDirectCategory, setShowAddDirectCategory] = useState(false);
  
  // Convert database categories to expected format
  const convertedCategories: ExpenseCategory[] = categories.map(convertExpenseCategoryFromDb);
  
  // Create simple monthly expenses structure from database data
  const convertedExpenses: MonthlyExpense[] = convertedCategories.map(category => {
    // Find expense values for this category from the current year
    const categoryExpenses = expenses.filter(exp => exp.categoria_id === category.id);
    return convertMonthlyExpenseFromDb(categoryExpenses, category.id, parseInt(selectedYear));
  });  useEffect(() => {
    // Clear temp values when month or year changes
    if (hasUnsavedChanges) {
      setTempExpenseValues({});
      setHasUnsavedChanges(false);
    }
    if (hasUnsavedDirectChanges) {
      setTempDirectExpenseValues({});
      setHasUnsavedDirectChanges(false);
    }
  }, [selectedMonth, selectedYear, hasUnsavedChanges, hasUnsavedDirectChanges]);
  const getExpenseForCategory = (categoryId: string): MonthlyExpense => {
    return convertedExpenses.find(exp => exp.categoryId === categoryId) || {
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
    };
  };
  const updateExpense = (categoryId: string, value: number) => {
    // Store the value temporarily
    setTempExpenseValues(prev => ({
      ...prev,
      [categoryId]: value
    }));
    setHasUnsavedChanges(true);
  };  const saveExpenseValues = async () => {
    try {
      // Convert month key to a proper date for the selected year/month
      const monthNumber = MONTHS.findIndex(m => m.key === selectedMonth) + 1; // 1-12
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, '0')}-01`; // YYYY-MM-01
      
      // Process each expense value that needs to be saved
      const savePromises = Object.entries(tempExpenseValues).map(async ([categoryId, value]) => {
        // Check if an expense already exists for this category and month
        const existingExpense = expenses.find(
          exp => exp.categoria_id === categoryId && exp.mes_referencia === dateString
        );

        if (existingExpense) {
          // Update existing expense
          return updateExpenseValue.mutateAsync({
            id: existingExpense.id,
            valor_mensal: value
          });
        } else {
          // Create new expense
          return addExpenseValue.mutateAsync({
            categoria_id: categoryId,
            mes_referencia: dateString,
            valor_mensal: value
          });
        }
      });

      // Wait for all save operations to complete
      await Promise.all(savePromises);
      
      // Clear temporary values and unsaved changes flag
      setTempExpenseValues({});
      setHasUnsavedChanges(false);
      toast.success('Todas as despesas foram salvas com sucesso!');
    } catch (error) {
      console.error('Error saving expense values:', error);
      toast.error('Erro ao salvar despesas. Tente novamente.');
    }
  };  const getTempExpenseValue = (categoryId: string): number => {
    // Return temp value if it exists, otherwise return the saved value
    if (tempExpenseValues[categoryId] !== undefined) {
      return tempExpenseValues[categoryId];
    }
    const expense = getExpenseForCategory(categoryId);
    const monthKey = selectedMonth as keyof MonthlyExpense;
    return expense[monthKey] as number || 0;
  };
  const toggleFixedExpense = (categoryId: string, isFixed: boolean) => {
    setFixedExpenses(prev => ({
      ...prev,
      [categoryId]: isFixed
    }));

    // Simplified: just show toast for now
    toast.success(`Despesa ${isFixed ? 'marcada como fixa' : 'desmarcada como fixa'}`);
  };
  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // Use the mutation from the hook
    addCategory.mutate(newCategoryName.trim(), {
      onSuccess: () => {
        setNewCategoryName('');
        setShowAddCategory(false);
        toast.success('Nova categoria adicionada com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao adicionar categoria');
      }
    });
  };

  const removeCategory = (categoryId: string) => {
    // Use the mutation from the hook
    deleteCategory.mutate(categoryId, {
      onSuccess: () => {
        // Also remove from fixed expenses
        setFixedExpenses(prev => {
          const updated = { ...prev };
          delete updated[categoryId];
          return updated;
        });
        toast.success('Categoria removida com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao remover categoria');
      }
    });
  };
  const calculateMonthTotal = () => {
    return convertedCategories.reduce((total, category) => {
      // Use temp value if available, otherwise use saved value
      const tempValue = tempExpenseValues[category.id];
      if (tempValue !== undefined) {
        return total + tempValue;
      }
      
      const expense = getExpenseForCategory(category.id);
      const monthKey = selectedMonth as keyof MonthlyExpense;
      return total + (expense[monthKey] as number || 0);
    }, 0);
  };

  const calculateYearlyTotal = (categoryId: string) => {
    const expense = getExpenseForCategory(categoryId);
    return MONTHS.reduce((total, month) => {
      const monthKey = month.key as keyof MonthlyExpense;
      return total + (expense[monthKey] as number || 0);
    }, 0);
  };
  // Direct expenses functions
  const updateDirectExpense = (categoryId: string, value: number) => {
    // Store the value temporarily
    setTempDirectExpenseValues(prev => ({
      ...prev,
      [categoryId]: value
    }));
    setHasUnsavedDirectChanges(true);
  };

  const saveDirectExpenseValues = async () => {
    try {
      // For now, just save to local state since we don't have a database table yet
      const newValues = Object.entries(tempDirectExpenseValues).map(([categoryId, value]) => ({
        categoryId,
        value
      }));
      
      setDirectExpenseValues(prev => {
        // Remove old values for the same categories and add new ones
        const filtered = prev.filter(ev => !tempDirectExpenseValues[ev.categoryId]);
        return [...filtered, ...newValues];
      });
      
      // Clear temporary values and unsaved changes flag
      setTempDirectExpenseValues({});
      setHasUnsavedDirectChanges(false);
      toast.success('Despesas diretas salvas com sucesso!');
    } catch (error) {
      console.error('Error saving direct expense values:', error);
      toast.error('Erro ao salvar despesas diretas. Tente novamente.');
    }
  };

  const addNewDirectCategory = () => {
    if (!newDirectCategoryName.trim()) return;
    
    const newCategory: DirectExpenseCategory = {
      id: Date.now().toString(),
      name: newDirectCategoryName.trim(),
      isCustom: true
    };
    
    setDirectCategories(prev => [...prev, newCategory]);
    setNewDirectCategoryName('');
    setShowAddDirectCategory(false);
    toast.success('Nova categoria de despesa direta adicionada com sucesso!');
  };

  const removeDirectCategory = (categoryId: string) => {
    setDirectCategories(prev => prev.filter(cat => cat.id !== categoryId));
    
    // Also remove from expense values and temp values
    setDirectExpenseValues(prev => prev.filter(ev => ev.categoryId !== categoryId));
    setTempDirectExpenseValues(prev => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
    
    toast.success('Categoria de despesa direta removida com sucesso!');
  };

  const getTempDirectExpenseValue = (categoryId: string): number => {
    // Return temp value if it exists, otherwise return the saved value
    if (tempDirectExpenseValues[categoryId] !== undefined) {
      return tempDirectExpenseValues[categoryId];
    }
    const expenseValue = directExpenseValues.find(ev => ev.categoryId === categoryId);
    return expenseValue?.value || 0;
  };

  const calculateDirectMonthTotal = () => {
    return directCategories.reduce((total, category) => {
      // Use temp value if available, otherwise use saved value
      const tempValue = tempDirectExpenseValues[category.id];
      if (tempValue !== undefined) {
        return total + tempValue;
      }
      
      const expenseValue = directExpenseValues.find(ev => ev.categoryId === category.id);
      return total + (expenseValue?.value || 0);
    }, 0);
  };
  // Calculate summary metrics
  const totalCategories = convertedCategories.length;
  const monthTotal = calculateMonthTotal();
  const fixedExpensesTotal = convertedCategories
    .filter(cat => ['Aluguel', 'Energia Elétrica', 'Internet/Telefone', 'Água'].includes(cat.name))
    .reduce((sum, cat) => {
      // Use temp value if available, otherwise use saved value
      const tempValue = tempExpenseValues[cat.id];
      if (tempValue !== undefined) {
        return sum + tempValue;
      }
      
      const expense = getExpenseForCategory(cat.id);
      const monthKey = selectedMonth as keyof MonthlyExpense;
      return sum + (expense[monthKey] as number || 0);
    }, 0);
  const variableExpenses = monthTotal - fixedExpensesTotal;

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}      <ExpensesHeader
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {/* Summary Cards */}
      <ExpensesSummaryCards
        totalCategories={convertedCategories.length}
        monthTotal={monthTotal}
        fixedExpensesTotal={fixedExpensesTotal}
        variableExpenses={variableExpenses}
      />

      {/* Tabs Section */}
      <div className="symbol-card p-2 shadow-lg">
        <Tabs defaultValue="indirect" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="indirect" 
              className="bg-symbol-beige text-symbol-black font-medium py-3 px-6 data-[state=active]:bg-symbol-gold data-[state=active]:text-symbol-black data-[state=active]:shadow-none border-none rounded-none text-sm uppercase tracking-wide transition-all duration-300"
            >
              Despesas
            </TabsTrigger>
            <TabsTrigger 
              value="direct" 
              className="bg-symbol-beige text-symbol-black font-medium py-3 px-6 data-[state=active]:bg-symbol-gold data-[state=active]:text-symbol-black data-[state=active]:shadow-none border-none rounded-none text-sm uppercase tracking-wide transition-all duration-300"
            >
              Despesas Diretas
            </TabsTrigger>
          </TabsList>

          {/* Indirect Expenses Tab */}          <TabsContent value="indirect" className="mt-6">
            <IndirectExpensesTable
              categories={convertedCategories}
              expenses={convertedExpenses}
              fixedExpenses={fixedExpenses}
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
              onSetNewCategoryName={setNewCategoryName}
              onSetShowAddCategory={setShowAddCategory}
              getExpenseForCategory={getExpenseForCategory}
              getTempExpenseValue={getTempExpenseValue}
              calculateYearlyTotal={calculateYearlyTotal}
              calculateMonthTotal={calculateMonthTotal}
            />
          </TabsContent>          {/* Direct Expenses Tab */}
          <TabsContent value="direct" className="mt-6">
            <DirectExpensesTable
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              categories={directCategories}
              expenseValues={directExpenseValues}
              tempExpenseValues={tempDirectExpenseValues}
              hasUnsavedChanges={hasUnsavedDirectChanges}
              newCategoryName={newDirectCategoryName}
              showAddCategory={showAddDirectCategory}
              onUpdateExpense={updateDirectExpense}
              onSaveExpenseValues={saveDirectExpenseValues}
              onAddNewCategory={addNewDirectCategory}
              onRemoveCategory={removeDirectCategory}
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
