import { useMemo } from 'react';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MonthlyReportData, HistoricalDataItem } from '../types/ReportTypes';
import type { Service, MaterialCost } from '@/types';

interface Transaction {
  date: string;
  tipo_transacao: 'ENTRADA' | 'SAIDA';
  valor: number;
}

interface BusinessParams {
  impostosRate?: number;
}

export const useReportData = (
  transactions: Transaction[],
  selectedMonth: number,
  selectedYear: number,
  getTotalByMonth: (monthKey: string) => number,
  services: Service[]
): MonthlyReportData => {
  return useMemo((): MonthlyReportData => {
    const targetDate = new Date(selectedYear, selectedMonth, 1);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const monthKey = format(targetDate, 'yyyy-MM');

    // Filter transactions for the selected month
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    // Calculate revenue (faturamento)
    const faturamento = monthTransactions
      .filter(t => t.tipo_transacao === 'ENTRADA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    // Calculate total expenses from transactions
    const totalExpenses = monthTransactions
      .filter(t => t.tipo_transacao === 'SAIDA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    // Get indirect expenses from database for the specific month
    const despesasIndiretas = getTotalByMonth(monthKey);    // Calculate material costs (raw materials used in services)
    const custoMateriasPrimas = services.reduce((total, service) => {
      const serviceMaterialCost = service.materialCosts?.reduce((materialTotal: number, material: MaterialCost) => {
        return materialTotal + material.cost; // Using the 'cost' property from MaterialCost
      }, 0) || 0;
      return total + serviceMaterialCost;
    }, 0);

    // Calculate direct costs (materials + direct labor)
    // Using default percentages since these fields don't exist in BusinessParams
    const percentualCustosDirectos = 25; // 25% default
    const custosDirectos = custoMateriasPrimas + (faturamento * (percentualCustosDirectos / 100));

    // Calculate operational cost (indirect expenses + admin costs)
    const percentualCustoOperacional = 15; // 15% default
    const custoOperacional = despesasIndiretas + (faturamento * (percentualCustoOperacional / 100));

    // Calculate commissions based on business params
    const percentualComissao = 10; // 10% default
    const comissoes = faturamento * (percentualComissao / 100);

    // Calculate taxes based on business params
    const percentualImposto = 8; // 8% default
    const impostos = faturamento * (percentualImposto / 100);

    // Calculate profits
    const lucroOperacional = faturamento - custosDirectos - custoOperacional;
    const lucroLiquido = faturamento - custosDirectos - custoOperacional - comissoes - impostos;
    
    // Calculate margins
    const margemLucro = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0;
    const margemOperacional = faturamento > 0 ? (lucroOperacional / faturamento) * 100 : 0;

    // Calculate EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)
    const ebitda = lucroOperacional + impostos;

    // Transaction metrics
    const transacoesEntrada = monthTransactions.filter(t => t.tipo_transacao === 'ENTRADA').length;
    const transacoesSaida = monthTransactions.filter(t => t.tipo_transacao === 'SAIDA').length;
    const totalTransacoes = monthTransactions.length;
    const ticketMedio = transacoesEntrada > 0 ? faturamento / transacoesEntrada : 0;
    const servicosRealizados = transacoesEntrada; // Assuming each income transaction is a service

    return {
      faturamento,
      custosDirectos,
      custoOperacional,
      despesasIndiretas,
      comissoes,
      impostos,
      lucroOperacional,
      lucroLiquido,
      margemLucro,
      margemOperacional,
      totalTransacoes,
      transacoesEntrada,
      transacoesSaida,
      ticketMedio,
      servicosRealizados,
      custoMateriasPrimas,
      percentualCustosDirectos: faturamento > 0 ? (custosDirectos / faturamento) * 100 : 0,
      percentualCustoOperacional: faturamento > 0 ? (custoOperacional / faturamento) * 100 : 0,
      ebitda,
    };
  }, [transactions, selectedMonth, selectedYear, getTotalByMonth, services]);
};

export const useHistoricalData = (
  transactions: Transaction[],
  selectedMonth: number,
  selectedYear: number,
  getTotalByMonth: (monthKey: string) => number,
  params?: BusinessParams
): HistoricalDataItem[] => {
  return useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(selectedYear, selectedMonth, 1), i);
      const monthKey = format(date, 'yyyy-MM');
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const faturamento = monthTransactions
        .filter(t => t.tipo_transacao === 'ENTRADA')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      const despesasIndiretas = getTotalByMonth(monthKey);
      const percentualCustosDirectos = 25;
      const percentualCustoOperacional = 15;
      const custosDirectos = faturamento * (percentualCustosDirectos / 100);
      const custoOperacional = despesasIndiretas + (faturamento * (percentualCustoOperacional / 100));
      const comissoes = faturamento * (10 / 100);
      const impostos = faturamento * ((params?.impostosRate || 8) / 100);
      const lucroLiquido = faturamento - custosDirectos - custoOperacional - comissoes - impostos;

      months.push({
        month: format(date, 'MMM', { locale: ptBR }),
        monthFull: format(date, 'MMMM yyyy', { locale: ptBR }),
        faturamento,
        lucroLiquido,
        custosDirectos,
        custoOperacional,
        despesasIndiretas,
      });
    }
    return months;
  }, [transactions, selectedMonth, selectedYear, getTotalByMonth, params]);
};
