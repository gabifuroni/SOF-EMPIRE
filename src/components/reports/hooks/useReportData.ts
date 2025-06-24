import { useMemo } from 'react';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MonthlyReportData, HistoricalDataItem } from '../types/ReportTypes';
import type { Service, MaterialCost } from '@/types';

interface Transaction {
  date: string;
  tipo_transacao: 'ENTRADA' | 'SAIDA';
  valor: number;
  category?: string | null;
  commission?: number | null;
}

interface BusinessParams {
  impostosRate?: number;
  lucroDesejado?: number;
  weightedAverageRate?: number;
  despesasDiretas?: number;
  despesasIndiretasDepreciacao?: number;
}

export const useReportData = (
  transactions: Transaction[],
  selectedMonth: number,
  selectedYear: number,
  getTotalByMonth: (monthKey: string) => number,
  services: Service[],
  getDirectExpensesTotalByMonth?: (monthKey: string) => number,
  businessParams?: BusinessParams
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

    // Calculate revenue (faturamento) - only income transactions
    const faturamento = monthTransactions
      .filter(t => t.tipo_transacao === 'ENTRADA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    // Calculate total expenses from transactions (all outgoing transactions)
    const totalExpenses = monthTransactions
      .filter(t => t.tipo_transacao === 'SAIDA')
      .reduce((sum, t) => sum + Number(t.valor), 0);    // Get indirect expenses from database for the specific month
    const despesasIndiretas = getTotalByMonth(monthKey);    // Calculate direct costs components (like in ServiceTable)
    // 1. Commissions - sum real commissions from transactions or use percentage
    const entradaTransactions = monthTransactions.filter(t => t.tipo_transacao === 'ENTRADA');
    const comissoesReais = entradaTransactions.reduce((sum, t) => {
      if (t.commission && t.commission > 0) {
        return sum + Number(t.commission);
      } else {
        // If no commission specified, calculate using percentage
        const percentualComissao = businessParams?.lucroDesejado || 10;
        return sum + (Number(t.valor) * (percentualComissao / 100));
      }
    }, 0);

    // 2. Material costs (only "FORNECEDORES" category from cash flow)
    const custoMateriasPrimas = monthTransactions
      .filter(t => t.tipo_transacao === 'SAIDA' && t.category === 'FORNECEDORES')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    // 3. Credit card fees
    const percentualCartao = businessParams?.weightedAverageRate || 3.5;
    const taxasCartao = faturamento * (percentualCartao / 100);

    // 4. Taxes
    const percentualImposto = businessParams?.impostosRate || 8;
    const impostos = faturamento * (percentualImposto / 100);

    // Calculate percentages
    const percentualComissao = faturamento > 0 ? (comissoesReais / faturamento) * 100 : 0;
    const percentualMateriasPrimas = faturamento > 0 ? (custoMateriasPrimas / faturamento) * 100 : 0;
    const percentualImpostos = faturamento > 0 ? (impostos / faturamento) * 100 : 0;

    // Total direct costs (like in ServiceTable: totalDirectCosts)
    const custosDirectos = comissoesReais + custoMateriasPrimas + taxasCartao + impostos;

    // Operational margin (like in ServiceTable: operationalMargin)
    const margemOperacionalValor = faturamento - custosDirectos;    // Operational cost (like in ServiceTable: operationalCost)
    const percentualCustoOperacional = businessParams?.despesasIndiretasDepreciacao || 15;
    const custoOperacional = (faturamento * percentualCustoOperacional) / 100;

    // Net profit (like in ServiceTable: partialProfit)
    const lucroLiquido = margemOperacionalValor - custoOperacional;

    // Calculate margins
    const margemLucro = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0;
    const margemOperacional = faturamento > 0 ? (margemOperacionalValor / faturamento) * 100 : 0;

    // Calculate EBITDA
    const ebitda = margemOperacionalValor + impostos;    // Calculate material costs from services (this is for reference, not used in main calculation)
    const custoMateriasPrimasServicos = services.reduce((total, service) => {
      const serviceMaterialCost = service.materialCosts?.reduce((materialTotal: number, material: MaterialCost) => {
        return materialTotal + material.cost;
      }, 0) || 0;
      return total + serviceMaterialCost;
    }, 0);    // Transaction metrics
    const transacoesEntrada = monthTransactions.filter(t => t.tipo_transacao === 'ENTRADA').length;
    const transacoesSaida = monthTransactions.filter(t => t.tipo_transacao === 'SAIDA').length;
    const totalTransacoes = monthTransactions.length;
    const ticketMedio = transacoesEntrada > 0 ? faturamento / transacoesEntrada : 0;
    const servicosRealizados = transacoesEntrada; // Assuming each income transaction is a service

    return {
      // Valores base
      faturamento,
      
      // Comissão
      comissoes: comissoesReais,
      percentualComissao,
      
      // Matéria Prima
      custoMateriasPrimas,
      percentualMateriasPrimas,
      
      // Cartão
      taxasCartao,
      percentualCartao,
      
      // Impostos
      impostos,
      percentualImpostos,
      
      // Totais diretos
      custosDirectos,
      percentualCustosDirectos: faturamento > 0 ? (custosDirectos / faturamento) * 100 : 0,
      
      // Margem Operacional
      lucroOperacional: margemOperacionalValor,
      margemOperacional,
      
      // Custo Operacional
      custoOperacional,
      percentualCustoOperacional,
      
      // Lucro Final
      lucroLiquido,
      margemLucro,
      
      // Outros campos existentes
      despesasIndiretas,
      totalTransacoes,
      transacoesEntrada,
      transacoesSaida,
      ticketMedio,
      servicosRealizados,
      ebitda,
    };
  }, [transactions, selectedMonth, selectedYear, getTotalByMonth, services, businessParams]);
};

export const useHistoricalData = (
  transactions: Transaction[],
  selectedMonth: number,
  selectedYear: number,
  getTotalByMonth: (monthKey: string) => number,
  getDirectExpensesTotalByMonth?: (monthKey: string) => number,
  businessParams?: BusinessParams
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
      });      const faturamento = monthTransactions
        .filter(t => t.tipo_transacao === 'ENTRADA')
        .reduce((sum, t) => sum + Number(t.valor), 0);      const despesasIndiretas = getTotalByMonth(monthKey);
      
      // Calculate direct costs like in ServiceTable
      const entradaTransactionsMonth = monthTransactions.filter(t => t.tipo_transacao === 'ENTRADA');
      const comissoesReais = entradaTransactionsMonth.reduce((sum, t) => {
        if (t.commission && t.commission > 0) {
          return sum + Number(t.commission);
        } else {
          // If no commission specified, calculate using percentage
          const percentualComissao = businessParams?.lucroDesejado || 10;
          return sum + (Number(t.valor) * (percentualComissao / 100));
        }
      }, 0);
      
      const custoMateriasPrimas = monthTransactions
        .filter(t => t.tipo_transacao === 'SAIDA' && t.category === 'FORNECEDORES')
        .reduce((sum, t) => sum + Number(t.valor), 0);
      
      const percentualCartao = businessParams?.weightedAverageRate || 3.5;
      const taxasCartao = faturamento * (percentualCartao / 100);
      
      const percentualImposto = businessParams?.impostosRate || 8;
      const impostos = faturamento * (percentualImposto / 100);
      
      const custosDirectos = comissoesReais + custoMateriasPrimas + taxasCartao + impostos;
      
      const margemOperacionalValor = faturamento - custosDirectos;
        const percentualCustoOperacional = businessParams?.despesasIndiretasDepreciacao || 15;
      const custoOperacional = (faturamento * percentualCustoOperacional) / 100;
      
      const lucroLiquido = margemOperacionalValor - custoOperacional;

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
  }, [transactions, selectedMonth, selectedYear, getTotalByMonth, businessParams]);
};
