import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DateSelectors } from './DateSelectors';

interface NoDataScreenProps {
  selectedMonth: number;
  selectedYear: number;
  months: string[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const NoDataScreen = ({ 
  selectedMonth, 
  selectedYear, 
  months, 
  onMonthChange, 
  onYearChange 
}: NoDataScreenProps) => (
  <div className="space-y-8 p-6 animate-minimal-fade">
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Relatórios Mensais
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Análise completa do desempenho financeiro
        </p>
      </div>
    </div>

    {/* Date Selectors - sempre visíveis */}
    <DateSelectors
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
      onMonthChange={onMonthChange}
      onYearChange={onYearChange}
    />

    <Card className="symbol-card p-8 text-center shadow-lg bg-white border-symbol-gold/30">
      <CardContent>
        <div className="text-symbol-gray-500">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-symbol-gold/60" />
          <h3 className="brand-heading text-xl text-symbol-black mb-2">Sem dados para este período</h3>
          <p className="brand-body">Não há transações registradas para {months[selectedMonth]} de {selectedYear}.</p>
          <p className="mt-2 text-sm brand-body text-symbol-gray-600">Registre algumas transações para visualizar o relatório mensal.</p>
        </div>
      </CardContent>
    </Card>
  </div>
);
