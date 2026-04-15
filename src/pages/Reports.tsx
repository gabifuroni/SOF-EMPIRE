import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { DateSelectors } from '@/components/reports/DateSelectors';
import { NoDataScreen } from '@/components/reports/NoDataScreen';
import { ExecutiveSummary } from '@/components/reports/ExecutiveSummary';
import { MainMetrics } from '@/components/reports/MainMetrics';
import { SecondaryMetrics } from '@/components/reports/SecondaryMetrics';
import { Charts } from '@/components/reports/Charts';
import { useChartData } from '@/components/reports/hooks/useChartData';

const Reports = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: financialSummary, isLoading: financialSummaryLoading } = useFinancialSummary(selectedMonth + 1, selectedYear);
  const isLoading = transactionsLoading || financialSummaryLoading;
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const years = [2022,2023,2024,2025,2026,2027];

  const reportData = financialSummary ? {
    faturamento: financialSummary.faturamento_bruto,
    custosDirectos: financialSummary.custos_diretos,
    percentualCustosDirectos: financialSummary.percentuais.custos_diretos_pct,
    despesasIndiretas: Number(financialSummary.custos_indiretos ?? 0),
    comissoes: Number(financialSummary.comissoes ?? 0),
    impostos: Number(financialSummary.impostos_taxas ?? 0),
    percentualImpostos: Number(financialSummary.percentuais.impostos_pct ?? 0),
    custoOperacional: 0, percentualCustoOperacional: 0,
    lucroLiquido: financialSummary.resultado_liquido,
    margemLucro: financialSummary.margem_lucro,
    ticketMedio: financialSummary.ticket_medio,
    servicosRealizados: financialSummary.servicos_realizados,
    transacoesEntrada: financialSummary.servicos_realizados,
  } : null;

  const { chartConfig, pieData } = useChartData(reportData);
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 80 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ height: 120, background: '#13131a', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}
      </div>
    </div>
  );

  if (!reportData || reportData.faturamento === 0) return (
    <NoDataScreen selectedMonth={selectedMonth} selectedYear={selectedYear} months={months} onMonthChange={setSelectedMonth} onYearChange={setSelectedYear} />
  );

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ReportHeader />
      <DateSelectors selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={setSelectedMonth} onYearChange={setSelectedYear} />
      <ExecutiveSummary reportData={reportData} formatCurrency={formatCurrency} />
      <MainMetrics reportData={reportData} formatCurrency={formatCurrency} />
      <SecondaryMetrics reportData={reportData} formatCurrency={formatCurrency} />
      <Charts reportData={reportData} pieData={pieData} chartConfig={chartConfig} formatCurrency={formatCurrency} />
    </div>
  );
};

export default Reports;
