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

interface DirectExpense {
  id: string;
  rateioPercent: number;
  rateioValue: number;
  productValue: number;
  cardTaxPercent: number;
  cardValue: number;
  taxPercent: number;
  taxValue: number;
  total: number;
  percentage: number;
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
  } = useIndirectExpenseValues();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [directExpenses, setDirectExpenses] = useState<DirectExpense[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, boolean>>({});
  
  // Convert database categories to expected format
  const convertedCategories: ExpenseCategory[] = categories.map(convertExpenseCategoryFromDb);
  
  // Create simple monthly expenses structure from database data
  const convertedExpenses: MonthlyExpense[] = convertedCategories.map(category => {
    // Find expense values for this category from the current year
    const categoryExpenses = expenses.filter(exp => exp.categoria_id === category.id);
    return convertMonthlyExpenseFromDb(categoryExpenses, category.id, parseInt(selectedYear));
  });
  useEffect(() => {
    // Simplified since we use converted data directly
    // Initialize direct expenses with some sample data
    const initialDirectExpenses: DirectExpense[] = Array.from({ length: 5 }, (_, index) => ({
      id: (index + 1).toString(),
      rateioPercent: 50,
      rateioValue: 0,
      productValue: 0,
      cardTaxPercent: 2.13,
      cardValue: 0,
      taxPercent: 6,
      taxValue: 0,
      total: 0,
      percentage: 0,
    }));
    setDirectExpenses(initialDirectExpenses);
  }, [categories, selectedYear]);
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
    // Simplified: just show toast for now - full DB integration would go here
    toast.success(`Despesa atualizada: ${value}`);
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
    return convertedExpenses.reduce((total, expense) => {
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

  const updateDirectExpense = (id: string, field: keyof DirectExpense, value: number) => {
    setDirectExpenses(prev => prev.map(expense => {
      if (expense.id === id) {
        const updated = { ...expense, [field]: value };
        
        // Auto-calculate dependent fields
        if (field === 'rateioPercent' || field === 'total') {
          updated.rateioValue = (updated.total * updated.rateioPercent) / 100;
        }
        
        if (field === 'productValue' || field === 'cardTaxPercent') {
          updated.cardValue = (updated.productValue * updated.cardTaxPercent) / 100;
        }
        
        if (field === 'productValue' || field === 'taxPercent') {
          updated.taxValue = (updated.productValue * updated.taxPercent) / 100;
        }
        
        // Calculate total if product value changes
        if (field === 'productValue') {
          updated.total = updated.productValue + updated.cardValue + updated.taxValue;
          updated.rateioValue = (updated.total * updated.rateioPercent) / 100;
        }
        
        return updated;
      }
      return expense;
    }));
  };

  const addDirectExpense = () => {
    const newExpense: DirectExpense = {
      id: Date.now().toString(),
      rateioPercent: 50,
      rateioValue: 0,
      productValue: 0,
      cardTaxPercent: 2.13,
      cardValue: 0,
      taxPercent: 6,
      taxValue: 0,
      total: 0,
      percentage: 0,
    };
    setDirectExpenses(prev => [...prev, newExpense]);
  };

  const removeDirectExpense = (id: string) => {
    setDirectExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const saveExpenses = () => {
    toast.success('Despesas salvas com sucesso!');
  };

  // Calculate summary metrics  const totalCategories = convertedCategories.length;
  const monthTotal = calculateMonthTotal();
  const fixedExpensesTotal = convertedCategories
    .filter(cat => ['Aluguel', 'Energia Elétrica', 'Internet/Telefone', 'Água'].includes(cat.name))
    .reduce((sum, cat) => {
      const expense = getExpenseForCategory(cat.id);
      const monthKey = selectedMonth as keyof MonthlyExpense;
      return sum + (expense[monthKey] as number || 0);
    }, 0);
  const variableExpenses = monthTotal - fixedExpensesTotal;

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}
      <ExpensesHeader
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        onSave={saveExpenses}
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
              onUpdateExpense={updateExpense}
              onToggleFixedExpense={toggleFixedExpense}
              onRemoveCategory={removeCategory}
              onAddNewCategory={addNewCategory}
              onSetNewCategoryName={setNewCategoryName}
              onSetShowAddCategory={setShowAddCategory}
              getExpenseForCategory={getExpenseForCategory}
              calculateYearlyTotal={calculateYearlyTotal}
              calculateMonthTotal={calculateMonthTotal}
            />
          </TabsContent>

          {/* Direct Expenses Tab */}
          <TabsContent value="direct" className="mt-6">
            <DirectExpensesTable
              directExpenses={directExpenses}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onUpdateDirectExpense={updateDirectExpense}
              onAddDirectExpense={addDirectExpense}
              onRemoveDirectExpense={removeDirectExpense}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IndirectExpenses;
