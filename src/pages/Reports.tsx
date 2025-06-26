import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';

// Refactored components
import { ReportHeader } from '@/components/reports/ReportHeader';
import { DateSelectors } from '@/components/reports/DateSelectors';
import { NoDataScreen } from '@/components/reports/NoDataScreen';
import { ExecutiveSummary } from '@/components/reports/ExecutiveSummary';
import { MainMetrics } from '@/components/reports/MainMetrics';
import { SecondaryMetrics } from '@/components/reports/SecondaryMetrics';
import { DetailedMetrics } from '@/components/reports/DetailedMetrics';
import { Charts } from '@/components/reports/Charts';

// Hooks
import { useChartData } from '@/components/reports/hooks/useChartData';

const Reports = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: financialSummary, isLoading: financialSummaryLoading } = useFinancialSummary(selectedMonth + 1, selectedYear);

  const isLoading = transactionsLoading || financialSummaryLoading;

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = [2022, 2023, 2024, 2025, 2026, 2027];

  // Convert financial summary data to match the expected MonthlyReportData format
  const reportData = financialSummary ? {
    // Valores base
    faturamento: financialSummary.faturamento_bruto,
    // Custos Diretos
    custosDirectos: financialSummary.custos_diretos,
    percentualCustosDirectos: financialSummary.percentuais.custos_diretos_pct,
    // Custos Indiretos (despesas indiretas + impostos + comissão + depreciação mensal)
    custosIndiretos: Number(financialSummary.custos_indiretos ?? 0),
    // Propriedades obrigatórias para compatibilidade
    comissoes: Number(financialSummary.comissoes ?? 0),
    impostos: Number(financialSummary.impostos_taxas ?? 0),
    percentualImpostos: Number(financialSummary.percentuais.impostos_pct ?? 0),
    custoOperacional: 0, // Não será exibido
    percentualCustoOperacional: 0, // Não será exibido
    // Lucro e resultado
    lucroLiquido: financialSummary.resultado_liquido,
    margemLucro: financialSummary.margem_lucro,
    // Serviços realizados e ticket médio
    ticketMedio: financialSummary.ticket_medio,
    servicosRealizados: financialSummary.servicos_realizados,
    transacoesEntrada: financialSummary.servicos_realizados,
  } : null;

  // Chart data
  const { chartConfig, pieData } = useChartData(reportData);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 animate-minimal-fade">
        <div className="animate-pulse">
          <div className="h-8 bg-symbol-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-symbol-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-symbol-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.faturamento === 0) {
    return (
      <NoDataScreen
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        months={months}
      />
    );
  }

  // Renderização dos componentes: manter apenas os cards solicitados
  return (
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 animate-minimal-fade">
      {/* Header Section */}
      <ReportHeader />

      {/* Date Filters */}
      <DateSelectors
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      {/* Executive Summary */}
      <ExecutiveSummary
        reportData={reportData}
        formatCurrency={formatCurrency}
      />

      {/* Main Metrics Grid - apenas cards solicitados */}
      <MainMetrics
        reportData={reportData}
        formatCurrency={formatCurrency}
      />

      {/* Secondary Metrics - apenas cards solicitados */}
      <SecondaryMetrics
        reportData={reportData}
        formatCurrency={formatCurrency}
      />

      {/* Charts Section - gráfico de pizza restaurado */}
      <Charts
        reportData={reportData}
        pieData={pieData}
        chartConfig={chartConfig}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Reports;