import React from 'react';
import { Info } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MonthlyReportData, PieDataItem, ChartConfig } from './types/ReportTypes';
import { InfoModal } from './InfoModal';
import { ComposicaoDespesasModal, IndicadoresPerformanceModal } from './ReportModals';

interface ChartsProps { reportData: MonthlyReportData; pieData: PieDataItem[]; chartConfig: ChartConfig; formatCurrency: (v: number) => string; }

const card: React.CSSProperties = { background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '24px' };
const infoBtn = <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9090a8', display: 'flex' }}><Info size={14} /></button>;

const progressBar = (value: number, color: string, label: string, meta: string) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: '#9090a8' }}>{label}</span>
      <span style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>{value.toFixed(1)}%</span>
    </div>
    <div style={{ height: 6, background: '#1c1c26', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
      <div style={{ height: '100%', width: `${Math.min(Math.abs(value), 100)}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
    </div>
    <p style={{ fontSize: 11, color: '#606078' }}>{meta} • Atual: {value.toFixed(1)}%</p>
  </div>
);

export const Charts = ({ reportData, pieData, chartConfig, formatCurrency }: ChartsProps) => {
  const eficiencia = ((reportData.faturamento - reportData.custosDirectos) / reportData.faturamento) * 100;
  const controle = (reportData.custosDirectos / reportData.faturamento) * 100;
  const margemOp = (reportData as any).margemOperacional ?? 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>Composição das Despesas</h3>
          <InfoModal title="Composição das Despesas" trigger={infoBtn}><ComposicaoDespesasModal /></InfoModal>
        </div>
        <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 16 }} />
        <ChartContainer config={chartConfig} className="h-56 w-full max-w-sm mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius="30%" outerRadius="70%" paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="#13131a" strokeWidth={2} />)}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent formatter={(v, n) => [formatCurrency(Number(v)), n]} labelFormatter={() => ''} />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          {pieData.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#1c1c26', borderRadius: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#9090a8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#f0f0f8' }}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>Indicadores de Performance</h3>
          <InfoModal title="Indicadores de Performance" trigger={infoBtn}><IndicadoresPerformanceModal /></InfoModal>
        </div>
        <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 24 }} />
        {progressBar(eficiencia, 'linear-gradient(90deg,#00c896,#4dffd4)', 'Eficiência Operacional', 'Meta ideal: acima de 70%')}
        {progressBar(controle, 'linear-gradient(90deg,#4d9fff,#93c5fd)', 'Controle de Custos', 'Meta ideal: abaixo de 30%')}
        {progressBar(margemOp, margemOp >= 0 ? 'linear-gradient(90deg,#c9a84c,#e8c96a)' : 'linear-gradient(90deg,#ff4d6a,#fca5a5)', 'Margem Operacional', 'Meta ideal: acima de 20%')}
      </div>
    </div>
  );
};
