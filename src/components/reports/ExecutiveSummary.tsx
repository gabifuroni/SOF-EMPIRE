import React from 'react';
import { Award } from 'lucide-react';
import { MonthlyReportData } from './types/ReportTypes';

interface ExecutiveSummaryProps {
  reportData: MonthlyReportData;
  formatCurrency: (value: number) => string;
}

export const ExecutiveSummary = ({ reportData, formatCurrency }: ExecutiveSummaryProps) => (
  <div className="symbol-card p-4 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-symbol-gold/10 to-symbol-beige/20 border-symbol-gold/30">
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <Award className={`w-8 h-8 lg:w-10 lg:h-10 ${reportData.margemLucro >= 15 ? 'text-green-600' : reportData.margemLucro >= 10 ? 'text-symbol-gold' : 'text-red-600'}`} />
          <div>
            <h2 className="brand-heading text-xl lg:text-2xl text-symbol-black">
              Resumo Executivo
            </h2>
            <div className="w-8 h-px bg-symbol-beige mt-1"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="text-center lg:text-left">
            <p className="brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wider mb-1">
              Faturamento Total
            </p>
            <p className="brand-heading text-xl lg:text-2xl text-symbol-black">
              {formatCurrency(reportData.faturamento)}
            </p>
          </div>
          
          <div className="text-center lg:text-left">
            <p className="brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wider mb-1">
              Resultado Líquido
            </p>
            <p className={`brand-heading text-xl lg:text-2xl ${reportData.lucroLiquido >= 0 ? 'text-symbol-black' : 'text-red-600'}`}>
              {formatCurrency(reportData.lucroLiquido)}
            </p>
          </div>
          
          <div className="text-center lg:text-left">
            <p className="brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wider mb-1">
              Margem de Lucro
            </p>
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <p className={`font-semibold text-sm lg:text-base ${reportData.margemLucro >= 15 ? 'text-green-600' : reportData.margemLucro >= 10 ? 'text-symbol-gold' : 'text-red-600'}`}>
                {reportData.margemLucro.toFixed(1)}%
              </p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                reportData.margemLucro >= 15 ? 'bg-green-100 text-green-700' : 
                reportData.margemLucro >= 10 ? 'bg-symbol-gold/20 text-symbol-gold' : 'bg-red-100 text-red-700'
              }`}>
                {reportData.margemLucro >= 15 ? 'Excelente' : reportData.margemLucro >= 10 ? 'Boa' : 'Precisa melhorar'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
