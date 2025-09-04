import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CashFlowHeaderProps {
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
}

const MONTHS = [
  { key: '01', label: 'Janeiro' },
  { key: '02', label: 'Fevereiro' },
  { key: '03', label: 'Março' },
  { key: '04', label: 'Abril' },
  { key: '05', label: 'Maio' },
  { key: '06', label: 'Junho' },
  { key: '07', label: 'Julho' },
  { key: '08', label: 'Agosto' },
  { key: '09', label: 'Setembro' },
  { key: '10', label: 'Outubro' },
  { key: '11', label: 'Novembro' },
  { key: '12', label: 'Dezembro' },
];

const CashFlowHeader = ({ 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange
}: CashFlowHeaderProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Fluxo de Caixa
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Gerencie suas entradas e saídas financeiras
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className='flex flex-row-reverse items-center gap-2 mb-2 sm:mb-0'>
            <Calendar className="w-7 h-7 text-symbol-gray-600" />
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-full sm:w-40 bg-symbol-gray-50 border-symbol-gray-300">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.key} value={month.key}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-full sm:w-32 bg-symbol-gray-50 border-symbol-gray-300">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CashFlowHeader;