import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, FileText, Target, AlertTriangle, ChevronRight } from 'lucide-react';
import PatenteCard from '@/components/dashboard/PatenteCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { startOfMonth, endOfMonth, subMonths, format, parse } from 'date-fns';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { usePatentes } from '@/hooks/usePatentes';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useMetasColaboradoras } from '@/hooks/useMetasColaboradoras';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  useEffect(() => {
    if (!adminLoading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, adminLoading, navigate]);

  const { profile, isLoading: profileLoading } = useProfile();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { params: businessParams, isLoading: businessParamsLoading } = useBusinessParams();
  const { getCurrentPatente, getNextPatente, isLoading: patentesLoading } = usePatentes();

  const now = new Date();
  const mesReferencia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { metas } = useMetasColaboradoras(mesReferencia);

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

  // Totais vindos das metas cadastradas na aba Metas
  const totalMetaFaturamento = metas.reduce((s, m) => s + (m.meta_faturamento ?? 0), 0);
  const totalMetaAtendimentos = metas.reduce((s, m) => s + (m.meta_atendimentos ?? 0), 0);
  const progressFaturamento = totalMetaFaturamento > 0 ? Math.min((monthlyRevenue / totalMetaFaturamento) * 100, 100) : 0;
  const progressAtendimentos = totalMetaAtendimentos > 0 ? Math.min((monthlyAttendance / totalMetaAtendimentos) * 100, 100) : 0;
  const hasMetas = totalMetaFaturamento > 0 || totalMetaAtendimentos > 0;

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
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', letterSpacing: '-0.01em' }}>
            Bem-vinda(o), <span className="font-feminine">{displayName}</span> 👋
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
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#f0f0f8' }}>
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
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#f0f0f8' }}>
            R$ {estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Meta */}
        <div className="dash-card" style={{ ...card({ padding: 20 }), animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={16} style={{ color: '#c9a84c' }} />
            </div>
            <Link to="/metas" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#c9a84c', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '4px 8px', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.04em' }}>
              Configurar <ChevronRight size={10} />
            </Link>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 10 }}>Metas do Mês</div>

          {!hasMetas ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 12, color: '#606078', marginBottom: 6 }}>Nenhuma meta definida</div>
              <Link to="/metas" style={{ fontSize: 11, color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>
                Definir metas →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Faturamento */}
              {totalMetaFaturamento > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                    <span style={{ color: '#9090a8' }}>Faturamento</span>
                    <span style={{ color: '#c9a84c', fontWeight: 600 }}>
                      {progressFaturamento.toFixed(0)}% · R$ {totalMetaFaturamento.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ height: 5, background: '#1c1c26', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressFaturamento}%`, background: 'linear-gradient(90deg,#c9a84c,#e8c96a)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#606078', marginTop: 3 }}>
                    R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} alcançados
                  </div>
                </div>
              )}
              {/* Atendimentos */}
              {totalMetaAtendimentos > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                    <span style={{ color: '#9090a8' }}>Atendimentos</span>
                    <span style={{ color: '#9090a8', fontWeight: 600 }}>
                      {progressAtendimentos.toFixed(0)}% · {totalMetaAtendimentos} meta
                    </span>
                  </div>
                  <div style={{ height: 5, background: '#1c1c26', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressAtendimentos}%`, background: 'linear-gradient(90deg,#6a9fff,#a0c4ff)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#606078', marginTop: 3 }}>
                    {monthlyAttendance} atendimentos realizados
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="dash-card" style={{ ...card({ padding: '24px 28px' }), animationDelay: '0.25s' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>Faturamento Mensal</h3>
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
