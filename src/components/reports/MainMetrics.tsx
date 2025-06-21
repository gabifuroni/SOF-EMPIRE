import React from 'react';
import { DollarSign, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { MonthlyReportData } from './types/ReportTypes';
import { InfoModal } from './InfoModal';
import { FaturamentoModal, CustosDirectosModal, CustoOperacionalModal } from './ReportModals';
import { Info } from 'lucide-react';

interface MainMetricsProps {
  reportData: MonthlyReportData;
  formatCurrency: (value: number) => string;
}

export const MainMetrics = ({ reportData, formatCurrency }: MainMetricsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
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
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-white border-symbol-gold/30">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <BarChart3 className="text-symbol-gold" size={20} />
        <InfoModal 
          title="Despesas Indiretas" 
          trigger={
            <button className="p-2 hover:bg-symbol-gold/10 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-symbol-gold cursor-pointer" />
            </button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-symbol-gray-700 leading-relaxed">
              <strong>O que são:</strong> Gastos fixos mensais necessários para manter o negócio funcionando, independentemente do volume de vendas.
            </p>
            <div className="bg-symbol-beige/20 p-4 rounded-lg">
              <h4 className="font-semibold text-symbol-black mb-2">Exemplos:</h4>
              <ul className="text-sm text-symbol-gray-700 space-y-1">
                <li>• Aluguel e condomínio</li>
                <li>• Energia elétrica e água</li>
                <li>• Internet e telefone</li>
                <li>• Contabilidade</li>
                <li>• Limpeza e materiais de escritório</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Importância:</h4>
              <p className="text-sm text-blue-700">
                Controlar essas despesas é fundamental para manter a lucratividade, pois elas ocorrem mesmo quando não há vendas.
              </p>
            </div>
          </div>
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Custos Indiretos
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {formatCurrency(reportData.despesasIndiretas)}
      </div>
      <div className="text-xs text-symbol-gold font-medium mt-1">
        Custos mensais
      </div>
    </div>

    {/* 4. Custo Operacional */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-white border-symbol-gold/30">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <Activity className="text-symbol-gold" size={20} />
        <InfoModal 
          title="Custo Operacional" 
          trigger={
            <button className="p-2 hover:bg-symbol-gold/10 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-symbol-gold cursor-pointer" />
            </button>
          }
        >
          <CustoOperacionalModal />
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Custo Operacional
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {formatCurrency(reportData.custoOperacional)}
      </div>
      <div className="text-xs text-symbol-gold font-medium mt-1">
        {reportData.percentualCustoOperacional.toFixed(1)}% do faturamento
      </div>
    </div>

    {/* 5. Impostos Gerais */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-rose-50/50 to-rose-100/30 border-rose-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <TrendingDown className="text-rose-600" size={20} />
        <InfoModal 
          title="Impostos e Taxas" 
          trigger={
            <button className="p-2 hover:bg-rose-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-rose-600 cursor-pointer" />
            </button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-symbol-gray-700 leading-relaxed">
              <strong>O que inclui:</strong> Todos os impostos, taxas e contribuições obrigatórias incidentes sobre o faturamento.
            </p>
            <div className="bg-rose-50 p-4 rounded-lg">
              <h4 className="font-semibold text-rose-800 mb-2">Principais tipos:</h4>
              <ul className="text-sm text-rose-700 space-y-1">
                <li>• ISS: Imposto sobre serviços</li>
                <li>• Taxas de cartão e PIX</li>
              </ul>
            </div>
            <div className="bg-symbol-beige/20 p-4 rounded-lg">
              <h4 className="font-semibold text-symbol-black mb-2">Dica:</h4>
              <p className="text-sm text-symbol-gray-700">
                Consulte um contador para otimizar seu regime tributário e reduzir este percentual.
              </p>
            </div>
          </div>
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Impostos e Taxas
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {formatCurrency(reportData.impostos)}
      </div>
      <div className="text-xs text-rose-600 font-medium mt-1">
        {((reportData.impostos / reportData.faturamento) * 100).toFixed(1)}% do faturamento
      </div>
    </div>
  </div>
);
