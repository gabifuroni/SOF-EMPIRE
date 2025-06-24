import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useIndirectExpenseValues } from '@/hooks/useIndirectExpenses';
import { useDirectExpenseValues } from '@/hooks/useDirectExpenses';
import { useMaterials } from '@/hooks/useMaterials';
import { useServices } from '@/hooks/useServices';
import { useBusinessParams } from '@/hooks/useBusinessParams';

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
import { useReportData } from '@/components/reports/hooks/useReportData';
import { useChartData } from '@/components/reports/hooks/useChartData';

const Reports = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { expenses: indirectExpenses, isLoading: expensesLoading, getTotalByMonth } = useIndirectExpenseValues();
  const { expenses: directExpenses, isLoading: directExpensesLoading, getTotalByMonth: getDirectExpensesTotalByMonth } = useDirectExpenseValues();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { services, isLoading: servicesLoading } = useServices();
  const { params: businessParams, isLoading: businessParamsLoading } = useBusinessParams();

  const isLoading = transactionsLoading || expensesLoading || directExpensesLoading || materialsLoading || servicesLoading || businessParamsLoading;

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = [2022, 2023, 2024, 2025, 2026, 2027];

  // Calculate report data from real database data
  const reportData = useReportData(
    transactions,
    selectedMonth,
    selectedYear,
    getTotalByMonth,
    services,
    getDirectExpensesTotalByMonth,
    businessParams
  );

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

      {/* Main Metrics Grid */}
      <MainMetrics
        reportData={reportData}
        formatCurrency={formatCurrency}
      />

      {/* Secondary Metrics */}
      <SecondaryMetrics
        reportData={reportData}
        formatCurrency={formatCurrency}
      />

      {/* Detailed Metrics - Same as Service Table */}
      <DetailedMetrics
        reportData={reportData}
        formatCurrency={formatCurrency}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        transactions={transactions}
      />

      {/* Charts Section */}
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