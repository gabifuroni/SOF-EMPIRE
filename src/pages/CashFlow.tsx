import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, ExternalLink, Calendar } from 'lucide-react';
import AddEntryModal from '@/components/cash-flow/AddEntryModal';
import CashFlowTable from '@/components/cash-flow/CashFlowTable';
import { format, parse } from 'date-fns';
import { useTransactions } from '@/hooks/useTransactions';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { CashFlowEntry } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string; date: string; description: string;
  tipo_transacao: 'ENTRADA' | 'SAIDA'; valor: number;
  payment_method?: string | null; category?: string | null;
  commission?: number | null; user_id: string;
  created_at?: string; updated_at?: string;
}

interface EntryData {
  description: string; amount: number; date: Date;
  paymentMethod?: string; category?: string; commission?: number;
}

type FilterType = 'todos' | 'entradas' | 'saidas';

const MONTHS = [
  { key: '01', label: 'Janeiro' }, { key: '02', label: 'Fevereiro' },
  { key: '03', label: 'Março' }, { key: '04', label: 'Abril' },
  { key: '05', label: 'Maio' }, { key: '06', label: 'Junho' },
  { key: '07', label: 'Julho' }, { key: '08', label: 'Agosto' },
  { key: '09', label: 'Setembro' }, { key: '10', label: 'Outubro' },
  { key: '11', label: 'Novembro' }, { key: '12', label: 'Dezembro' },
];

const CashFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('todos');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { paymentMethods } = usePaymentMethods();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  const convertedEntries: CashFlowEntry[] = transactions.map((t: Transaction) => ({
    id: t.id,
    date: parse(t.date, 'yyyy-MM-dd', new Date()),
    description: t.description,
    type: t.tipo_transacao === 'ENTRADA' ? 'entrada' as const : 'saida' as const,
    amount: t.tipo_transacao === 'ENTRADA' ? Number(t.valor) : -Math.abs(Number(t.valor)),
    paymentMethod: t.payment_method || undefined,
    category: t.category || undefined,
    commission: t.commission || undefined,
  }));

  const filteredEntries = convertedEntries.filter(entry => {
    if (filterType !== 'todos') {
      if (entry.type !== (filterType === 'entradas' ? 'entrada' : 'saida')) return false;
    }
    const entryYear = entry.date.getFullYear().toString();
    const entryMonth = (entry.date.getMonth() + 1).toString().padStart(2, '0');
    return entryYear === selectedYear && entryMonth === selectedMonth;
  });

  const totalEntradas = filteredEntries.filter(e => e.type === 'entrada').reduce((s, e) => s + e.amount, 0);
  const totalSaidas = filteredEntries.filter(e => e.type === 'saida').reduce((s, e) => s + Math.abs(e.amount), 0);
  const saldoPeriodo = totalEntradas - totalSaidas;

  const handleAddEntry = async (entryData: EntryData) => {
    try {
      await addTransaction.mutateAsync({
        description: entryData.description, valor: entryData.amount,
        tipo_transacao: 'ENTRADA', date: format(entryData.date, 'yyyy-MM-dd'),
        payment_method: entryData.paymentMethod, commission: entryData.commission || null,
      });
      setIsAddEntryModalOpen(false);
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao adicionar a entrada.', variant: 'destructive' });
    }
  };

  const handleEditEntry = async (entryData: EntryData) => {
    if (!editingEntry) return;
    try {
      await updateTransaction.mutateAsync({
        id: editingEntry.id, description: entryData.description,
        valor: entryData.amount, date: format(entryData.date, 'yyyy-MM-dd'),
        payment_method: entryData.paymentMethod, commission: entryData.commission || null,
      });
      setEditingEntry(null);
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao atualizar a entrada.', variant: 'destructive' });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try { await deleteTransaction.mutateAsync(id); } catch {}
  };

  const openEditModal = (entry: CashFlowEntry) => {
    if (entry.type === 'entrada') { setEditingEntry(entry); setIsAddEntryModalOpen(true); }
  };

  const card: React.CSSProperties = { background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12 };

  if (isLoading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #2a2a38', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .cf-card{animation:fadeUp 0.4s ease both}
        .cf-card:hover{border-color:#3a3a4a!important}
        .cf-filter-btn{background:transparent;border:1px solid #2a2a38;border-radius:20px;padding:5px 14px;font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all 0.15s;color:#9090a8;font-family:Sora, sans-serif}
        .cf-filter-btn.active{background:#c9a84c;border-color:#c9a84c;color:#0a0a0f;font-weight:600}
        .cf-filter-btn:hover:not(.active){border-color:#3a3a4a;color:#f0f0f8}
        .cf-btn-primary{background:linear-gradient(135deg,#00c896,#00a07a);color:#0a0a0f;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:opacity 0.15s;font-family:Sora, sans-serif}
        .cf-btn-primary:hover{opacity:0.9}
        .cf-btn-secondary{background:rgba(255,255,255,0.05);border:1px solid #2a2a38;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:500;color:#9090a8;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.15s;font-family:Sora, sans-serif}
        .cf-btn-secondary:hover{border-color:#3a3a4a;color:#f0f0f8}
        .cf-select{background:#1c1c26;border:1px solid #2a2a38;border-radius:8px;padding:8px 12px;color:#f0f0f8;font-size:13px;outline:none;cursor:pointer;font-family:Sora, sans-serif}
        .cf-entry-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #2a2a38;transition:background 0.12s}
        .cf-entry-row:last-child{border-bottom:none}
        .cf-entry-row:hover{background:rgba(255,255,255,0.02)}
        .cf-icon-btn{background:rgba(255,255,255,0.05);border:1px solid #2a2a38;border-radius:6px;padding:6px;cursor:pointer;color:#9090a8;display:flex;transition:all 0.15s}
        .cf-icon-btn:hover{border-color:#3a3a4a;color:#f0f0f8}
        .cf-icon-btn.danger:hover{border-color:rgba(255,77,106,0.3);color:#ff4d6a;background:rgba(255,77,106,0.08)}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Fluxo de Caixa</h1>
          <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
          <p style={{ fontSize: 13, color: '#9090a8' }}>Gerencie suas entradas e saídas financeiras</p>
        </div>

        {/* Month/Year selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#13131a', border: '1px solid #2a2a38', borderRadius: 10, padding: '6px 12px' }}>
            <Calendar size={14} style={{ color: '#9090a8' }} />
            <select className="cf-select" style={{ background: 'transparent', border: 'none', padding: 0 }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
            <select className="cf-select" style={{ background: 'transparent', border: 'none', padding: 0 }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="cf-btn-primary" onClick={() => setIsAddEntryModalOpen(true)}>
          <Plus size={16} /> Adicionar Entrada
        </button>
        <button className="cf-btn-secondary" onClick={() => navigate('/expenses')}>
          <ExternalLink size={16} /> Gerenciar Despesas
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total de Entradas', value: totalEntradas, icon: <TrendingUp size={18} style={{ color: '#00c896' }} />, color: '#00c896', bg: 'rgba(0,200,150,0.08)' },
          { label: 'Total de Saídas', value: totalSaidas, icon: <TrendingDown size={18} style={{ color: '#ff4d6a' }} />, color: '#ff4d6a', bg: 'rgba(255,77,106,0.08)', action: () => navigate('/expenses') },
          { label: 'Saldo do Período', value: saldoPeriodo, icon: <DollarSign size={18} style={{ color: saldoPeriodo >= 0 ? '#4d9fff' : '#ff4d6a' }} />, color: saldoPeriodo >= 0 ? '#4d9fff' : '#ff4d6a', bg: saldoPeriodo >= 0 ? 'rgba(77,159,255,0.08)' : 'rgba(255,77,106,0.08)' },
        ].map((item, i) => (
          <div key={i} className="cf-card" style={{ ...card, padding: 20, animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
              {item.action && <button className="cf-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={item.action}>Ver Despesas</button>}
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: item.color }}>
              R$ {Math.abs(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['todos', 'entradas', 'saidas'] as FilterType[]).map(f => (
          <button key={f} className={`cf-filter-btn ${filterType === f ? 'active' : ''}`} onClick={() => setFilterType(f)}>
            {f === 'todos' ? 'Todos' : f === 'entradas' ? 'Entradas' : 'Saídas'}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div className="cf-card" style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2a2a38' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>Lançamentos Financeiros</h3>
          <div style={{ width: 24, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginTop: 6 }} />
        </div>

        {filteredEntries.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#606078' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Nenhum lançamento encontrado</div>
            <div style={{ fontSize: 12 }}>Adicione uma entrada para começar</div>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div style={{ display: 'block' }} className="lg-hidden-block">
              <style>{`.lg-hidden-block{display:block}@media(min-width:1024px){.lg-hidden-block{display:none!important}}`}</style>
              {filteredEntries.map(entry => (
                <div key={entry.id} className="cf-entry-row" style={{ flexWrap: 'wrap' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: entry.type === 'entrada' ? 'rgba(0,200,150,0.1)' : 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {entry.type === 'entrada' ? '📈' : '📉'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f8', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</div>
                    <div style={{ fontSize: 11, color: '#9090a8' }}>{format(entry.date, 'dd/MM/yyyy')}{entry.paymentMethod && ` · ${entry.paymentMethod}`}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: entry.type === 'entrada' ? '#00c896' : '#ff4d6a' }}>
                      {entry.type === 'entrada' ? '+' : '-'} R$ {Math.abs(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    {entry.type === 'entrada' && (
                      <>
                        <button className="cf-icon-btn" onClick={() => openEditModal(entry)}><Edit size={13} /></button>
                        <button className="cf-icon-btn danger" onClick={() => handleDeleteEntry(entry.id)}><Trash2 size={13} /></button>
                      </>
                    )}
                    {entry.type === 'saida' && (
                      <button className="cf-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => navigate('/expenses')}>Ver em Despesas</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div style={{ display: 'none' }} className="lg-visible-block">
              <style>{`.lg-visible-block{display:none!important}@media(min-width:1024px){.lg-visible-block{display:block!important}}`}</style>
              <CashFlowTable entries={filteredEntries} onEdit={openEditModal} onDelete={handleDeleteEntry} />
            </div>
          </>
        )}
      </div>

      <AddEntryModal show={isAddEntryModalOpen && !editingEntry} onClose={() => setIsAddEntryModalOpen(false)} onSave={handleAddEntry} />
      {editingEntry && editingEntry.type === 'entrada' && (
        <AddEntryModal show={true} onClose={() => { setEditingEntry(null); setIsAddEntryModalOpen(false); }} onSave={handleEditEntry} entry={editingEntry} />
      )}
    </div>
  );
};

export default CashFlow;
