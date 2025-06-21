
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState, useEffect, useRef } from 'react';

interface DirectExpenseCategory {
  id: string;
  name: string;
  isCustom: boolean;
}

interface DirectExpenseValue {
  categoryId: string;
  value: number;
}

interface DirectExpensesTableProps {
  selectedMonth: string;
  selectedYear: string;
  categories: DirectExpenseCategory[];
  expenseValues: DirectExpenseValue[];
  tempExpenseValues: Record<string, number>;
  hasUnsavedChanges: boolean;
  newCategoryName: string;
  showAddCategory: boolean;
  onUpdateExpense: (categoryId: string, value: number) => void;
  onSaveExpenseValues: () => void;
  onAddNewCategory: () => void;
  onRemoveCategory: (categoryId: string) => void;
  onSetNewCategoryName: (name: string) => void;
  onSetShowAddCategory: (show: boolean) => void;
  getTempExpenseValue: (categoryId: string) => number;
  calculateMonthTotal: () => number;
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

// Component for individual expense input
const DirectExpenseInput = ({ 
  categoryId, 
  initialValue, 
  onValueChange, 
  hasChanges 
}: {
  categoryId: string;
  initialValue: number;
  onValueChange: (value: number) => void;
  hasChanges: boolean;
}) => {
  const [localValue, setLocalValue] = useState(initialValue === 0 ? '' : initialValue.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Only update when not focused and when the external value is different from what we have
  useEffect(() => {
    if (!isFocused) {
      const currentNumber = parseFloat(localValue) || 0;
      if (currentNumber !== initialValue) {
        setLocalValue(initialValue === 0 ? '' : initialValue.toString());
      }
    }
  }, [initialValue, isFocused, localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    
    // Immediately notify parent of changes
    const numericValue = parseFloat(value) || 0;
    onValueChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Clear if it's showing 0
    if (localValue === '0' || (parseFloat(localValue) || 0) === 0) {
      setLocalValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseFloat(localValue) || 0;
    
    // Update the display value
    setLocalValue(numericValue === 0 ? '' : numericValue.toString());
    
    // Final notification to parent
    onValueChange(numericValue);
  };

  return (
    <div className="relative">      
    <Input
        type="number"
        min="0"
        step="0.01"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}        className={`text-right max-w-32 ml-auto focus:border-symbol-gold ${
          hasChanges
            ? 'bg-symbol-beige/30 border-symbol-gold/50' 
            : 'bg-symbol-gray-50 border-symbol-gray-300'
        }`}
        placeholder="0,00"
      />
      {hasChanges && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-symbol-gold rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

const DirectExpensesTable = ({
  selectedMonth,
  selectedYear,
  categories,
  expenseValues,
  tempExpenseValues,
  hasUnsavedChanges,
  newCategoryName,
  showAddCategory,
  onUpdateExpense,
  onSaveExpenseValues,
  onAddNewCategory,
  onRemoveCategory,
  onSetNewCategoryName,
  onSetShowAddCategory,
  getTempExpenseValue,
  calculateMonthTotal,
}: DirectExpensesTableProps) => {
  const selectedMonthLabel = MONTHS.find(m => m.key === selectedMonth)?.label || '';

  return (
    <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Despesas Diretas - {selectedMonthLabel} - {selectedYear}
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        {hasUnsavedChanges && (
          <Button 
            onClick={onSaveExpenseValues}
            className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Categoria de Despesa</TableHead>
              <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Valor do Mês (R$)</TableHead>
              <TableHead className="w-20 text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => {
              const savedValue = expenseValues.find(ev => ev.categoryId === category.id)?.value || 0;
              const currentValue = getTempExpenseValue(category.id);
              const hasChanges = currentValue !== savedValue;
              
              return (
                <TableRow key={category.id} className={index % 2 === 0 ? 'bg-symbol-gray-50/30' : ''}>
                  <TableCell className="font-medium brand-body text-symbol-black">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <DirectExpenseInput
                      categoryId={category.id}
                      initialValue={currentValue}
                      onValueChange={(value) => onUpdateExpense(category.id, value)}
                      hasChanges={hasChanges}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {category.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveCategory(category.id)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {/* Add Category Row */}
            {showAddCategory ? (
              <TableRow className="bg-symbol-beige/20 border-2 border-dashed border-symbol-gold/40">
                <TableCell>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => onSetNewCategoryName(e.target.value)}
                    placeholder="Nome da nova categoria de despesa direta"
                    className="border-none bg-transparent focus:border-symbol-gold"
                    onKeyPress={(e) => e.key === 'Enter' && onAddNewCategory()}
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={onAddNewCategory} 
                      className="h-8 bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        onSetShowAddCategory(false);
                        onSetNewCategoryName('');
                      }}
                      className="h-8 text-symbol-gray-600 hover:text-symbol-black"
                    >
                      ✕
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => onSetShowAddCategory(true)}
                    className="border-dashed border-symbol-gold/40 text-symbol-gray-600 hover:bg-symbol-beige/20 font-light"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Nova Categoria de Despesa Direta
                  </Button>
                </TableCell>
              </TableRow>
            )}
            
            {/* Total Monthly Row */}
            <TableRow className="bg-symbol-gold/10 border-t-2 border-symbol-gold/30 font-semibold">
              <TableCell className="font-bold brand-subheading text-symbol-black">
                Total do Mês
              </TableCell>
              <TableCell className="text-right font-bold text-symbol-gold">
                R$ {calculateMonthTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DirectExpensesTable;
