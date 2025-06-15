
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';

interface DirectExpense {
  id: string;
  rateioPercent: number;
  rateioValue: number;
  productValue: number;
  cardTaxPercent: number;
  cardValue: number;
  taxPercent: number;
  taxValue: number;
  total: number;
  percentage: number;
}

interface DirectExpensesTableProps {
  directExpenses: DirectExpense[];
  selectedMonth: string;
  selectedYear: string;
  onUpdateDirectExpense: (id: string, field: keyof DirectExpense, value: number) => void;
  onAddDirectExpense: () => void;
  onRemoveDirectExpense: (id: string) => void;
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

const DirectExpensesTable = ({
  directExpenses,
  selectedMonth,
  selectedYear,
  onUpdateDirectExpense,
  onAddDirectExpense,
  onRemoveDirectExpense,
}: DirectExpensesTableProps) => {
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, boolean>>({});
  const selectedMonthLabel = MONTHS.find(m => m.key === selectedMonth)?.label || '';

  const toggleFixedExpense = (id: string, isFixed: boolean) => {
    setFixedExpenses(prev => ({
      ...prev,
      [id]: isFixed
    }));
  };

  return (
    <div className="bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg border border-symbol-gray-200">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Despesas Diretas - {selectedMonthLabel} - {selectedYear}
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        <Button
          onClick={onAddDirectExpense}
          className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-2 px-4 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Linha
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wide">Comissão/Rateio (%)</TableHead>
              <TableHead className="text-center brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wide">Taxa de cartão (%)</TableHead>
              <TableHead className="text-center brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wide">Imposto (%)</TableHead>
              <TableHead className="text-center brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wide">Valor Fixo</TableHead>
              <TableHead className="w-16 text-center brand-subheading text-symbol-gray-700 text-xs uppercase tracking-wide">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directExpenses.map((expense, index) => (
              <TableRow key={expense.id} className={index % 2 === 0 ? 'bg-symbol-gray-50/30' : ''}>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={expense.rateioPercent || ''}
                    onChange={(e) => onUpdateDirectExpense(expense.id, 'rateioPercent', parseFloat(e.target.value) || 0)}
                    className="text-center w-24 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-sm"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={expense.cardTaxPercent || ''}
                    onChange={(e) => onUpdateDirectExpense(expense.id, 'cardTaxPercent', parseFloat(e.target.value) || 0)}
                    className="text-center w-24 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-sm"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={expense.taxPercent || ''}
                    onChange={(e) => onUpdateDirectExpense(expense.id, 'taxPercent', parseFloat(e.target.value) || 0)}
                    className="text-center w-24 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-sm"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={fixedExpenses[expense.id] || false}
                      onCheckedChange={(checked) => toggleFixedExpense(expense.id, checked as boolean)}
                      className="data-[state=checked]:bg-symbol-gold data-[state=checked]:border-symbol-gold border-2 border-symbol-gray-400 w-5 h-5"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDirectExpense(expense.id)}
                    className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DirectExpensesTable;
