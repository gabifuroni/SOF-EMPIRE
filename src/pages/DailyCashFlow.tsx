
import { useState } from 'react';
import { Plus, Minus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AddEntryModal from '@/components/cash-flow/AddEntryModal';
import AddExpenseModal from '@/components/cash-flow/AddExpenseModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from '@/hooks/useTransactions';

const DailyCashFlow = () => {
  const today = new Date();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions();

  // Filter today's entries
  const todayEntries = transactions.filter(entry => {
    const entryDate = format(new Date(entry.date), 'yyyy-MM-dd');
    const todayDate = format(today, 'yyyy-MM-dd');
    return entryDate === todayDate;
  });

  // Calculate totals for today
  const totalEntradas = todayEntries
    .filter(entry => entry.tipo_transacao === 'ENTRADA')
    .reduce((sum, entry) => sum + Number(entry.valor), 0);

  const totalSaidas = todayEntries
    .filter(entry => entry.tipo_transacao === 'SAIDA')
    .reduce((sum, entry) => sum + Number(entry.valor), 0);

  const saldoDia = totalEntradas - totalSaidas;

  const handleAddEntry = async (entryData: any) => {
    try {
      await addTransaction.mutateAsync({
        description: entryData.description,
        valor: entryData.amount,
        tipo_transacao: 'ENTRADA',
        date: format(today, 'yyyy-MM-dd'),
        payment_method: entryData.paymentMethod,
      });
      setIsAddEntryModalOpen(false);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      await addTransaction.mutateAsync({
        description: expenseData.description,
        valor: expenseData.amount,
        tipo_transacao: 'SAIDA',
        date: format(today, 'yyyy-MM-dd'),
        category: expenseData.category,
      });
      setIsAddExpenseModalOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-symbol-gold border-t-symbol-beige rounded-full animate-spin mx-auto"></div>
          <p className="brand-body text-symbol-gray-600">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="brand-heading text-3xl text-symbol-black mb-2">
            Fluxo de Caixa Diário
          </h1>
          <div className="w-12 h-px bg-symbol-gold mb-4"></div>
          <p className="brand-body text-symbol-gray-600">
            Controle suas movimentações do dia {format(today, 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsAddEntryModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Entrada
          </Button>
          
          <Button 
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
          >
            <Minus className="w-4 h-4 mr-2" />
            Adicionar Saída
          </Button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Entradas do Dia
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black mb-1">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Saídas do Dia
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black mb-1">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className={`${saldoDia >= 0 ? 'text-blue-600' : 'text-red-600'}`} size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Saldo do Dia
            </h3>
          </div>
          <div className={`brand-heading text-2xl mb-1 ${saldoDia >= 0 ? 'text-symbol-black' : 'text-red-600'}`}>
            R$ {saldoDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h3 className="brand-heading text-xl text-symbol-black mb-2">
            Lançamentos de Hoje - {format(today, 'dd/MM/yyyy', { locale: ptBR })}
          </h3>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>

        {todayEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-symbol-beige/30 flex items-center justify-center mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="brand-subheading text-symbol-black text-lg mb-3">
              Nenhum lançamento hoje
            </h3>
            <p className="brand-body text-symbol-gray-600 mb-6">
              Adicione sua primeira entrada ou saída do dia
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Descrição</TableHead>
                  <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Tipo</TableHead>
                  <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Valor (R$)</TableHead>
                  <TableHead className="text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayEntries
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((entry, index) => (
                  <TableRow key={entry.id} className={index % 2 === 0 ? 'bg-symbol-gray-50/30' : ''}>
                    <TableCell className="font-medium brand-body text-symbol-black">{entry.description}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        entry.tipo_transacao === 'ENTRADA' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.tipo_transacao === 'ENTRADA' ? 'Entrada' : 'Saída'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${
                        entry.tipo_transacao === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        R$ {Number(entry.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
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

      <AddEntryModal
        show={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        onSave={handleAddEntry}
      />

      <AddExpenseModal
        show={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSave={handleAddExpense}
      />
    </div>
  );
};

export default DailyCashFlow;
