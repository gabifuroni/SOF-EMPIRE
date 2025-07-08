import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateSelectorsProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const DateSelectors = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }: DateSelectorsProps) => (
  <div className="symbol-card p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center gap-3">
        <label className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide font-medium">
          Período de Análise:
        </label>
      </div>
      
      <div className="flex items-center gap-3">
        <Select value={selectedMonth.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
          <SelectTrigger className="w-40 bg-white border-symbol-gold/40 hover:border-symbol-gold focus:border-symbol-gold focus:ring-symbol-gold/20 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-symbol-gold/40">
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()} className="hover:bg-symbol-gold/10 focus:bg-symbol-gold/10">
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
          <SelectTrigger className="w-28 bg-white border-symbol-gold/40 hover:border-symbol-gold focus:border-symbol-gold focus:ring-symbol-gold/20 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-symbol-gold/40">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()} className="hover:bg-symbol-gold/10 focus:bg-symbol-gold/10">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-sm text-symbol-gray-600">
        Visualizando dados de <span className="font-medium text-symbol-black">{months[selectedMonth]} de {selectedYear}</span>
      </div>
    </div>
  </div>
);
