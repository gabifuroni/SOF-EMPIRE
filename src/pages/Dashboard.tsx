import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, FileText, User, Target, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PatenteCard from '@/components/dashboard/PatenteCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';

const Dashboard = () => {
  const [monthlyGoal, setMonthlyGoal] = useState(10000);
  const [goalType, setGoalType] = useState<'financial' | 'attendance'>('financial');
  const [attendanceGoal, setAttendanceGoal] = useState(50);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());
  const [attendanceGoalInput, setAttendanceGoalInput] = useState(attendanceGoal.toString());
  const { profile, isLoading: profileLoading } = useProfile();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { params: businessParams, updateParams } = useBusinessParams();

  // Calculate current month revenue
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const currentMonthEntries = transactions.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= monthStart && entryDate <= monthEnd;
  });

  const monthlyRevenue = currentMonthEntries
    .filter(entry => entry.tipo_transacao === 'ENTRADA')
    .reduce((sum, entry) => sum + Number(entry.valor), 0);

  const monthlyExpenses = currentMonthEntries
    .filter(entry => entry.tipo_transacao === 'SAIDA')
    .reduce((sum, entry) => sum + Number(entry.valor), 0);
  const estimatedProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? (estimatedProfit / monthlyRevenue) * 100 : 0;
    // Calculate expense percentage of revenue
  const expensePercentage = monthlyRevenue > 0 ? (monthlyExpenses / monthlyRevenue) * 100 : 0;
  const expectedTotalExpenses = businessParams.despesasIndiretasDepreciacao + businessParams.despesasDiretas;

  // Calculate attendance count (number of entries)
  const monthlyAttendance = currentMonthEntries
    .filter(entry => entry.tipo_transacao === 'ENTRADA').length;
  
  // Calculate monthly data for chart (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(currentMonth, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthTransactions = transactions.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
    
    const revenue = monthTransactions
      .filter(entry => entry.tipo_transacao === 'ENTRADA')
      .reduce((sum, entry) => sum + Number(entry.valor), 0);
    
    monthlyData.push({
      month: format(date, 'MMM'),
      revenue: revenue
    });
  }

  // Calculate goal progress based on type
  const getCurrentValue = () => {
    return goalType === 'financial' ? monthlyRevenue : monthlyAttendance;
  };

  const getCurrentGoal = () => {
    return goalType === 'financial' ? monthlyGoal : attendanceGoal;
  };

  const goalProgress = (getCurrentValue() / getCurrentGoal()) * 100;
  const remainingToGoal = Math.max(0, getCurrentGoal() - getCurrentValue());
  const handleSaveGoal = () => {
    if (goalType === 'financial') {
      const newGoal = parseFloat(goalInput) || 0;
      setMonthlyGoal(newGoal);
      localStorage.setItem('monthlyGoal', newGoal.toString());
      // Atualizar contexto
      updateParams({
        monthlyGoal: newGoal,
        goalType: goalType
      });
    } else {
      const newGoal = parseInt(attendanceGoalInput) || 0;
      setAttendanceGoal(newGoal);
      localStorage.setItem('attendanceGoal', newGoal.toString());
      // Atualizar contexto
      updateParams({
        attendanceGoal: newGoal,
        goalType: goalType
      });
    }
    localStorage.setItem('goalType', goalType);
    setIsEditingGoal(false);
  };
  useEffect(() => {
    // Sync with business params context first
    if (businessParams.monthlyGoal !== monthlyGoal) {
      setMonthlyGoal(businessParams.monthlyGoal);
      setGoalInput(businessParams.monthlyGoal.toString());
    }
    if (businessParams.attendanceGoal !== attendanceGoal) {
      setAttendanceGoal(businessParams.attendanceGoal);
      setAttendanceGoalInput(businessParams.attendanceGoal.toString());
    }
    if (businessParams.goalType !== goalType) {
      setGoalType(businessParams.goalType);
    }

    // Then check localStorage for any overrides
    const savedGoal = localStorage.getItem('monthlyGoal');
    const savedAttendanceGoal = localStorage.getItem('attendanceGoal');
    const savedGoalType = localStorage.getItem('goalType') as 'financial' | 'attendance';
    
    if (savedGoal) {
      const goal = parseFloat(savedGoal);
      setMonthlyGoal(goal);
      setGoalInput(goal.toString());
      // Update context if different
      if (goal !== businessParams.monthlyGoal) {
        updateParams({ monthlyGoal: goal });
      }
    }
    if (savedAttendanceGoal) {
      const goal = parseInt(savedAttendanceGoal);
      setAttendanceGoal(goal);
      setAttendanceGoalInput(goal.toString());
      // Update context if different
      if (goal !== businessParams.attendanceGoal) {
        updateParams({ attendanceGoal: goal });
      }
    }
    if (savedGoalType) {
      setGoalType(savedGoalType);
      // Update context if different
      if (savedGoalType !== businessParams.goalType) {
        updateParams({ goalType: savedGoalType });
      }
    }
  }, [businessParams, updateParams, monthlyGoal, attendanceGoal, goalType]);

  if (profileLoading || transactionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-symbol-gold border-t-symbol-beige rounded-full animate-spin mx-auto"></div>
          <p className="brand-body text-symbol-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Extract first and last name from full name
  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0];
    return `${names[0]} ${names[names.length - 1]}`;
  };

  const userName = profile?.nome_profissional_ou_salao || 'Usuário';
  const displayName = getFirstAndLastName(userName);
  return (
    <div className="space-y-8 p-6 animate-minimal-fade">      {/* Alert System */}
      {(profitMargin < businessParams.lucroDesejado || expensePercentage > expectedTotalExpenses) && (
        <div className="space-y-3">
          {profitMargin < businessParams.lucroDesejado && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Atenção:</strong> Margem de lucro atual ({profitMargin.toFixed(1)}%) está abaixo do desejado ({businessParams.lucroDesejado}%). 
                Revise seus custos e preços.
              </AlertDescription>
            </Alert>
          )}
          {expensePercentage > expectedTotalExpenses && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Alerta:</strong> Despesas totais ({expensePercentage.toFixed(1)}%) ultrapassaram o esperado ({expectedTotalExpenses}%). 
                Controle seus gastos mensais.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="brand-heading text-3xl text-symbol-black mb-2">
            Bem-vinda(o), {displayName}
          </h1>
          <div className="w-12 h-px bg-symbol-gold mb-4"></div>
          <p className="brand-body text-symbol-gray-600">
            Visão geral do seu salão em tempo real
          </p>
        </div>
      </div>

      {/* Main Metrics Grid - 3 cards in top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="text-blue-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Faturamento do Mês
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black mb-1">
            R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-emerald-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Lucro Estimado
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black mb-1">
            R$ {estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-green-600 font-medium">
            {profitMargin.toFixed(1)}% de margem
          </div>
        </div>

        {/* Monthly Goal Card with Flexible Type */}
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
          <div className="flex items-center justify-between mb-4">
            <Target className="text-purple-600" size={20} />
            <button
              onClick={() => setIsEditingGoal(true)}
              className="p-1 hover:bg-purple-100 rounded transition-colors"
            >
              <Edit size={14} className="text-purple-600" />
            </button>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Meta do Mês
            </h3>
          </div>
          
          {isEditingGoal ? (
            <div className="space-y-3">
              {/* Goal Type Selection */}
              <RadioGroup value={goalType} onValueChange={(value) => setGoalType(value as 'financial' | 'attendance')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="financial" id="financial" />
                  <Label htmlFor="financial" className="text-xs">Meta Financeira</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="attendance" id="attendance" />
                  <Label htmlFor="attendance" className="text-xs">Meta de Atendimentos</Label>
                </div>
              </RadioGroup>

              {/* Goal Input */}
              <Input
                type="number"
                value={goalType === 'financial' ? goalInput : attendanceGoalInput}
                onChange={(e) => {
                  if (goalType === 'financial') {
                    setGoalInput(e.target.value);
                  } else {
                    setAttendanceGoalInput(e.target.value);
                  }
                }}
                className="text-sm bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                placeholder={goalType === 'financial' ? "Meta financeira" : "Meta de atendimentos"}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveGoal}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1"
                >
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditingGoal(false);
                    setGoalInput(monthlyGoal.toString());
                    setAttendanceGoalInput(attendanceGoal.toString());
                  }}
                  className="text-xs px-2 py-1 border-symbol-gray-300 text-symbol-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="brand-heading text-2xl text-symbol-black mb-1">
                {goalType === 'financial' 
                  ? `R$ ${getCurrentGoal().toLocaleString('pt-BR')}`
                  : `${getCurrentGoal()} atendimentos`
                }
              </div>
              <div className="text-xs text-purple-600 mb-2">
                {goalType === 'financial' ? 'Meta Financeira' : 'Meta de Atendimentos'}
              </div>
              <div className="space-y-2">
                <div className="w-full bg-symbol-gray-200 h-2 overflow-hidden rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(goalProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-600 font-medium">
                    {goalProgress.toFixed(1)}%
                  </span>
                  <span className="text-symbol-gray-600">
                    Faltam: {goalType === 'financial' 
                      ? `R$ ${remainingToGoal.toLocaleString('pt-BR')}`
                      : `${remainingToGoal} atendimentos`
                    }
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Patent Card - Full width row */}
      <div className="w-full">
        <PatenteCard currentRevenue={profile?.faturamento_total_acumulado || 0} />
      </div>

      {/* Revenue Trend Chart */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="space-y-6">
          <div>
            <h3 className="brand-heading text-xl text-symbol-black mb-2">
              Tendência de Faturamento
            </h3>
            <div className="w-8 h-px bg-symbol-beige mb-4"></div>
            <p className="brand-body text-symbol-gray-600 text-sm">
              Evolução mensal dos últimos 6 meses
            </p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="1 1" stroke="#e5e5e5" />
                <XAxis 
                  dataKey="month" 
                  stroke="#737373"
                  fontSize={12}
                  fontWeight={300}
                />
                <YAxis 
                  stroke="#737373"
                  fontSize={12}
                  fontWeight={300}
                  tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                  labelStyle={{ color: '#070808', fontWeight: 300 }}
                  contentStyle={{ 
                    backgroundColor: '#fafafa',
                    border: '1px solid #e5e5e5',
                    borderRadius: '2px',
                    fontWeight: 300
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c5a876" 
                  strokeWidth={2}
                  dot={{ fill: '#c5a876', strokeWidth: 1, r: 4 }}
                  activeDot={{ r: 6, stroke: '#070808', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/daily-cash-flow" className="block">
          <div className="symbol-card p-6 hover:shadow-xl cursor-pointer transition-all duration-300 group shadow-lg bg-gradient-to-br from-amber-50/40 to-amber-100/20 border-amber-200/40 hover:border-amber-300/60">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100/60 flex items-center justify-center mx-auto group-hover:bg-amber-200/80 transition-colors rounded-lg">
                <Calendar className="text-amber-700 group-hover:text-amber-800 transition-colors" size={24} />
              </div>
              <div>
                <h3 className="brand-subheading text-symbol-black text-sm uppercase tracking-wider mb-2">
                  Adicionar Entrada
                </h3>
                <p className="brand-body text-symbol-gray-600 text-sm">
                  Registre um novo atendimento
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/services" className="block">
          <div className="symbol-card p-6 hover:shadow-xl cursor-pointer transition-all duration-300 group shadow-lg bg-gradient-to-br from-purple-50/40 to-purple-100/20 border-purple-200/40 hover:border-purple-300/60">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100/60 flex items-center justify-center mx-auto group-hover:bg-purple-200/80 transition-colors rounded-lg">
                <FileText className="text-purple-700 group-hover:text-purple-800 transition-colors" size={24} />
              </div>
              <div>
                <h3 className="brand-subheading text-symbol-black text-sm uppercase tracking-wider mb-2">
                  Gerenciar Serviços
                </h3>
                <p className="brand-body text-symbol-gray-600 text-sm">
                  Configure preços e custos
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/reports" className="block">
          <div className="symbol-card p-6 hover:shadow-xl cursor-pointer transition-all duration-300 group shadow-lg bg-gradient-to-br from-rose-50/40 to-rose-100/20 border-rose-200/40 hover:border-rose-300/60">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100/60 flex items-center justify-center mx-auto group-hover:bg-rose-200/80 transition-colors rounded-lg">
                <User className="text-rose-700 group-hover:text-rose-800 transition-colors" size={24} />
              </div>
              <div>
                <h3 className="brand-subheading text-symbol-black text-sm uppercase tracking-wider mb-2">
                  Ver Relatórios
                </h3>
                <p className="brand-body text-symbol-gray-600 text-sm">
                  Análise financeira detalhada
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
