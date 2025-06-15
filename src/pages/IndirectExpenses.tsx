import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseCategory, MonthlyExpense, DEFAULT_EXPENSE_CATEGORIES } from '@/types';
import { toast } from 'sonner';
import ExpensesHeader from '@/components/expenses/ExpensesHeader';
import ExpensesSummaryCards from '@/components/expenses/ExpensesSummaryCards';
import IndirectExpensesTable from '@/components/expenses/IndirectExpensesTable';
import DirectExpensesTable from '@/components/expenses/DirectExpensesTable';

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
  const [categories, setCategories] = useState<ExpenseCategory[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, boolean>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [directExpenses, setDirectExpenses] = useState<DirectExpense[]>([]);

  useEffect(() => {
    // Initialize expenses for all categories
    const initialExpenses = categories.map(category => ({
      categoryId: category.id,
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
    }));
    setExpenses(initialExpenses);

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
    return expenses.find(exp => exp.categoryId === categoryId) || {
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
    setExpenses(prev => {
      const updated = prev.map(exp => {
        if (exp.categoryId === categoryId) {
          const updatedExp = { ...exp };
          (updatedExp as any)[selectedMonth] = value;
          
          // If it's marked as fixed, update all months with the same value
          if (fixedExpenses[categoryId]) {
            MONTHS.forEach(month => {
              (updatedExp as any)[month.key] = value;
            });
          }
          
          return updatedExp;
        }
        return exp;
      });
      
      // If category doesn't exist, add it
      if (!updated.find(exp => exp.categoryId === categoryId)) {
        const newExpense: any = {
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
        
        newExpense[selectedMonth] = value;

        // If it's marked as fixed, set all months to the same value
        if (fixedExpenses[categoryId]) {
          MONTHS.forEach(month => {
            newExpense[month.key] = value;
          });
        }

        updated.push(newExpense);
      }
      
      return updated;
    });
  };

  const toggleFixedExpense = (categoryId: string, isFixed: boolean) => {
    setFixedExpenses(prev => ({
      ...prev,
      [categoryId]: isFixed
    }));

    // If marking as fixed, apply current month value to all months
    if (isFixed) {
      const currentExpense = getExpenseForCategory(categoryId);
      const currentValue = (currentExpense as any)[selectedMonth] || 0;
      
      setExpenses(prev => prev.map(exp => {
        if (exp.categoryId === categoryId) {
          const updatedExp = { ...exp };
          MONTHS.forEach(month => {
            (updatedExp as any)[month.key] = currentValue;
          });
          return updatedExp;
        }
        return exp;
      }));
    }
  };

  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: ExpenseCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      isCustom: true,
    };
    
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setShowAddCategory(false);
    toast.success('Nova categoria adicionada com sucesso!');
  };

  const removeCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setExpenses(prev => prev.filter(exp => exp.categoryId !== categoryId));
    setFixedExpenses(prev => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
    toast.success('Categoria removida com sucesso!');
  };

  const calculateMonthTotal = () => {
    return expenses.reduce((total, expense) => {
      return total + ((expense as any)[selectedMonth] || 0);
    }, 0);
  };

  const calculateYearlyTotal = (categoryId: string) => {
    const expense = getExpenseForCategory(categoryId);
    return MONTHS.reduce((total, month) => {
      return total + ((expense as any)[month.key] || 0);
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

  // Calculate summary metrics
  const totalCategories = categories.length;
  const monthTotal = calculateMonthTotal();
  const fixedExpensesTotal = categories.filter(cat => ['Aluguel', 'Energia Elétrica', 'Internet/Telefone', 'Água'].includes(cat.name))
    .reduce((sum, cat) => sum + ((getExpenseForCategory(cat.id) as any)[selectedMonth] || 0), 0);
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
        totalCategories={totalCategories}
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

          {/* Indirect Expenses Tab */}
          <TabsContent value="indirect" className="mt-6">
            <IndirectExpensesTable
              categories={categories}
              expenses={expenses}
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
