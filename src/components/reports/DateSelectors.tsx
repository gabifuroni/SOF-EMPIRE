import React from 'react';
import { Calendar } from 'lucide-react';

interface DateSelectorsProps {
  selectedMonth: number; selectedYear: number;
  onMonthChange: (month: number) => void; onYearChange: (year: number) => void;
}

const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const years = [2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030];

export const DateSelectors = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }: DateSelectorsProps) => (
  <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Calendar size={16} style={{ color: '#9090a8' }} />
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8' }}>Período:</span>
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select value={selectedMonth} onChange={e => onMonthChange(parseInt(e.target.value))}
        style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '8px 12px', color: '#f0f0f8', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        {months.map((m, i) => <option key={i} value={i} style={{ background: '#1c1c26' }}>{m}</option>)}
      </select>
      <select value={selectedYear} onChange={e => onYearChange(parseInt(e.target.value))}
        style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '8px 12px', color: '#f0f0f8', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        {years.map(y => <option key={y} value={y} style={{ background: '#1c1c26' }}>{y}</option>)}
      </select>
    </div>
    <span style={{ fontSize: 12, color: '#9090a8' }}>
      Visualizando: <strong style={{ color: '#c9a84c' }}>{months[selectedMonth]} de {selectedYear}</strong>
    </span>
  </div>
);
