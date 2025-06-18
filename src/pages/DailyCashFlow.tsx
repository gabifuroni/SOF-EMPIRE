import { useState } from 'react';
import AddEntryModal from '@/components/cash-flow/AddEntryModal';
import AddExpenseModal from '@/components/cash-flow/AddExpenseModal';
import DailyCashFlowHeader from '@/components/cash-flow/DailyCashFlowHeader';
import DailyCashFlowMetrics from '@/components/cash-flow/DailyCashFlowMetrics';
import DailyCashFlowTable from '@/components/cash-flow/DailyCashFlowTable';
import { format, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';

const DailyCashFlow = () => {
  const today = new Date();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions();
  const { params } = useBusinessParams();

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
  
  // Calculate daily attendance goal
  const workingDaysPerMonth = Math.floor(params.workingDaysPerYear / 12);
  const dailyAttendanceGoal = Math.ceil(params.attendanceGoal / workingDaysPerMonth);
  
  // Count today's attendances (entries)
  const todayAttendances = todayEntries.filter(entry => entry.tipo_transacao === 'ENTRADA').length;
  const remainingAttendances = Math.max(0, dailyAttendanceGoal - todayAttendances);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddEntry = async (entryData: any) => {
    try {
      await addTransaction.mutateAsync({
        description: entryData.description,
        valor: entryData.amount,
        tipo_transacao: 'ENTRADA',
        date: format(entryData.date, 'yyyy-MM-dd'),
        payment_method: entryData.paymentMethod,
      });
      setIsAddEntryModalOpen(false);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddExpense = async (expenseData: any) => {
    try {
      await addTransaction.mutateAsync({
        description: expenseData.description,
        valor: expenseData.amount,
        tipo_transacao: 'SAIDA',
        date: format(expenseData.date, 'yyyy-MM-dd'),
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
      <DailyCashFlowHeader
        today={today}
        onAddEntry={() => setIsAddEntryModalOpen(true)}
        onAddExpense={() => setIsAddExpenseModalOpen(true)}
      />      <DailyCashFlowMetrics
        totalEntradas={totalEntradas}
        totalSaidas={totalSaidas}
        saldoDia={saldoDia}
        dailyAttendanceGoal={dailyAttendanceGoal}
        todayAttendances={todayAttendances}
        remainingAttendances={remainingAttendances}
      />

      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h3 className="brand-heading text-xl text-symbol-black mb-2">
            Lançamentos de Hoje - {format(today, 'dd/MM/yyyy', { locale: ptBR })}
          </h3>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>

        <DailyCashFlowTable
          todayEntries={todayEntries}
          today={today}
          onDeleteEntry={handleDeleteEntry}
        />
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
