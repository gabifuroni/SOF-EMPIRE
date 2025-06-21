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
  } = useDirectExpenseValues();  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, boolean>>(
    {}
  );  const [tempExpenseValues, setTempExpenseValues] = useState<
    Record<string, number>
  >({});

  // Direct expenses state
  const [tempDirectExpenseValues, setTempDirectExpenseValues] = useState<
    Record<string, number>
  >({});
  const [newDirectCategoryName, setNewDirectCategoryName] = useState("");
  const [showAddDirectCategory, setShowAddDirectCategory] = useState(false);

  // Debounced values to prevent flickering
  const [debouncedTempExpenseValues, setDebouncedTempExpenseValues] = useState<
    Record<string, number>
  >({});
  const [debouncedTempDirectExpenseValues, setDebouncedTempDirectExpenseValues] = useState<
    Record<string, number>
  >({});

  // Convert database categories to expected format
  const convertedCategories: ExpenseCategory[] = categories.map(
    convertExpenseCategoryFromDb
  );

  // Create simple monthly expenses structure from database data
  const convertedExpenses: MonthlyExpense[] = convertedCategories.map(
    (category) => {
      // Find expense values for this category from the current year
      const categoryExpenses = expenses.filter(
        (exp) => exp.categoria_id === category.id
      );
      return convertMonthlyExpenseFromDb(
        categoryExpenses,
        category.id,
        parseInt(selectedYear)
      );
    }  );
    useEffect(() => {
    // Clear temp values when month or year changes
    setTempExpenseValues({});
    setTempDirectExpenseValues({});
    setDebouncedTempExpenseValues({});
    setDebouncedTempDirectExpenseValues({});
  }, [selectedMonth, selectedYear]);

  // Debounce effect for expense values to prevent button flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTempExpenseValues(tempExpenseValues);
    }, 100);
    return () => clearTimeout(timer);
  }, [tempExpenseValues]);

  // Debounce effect for direct expense values
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTempDirectExpenseValues(tempDirectExpenseValues);
    }, 100);
    return () => clearTimeout(timer);
  }, [tempDirectExpenseValues]);
  
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
  };  const updateExpense = (categoryId: string, value: number) => {
    // Store the value temporarily
    setTempExpenseValues((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
    // Don't set hasUnsavedChanges here - it will be calculated dynamically
  };
  const saveExpenseValues = async () => {
    try {
      // Convert month key to a proper date for the selected year/month
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1; // 1-12
      const dateString = `${selectedYear}-${monthNumber
        .toString()
        .padStart(2, "0")}-01`; // YYYY-MM-01

      // Process each expense value that needs to be saved
      const savePromises = Object.entries(tempExpenseValues).map(
        async ([categoryId, value]) => {
          // Check if an expense already exists for this category and month
          const existingExpense = expenses.find(
            (exp) =>
              exp.categoria_id === categoryId &&
              exp.mes_referencia === dateString
          );

          if (existingExpense) {
            // Update existing expense
            return updateExpenseValue.mutateAsync({
              id: existingExpense.id,
              valor_mensal: value,
            });
          } else {
            // Create new expense
            return addExpenseValue.mutateAsync({
              categoria_id: categoryId,
              mes_referencia: dateString,
              valor_mensal: value,
            });
          }
        }
      );

      // Wait for all save operations to complete
      await Promise.all(savePromises);      // Clear temporary values and unsaved changes flag
      setTempExpenseValues({});
      // hasUnsavedChanges will be recalculated automatically
      toast.success("Todas as despesas foram salvas com sucesso!");
    } catch (error) {
      console.error("Error saving expense values:", error);
      toast.error("Erro ao salvar despesas. Tente novamente.");
    }
  };
  const getTempExpenseValue = (categoryId: string): number => {
    // Return temp value if it exists, otherwise return the saved value
    if (tempExpenseValues[categoryId] !== undefined) {
      return tempExpenseValues[categoryId];
    }
    const expense = getExpenseForCategory(categoryId);
    const monthKey = selectedMonth as keyof MonthlyExpense;
    return (expense[monthKey] as number) || 0;
  };
  const toggleFixedExpense = (categoryId: string, isFixed: boolean) => {
    setFixedExpenses((prev) => ({
      ...prev,
      [categoryId]: isFixed,
    }));

    // Simplified: just show toast for now
    toast.success(
      `Despesa ${isFixed ? "marcada como fixa" : "desmarcada como fixa"}`
    );
  };
  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;

    // Use the mutation from the hook
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
    // Use the mutation from the hook
    deleteCategory.mutate(categoryId, {
      onSuccess: () => {
        // Also remove from fixed expenses
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
    });  };
  
  const editCategory = (categoryId: string, newName: string) => {
    updateCategory.mutate({ id: categoryId, categoryName: newName }, {
      onSuccess: () => {
        toast.success("Categoria atualizada com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao atualizar categoria");
      },
    });
  };  // Calculate if there are unsaved changes
  const calculateHasUnsavedChanges = () => {
    return Object.entries(debouncedTempExpenseValues).some(([categoryId, tempValue]) => {
      const expense = getExpenseForCategory(categoryId);
      const savedValue = (expense[selectedMonth as keyof MonthlyExpense] as number) || 0;
      return tempValue !== savedValue;
    });
  };
  const hasUnsavedChanges = calculateHasUnsavedChanges();  // Calculate if there are unsaved direct changes
  const calculateHasUnsavedDirectChanges = () => {
    return Object.entries(debouncedTempDirectExpenseValues).some(([categoryId, tempValue]) => {
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
      
      const expenseValue = directExpenses.find(
        (exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString
      );
      const savedValue = expenseValue?.valor_mensal || 0;
      return tempValue !== savedValue;
    });
  };

  const hasUnsavedDirectChanges = calculateHasUnsavedDirectChanges();

  const calculateMonthTotal = () => {
    return convertedCategories.reduce((total, category) => {
      // Use temp value if available, otherwise use saved value
      const tempValue = tempExpenseValues[category.id];
      if (tempValue !== undefined) {
        return total + tempValue;
      }

      const expense = getExpenseForCategory(category.id);
      const monthKey = selectedMonth as keyof MonthlyExpense;
      return total + ((expense[monthKey] as number) || 0);
    }, 0);
  };

  const calculateYearlyTotal = (categoryId: string) => {
    const expense = getExpenseForCategory(categoryId);
    return MONTHS.reduce((total, month) => {
      const monthKey = month.key as keyof MonthlyExpense;
      return total + ((expense[monthKey] as number) || 0);
    }, 0);
  };  // Direct expenses functions
  const updateDirectExpense = (categoryId: string, value: number) => {
    // Store the value temporarily
    setTempDirectExpenseValues((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
    // Don't set hasUnsavedDirectChanges here - it will be calculated dynamically
  };
  const saveDirectExpenseValues = async () => {
    try {
      // Convert month key to a proper date for the selected year/month
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1; // 1-12
      const dateString = `${selectedYear}-${monthNumber
        .toString()
        .padStart(2, "0")}-01`; // YYYY-MM-01

      // Process each expense value that needs to be saved
      const savePromises = Object.entries(tempDirectExpenseValues).map(
        async ([categoryId, value]) => {
          // Check if an expense already exists for this category and month
          const existingExpense = directExpenses.find(
            (exp) =>
              exp.categoria_id === categoryId &&
              exp.mes_referencia === dateString
          );

          if (existingExpense) {
            // Update existing expense
            return updateDirectExpenseValue.mutateAsync({
              id: existingExpense.id,
              valor_mensal: value,
            });
          } else {
            // Create new expense
            return addDirectExpenseValue.mutateAsync({
              categoria_id: categoryId,
              mes_referencia: dateString,
              valor_mensal: value,
            });
          }
        }
      );

      // Wait for all save operations to complete
      await Promise.all(savePromises);      // Clear temporary values and unsaved changes flag
      setTempDirectExpenseValues({});
      // hasUnsavedDirectChanges will be recalculated automatically
      toast.success("Despesas diretas salvas com sucesso!");
    } catch (error) {
      console.error("Error saving direct expense values:", error);
      toast.error("Erro ao salvar despesas diretas. Tente novamente.");
    }
  };
  const addNewDirectCategory = () => {
    if (!newDirectCategoryName.trim()) return;

    // Use the mutation from the hook
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
    // Use the mutation from the hook
    deleteDirectCategory.mutate(categoryId, {
      onSuccess: () => {
        // Also remove from temp values
        setTempDirectExpenseValues((prev) => {
          const updated = { ...prev };
          delete updated[categoryId];
          return updated;
        });
        toast.success("Categoria de despesa direta removida com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao remover categoria de despesa direta");
      },    });
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
  };  const getTempDirectExpenseValue = (categoryId: string): number => {
    // Return temp value if it exists, otherwise return the saved value
    if (tempDirectExpenseValues[categoryId] !== undefined) {
      return tempDirectExpenseValues[categoryId];
    }
    
    // Find the expense for this category and current month
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber
      .toString()
      .padStart(2, "0")}-01`;
    
    const expenseValue = directExpenses.find(
      (exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString
    );
    return expenseValue?.valor_mensal || 0;
  };  const calculateDirectMonthTotal = () => {
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber
      .toString()
      .padStart(2, "0")}-01`;
    
    return directCategories.reduce((total, category) => {
      // Use temp value if available, otherwise use saved value
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
  // Calculate summary metrics
  const totalCategories = convertedCategories.length;
  const monthTotal = calculateMonthTotal();
  const fixedExpensesTotal = convertedCategories
    .filter((cat) =>
      ["Aluguel", "Energia Elétrica", "Internet/Telefone", "Água"].includes(
        cat.name
      )
    )
    .reduce((sum, cat) => {
      // Use temp value if available, otherwise use saved value
      const tempValue = tempExpenseValues[cat.id];
      if (tempValue !== undefined) {
        return sum + tempValue;
      }

      const expense = getExpenseForCategory(cat.id);
      const monthKey = selectedMonth as keyof MonthlyExpense;
      return sum + ((expense[monthKey] as number) || 0);
    }, 0);
  const variableExpenses = monthTotal - fixedExpensesTotal;

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}{" "}
      <ExpensesHeader
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
          {/* Indirect Expenses Tab */}{" "}
          <TabsContent value="indirect" className="mt-6">            <IndirectExpensesTable
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
          </TabsContent>{" "}
          {/* Direct Expenses Tab */}
          <TabsContent value="direct" className="mt-6">            <DirectExpensesTable
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
                  const dateString = `${selectedYear}-${monthNumber
                    .toString()
                    .padStart(2, "0")}-01`;
                  return exp.mes_referencia === dateString;
                })
                .map(exp => ({
                  categoryId: exp.categoria_id,
                  value: exp.valor_mensal
                }))}
              tempExpenseValues={tempDirectExpenseValues}
              hasUnsavedChanges={hasUnsavedDirectChanges}
              newCategoryName={newDirectCategoryName}
              showAddCategory={showAddDirectCategory}              onUpdateExpense={updateDirectExpense}
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
