import React from 'react';

export interface MonthlyReportData {
  faturamento: number;
  custosDirectos: number;
  custoOperacional: number;
  despesasIndiretas: number;
  comissoes: number;
  impostos: number;
  lucroOperacional: number;
  lucroLiquido: number;
  margemLucro: number;
  margemOperacional: number;
  totalTransacoes: number;
  transacoesEntrada: number;
  transacoesSaida: number;
  ticketMedio: number;
  servicosRealizados: number;
  custoMateriasPrimas: number;
  percentualCustosDirectos: number;
  percentualCustoOperacional: number;
  ebitda: number;
}

export interface PieDataItem {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

export interface HistoricalDataItem {
  month: string;
  monthFull: string;
  faturamento: number;
  lucroLiquido: number;
  custosDirectos: number;
  custoOperacional: number;
  despesasIndiretas: number;
}

export interface ChartConfig {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
}
