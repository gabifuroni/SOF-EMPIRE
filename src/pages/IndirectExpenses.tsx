import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import ExpensesHeader from "@/components/expenses/ExpensesHeader";
import ExpensesSummaryCards from "@/components/expenses/ExpensesSummaryCards";
import IndirectExpensesTable from "@/components/expenses/IndirectExpensesTable";
import DirectExpensesTable from "@/components/expenses/DirectExpensesTable";
import { useIndirectExpenseCategories, useIndirectExpenseValues } from "@/hooks/useIndirectExpenses";
import { useDirectExpenseCategories, useDirectExpenseValues } from "@/hooks/useDirectExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import { convertExpenseCategoryFromDb, convertMonthlyExpenseFromDb } from "@/utils/typeConverters";
import type { ExpenseCategory, MonthlyExpense } from "@/types";

interface DirectExpenseCategory { id: string; name: string; isCustom: boolean; }
interface DirectExpenseValue { categoryId: string; value: number; }

const MONTHS = [
  { key: "january", label: "Janeiro" }, { key: "february", label: "Fevereiro" },
  { key: "march", label: "Março" }, { key: "april", label: "Abril" },
  { key: "may", label: "Maio" }, { key: "june", label: "Junho" },
  { key: "july", label: "Julho" }, { key: "august", label: "Agosto" },
  { key: "september", label: "Setembro" }, { key: "october", label: "Outubro" },
  { key: "november", label: "Novembro" }, { key: "december", label: "Dezembro" },
];

const IndirectExpenses = () => {
  const { user } = useSupabaseAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(() => MONTHS[new Date().getMonth()].key);

  const { categories, isLoading: categoriesLoading, addCategory, updateCategory, updateCategoryFixed, deleteCategory } = useIndirectExpenseCategories();
  const { expenses, isLoading: expensesLoading, addExpenseValue, updateExpenseValue, deleteExpenseValue, getTotalByMonth } = useIndirectExpenseValues();
  const { categories: directCategories, isLoading: directCategoriesLoading, addCategory: addDirectCategory, updateCategory: updateDirectCategory, deleteCategory: deleteDirectCategory } = useDirectExpenseCategories();
  const { expenses: directExpenses, isLoading: directExpensesLoading, addExpenseValue: addDirectExpenseValue, updateExpenseValue: updateDirectExpenseValue, upsertExpenseValue: upsertDirectExpenseValue, deleteExpenseValue: deleteDirectExpenseValue, getTotalByMonth: getDirectTotalByMonth, getTotalByMonthAndYear: getDirectTotalByMonthAndYear } = useDirectExpenseValues();
  const { addTransaction } = useTransactions();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [tempExpenseValues, setTempExpenseValues] = useState<Record<string, number>>({});
  const [tempDirectExpenseValues, setTempDirectExpenseValues] = useState<Record<string, number>>({});
  const [newDirectCategoryName, setNewDirectCategoryName] = useState("");
  const [showAddDirectCategory, setShowAddDirectCategory] = useState(false);

  const convertedCategories: ExpenseCategory[] = categories.map(convertExpenseCategoryFromDb);
  const convertedExpenses: MonthlyExpense[] = convertedCategories.map((category) => {
    const categoryExpenses = expenses.filter((exp) => exp.categoria_id === category.id);
    return convertMonthlyExpenseFromDb(categoryExpenses, category.id, parseInt(selectedYear));
  });

  useEffect(() => { setTempExpenseValues({}); setTempDirectExpenseValues({}); }, [selectedMonth, selectedYear]);

  const getExpenseForCategory = (categoryId: string): MonthlyExpense => {
    return convertedExpenses.find((exp) => exp.categoryId === categoryId) || { categoryId, year: parseInt(selectedYear), january: 0, february: 0, march: 0, april: 0, may: 0, june: 0, july: 0, august: 0, september: 0, october: 0, november: 0, december: 0 };
  };

  const updateExpense = (categoryId: string, value: number) => setTempExpenseValues((prev) => ({ ...prev, [categoryId]: value }));

  const saveExpenseValues = async () => {
    if (!user) return;
    try {
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
      const savePromises = Object.entries(tempExpenseValues).map(async ([categoryId, value]) => {
        const existingExpense = expenses.find((exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString);
        let result;
        if (existingExpense) { result = await updateExpenseValue.mutateAsync({ id: existingExpense.id, valor_mensal: value }); }
        else { result = await addExpenseValue.mutateAsync({ categoria_id: categoryId, mes_referencia: dateString, valor_mensal: value }); }
        const category = categories.find(cat => cat.id === categoryId);
        const isFixed = category?.is_fixed || false;
        try {
          const { data: existingTransactions } = await supabase.from('transacoes_financeiras').select('id').eq('user_id', user?.id).eq('category', 'Despesas Indiretas').ilike('description', `%Despesa Indireta: ${category?.nome_categoria_despesa || ''}%`);
          if (existingTransactions && existingTransactions.length > 0) { await supabase.from('transacoes_financeiras').delete().in('id', existingTransactions.map(t => t.id)); }
        } catch {}
        if (value > 0) {
          if (isFixed) {
            await Promise.all(MONTHS.map(async (month, index) => { const monthDate = `${selectedYear}-${(index + 1).toString().padStart(2, "0")}-01`; await addTransaction.mutateAsync({ description: `Despesa Indireta: ${category?.nome_categoria_despesa || ''}`, valor: -value, tipo_transacao: 'SAIDA' as const, date: monthDate, category: 'Despesas Indiretas', payment_method: null }); }));
          } else {
            await addTransaction.mutateAsync({ description: `Despesa Indireta: ${category?.nome_categoria_despesa || ''}`, valor: -value, tipo_transacao: 'SAIDA' as const, date: dateString, category: 'Despesas Indiretas', payment_method: null });
          }
        }
        return result;
      });
      await Promise.all(savePromises);
      setTempExpenseValues({});
      await cleanOrphanTransactions();
      toast.success("Despesas indiretas salvas com sucesso!");
    } catch { toast.error("Erro ao salvar despesas indiretas."); }
  };

  const getTempExpenseValue = (categoryId: string): number => {
    if (tempExpenseValues[categoryId] !== undefined) return tempExpenseValues[categoryId];
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    const expenseValue = expenses.find((exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString);
    return expenseValue?.valor_mensal || 0;
  };

  const calculateMonthTotal = () => {
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    return convertedCategories.reduce((total, category) => {
      const tempValue = tempExpenseValues[category.id];
      if (tempValue !== undefined) return total + tempValue;
      const expenseValue = expenses.find((exp) => exp.categoria_id === category.id && exp.mes_referencia === dateString);
      return total + (expenseValue?.valor_mensal || 0);
    }, 0);
  };

  const calculateHasUnsavedChanges = () => Object.entries(tempExpenseValues).some(([categoryId, tempValue]) => {
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    const expenseValue = expenses.find((exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString);
    return tempValue !== (expenseValue?.valor_mensal || 0);
  });

  const calculateYearlyTotal = (categoryId: string): number => {
    return expenses.filter((exp) => exp.categoria_id === categoryId && exp.mes_referencia.startsWith(selectedYear)).reduce((sum, exp) => sum + exp.valor_mensal, 0);
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try { await addCategory.mutateAsync(newCategoryName.trim()); setNewCategoryName(""); setShowAddCategory(false); toast.success("Nova categoria adicionada!"); }
    catch { toast.error("Erro ao adicionar categoria"); }
  };

  const removeCategory = async (categoryId: string) => {
    if (!user) return;
    try {
      const categoryName = categories.find(cat => cat.id === categoryId)?.nome_categoria_despesa;
      await supabase.from('transacoes_financeiras').delete().eq('user_id', user.id).eq('category', 'Despesas Indiretas').ilike('description', `%Despesa Indireta: ${categoryName}%`);
      await deleteCategory.mutateAsync(categoryId);
      toast.success("Categoria removida!");
    } catch { toast.error("Erro ao remover categoria"); }
  };

  const editCategory = async (categoryId: string, newName: string) => {
    try { await updateCategory.mutateAsync({ id: categoryId, categoryName: newName }); toast.success("Categoria atualizada!"); }
    catch { toast.error("Erro ao atualizar categoria"); }
  };

  const toggleFixedExpense = async (categoryId: string, isFixed: boolean) => {
    try { await updateCategoryFixed.mutateAsync({ id: categoryId, isFixed }); }
    catch { toast.error("Erro ao alterar tipo de despesa"); }
  };

  const updateDirectExpense = (categoryId: string, value: number) => setTempDirectExpenseValues((prev) => ({ ...prev, [categoryId]: value }));

  const saveDirectExpenseValues = async () => {
    if (!user) return;
    try {
      const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
      const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
      const savePromises = Object.entries(tempDirectExpenseValues).map(async ([categoryId, value]) => {
        const category = directCategories.find((cat) => cat.id === categoryId);
        if (!category) return;
        await supabase.from('transacoes_financeiras').delete().eq('user_id', user.id).eq('category', 'Despesas Diretas').eq('date', dateString).ilike('description', `%Despesa Direta: ${category?.nome_categoria}%`);
        const result = await upsertDirectExpenseValue.mutateAsync({ categoria_id: categoryId, mes_referencia: dateString, valor_mensal: value });
        if (value > 0) { await addTransaction.mutateAsync({ description: `Despesa Direta: ${category?.nome_categoria || ''}`, valor: -value, tipo_transacao: 'SAIDA' as const, date: dateString, category: 'Despesas Diretas', payment_method: 'Dinheiro' }); }
        return result;
      });
      await Promise.all(savePromises);
      setTempDirectExpenseValues({});
      await cleanOrphanTransactions();
      toast.success("Despesas diretas salvas com sucesso!");
    } catch { toast.error("Erro ao salvar despesas diretas."); }
  };

  const addNewDirectCategory = async () => {
    if (!newDirectCategoryName.trim()) return;
    try { await addDirectCategory.mutateAsync(newDirectCategoryName.trim()); setNewDirectCategoryName(""); setShowAddDirectCategory(false); toast.success("Nova categoria adicionada!"); }
    catch { toast.error("Erro ao adicionar categoria"); }
  };

  const removeDirectCategory = async (categoryId: string) => {
    if (!user) return;
    try {
      const categoryName = directCategories.find(cat => cat.id === categoryId)?.nome_categoria;
      await supabase.from('transacoes_financeiras').delete().eq('user_id', user.id).eq('category', 'Despesas Diretas').ilike('description', `%Despesa Direta: ${categoryName}%`);
      await deleteDirectCategory.mutateAsync(categoryId);
      toast.success("Categoria removida!");
    } catch { toast.error("Erro ao remover categoria"); }
  };

  const editDirectCategory = async (categoryId: string, newName: string) => {
    if (!user) return;
    try {
      const oldName = directCategories.find(cat => cat.id === categoryId)?.nome_categoria;
      await updateDirectCategory.mutateAsync({ id: categoryId, categoryName: newName });
      if (oldName && oldName !== newName) {
        const { data: related } = await supabase.from('transacoes_financeiras').select('id').eq('user_id', user.id).eq('category', 'Despesas Diretas').ilike('description', `%Despesa Direta: ${oldName}%`);
        if (related && related.length > 0) { await supabase.from('transacoes_financeiras').update({ description: `Despesa Direta: ${newName}` }).in('id', related.map(t => t.id)); }
      }
      toast.success("Categoria atualizada!");
    } catch { toast.error("Erro ao atualizar categoria"); }
  };

  const getTempDirectExpenseValue = (categoryId: string): number => {
    if (tempDirectExpenseValues[categoryId] !== undefined) return tempDirectExpenseValues[categoryId];
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    const expenseValue = directExpenses.find((exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString);
    return expenseValue?.valor_mensal || 0;
  };

  const calculateDirectMonthTotal = () => {
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    return directCategories.reduce((total, category) => {
      const tempValue = tempDirectExpenseValues[category.id];
      if (tempValue !== undefined) return total + tempValue;
      const expenseValue = directExpenses.find((exp) => exp.categoria_id === category.id && exp.mes_referencia === dateString);
      return total + (expenseValue?.valor_mensal || 0);
    }, 0);
  };

  const calculateHasUnsavedDirectChanges = () => Object.entries(tempDirectExpenseValues).some(([categoryId, tempValue]) => {
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    const expenseValue = directExpenses.find((exp) => exp.categoria_id === categoryId && exp.mes_referencia === dateString);
    return tempValue !== (expenseValue?.valor_mensal || 0);
  });

  const cleanOrphanTransactions = async () => {
    if (!user) return;
    try {
      const { data: allExpenseTransactions } = await supabase.from('transacoes_financeiras').select('*').eq('user_id', user.id).in('category', ['Despesas Indiretas', 'Despesas Diretas']);
      if (!allExpenseTransactions) return;
      const transactionsToDelete: string[] = [];
      for (const transaction of allExpenseTransactions) {
        const isIndirect = transaction.category === 'Despesas Indiretas';
        const hasValue = isIndirect
          ? expenses.some(exp => transaction.description?.includes(categories.find(cat => cat.id === exp.categoria_id)?.nome_categoria_despesa || '') && exp.valor_mensal > 0)
          : directExpenses.some(exp => transaction.description?.includes(directCategories.find(cat => cat.id === exp.categoria_id)?.nome_categoria || '') && exp.valor_mensal > 0);
        if (!hasValue) transactionsToDelete.push(transaction.id);
      }
      if (transactionsToDelete.length > 0) { await supabase.from('transacoes_financeiras').delete().in('id', transactionsToDelete); }
    } catch {}
  };

  const hasUnsavedChanges = calculateHasUnsavedChanges();
  const hasUnsavedDirectChanges = calculateHasUnsavedDirectChanges();
  const indirectMonthTotal = calculateMonthTotal();
  const directMonthTotal = calculateDirectMonthTotal();
  const totalMonthExpenses = indirectMonthTotal + directMonthTotal;
  const fixedExpensesTotal = categories.filter((cat) => cat.is_fixed).reduce((sum, cat) => {
    const tempValue = tempExpenseValues[cat.id];
    if (tempValue !== undefined) return sum + tempValue;
    const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1;
    const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`;
    const expenseValue = expenses.find((exp) => exp.categoria_id === cat.id && exp.mes_referencia === dateString);
    return sum + (expenseValue?.valor_mensal || 0);
  }, 0);
  const variableExpenses = totalMonthExpenses - fixedExpensesTotal;

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%' }}>
      <style>{`
        .exp-tab-list { background: #13131a !important; border: 1px solid #2a2a38 !important; border-radius: 10px !important; padding: 4px !important; }
        .exp-tab-trigger { color: #9090a8 !important; border-radius: 7px !important; font-size: 13px !important; font-weight: 500 !important; padding: 9px 20px !important; transition: all 0.2s !important; }
        .exp-tab-trigger[data-state=active] { background: #c9a84c !important; color: #0a0a0f !important; font-weight: 600 !important; }
        .exp-tab-content { background: #13131a; border: 1px solid #2a2a38; border-radius: 12px; margin-top: 16px; overflow: hidden; }
      `}</style>

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

      <Tabs defaultValue="indirect" className="w-full">
        <TabsList className="exp-tab-list grid w-full grid-cols-2">
          <TabsTrigger value="indirect" className="exp-tab-trigger">Despesas Indiretas</TabsTrigger>
          <TabsTrigger value="direct" className="exp-tab-trigger">Despesas Diretas</TabsTrigger>
        </TabsList>

        <TabsContent value="indirect" className="exp-tab-content">
          <IndirectExpensesTable
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

        <TabsContent value="direct" className="exp-tab-content">
          <DirectExpensesTable
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            categories={directCategories.map(cat => ({ id: cat.id, name: cat.nome_categoria, isCustom: !cat.is_predefinida }))}
            expenseValues={directExpenses.filter(exp => { const monthNumber = MONTHS.findIndex((m) => m.key === selectedMonth) + 1; const dateString = `${selectedYear}-${monthNumber.toString().padStart(2, "0")}-01`; return exp.mes_referencia === dateString; }).map(exp => ({ categoryId: exp.categoria_id, value: exp.valor_mensal }))}
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
  );
};

export default IndirectExpenses;
