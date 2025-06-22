import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
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
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return MONTHS[currentMonth].key;
  });

  // Indirect expenses hooks
  const {
    categories,
    isLoading: categoriesLoading,
    addCategory,
    updateCategory,
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
    deleteExpenseValue: deleteDirectExpenseValue,
    getTotalByMonth: getDirectTotalByMonth,
  } = useDirectExpenseValues();

  // State for indirect expenses
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, boolean>>({});
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
    try {
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;

      console.log('Saving indirect expense values for date:', dateString);
      console.log('Temp values to save:', tempExpenseValues);

      const savePromises = Object.entries(tempExpenseValues).map(
        async ([categoryId, value]) => {
          const existingExpense = expenses.find(
            (exp) =>
              exp.categoria_id === categoryId &&
              exp.mes_referencia === dateString
          );

          console.log('Processing category:', categoryId, 'value:', value, 'existing:', existingExpense);

          if (existingExpense) {
            return updateExpenseValue.mutateAsync({
              id: existingExpense.id,
              valor_mensal: value,
            });
          } else {
            return addExpenseValue.mutateAsync({
              categoria_id: categoryId,
              mes_referencia: dateString,
              valor_mensal: value,
            });
          }
        }
      );

      await Promise.all(savePromises);
      setTempExpenseValues({});
      toast.success("Despesas indiretas salvas com sucesso!");
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

  const toggleFixedExpense = (categoryId: string, isFixed: boolean) => {
    setFixedExpenses((prev) => ({
      ...prev,
      [categoryId]: isFixed,
    }));
    toast.success(
      `Despesa ${isFixed ? "marcada como fixa" : "desmarcada como fixa"}`
    );
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

  const removeCategory = (categoryId: string) => {
    deleteCategory.mutate(categoryId, {
      onSuccess: () => {
        setFixedExpenses((prev) => {
          const updated = { ...prev };
          delete updated[categoryId];
          return updated;
        });
        toast.success("Categoria removida com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao remover categoria");
      },
    });
  };

  const editCategory = (categoryId: string, newName: string) => {
    updateCategory.mutate({ id: categoryId, categoryName: newName }, {
      onSuccess: () => {
        toast.success("Categoria atualizada com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao atualizar categoria");
      },
    });
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
    return expenses
      .filter(exp => exp.categoria_id === categoryId)
      .reduce((total, exp) => total + exp.valor_mensal, 0);
  };

  // DIRECT EXPENSES FUNCTIONS
  const updateDirectExpense = (categoryId: string, value: number) => {
    setTempDirectExpenseValues((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const saveDirectExpenseValues = async () => {
    try {
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;

      console.log('Saving direct expense values for date:', dateString);
      console.log('Temp values to save:', tempDirectExpenseValues);

      const savePromises = Object.entries(tempDirectExpenseValues).map(
        async ([categoryId, value]) => {
          const existingExpense = directExpenses.find(
            (exp) =>
              exp.categoria_id === categoryId &&
              exp.mes_referencia === dateString
          );

          console.log('Processing category:', categoryId, 'value:', value, 'existing:', existingExpense);

          if (existingExpense) {
            return updateDirectExpenseValue.mutateAsync({
              id: existingExpense.id,
              valor_mensal: value,
            });
          } else {
            return addDirectExpenseValue.mutateAsync({
              categoria_id: categoryId,
              mes_referencia: dateString,
              valor_mensal: value,
            });
          }
        }
      );

      await Promise.all(savePromises);
      setTempDirectExpenseValues({});
      toast.success("Despesas diretas salvas com sucesso!");
    } catch (error) {
      console.error("Error saving direct expense values:", error);
      toast.error("Erro ao salvar despesas diretas. Tente novamente.");
    }
  };

  const addNewDirectCategory = () => {
    if (!newDirectCategoryName.trim()) return;

    addDirectCategory.mutate(newDirectCategoryName.trim(), {
      onSuccess: () => {
        setNewDirectCategoryName("");
        setShowAddDirectCategory(false);
        toast.success("Nova categoria de despesa direta adicionada com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao adicionar categoria de despesa direta");
      },
    });
  };

  const removeDirectCategory = (categoryId: string) => {
    deleteDirectCategory.mutate(categoryId, {
      onSuccess: () => {
        setTempDirectExpenseValues((prev) => {
          const updated = { ...prev };
          delete updated[categoryId];
          return updated;
        });
        toast.success("Categoria de despesa direta removida com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao remover categoria de despesa direta");
      },
    });
  };

  const editDirectCategory = (categoryId: string, newName: string) => {
    updateDirectCategory.mutate({ id: categoryId, categoryName: newName }, {
      onSuccess: () => {
        toast.success("Categoria de despesa direta atualizada com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao atualizar categoria de despesa direta");
      },
    });
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

  // Calculate summary metrics
  const hasUnsavedChanges = calculateHasUnsavedChanges();
  const hasUnsavedDirectChanges = calculateHasUnsavedDirectChanges();
  const indirectMonthTotal = calculateMonthTotal();
  const directMonthTotal = calculateDirectMonthTotal();
  const totalMonthExpenses = indirectMonthTotal + directMonthTotal;
  
  // Calculate fixed expenses total based on categories marked as fixed
  const fixedExpensesTotal = convertedCategories
    .filter((cat) => fixedExpenses[cat.id])
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
  
  const variableExpenses = totalMonthExpenses - fixedExpensesTotal;

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

          <TabsContent value="indirect" className="mt-6">
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
