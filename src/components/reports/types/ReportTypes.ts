import React from 'react';

export interface MonthlyReportData {
  // Valores base
  faturamento: number; // Preço ($)
  
  // Comissão
  comissoes: number; // Valor Comissão ($)
  percentualComissao: number; // Comissão (%)
  
  // Matéria Prima
  custoMateriasPrimas: number; // Mat. Prima ($)
  percentualMateriasPrimas: number; // Mat. Prima (%)
  
  // Cartão
  taxasCartao: number; // Cartão ($)
  percentualCartao: number; // Cartão (%)
  
  // Impostos
  impostos: number; // Imposto ($)
  percentualImpostos: number; // Imposto (%)
  
  // Totais diretos
  custosDirectos: number; // Total ($) - custos diretos
  percentualCustosDirectos: number; // Total (%) - custos diretos
  
  // Margem Operacional
  lucroOperacional: number; // Margem Op. ($)
  margemOperacional: number; // Margem Op. (%)
  
  // Custo Operacional
  custoOperacional: number; // Custo Op. ($)
  percentualCustoOperacional: number; // Custo Op. (%)
  
  // Lucro Final
  lucroLiquido: number; // Lucro Parcial ($)
  margemLucro: number; // Lucro Parcial (%)
  
  // Outros campos existentes
  despesasIndiretas: number;
  totalTransacoes: number;
  transacoesEntrada: number;
  transacoesSaida: number;
  ticketMedio: number;
  servicosRealizados: number;
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
