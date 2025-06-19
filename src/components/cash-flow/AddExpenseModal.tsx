import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CashFlowEntry } from '@/types';
import { format } from 'date-fns';

interface AddExpenseModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (expense: Omit<CashFlowEntry, 'id'>) => void;
  entry?: CashFlowEntry;
  defaultDate?: Date;
}

const AddExpenseModal = ({ show, onClose, onSave, entry, defaultDate }: AddExpenseModalProps) => {
  const [formData, setFormData] = useState({
    date: format(defaultDate || new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    category: '',
    supplier: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        description: entry.description,
        amount: entry.amount.toString(),
        category: entry.category || '',
        supplier: entry.supplier || ''
      });
    } else {
      setFormData({
        date: format(defaultDate || new Date(), 'yyyy-MM-dd'),
        description: '',
        amount: '',
        category: '',
        supplier: ''
      });
    }
    setErrors({});
  }, [entry, show, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expenseData: Omit<CashFlowEntry, 'id'> = {
      date: new Date(formData.date),
      description: formData.description.trim(),
      type: 'saida',
      amount: parseFloat(formData.amount),
      category: formData.category,
      supplier: formData.supplier.trim() || undefined
    };

    onSave(expenseData);
    onClose();
  };

  const categories = [
    'Aluguel',
    'Fornecedores',
    'Marketing',
    'Impostos',
    'Salários',
    'Equipamentos',
    'Materiais de Limpeza',
    'Energia Elétrica',
    'Telefone/Internet',
    'Outras Despesas'
  ];

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="brand-heading text-xl text-symbol-black">
            {entry ? 'Editar Saída Financeira' : 'Adicionar Nova Saída Financeira'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Data
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige text-symbol-black"
              readOnly={!!defaultDate}
              title={defaultDate ? "Data fixada para o dia atual" : "Selecione a data"}
            />
            {defaultDate && (
              <p className="text-xs text-symbol-gray-600 mt-1">
                Data fixada para hoje - {format(defaultDate, 'dd/MM/yyyy')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Descrição *
            </Label>
            <Input
              id="description"
              placeholder="Ex: Compra de Esmaltes - Fornecedor Beauty"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige text-symbol-black"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Valor (R$) *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige text-symbol-black"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Categoria da Despesa *
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <Label htmlFor="supplier" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Fornecedor (Opcional)
            </Label>
            <Input
              id="supplier"
              placeholder="Nome do fornecedor"
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige text-symbol-black"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-light transition-all duration-300"
            >
              {entry ? 'Salvar Alterações' : 'Salvar Saída'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50 font-light"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
