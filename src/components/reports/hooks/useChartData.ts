import { useMemo } from 'react';
import { MonthlyReportData, PieDataItem, ChartConfig } from '../types/ReportTypes';

export const useChartData = (reportData: MonthlyReportData) => {
  const chartConfig: ChartConfig = {
    value: {
      label: "Valor (R$)",
    },
    faturamento: {
      label: "Faturamento",
      color: "#c5a876",
    },
    custosDirectos: {
      label: "Custos Diretos",
      color: "#d9d3c5",
    },
    custoOperacional: {
      label: "Custo Operacional",
      color: "#b8860b",
    },
    lucroLiquido: {
      label: "Lucro Líquido",
      color: "#070808",
    },
    despesasIndiretas: {
      label: "Despesas Indiretas",
      color: "#737373",
    },
    comissoes: {
      label: "Comissões",
      color: "#a3a3a3",
    },
    impostos: {
      label: "Impostos",
      color: "#d4d4d8",
    },
  };

  // Pie chart data for cost breakdown
  const pieData: PieDataItem[] = useMemo(() => {
    if (!reportData || reportData.faturamento === 0) return [];
    
    return [
      { 
        name: 'Custos Diretos', 
        value: reportData.custosDirectos, 
        color: '#ef4444', // Vermelho mais vibrante para custos diretos
        percentage: reportData.percentualCustosDirectos.toFixed(1)
      },
      { 
        name: 'Custo Operacional', 
        value: reportData.custoOperacional, 
        color: '#f97316', // Laranja para custo operacional
        percentage: reportData.percentualCustoOperacional.toFixed(1)
      },
      { 
        name: 'Comissões', 
        value: reportData.comissoes, 
        color: '#8b5cf6', // Roxo para comissões
        percentage: ((reportData.comissoes / reportData.faturamento) * 100).toFixed(1)
      },
      { 
        name: 'Impostos', 
        value: reportData.impostos, 
        color: '#64748b', // Cinza azulado para impostos
        percentage: ((reportData.impostos / reportData.faturamento) * 100).toFixed(1)
      },
      { 
        name: 'Lucro Líquido', 
        value: reportData.lucroLiquido, 
        color: reportData.lucroLiquido >= 0 ? '#22c55e' : '#dc2626', // Verde para lucro, vermelho para prejuízo
        percentage: reportData.margemLucro.toFixed(1)
      }
    ].filter(item => item.value > 0);
  }, [reportData]);

  // Bar chart data for monthly comparison
  const barData = useMemo(() => {
    if (!reportData) return [];
    
    const totalCosts = reportData.custosDirectos + reportData.custoOperacional + reportData.comissoes + reportData.impostos;
    
    return [
      {
        category: 'Resultado Mensal',
        faturamento: reportData.faturamento,
        custosDirectos: reportData.custosDirectos,
        custoOperacional: reportData.custoOperacional,
        comissoes: reportData.comissoes,
        impostos: reportData.impostos,
        lucroLiquido: reportData.lucroLiquido,
        totalCosts
      }
    ];
  }, [reportData]);

  return {
    chartConfig,
    pieData,
    barData
  };
};
