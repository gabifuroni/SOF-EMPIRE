import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Calendar, TrendingUp, Calculator, Receipt, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExpenseCategory, MonthlyExpense, DEFAULT_EXPENSE_CATEGORIES } from '@/types';
import { toast } from 'sonner';

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
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

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
          return { ...exp, [selectedMonth]: value };
        }
        return exp;
      });
      
      // If category doesn't exist, add it
      if (!updated.find(exp => exp.categoryId === categoryId)) {
        updated.push({
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
          [selectedMonth]: value,
        });
      }
      
      return updated;
    });
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
    toast.success('Categoria removida com sucesso!');
  };

  const calculateMonthTotal = () => {
    return expenses.reduce((total, expense) => {
      return total + (expense[selectedMonth as keyof MonthlyExpense] as number || 0);
    }, 0);
  };

  const calculateYearlyTotal = (categoryId: string) => {
    const expense = getExpenseForCategory(categoryId);
    return MONTHS.reduce((total, month) => {
      return total + (expense[month.key as keyof MonthlyExpense] as number || 0);
    }, 0);
  };

  const saveExpenses = () => {
    toast.success('Despesas salvas com sucesso!');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);
  const selectedMonthLabel = MONTHS.find(m => m.key === selectedMonth)?.label || '';

  // Calculate summary metrics
  const totalCategories = categories.length;
  const monthTotal = calculateMonthTotal();
  const fixedExpenses = categories.filter(cat => ['Aluguel', 'Energia Elétrica', 'Internet/Telefone', 'Água'].includes(cat.name))
    .reduce((sum, cat) => sum + (getExpenseForCategory(cat.id)[selectedMonth as keyof MonthlyExpense] as number || 0), 0);
  const variableExpenses = monthTotal - fixedExpenses;

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="brand-heading text-3xl text-symbol-black mb-2">
            Despesas Indiretas
          </h1>
          <div className="w-12 h-px bg-symbol-gold mb-4"></div>
          <p className="brand-body text-symbol-gray-600">
            Gerencie suas despesas fixas e recorrentes mensais
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-symbol-gray-600" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 bg-symbol-gray-50 border-symbol-gray-300">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.key} value={month.key}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 bg-symbol-gray-50 border-symbol-gray-300">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={saveExpenses}
            className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <Receipt className="text-blue-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Total de Categorias
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {totalCategories}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-red-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Total do Mês
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {monthTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <Calculator className="text-emerald-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Despesas Fixas
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {fixedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Despesas Variáveis
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {variableExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Despesas de {selectedMonthLabel} - {selectedYear}
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2 brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Categoria</TableHead>
                <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Valor do Mês (R$)</TableHead>
                <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Total Anual (R$)</TableHead>
                <TableHead className="w-20 text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => {
                const expense = getExpenseForCategory(category.id);
                const monthValue = expense[selectedMonth as keyof MonthlyExpense] as number || 0;
                const yearlyTotal = calculateYearlyTotal(category.id);
                
                return (
                  <TableRow key={category.id} className={index % 2 === 0 ? 'bg-symbol-gray-50/30' : ''}>
                    <TableCell className="font-medium brand-body text-symbol-black">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={monthValue || ''}
                        onChange={(e) => updateExpense(category.id, parseFloat(e.target.value) || 0)}
                        className="text-right max-w-32 ml-auto bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold"
                        placeholder="0,00"
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold brand-body text-symbol-black">
                      R$ {yearlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(category.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Add Category Row */}
              {showAddCategory ? (
                <TableRow className="bg-amber-50/50 border-2 border-dashed border-amber-200">
                  <TableCell>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nome da nova categoria"
                      className="border-none bg-transparent focus:border-symbol-gold"
                      onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
                    />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={addNewCategory} 
                        className="h-8 bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategoryName('');
                        }}
                        className="h-8 text-symbol-gray-600 hover:text-symbol-black"
                      >
                        ✕
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCategory(true)}
                      className="border-dashed border-amber-300 text-symbol-gray-600 hover:bg-amber-50/50 font-light"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Nova Categoria
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Total Row */}
              <TableRow className="bg-symbol-gold/10 border-t-2 border-symbol-gold/30 font-semibold">
                <TableCell className="font-bold brand-subheading text-symbol-black">
                  Total do Mês
                </TableCell>
                <TableCell className="text-right font-bold text-symbol-gold">
                  R$ {calculateMonthTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-bold brand-body text-symbol-black">
                  R$ {expenses.reduce((total, expense) => {
                    return total + MONTHS.reduce((categoryTotal, month) => {
                      return categoryTotal + (expense[month.key as keyof MonthlyExpense] as number || 0);
                    }, 0);
                  }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default IndirectExpenses;
