import { Calendar } from 'lucide-react';

interface ExpensesHeaderProps {
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onSave?: () => void;
}

const MONTHS = [
  { key: 'january', label: 'Janeiro' }, { key: 'february', label: 'Fevereiro' },
  { key: 'march', label: 'Março' }, { key: 'april', label: 'Abril' },
  { key: 'may', label: 'Maio' }, { key: 'june', label: 'Junho' },
  { key: 'july', label: 'Julho' }, { key: 'august', label: 'Agosto' },
  { key: 'september', label: 'Setembro' }, { key: 'october', label: 'Outubro' },
  { key: 'november', label: 'Novembro' }, { key: 'december', label: 'Dezembro' },
];

const ExpensesHeader = ({ selectedYear, selectedMonth, onYearChange, onMonthChange, onSave }: ExpensesHeaderProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Gestão de Despesas</h1>
        <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
        <p style={{ fontSize: 13, color: '#9090a8' }}>Gerencie suas despesas diretas e indiretas</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#13131a', border: '1px solid #2a2a38', borderRadius: 10, padding: '6px 12px' }}>
          <Calendar size={14} style={{ color: '#9090a8' }} />
          <select
            value={selectedMonth} onChange={e => onMonthChange(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#f0f0f8', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
          >
            {MONTHS.map(m => <option key={m.key} value={m.key} style={{ background: '#1c1c26' }}>{m.label}</option>)}
          </select>
          <select
            value={selectedYear} onChange={e => onYearChange(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#f0f0f8', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
          >
            {years.map(y => <option key={y} value={y.toString()} style={{ background: '#1c1c26' }}>{y}</option>)}
          </select>
        </div>
        {onSave && (
          <button onClick={onSave} style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6520)', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora, sans-serif' }}>
            💾 Salvar Alterações
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpensesHeader;
