import { useState } from 'react';
import { Plus, TrendingUp, Calculator, Receipt, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  monthlyAmount: number;
}

const Expenses = () => {
  const { toast } = useToast();
  
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      name: 'Aluguel do Salão',
      category: 'Fixas',
      amount: 1800.00,
      frequency: 'monthly',
      monthlyAmount: 1800.00
    },
    {
      id: '2',
      name: 'Energia Elétrica',
      category: 'Fixas',
      amount: 350.00,
      frequency: 'monthly',
      monthlyAmount: 350.00
    },
    {
      id: '3',
      name: 'Internet/Telefone',
      category: 'Fixas',
      amount: 120.00,
      frequency: 'monthly',
      monthlyAmount: 120.00
    },
    {
      id: '4',
      name: 'Seguro Anual',
      category: 'Variáveis',
      amount: 1200.00,
      frequency: 'yearly',
      monthlyAmount: 100.00
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    frequency: 'monthly' as 'monthly' | 'yearly'
  });

  const categories = [
    'Fixas',
    'Variáveis',
    'Marketing',
    'Equipamentos',
    'Manutenção',
    'Seguros',
    'Impostos',
    'Outras'
  ];

  const handleAddExpense = () => {
    if (!formData.name || !formData.category || !formData.amount) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const monthlyAmount = formData.frequency === 'yearly' ? amount / 12 : amount;

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      amount,
      frequency: formData.frequency,
      monthlyAmount
    };

    setExpenses(prev => [...prev, newExpense]);
    setFormData({ name: '', category: '', amount: '', frequency: 'monthly' });
    setIsAddModalOpen(false);

    toast({
      title: "Sucesso!",
      description: "Despesa adicionada com sucesso!",
      variant: "default"
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Despesa removida",
      description: "A despesa foi removida com sucesso",
      variant: "default"
    });
  };

  // Calculate totals
  const totalMonthly = expenses.reduce((sum, expense) => sum + expense.monthlyAmount, 0);
  const fixedExpenses = expenses.filter(exp => exp.category === 'Fixas').reduce((sum, exp) => sum + exp.monthlyAmount, 0);
  const variableExpenses = expenses.filter(exp => exp.category === 'Variáveis').reduce((sum, exp) => sum + exp.monthlyAmount, 0);
  const totalExpenses = expenses.length;

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
            Gerencie suas despesas fixas e variáveis mensais
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <Receipt className="text-blue-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Total de Despesas
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {totalExpenses}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-red-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Total Mensal
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

      {/* Add Expense Form */}
      {isAddModalOpen && (
        <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50/30 to-amber-100/20 border-amber-200/40">
          <div className="mb-6">
            <h2 className="brand-heading text-xl text-symbol-black mb-2">
              Adicionar Nova Despesa
            </h2>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="name" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Nome da Despesa
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Aluguel do Salão"
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
              />
            </div>

            <div>
              <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Categoria
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
              />
            </div>

            <div>
              <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Frequência
              </Label>
              <Select value={formData.frequency} onValueChange={(value: 'monthly' | 'yearly') => setFormData(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={handleAddExpense}
              className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-2 px-4 transition-all duration-300 uppercase tracking-wide text-sm"
            >
              Adicionar Despesa
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50 font-light"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Lista de Despesas Indiretas
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-symbol-beige/30 flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="brand-subheading text-symbol-black text-lg mb-3">
              Nenhuma despesa cadastrada
            </h3>
            <p className="brand-body text-symbol-gray-600 mb-6">
              Adicione suas primeiras despesas indiretas para melhor controle financeiro
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Nome</TableHead>
                  <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Categoria</TableHead>
                  <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Frequência</TableHead>
                  <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Valor Original</TableHead>
                  <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Valor Mensal</TableHead>
                  <TableHead className="text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense, index) => (
                  <TableRow key={expense.id} className={index % 2 === 0 ? 'bg-symbol-gray-50/30' : ''}>
                    <TableCell className="font-medium brand-body text-symbol-black">{expense.name}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        expense.category === 'Fixas' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="brand-body text-symbol-gray-700">
                      {expense.frequency === 'monthly' ? 'Mensal' : 'Anual'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-symbol-black">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-symbol-black">
                      R$ {expense.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-symbol-gray-600 hover:text-red-600 font-light"
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
