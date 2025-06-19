
import { Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpensesHeaderProps {
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onSave: () => void;
}

const MONTHS = [
  { key: 'january', label: 'Janeiro' },
  { key: 'february', label: 'Fevereiro' },
  { key: 'march', label: 'Março' },
  { key: 'april', label: 'Abril' },
  { key: 'may', label: 'Maio' },
  { key: 'june', label: 'Junho' },
  { key: 'july', label: 'Julho' },
  { key: 'august', label: 'Agosto' },
  { key: 'september', label: 'Setembro' },
  { key: 'october', label: 'Outubro' },
  { key: 'november', label: 'Novembro' },
  { key: 'december', label: 'Dezembro' },
];

const ExpensesHeader = ({ 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange, 
  onSave 
}: ExpensesHeaderProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Gestão de Despesas
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Gerencie suas despesas diretas e indiretas
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
        
        <Button 
          onClick={onSave}
          className="w-full sm:w-auto bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default ExpensesHeader;
