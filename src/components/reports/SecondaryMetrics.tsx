import React from 'react';
import { Target, TrendingUp, Calculator, Wrench, Info } from 'lucide-react';
import { MonthlyReportData } from './types/ReportTypes';
import { InfoModal } from './InfoModal';
import { MargemLucroModal, ResultadoLiquidoModal } from './ReportModals';

interface SecondaryMetricsProps { reportData: MonthlyReportData; formatCurrency: (v: number) => string; }

export const SecondaryMetrics = ({ reportData, formatCurrency }: SecondaryMetricsProps) => {
  const margemColor = reportData.margemLucro >= 15 ? '#00c896' : reportData.margemLucro >= 10 ? '#c9a84c' : '#ff4d6a';
  const margemLabel = reportData.margemLucro >= 15 ? 'Excelente' : reportData.margemLucro >= 10 ? 'Boa' : 'Precisa melhorar';
  const card: React.CSSProperties = { background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 20, transition: 'border-color 0.2s' };
  const infoBtn = <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9090a8', display: 'flex' }}><Info size={14} /></button>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(167,139,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={16} style={{ color: '#a78bfa' }} /></div>
          <InfoModal title="Margem de Lucro" trigger={infoBtn}><MargemLucroModal /></InfoModal>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Margem de Lucro</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>{reportData.margemLucro.toFixed(1)}%</div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: `${margemColor}15`, color: margemColor }}>{margemLabel}</span>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={16} style={{ color: reportData.lucroLiquido >= 0 ? '#00c896' : '#ff4d6a' }} /></div>
          <InfoModal title="Resultado Líquido" trigger={infoBtn}><ResultadoLiquidoModal /></InfoModal>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Resultado Líquido</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: reportData.lucroLiquido >= 0 ? '#00c896' : '#ff4d6a', marginBottom: 4 }}>{formatCurrency(reportData.lucroLiquido)}</div>
        <div style={{ fontSize: 11, color: reportData.lucroLiquido >= 0 ? '#00c896' : '#ff4d6a', fontWeight: 500 }}>{reportData.margemLucro.toFixed(1)}% margem</div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calculator size={16} style={{ color: '#22d3ee' }} /></div>
          <InfoModal title="Ticket Médio" trigger={infoBtn}><div style={{ fontSize: 13, color: '#9090a8' }}>Valor médio por transação no período selecionado.</div></InfoModal>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Ticket Médio</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>{formatCurrency(reportData.ticketMedio)}</div>
        <div style={{ fontSize: 11, color: '#22d3ee', fontWeight: 500 }}>Por transação</div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wrench size={16} style={{ color: '#14b8a6' }} /></div>
          <InfoModal title="Serviços Realizados" trigger={infoBtn}><div style={{ fontSize: 13, color: '#9090a8' }}>Número total de serviços prestados no período.</div></InfoModal>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Serviços Realizados</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>{reportData.servicosRealizados}</div>
        <div style={{ fontSize: 11, color: '#14b8a6', fontWeight: 500 }}>No período</div>
      </div>
    </div>
  );
};
