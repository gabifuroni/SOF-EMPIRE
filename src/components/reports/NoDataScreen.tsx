import React from 'react';
import { BarChart3 } from 'lucide-react';
import { DateSelectors } from './DateSelectors';

interface NoDataScreenProps {
  selectedMonth: number; selectedYear: number; months: string[];
  onMonthChange: (month: number) => void; onYearChange: (year: number) => void;
}

export const NoDataScreen = ({ selectedMonth, selectedYear, months, onMonthChange, onYearChange }: NoDataScreenProps) => (
  <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
    <div>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Relatórios Mensais</h1>
      <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
      <p style={{ fontSize: 13, color: '#9090a8' }}>Análise completa do desempenho financeiro</p>
    </div>
    <DateSelectors selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
      <BarChart3 size={48} style={{ color: 'rgba(201,168,76,0.4)', margin: '0 auto 16px' }} />
      <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>Sem dados para este período</h3>
      <p style={{ fontSize: 13, color: '#9090a8', marginBottom: 4 }}>Não há transações registradas para {months[selectedMonth]} de {selectedYear}.</p>
      <p style={{ fontSize: 12, color: '#606078' }}>Registre algumas transações para visualizar o relatório mensal.</p>
    </div>
  </div>
);
