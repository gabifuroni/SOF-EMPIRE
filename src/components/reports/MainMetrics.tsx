import React from 'react';
import { DollarSign, TrendingDown } from 'lucide-react';
import { MonthlyReportData } from './types/ReportTypes';
import { InfoModal } from './InfoModal';
import { FaturamentoModal, CustosDirectosModal } from './ReportModals';
import { Info } from 'lucide-react';

interface MainMetricsProps {
  reportData: MonthlyReportData;
  formatCurrency: (value: number) => string;
}

export const MainMetrics = ({ reportData, formatCurrency }: MainMetricsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {/* 1. Faturamento */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <DollarSign className="text-blue-600" size={20} />
        <InfoModal 
          title="Faturamento Bruto" 
          trigger={
            <button className="p-2 hover:bg-blue-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-blue-600 cursor-pointer" />
            </button>
          }
        >
          <FaturamentoModal />
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Faturamento Bruto
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {formatCurrency(reportData.faturamento)}
      </div>
      <div className="text-xs text-blue-600 font-medium mt-1">
        {reportData.transacoesEntrada} transações
      </div>
    </div>

    {/* 2. Custos Diretos */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <TrendingDown className="text-red-600" size={20} />
        <InfoModal 
          title="Custos Diretos" 
          trigger={
            <button className="p-2 hover:bg-red-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-red-600 cursor-pointer" />
            </button>
          }
        >
          <CustosDirectosModal />
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Custos Diretos
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {formatCurrency(reportData.custosDirectos)}
      </div>
      <div className="text-xs text-red-600 font-medium mt-1">
        {reportData.percentualCustosDirectos.toFixed(1)}% do faturamento
      </div>
    </div>

    {/* 3. Custos Indiretos */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 border-yellow-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <TrendingDown className="text-yellow-600" size={20} />
        <InfoModal 
          title="Custos Indiretos" 
          trigger={
            <button className="p-2 hover:bg-yellow-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-yellow-600 cursor-pointer" />
            </button>
          }
        >
          <span>Inclui despesas indiretas, impostos, comissão e depreciação mensal.</span>
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Custos Indiretos
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {formatCurrency(reportData.custosIndiretos)}
      </div>
      {/* Não exibe percentual, pois é soma composta */}
    </div>
  </div>
);
