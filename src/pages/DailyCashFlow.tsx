import { useState, useMemo } from 'react';
import AddEntryModal from '@/components/cash-flow/AddEntryModal';
import DailyCashFlowTable from '@/components/cash-flow/DailyCashFlowTable';
import { format, isToday, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, ExternalLink, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { useNavigate } from 'react-router-dom';

const DailyCashFlow = () => {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const currentDate = new Date();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions();
  const { params, isLoading: paramsLoading } = useBusinessParams();

  const todayEntries = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(entry => {
      const entryDate = entry.date ? parse(entry.date, 'yyyy-MM-dd', new Date()) : null;
      return !!entryDate && isToday(entryDate);
    });
  }, [transactions]);

  const dailyTotals = useMemo(() => {
    const totalEntradas = todayEntries.filter(e => e.tipo_transacao === 'ENTRADA').reduce((s, e) => s + Number(e.valor || 0), 0);
    const totalSaidas = todayEntries.filter(e => e.tipo_transacao === 'SAIDA').reduce((s, e) => s + Number(e.valor || 0), 0);
    return { totalEntradas, totalSaidas, saldoDia: totalEntradas - totalSaidas };
  }, [todayEntries]);

  const dailyGoalData = useMemo(() => {
    if (paramsLoading || !params) return { dailyGoal: 0, currentProgress: 0, remainingToGoal: 0, goalLabel: '', goalUnit: '', progressPercentage: 0 };
    const workingDaysPerMonth = Math.floor(params.workingDaysPerYear / 12);
    let dailyGoal = 0, currentProgress = 0, goalLabel = '', goalUnit = '';
    if (params.goalType === 'financial') {
      dailyGoal = params.monthlyGoal / workingDaysPerMonth;
      currentProgress = dailyTotals.totalEntradas;
      goalLabel = 'Meta de Faturamento Diária'; goalUnit = 'R$';
    } else {
      dailyGoal = Math.ceil(params.attendanceGoal / workingDaysPerMonth);
      currentProgress = todayEntries.filter(e => e.tipo_transacao === 'ENTRADA').length;
      goalLabel = 'Meta de Atendimentos Diária'; goalUnit = '';
    }
    return { dailyGoal, currentProgress, remainingToGoal: Math.max(0, dailyGoal - currentProgress), goalLabel, goalUnit, progressPercentage: dailyGoal > 0 ? (currentProgress / dailyGoal) * 100 : 0 };
  }, [params, paramsLoading, dailyTotals, todayEntries]);

  const handleAddEntry = async (entryData: any) => {
    try {
      await addTransaction.mutateAsync({ description: entryData.description, valor: entryData.amount, tipo_transacao: 'ENTRADA', date: format(entryData.date, 'yyyy-MM-dd'), payment_method: entryData.paymentMethod, commission: entryData.commission ? (entryData.amount * entryData.commission) / 100 : null });
      setIsAddEntryModalOpen(false);
    } catch {}
  };

  const handleDeleteEntry = async (id: string) => { try { await deleteTransaction.mutateAsync(id); } catch {} };

  const card = (color: string, bg: string): React.CSSProperties => ({ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 20, transition: 'border-color 0.2s' });

  if (isLoading || paramsLoading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #2a2a38', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px', background: "#0f0f17", minHeight: "100%" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .dcf-card{animation:fadeUp 0.4s ease both} .dcf-card:hover{border-color:#3a3a4a!important}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Fluxo de Caixa Diário</h1>
          <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
          <p style={{ fontSize: 13, color: '#9090a8' }}>Controle suas entradas do dia {format(today, "dd/MM/yyyy", { locale: ptBR })}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setIsAddEntryModalOpen(true)} style={{ background: 'linear-gradient(135deg,#00c896,#00a07a)', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora, sans-serif' }}>
            <Plus size={16} /> Adicionar Entrada
          </button>
          <button onClick={() => navigate('/expenses')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a38', color: '#9090a8', borderRadius: 10, padding: '10px 20px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora, sans-serif' }}>
            <ExternalLink size={16} /> Gerenciar Despesas
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
        <div className="dcf-card" style={card('#00c896', 'rgba(0,200,150,0.08)')}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><TrendingUp size={16} style={{ color: '#00c896' }} /></div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Entradas do Dia</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#00c896' }}>R$ {dailyTotals.totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="dcf-card" style={card('#ff4d6a', 'rgba(255,77,106,0.08)')}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><TrendingDown size={16} style={{ color: '#ff4d6a' }} /></div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Saídas do Dia</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#ff4d6a' }}>R$ {dailyTotals.totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="dcf-card" style={card('#4d9fff', 'rgba(77,159,255,0.08)')}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77,159,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><DollarSign size={16} style={{ color: dailyTotals.saldoDia >= 0 ? '#4d9fff' : '#ff4d6a' }} /></div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Saldo do Dia</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: dailyTotals.saldoDia >= 0 ? '#f0f0f8' : '#ff4d6a' }}>R$ {dailyTotals.saldoDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        {dailyGoalData.dailyGoal > 0 && (
          <div className="dcf-card" style={card('#c9a84c', 'rgba(201,168,76,0.08)')}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Target size={16} style={{ color: '#c9a84c' }} /></div>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>{dailyGoalData.goalLabel}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>
              {dailyGoalData.goalUnit === 'R$' ? `R$ ${dailyGoalData.currentProgress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `${dailyGoalData.currentProgress} atendimentos`}
            </div>
            <div style={{ fontSize: 11, color: '#9090a8', marginBottom: 8 }}>
              Meta: {dailyGoalData.goalUnit === 'R$' ? `R$ ${dailyGoalData.dailyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `${dailyGoalData.dailyGoal} atendimentos`}
            </div>
            <div style={{ height: 5, background: '#1c1c26', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${Math.min(100, dailyGoalData.progressPercentage)}%`, background: 'linear-gradient(90deg,#c9a84c,#e8c96a)', borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>
              {dailyGoalData.remainingToGoal > 0 ? `Faltam ${dailyGoalData.goalUnit === 'R$' ? `R$ ${dailyGoalData.remainingToGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `${dailyGoalData.remainingToGoal} atend.`}` : '🎉 Meta atingida!'}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="dcf-card" style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>
              Lançamentos de Hoje — {format(today, 'dd/MM/yyyy', { locale: ptBR })}
            </h3>
            <div style={{ width: 24, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2 }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#9090a8' }}>{todayEntries.length} lançamento{todayEntries.length !== 1 ? 's' : ''} hoje</div>
            {dailyGoalData.dailyGoal > 0 && <div style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>Progresso: {dailyGoalData.progressPercentage.toFixed(1)}%</div>}
          </div>
        </div>
        <DailyCashFlowTable todayEntries={todayEntries} today={today} onDeleteEntry={handleDeleteEntry} />
      </div>

      <AddEntryModal show={isAddEntryModalOpen} onClose={() => setIsAddEntryModalOpen(false)} onSave={handleAddEntry} defaultDate={currentDate} />
    </div>
  );
};

export default DailyCashFlow;
