
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CashFlowEntry } from '@/types';
import { format, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface AddEntryModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CashFlowEntry, 'id'>) => void;
  entry?: CashFlowEntry;
  defaultDate?: Date;
}

interface Service {
  id: string;
  name: string;
  sale_price: number;
}

const AddEntryModal = ({ show, onClose, onSave, entry, defaultDate }: AddEntryModalProps) => {  const [formData, setFormData] = useState({
    date: format(defaultDate || new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    paymentMethod: '',
    client: '',
    commission: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Load services from database
  useEffect(() => {
    const loadServices = async () => {
      if (!show) return;
      
      setLoadingServices(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data, error } = await supabase
          .from('servicos')
          .select('id, name, sale_price')
          .eq('user_id', user.user.id)
          .order('name');

        if (error) {
          console.error('Error loading services:', error);
          return;
        }

        setServices(data || []);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [show]);  useEffect(() => {
    if (entry) {
      setFormData({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        description: entry.description,
        amount: entry.amount.toString(),
        paymentMethod: entry.paymentMethod || '',
        client: entry.client || '',
        commission: entry.commission && entry.amount > 0 ? ((entry.commission / entry.amount) * 100).toString() : ''
      });
  } else {
      setFormData({
        date: format(defaultDate || new Date(), 'yyyy-MM-dd'),
        description: '',
        amount: '',
        paymentMethod: '',
        client: '',
        commission: ''
      });
      setSelectedServices([]);
    }
    setErrors({});
  }, [entry, show, defaultDate]);

  const handleServiceToggle = (serviceId: string, serviceName: string, servicePrice: number) => {
    setSelectedServices(prev => {
      const isSelected = prev.includes(serviceId);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.filter(id => id !== serviceId);
      } else {
        newSelection = [...prev, serviceId];
      }

      // Update description and amount based on selected services
      const selectedServicesList = services.filter(s => newSelection.includes(s.id));
      const totalAmount = selectedServicesList.reduce((sum, s) => sum + s.sale_price, 0);
      const serviceNames = selectedServicesList.map(s => s.name).join(', ');

      setFormData(prev => ({
        ...prev,
        description: serviceNames || prev.description,
        amount: totalAmount > 0 ? totalAmount.toString() : prev.amount
      }));

      return newSelection;
    });
  };

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

    // Parse the date as local to avoid timezone shifts (e.g., -1 day)
    const parsedDate = parse(formData.date, 'yyyy-MM-dd', new Date());

    const entryData: Omit<CashFlowEntry, 'id'> = {
      date: parsedDate,
      description: formData.description.trim(),
      type: 'entrada',
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      client: formData.client.trim() || undefined,
      commission: formData.commission ? (parseFloat(formData.amount) * parseFloat(formData.commission)) / 100 : undefined
    };

    onSave(entryData);
    onClose();
  };
  const paymentMethods = [
    'Dinheiro',
    'Pix',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Crédito Parcelado',
    'Transferência Bancária'
  ];

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
              title={"Selecione a data"}
            />
            {/* Mantém a data sugerida, mas permite alteração */}
          </div>

          {/* Services Selection */}
          {services.length > 0 && (
            <div>
              <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Serviços Prestados (Opcional)</Label>
              {loadingServices ? (
                <div className="mt-2 text-sm text-symbol-gray-600">Carregando serviços...</div>
              ) : (
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border border-symbol-gray-300 rounded p-3 bg-symbol-gray-50">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id, service.name, service.sale_price)}
                        className="data-[state=checked]:bg-symbol-gold data-[state=checked]:border-symbol-gold"
                      />
                      <Label htmlFor={service.id} className="text-sm text-symbol-black cursor-pointer flex-1">
                        {service.name} - R$ {service.sale_price.toFixed(2)}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
          </div>          <div>
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
          </div>          <div>
            <Label htmlFor="commission" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Comissão (%) - Opcional</Label>
            <Input
              id="commission"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0,0"
              value={formData.commission}
              onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
              className="mt-1 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
            />
            <p className="text-xs text-symbol-gray-600 mt-1">
              Se não informado, será usado o percentual dos parâmetros do negócio
            </p>
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
