import React from 'react';
import { DollarSign, TrendingDown } from 'lucide-react';
import { MonthlyReportData } from './types/ReportTypes';
import { InfoModal } from './InfoModal';
import { FaturamentoModal, CustosDirectosModal } from './ReportModals';
import { Info } from 'lucide-react';

interface MainMetricsProps { reportData: MonthlyReportData; formatCurrency: (v: number) => string; }

const card = (color: string): React.CSSProperties => ({
  background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '20px',
  transition: 'border-color 0.2s',
});

export const MainMetrics = ({ reportData, formatCurrency }: MainMetricsProps) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
    <div style={card('#4d9fff')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77,159,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={16} style={{ color: '#4d9fff' }} /></div>
        <InfoModal title="Faturamento Bruto" trigger={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9090a8', display: 'flex' }}><Info size={14} /></button>}><FaturamentoModal /></InfoModal>
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Faturamento Bruto</div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>{formatCurrency(reportData.faturamento)}</div>
      <div style={{ fontSize: 11, color: '#4d9fff', fontWeight: 500 }}>{reportData.transacoesEntrada} transações</div>
    </div>

    <div style={card('#ff4d6a')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingDown size={16} style={{ color: '#ff4d6a' }} /></div>
        <InfoModal title="Custos Diretos" trigger={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9090a8', display: 'flex' }}><Info size={14} /></button>}><CustosDirectosModal /></InfoModal>
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Custos Diretos</div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>{formatCurrency(Number(reportData.custosDirectos))}</div>
      <div style={{ fontSize: 11, color: '#ff4d6a', fontWeight: 500 }}>{reportData.percentualCustosDirectos.toFixed(1)}% do faturamento</div>
    </div>

    <div style={card('#fbbf24')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingDown size={16} style={{ color: '#fbbf24' }} /></div>
        <InfoModal title="Custos Indiretos" trigger={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9090a8', display: 'flex' }}><Info size={14} /></button>}><span>Inclui apenas as despesas indiretas mensais.</span></InfoModal>
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Custos Indiretos</div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8' }}>{formatCurrency(reportData.despesasIndiretas || 0)}</div>
    </div>
  </div>
);
