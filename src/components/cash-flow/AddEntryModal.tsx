import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CashFlowEntry } from '@/types';
import { format } from 'date-fns';

interface AddEntryModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CashFlowEntry, 'id'>) => void;
  entry?: CashFlowEntry;
}

const AddEntryModal = ({ show, onClose, onSave, entry }: AddEntryModalProps) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    paymentMethod: '',
    client: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        description: entry.description,
        amount: entry.amount.toString(),
        paymentMethod: entry.paymentMethod || '',
        client: entry.client || ''
      });
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        amount: '',
        paymentMethod: '',
        client: ''
      });
    }
    setErrors({});
  }, [entry, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const entryData: Omit<CashFlowEntry, 'id'> = {
      date: new Date(formData.date),
      description: formData.description.trim(),
      type: 'entrada',
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      client: formData.client.trim() || undefined
    };

    onSave(entryData);
    onClose();
  };

  const paymentMethods = [
    'Dinheiro',
    'Pix',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Transferência Bancária'
  ];

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="brand-heading text-xl text-symbol-black">
            {entry ? 'Editar Entrada Financeira' : 'Adicionar Nova Entrada Financeira'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
            />
          </div>

          <div>
            <Label htmlFor="description" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Serviço de Manicure - Ana Paula"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Valor (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-1 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Forma de Pagamento *</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger className="mt-1 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          <div>
            <Label htmlFor="client" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Cliente (Opcional)</Label>
            <Input
              id="client"
              placeholder="Nome do cliente"
              value={formData.client}
              onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
              className="mt-1 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {entry ? 'Salvar Alterações' : 'Salvar Entrada'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntryModal;
