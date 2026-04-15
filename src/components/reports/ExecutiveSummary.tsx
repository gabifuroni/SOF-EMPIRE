import React from 'react';
import { Award } from 'lucide-react';
import { MonthlyReportData } from './types/ReportTypes';

interface ExecutiveSummaryProps { reportData: MonthlyReportData; formatCurrency: (v: number) => string; }

export const ExecutiveSummary = ({ reportData, formatCurrency }: ExecutiveSummaryProps) => {
  const color = reportData.margemLucro >= 15 ? '#00c896' : reportData.margemLucro >= 10 ? '#c9a84c' : '#ff4d6a';
  const label = reportData.margemLucro >= 15 ? 'Excelente' : reportData.margemLucro >= 10 ? 'Boa' : 'Precisa melhorar';
  return (
    <div style={{ background: 'linear-gradient(135deg,#16141f 0%,#13131a 60%,#1a1520 100%)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Award size={24} style={{ color }} />
        <h2 style={{ fontFamily: 'serif', fontSize: 18, fontWeight: 600, color: '#f0f0f8' }}>Resumo Executivo</h2>
        <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
        {[
          { label: 'Faturamento Total', value: formatCurrency(reportData.faturamento), color: '#f0f0f8' },
          { label: 'Resultado Líquido', value: formatCurrency(reportData.lucroLiquido), color: reportData.lucroLiquido >= 0 ? '#00c896' : '#ff4d6a' },
          { label: 'Margem de Lucro', value: `${reportData.margemLucro.toFixed(1)}%`, color, badge: label },
        ].map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 600, color: item.color, marginBottom: item.badge ? 6 : 0 }}>{item.value}</div>
            {item.badge && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: `${color}15`, color }}>{item.badge}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
