import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, FileText, Target, Edit, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import PatenteCard from '@/components/dashboard/PatenteCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { startOfMonth, endOfMonth, subMonths, format, parse } from 'date-fns';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { usePatentes } from '@/hooks/usePatentes';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useUserGoals } from '@/hooks/useUserGoals';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    if (!adminLoading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, adminLoading, navigate]);

  const [monthlyGoal, setMonthlyGoal] = useState(10000);
  const [goalType, setGoalType] = useState<'financial' | 'attendance'>('financial');
  const [attendanceGoal, setAttendanceGoal] = useState(50);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());
  const [attendanceGoalInput, setAttendanceGoalInput] = useState(attendanceGoal.toString());

  const { profile, isLoading: profileLoading } = useProfile();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { params: businessParams, updateParams, isLoading: businessParamsLoading } = useBusinessParams();
  const { getCurrentPatente, getNextPatente, isLoading: patentesLoading } = usePatentes();
  const { goals: userGoals, saveGoals, isLoading: goalsLoading } = useUserGoals();

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthEntries = transactions.filter(entry => {
    const entryDate = parse(entry.date, 'yyyy-MM-dd', new Date());
    return entryDate >= monthStart && entryDate <= monthEnd;
  });

  const monthlyRevenue = currentMonthEntries
    .filter(e => e.tipo_transacao === 'ENTRADA')
    .reduce((sum, e) => sum + Number(e.valor), 0);

  const monthlyExpenses = currentMonthEntries
    .filter(e => e.tipo_transacao === 'SAIDA')
    .reduce((sum, e) => sum + Number(e.valor), 0);

  const estimatedProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? (estimatedProfit / monthlyRevenue) * 100 : 0;
  const expensePercentage = monthlyRevenue > 0 ? (monthlyExpenses / monthlyRevenue) * 100 : 0;
  const expectedTotalExpenses = businessParams.despesasIndiretasDepreciacao + businessParams.despesasDiretas;
  const monthlyAttendance = currentMonthEntries.filter(e => e.tipo_transacao === 'ENTRADA').length;

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(currentMonth, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const rev = transactions
      .filter(e => { const d = parse(e.date, 'yyyy-MM-dd', new Date()); return d >= start && d <= end && e.tipo_transacao === 'ENTRADA'; })
      .reduce((sum, e) => sum + Number(e.valor), 0);
    monthlyData.push({ month: format(date, 'MMM'), revenue: rev });
  }

  const getCurrentValue = () => goalType === 'financial' ? monthlyRevenue : monthlyAttendance;
  const getCurrentGoal = () => goalType === 'financial' ? monthlyGoal : attendanceGoal;
  const goalProgress = getCurrentGoal() > 0 ? (getCurrentValue() / getCurrentGoal()) * 100 : 0;
  const remainingToGoal = Math.max(0, getCurrentGoal() - getCurrentValue());

  const handleSaveGoal = async () => {
    try {
      let goalData;
      if (goalType === 'financial') {
        const newGoal = parseFloat(goalInput) || 0;
        setMonthlyGoal(newGoal);
        goalData = { tipoMeta: 'financeira' as const, valorMetaMensal: newGoal, metaAtendimentosMensal: attendanceGoal || null };
      } else {
        const newGoal = parseInt(attendanceGoalInput) || 0;
        setAttendanceGoal(newGoal);
        goalData = { tipoMeta: 'atendimentos' as const, valorMetaMensal: monthlyGoal, metaAtendimentosMensal: newGoal };
      }
      await saveGoals.mutateAsync(goalData);
      updateParams({
        monthlyGoal: goalType === 'financial' ? goalData.valorMetaMensal : monthlyGoal,
        attendanceGoal: goalType === 'attendance' ? goalData.metaAtendimentosMensal : attendanceGoal,
        goalType,
      });
      setIsEditingGoal(false);
    } catch {
      alert('Erro ao salvar meta. Tente novamente.');
    }
  };

  const handleGoalTypeChange = async (newGoalType: 'financial' | 'attendance') => {
    try {
      setGoalType(newGoalType);
      const goalData = {
        tipoMeta: newGoalType === 'financial' ? 'financeira' as const : 'atendimentos' as const,
        valorMetaMensal: monthlyGoal,
        metaAtendimentosMensal: attendanceGoal || null,
      };
      await saveGoals.mutateAsync(goalData);
      updateParams({ goalType: newGoalType });
    } catch {
      alert('Erro ao alterar tipo de meta. Tente novamente.');
    }
  };

  useEffect(() => {
    if (userGoals && !goalsLoading) {
      setGoalType(userGoals.tipoMeta === 'financeira' ? 'financial' : 'attendance');
      setMonthlyGoal(userGoals.valorMetaMensal);
      setGoalInput(userGoals.valorMetaMensal.toString());
      if (userGoals.metaAtendimentosMensal) {
        setAttendanceGoal(userGoals.metaAtendimentosMensal);
        setAttendanceGoalInput(userGoals.metaAtendimentosMensal.toString());
      } else {
        setAttendanceGoal(30);
        setAttendanceGoalInput('30');
      }
    } else if (!goalsLoading && !userGoals) {
      setGoalType('financial');
      setMonthlyGoal(15000);
      setGoalInput('15000');
      setAttendanceGoal(30);
      setAttendanceGoalInput('30');
    }
  }, [userGoals, goalsLoading]);

  useEffect(() => {
    if (businessParams.monthlyGoal && businessParams.monthlyGoal !== monthlyGoal && !userGoals) {
      setMonthlyGoal(businessParams.monthlyGoal);
      setGoalInput(businessParams.monthlyGoal.toString());
    }
    if (businessParams.attendanceGoal && businessParams.attendanceGoal !== attendanceGoal && !userGoals) {
      setAttendanceGoal(businessParams.attendanceGoal);
      setAttendanceGoalInput(businessParams.attendanceGoal.toString());
    }
    if (businessParams.goalType && businessParams.goalType !== goalType && !userGoals) {
      setGoalType(businessParams.goalType);
    }
  }, [businessParams, userGoals]);

  if (profileLoading || transactionsLoading || businessParamsLoading || patentesLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #2a2a38', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#9090a8', fontSize: 14 }}>Carregando dados...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.trim().split(' ');
    return names.length === 1 ? names[0] : `${names[0]} ${names[names.length - 1]}`;
  };
  const userName = profile?.nome_profissional_ou_salao || 'Usuário';
  const displayName = getFirstAndLastName(userName);

  const card = (style?: React.CSSProperties): React.CSSProperties => ({
    background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12,
    transition: 'border-color 0.2s', ...style,
  });

  return (
    <div style={{ padding: '24px 28px', background: '#0a0a0f', minHeight: '100%' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .dash-card { animation: fadeUp 0.4s ease both; }
        .dash-card:hover { border-color: #3a3a4a !important; }
        .action-card:hover { border-color: rgba(201,168,76,0.3) !important; background: rgba(201,168,76,0.05) !important; }
        .goal-input { background: #1c1c26; border: 1px solid #2a2a38; border-radius: 8px; padding: 8px 12px; color: #f0f0f8; font-size: 13px; outline: none; width: 100%; }
        .goal-input:focus { border-color: #c9a84c; }
      `}</style>

      {/* Alerts */}
      {monthlyRevenue > 0 && (profitMargin < businessParams.lucroDesejado || expensePercentage > expectedTotalExpenses) && (
        <div style={{ marginBottom: 20 }}>
          {profitMargin < businessParams.lucroDesejado && (
            <div style={{ background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} style={{ color: '#ff4d6a', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#ff8fa3' }}>
                <strong>Atenção:</strong> Margem de lucro atual ({profitMargin.toFixed(1)}%) está abaixo do desejado ({businessParams.lucroDesejado}%).
              </span>
            </div>
          )}
          {expensePercentage > expectedTotalExpenses && (
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#fcd34d' }}>
                <strong>Alerta:</strong> Despesas ({expensePercentage.toFixed(1)}%) ultrapassaram o esperado ({expectedTotalExpenses}%).
              </span>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="dash-card" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 6 }}>
          <h1 style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', letterSpacing: '0.02em' }}>
            Bem-vinda(o), {displayName} 👋
          </h1>
          <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg, #c9a84c, transparent)', borderRadius: 2, margin: '8px 0' }} />
          <p style={{ fontSize: 13, color: '#9090a8' }}>Visão geral do seu negócio em tempo real</p>
        </div>
      </div>

      {/* Patente Card */}
      <div className="dash-card" style={{ marginBottom: 20 }}>
        <PatenteCard currentRevenue={profile?.faturamento_total_acumulado || 0} />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { href: '/daily-cash-flow', icon: '➕', label: 'Adicionar Entrada', sub: 'Registre um novo atendimento', color: '#00c896' },
          { href: '/services', icon: '💎', label: 'Gerenciar Serviços', sub: 'Configure preços e custos', color: '#c9a84c' },
          { href: '/reports', icon: '📊', label: 'Ver Relatórios', sub: 'Análise financeira detalhada', color: '#4d9fff' },
        ].map((action, i) => (
          <Link key={i} to={action.href} style={{ textDecoration: 'none' }}>
            <div className="dash-card action-card" style={{ ...card(), padding: '20px', textAlign: 'center', cursor: 'pointer', animationDelay: `${i * 0.05}s` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${action.color}15`, border: `1px solid ${action.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 }}>
                {action.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f0f0f8', marginBottom: 4 }}>{action.label}</div>
              <div style={{ fontSize: 11, color: '#9090a8' }}>{action.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {/* Faturamento */}
        <div className="dash-card" style={{ ...card({ padding: 20 }), animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77,159,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} style={{ color: '#4d9fff' }} />
            </div>
            <span style={{ fontSize: 10, color: '#4d9fff', background: 'rgba(77,159,255,0.1)', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>Mês atual</span>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Faturamento do Mês</div>
          <div style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 600, color: '#f0f0f8' }}>
            R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Lucro */}
        <div className="dash-card" style={{ ...card({ padding: 20 }), animationDelay: '0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} style={{ color: '#00c896' }} />
            </div>
            <span style={{ fontSize: 10, color: '#00c896', background: 'rgba(0,200,150,0.1)', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>{profitMargin.toFixed(1)}% margem</span>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Lucro Estimado</div>
          <div style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 600, color: '#f0f0f8' }}>
            R$ {estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Meta */}
        <div className="dash-card" style={{ ...card({ padding: 20 }), animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={16} style={{ color: '#c9a84c' }} />
            </div>
            {!isEditingGoal && (
              <button onClick={() => setIsEditingGoal(true)} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#c9a84c', display: 'flex' }}>
                <Edit size={12} />
              </button>
            )}
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Meta do Mês</div>

          {isEditingGoal ? (
            <div>
              <RadioGroup value={goalType} onValueChange={handleGoalTypeChange} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RadioGroupItem value="financial" id="financial" />
                    <Label htmlFor="financial" style={{ fontSize: 11, color: '#f0f0f8', cursor: 'pointer' }}>Financeira</Label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RadioGroupItem value="attendance" id="attendance" />
                    <Label htmlFor="attendance" style={{ fontSize: 11, color: '#f0f0f8', cursor: 'pointer' }}>Atendimentos</Label>
                  </div>
                </div>
              </RadioGroup>
              <input
                className="goal-input"
                type="number"
                value={goalType === 'financial' ? goalInput : attendanceGoalInput}
                onChange={e => goalType === 'financial' ? setGoalInput(e.target.value) : setAttendanceGoalInput(e.target.value)}
                placeholder={goalType === 'financial' ? 'Meta financeira' : 'Nº de atendimentos'}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={handleSaveGoal} style={{ flex: 1, background: '#c9a84c', color: '#0a0a0f', border: 'none', borderRadius: 6, padding: '7px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Salvar</button>
                <button onClick={() => { setIsEditingGoal(false); setGoalInput(monthlyGoal.toString()); setAttendanceGoalInput(attendanceGoal.toString()); }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#9090a8', border: '1px solid #2a2a38', borderRadius: 6, padding: '7px', fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>
                {goalType === 'financial' ? `R$ ${getCurrentGoal().toLocaleString('pt-BR')}` : `${getCurrentGoal()} atendimentos`}
              </div>
              <div style={{ fontSize: 10, color: '#c9a84c', marginBottom: 8 }}>
                {goalType === 'financial' ? 'Meta Financeira' : 'Meta de Atendimentos'}
              </div>
              <div style={{ height: 5, background: '#1c1c26', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${Math.min(goalProgress, 100)}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c96a)', borderRadius: 99, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                <span style={{ color: '#c9a84c', fontWeight: 500 }}>{goalProgress.toFixed(1)}%</span>
                <span style={{ color: '#9090a8' }}>Faltam: {goalType === 'financial' ? `R$ ${remainingToGoal.toLocaleString('pt-BR')}` : `${remainingToGoal} atendimentos`}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="dash-card" style={{ ...card({ padding: '24px 28px' }), animationDelay: '0.25s' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'serif', fontSize: 17, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>Faturamento Mensal</h3>
          <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg, #c9a84c, transparent)', borderRadius: 2, marginBottom: 4 }} />
          <p style={{ fontSize: 12, color: '#9090a8' }}>Evolução dos últimos 6 meses</p>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
              <XAxis dataKey="month" stroke="#606078" fontSize={12} tick={{ fill: '#606078' }} />
              <YAxis stroke="#606078" fontSize={12} tick={{ fill: '#606078' }} tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                contentStyle={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, color: '#f0f0f8', fontSize: 12 }}
                labelStyle={{ color: '#9090a8' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} dot={{ fill: '#c9a84c', r: 4 }} activeDot={{ r: 6, stroke: '#e8c96a', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
