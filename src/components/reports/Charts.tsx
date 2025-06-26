import React from 'react';
import { Info } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MonthlyReportData, PieDataItem, ChartConfig } from './types/ReportTypes';
import { InfoModal } from './InfoModal';
import { ComposicaoDespesasModal, IndicadoresPerformanceModal } from './ReportModals';

interface ChartsProps {
  reportData: MonthlyReportData;
  pieData: PieDataItem[];
  chartConfig: ChartConfig;
  formatCurrency: (value: number) => string;
}

export const Charts = ({ reportData, pieData, chartConfig, formatCurrency }: ChartsProps) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
    {/* Expense Composition Chart */}
    <div className="symbol-card p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-3 sm:mb-4 lg:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="brand-heading text-lg lg:text-xl text-symbol-black">
            Composição das Despesas
          </h3>
          <InfoModal 
            title="Composição das Despesas" 
            trigger={
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation">
                <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-symbol-gray-700 cursor-pointer" />
              </button>
            }
          >
            <ComposicaoDespesasModal />
          </InfoModal>
        </div>
        <p className="text-xs lg:text-sm text-symbol-gray-600 mb-4">
          Distribuição percentual do faturamento entre custos operacionais, diretos e lucro líquido
        </p>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>
      <div className="flex justify-center items-center">
        <ChartContainer config={chartConfig} className="h-56 sm:h-64 lg:h-72 w-full max-w-md mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="70%"
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [formatCurrency(Number(value)), name]}
                  labelFormatter={() => ''}
                />}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 border border-white shadow-sm" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-symbol-gray-700 font-medium truncate">
                {item.name}
              </span>
              <span className="text-symbol-gray-600 font-semibold ml-auto">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
        
        {/* Resumo visual para mobile */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100 sm:hidden">
          <div className="text-center">
            <p className="text-xs text-symbol-gray-600 mb-1">Distribuição do Faturamento</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-red-600 font-medium">
                Custos: {Number((reportData.percentualCustosDirectos ?? 0) + (reportData.percentualCustoOperacional ?? 0)).toFixed(1)}%
              </span>
              <span className="text-purple-600 font-medium">
                Deduções: {Number(((Number(reportData.comissoes ?? 0) + Number(reportData.impostos ?? 0)) / Number(reportData.faturamento ?? 1)) * 100).toFixed(1)}%
              </span>
              <span className={`font-bold ${Number(reportData.lucroLiquido ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Lucro: {Number(reportData.margemLucro ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Performance Indicators */}
    <div className="symbol-card p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-3 sm:mb-4 lg:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="brand-heading text-lg lg:text-xl text-symbol-black">
            Indicadores de Performance
          </h3>
          <InfoModal 
            title="Indicadores de Performance" 
            trigger={
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation">
                <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-symbol-gray-700 cursor-pointer" />
              </button>
            }
          >
            <IndicadoresPerformanceModal />
          </InfoModal>
        </div>
        <p className="text-xs lg:text-sm text-symbol-gray-600 mb-4">
          Métricas essenciais para avaliar a saúde financeira e eficiência operacional
        </p>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
            <span className="brand-body text-symbol-gray-700 text-sm lg:text-base">Eficiência Operacional</span>
            <span className="brand-heading text-symbol-black text-lg lg:text-xl">
              {Number(((Number(reportData.faturamento ?? 0) - Number(reportData.custosDirectos ?? 0)) / Number(reportData.faturamento ?? 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((reportData.faturamento - reportData.custosDirectos) / reportData.faturamento * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-symbol-gray-500 mt-1">
            Meta ideal: acima de 70% • Atual: {Number(((Number(reportData.faturamento ?? 0) - Number(reportData.custosDirectos ?? 0)) / Number(reportData.faturamento ?? 1)) * 100).toFixed(1)}%
          </p>
        </div>
        
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
            <span className="brand-body text-symbol-gray-700 text-sm lg:text-base">Controle de Custos</span>
            <span className="brand-heading text-symbol-black text-lg lg:text-xl">
              {Number((Number(reportData.custosDirectos ?? 0) / Number(reportData.faturamento ?? 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(reportData.custosDirectos / reportData.faturamento * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-symbol-gray-500 mt-1">
            Meta ideal: abaixo de 30% • Atual: {Number((Number(reportData.custosDirectos ?? 0) / Number(reportData.faturamento ?? 1)) * 100).toFixed(1)}%
          </p>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
            <span className="brand-body text-symbol-gray-700 text-sm lg:text-base">Margem Operacional</span>
            <span className="brand-heading text-symbol-black text-lg lg:text-xl">
              {Number(reportData.margemOperacional ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${reportData.margemOperacional >= 0 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
              style={{ width: `${Math.min(Math.abs(reportData.margemOperacional), 100)}%` }}
            />
          </div>
          <p className="text-xs text-symbol-gray-500 mt-1">
            Meta ideal: acima de 20% • Atual: {Number(reportData.margemOperacional ?? 0).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  </div>
);
