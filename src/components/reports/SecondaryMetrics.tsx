import React from 'react';
import { Target, TrendingUp, Calculator, Wrench } from 'lucide-react';
import { MonthlyReportData } from './types/ReportTypes';
import { InfoModal } from './InfoModal';
import { MargemLucroModal, ResultadoLiquidoModal } from './ReportModals';
import { Info } from 'lucide-react';

interface SecondaryMetricsProps {
  reportData: MonthlyReportData;
  formatCurrency: (value: number) => string;
}

export const SecondaryMetrics = ({ reportData, formatCurrency }: SecondaryMetricsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
    {/* 1. Margem de Lucro */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <Target className="text-purple-600" size={20} />
        <InfoModal 
          title="Margem de Lucro" 
          trigger={
            <button className="p-2 hover:bg-purple-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-purple-600 cursor-pointer" />
            </button>
          }
        >
          <MargemLucroModal />
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Margem de Lucro
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {reportData.margemLucro.toFixed(1)}%
      </div>
      <div className={`text-xs font-medium mt-1 ${reportData.margemLucro >= 15 ? 'text-green-600' : reportData.margemLucro >= 10 ? 'text-symbol-gold' : 'text-red-600'}`}>
        {reportData.margemLucro >= 15 ? 'Excelente' : reportData.margemLucro >= 10 ? 'Boa' : 'Precisa melhorar'}
      </div>
    </div>

    {/* 2. Resultado Líquido */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <TrendingUp className={`${reportData.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`} size={20} />
        <InfoModal 
          title="Resultado Líquido" 
          trigger={
            <button className="p-2 hover:bg-emerald-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-emerald-600 cursor-pointer" />
            </button>
          }
        >
          <ResultadoLiquidoModal />
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Resultado Líquido
        </h3>
      </div>
      <div className={`brand-heading text-lg lg:text-2xl ${reportData.lucroLiquido >= 0 ? 'text-symbol-black' : 'text-red-600'}`}>
        {formatCurrency(reportData.lucroLiquido)}
      </div>
      <div className={`text-xs font-medium mt-1 ${reportData.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {reportData.margemLucro.toFixed(1)}% margem
      </div>
    </div>

    {/* 3. Ticket Médio */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-cyan-50/50 to-cyan-100/30 border-cyan-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <Calculator className="text-cyan-600" size={20} />
        <InfoModal 
          title="Ticket Médio" 
          trigger={
            <button className="p-2 hover:bg-cyan-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-cyan-600 cursor-pointer" />
            </button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-symbol-gray-700 leading-relaxed">
              <strong>O que é:</strong> Valor médio por transação de entrada (venda) no período selecionado.
            </p>
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h4 className="font-semibold text-cyan-800 mb-2">Fórmula:</h4>
              <p className="text-sm text-cyan-700 font-mono">
                Faturamento Total ÷ Número de Transações
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Use para:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Avaliar a qualidade das vendas</li>
                <li>• Comparar performance entre períodos</li>
                <li>• Definir estratégias de precificação</li>
              </ul>
            </div>
          </div>
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Ticket Médio
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {formatCurrency(reportData.ticketMedio)}
      </div>
      <div className="text-xs text-cyan-600 font-medium mt-1">
        Por transação
      </div>
    </div>

    {/* 4. Serviços Realizados */}
    <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-teal-50/50 to-teal-100/30 border-teal-200/50">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <Wrench className="text-teal-600" size={20} />
        <InfoModal 
          title="Serviços Realizados" 
          trigger={
            <button className="p-2 hover:bg-teal-100 rounded-full transition-colors touch-manipulation">
              <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-teal-600 cursor-pointer" />
            </button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-symbol-gray-700 leading-relaxed">
              <strong>O que representa:</strong> Número total de serviços prestados no período, baseado nas transações de entrada.
            </p>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h4 className="font-semibold text-teal-800 mb-2">Importância:</h4>
              <p className="text-sm text-teal-700">
                Mostra a produtividade e volume de trabalho executado no período.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Análise:</h4>
              <p className="text-sm text-blue-700">
                Compare com meses anteriores para identificar tendências de crescimento ou sazonalidade.
              </p>
            </div>
          </div>
        </InfoModal>
      </div>
      <div className="mb-2">
        <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
          Serviços Realizados
        </h3>
      </div>
      <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
        {reportData.servicosRealizados}
      </div>
      <div className="text-xs text-teal-600 font-medium mt-1">
        No período
      </div>
    </div>
  </div>
);
