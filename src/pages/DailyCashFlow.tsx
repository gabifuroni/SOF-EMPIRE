import { useState, useMemo } from 'react';
import AddEntryModal from '@/components/cash-flow/AddEntryModal';
import AddExpenseModal from '@/components/cash-flow/AddExpenseModal';
import DailyCashFlowHeader from '@/components/cash-flow/DailyCashFlowHeader';
import DailyCashFlowMetrics from '@/components/cash-flow/DailyCashFlowMetrics';
import DailyCashFlowTable from '@/components/cash-flow/DailyCashFlowTable';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';

const DailyCashFlow = () => {
  const today = useMemo(() => new Date(), []); // Esta data será fixada no momento da renderização
  const currentDate = new Date(); // Data sempre atual para os modais
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions();
  const { params, isLoading: paramsLoading } = useBusinessParams();

  const todayEntries = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(entry => {
      try {
        // Verifica se é uma data válida e se é hoje
        const entryDate = entry.date ? parseISO(entry.date) : null;
        return entryDate && isToday(entryDate);
      } catch {
        // Se houver erro na conversão da data, verifica por string
        const entryDateStr = format(new Date(entry.date), 'yyyy-MM-dd');
        const todayDateStr = format(today, 'yyyy-MM-dd');
        return entryDateStr === todayDateStr;
      }
    });
  }, [transactions, today]);

  const dailyTotals = useMemo(() => {
    const totalEntradas = todayEntries
      .filter(entry => entry.tipo_transacao === 'ENTRADA')
      .reduce((sum, entry) => sum + Number(entry.valor || 0), 0);

    const totalSaidas = todayEntries
      .filter(entry => entry.tipo_transacao === 'SAIDA')
      .reduce((sum, entry) => sum + Number(entry.valor || 0), 0);

    const saldoDia = totalEntradas - totalSaidas;

    return { totalEntradas, totalSaidas, saldoDia };
  }, [todayEntries]);

  const dailyGoalData = useMemo(() => {
    if (paramsLoading || !params) {
      return {
        dailyGoal: 0,
        currentProgress: 0,
        remainingToGoal: 0,
        goalLabel: '',
        goalUnit: '',
        progressPercentage: 0
      };
    }

    const workingDaysPerMonth = Math.floor(params.workingDaysPerYear / 12);
    let dailyGoal = 0;
    let currentProgress = 0;
    let goalLabel = '';
    let goalUnit = '';
    
    if (params.goalType === 'financial') {
      // Meta financeira - baseada no faturamento mensal
      dailyGoal = params.monthlyGoal / workingDaysPerMonth;
      currentProgress = dailyTotals.totalEntradas;
      goalLabel = 'Meta de Faturamento Diária';
      goalUnit = 'R$';
    } else {
      // Meta de atendimentos - baseada no número de atendimentos mensais
      dailyGoal = Math.ceil(params.attendanceGoal / workingDaysPerMonth);
      currentProgress = todayEntries.filter(entry => entry.tipo_transacao === 'ENTRADA').length;
      goalLabel = 'Meta de Atendimentos Diária';
      goalUnit = '';
    }
    
    const remainingToGoal = Math.max(0, dailyGoal - currentProgress);
    const progressPercentage = dailyGoal > 0 ? (currentProgress / dailyGoal) * 100 : 0;

    return {
      dailyGoal,
      currentProgress,
      remainingToGoal,
      goalLabel,
      goalUnit,
      progressPercentage
    };
  }, [params, paramsLoading, dailyTotals, todayEntries]);  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddEntry = async (entryData: any) => {
    try {
      await addTransaction.mutateAsync({
        description: entryData.description,
        valor: entryData.amount,
        tipo_transacao: 'ENTRADA',
        date: format(currentDate, 'yyyy-MM-dd'), // Always use current date for daily cash flow
        payment_method: entryData.paymentMethod,
      });
      setIsAddEntryModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar entrada:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddExpense = async (expenseData: any) => {
    try {
      await addTransaction.mutateAsync({
        description: expenseData.description,
        valor: expenseData.amount,
        tipo_transacao: 'SAIDA',
        date: format(currentDate, 'yyyy-MM-dd'), // Always use current date for daily cash flow
        category: expenseData.category,
      });
      setIsAddExpenseModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar saída:', error);
    }
  };
  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
    }
  };
  if (isLoading || paramsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-symbol-gold border-t-symbol-beige rounded-full animate-spin mx-auto"></div>
          <p className="brand-body text-symbol-gray-600">
            {isLoading ? 'Carregando transações...' : 'Carregando parâmetros...'}
          </p>
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
        totalEntradas={dailyTotals.totalEntradas}
        totalSaidas={dailyTotals.totalSaidas}
        saldoDia={dailyTotals.saldoDia}
        dailyGoal={dailyGoalData.dailyGoal}
        currentProgress={dailyGoalData.currentProgress}
        remainingToGoal={dailyGoalData.remainingToGoal}
        goalLabel={dailyGoalData.goalLabel}
        goalUnit={dailyGoalData.goalUnit}
      />      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="brand-heading text-xl text-symbol-black mb-2">
                Lançamentos de Hoje - {format(today, 'dd/MM/yyyy', { locale: ptBR })}
              </h3>
              <div className="w-8 h-px bg-symbol-beige"></div>
            </div>
            <div className="text-right">
              <p className="text-sm text-symbol-gray-600 mb-1">
                {todayEntries.length} lançamento{todayEntries.length !== 1 ? 's' : ''} hoje
              </p>
              {dailyGoalData.dailyGoal > 0 && (
                <div className="text-sm text-symbol-gray-600">
                  Progresso da meta: {dailyGoalData.progressPercentage.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>

        <DailyCashFlowTable
          todayEntries={todayEntries}
          today={today}
          onDeleteEntry={handleDeleteEntry}
        />
      </div>      <AddEntryModal
        show={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        onSave={handleAddEntry}
        defaultDate={currentDate}
      />

      <AddExpenseModal
        show={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSave={handleAddExpense}
        defaultDate={currentDate}
      />
    </div>
  );
};

export default DailyCashFlow;
