import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CashFlowEntry } from '@/types';
import { format, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, DollarSign, Tag, User, CreditCard, Percent } from 'lucide-react';

interface AddEntryModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CashFlowEntry, 'id'>) => void;
  entry?: CashFlowEntry;
  defaultDate?: Date;
}

interface Service { id: string; name: string; sale_price: number; }

const AddEntryModal = ({ show, onClose, onSave, entry, defaultDate }: AddEntryModalProps) => {
  const [formData, setFormData] = useState({ date: format(defaultDate || new Date(), 'yyyy-MM-dd'), description: '', amount: '', paymentMethod: '', client: '', commission: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      if (!show) return;
      setLoadingServices(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        const { data, error } = await supabase.from('servicos').select('id, name, sale_price').eq('user_id', user.user.id).order('name');
        if (!error) setServices(data || []);
      } catch {} finally { setLoadingServices(false); }
    };
    loadServices();
  }, [show]);

  useEffect(() => {
    if (entry) {
      setFormData({ date: format(new Date(entry.date), 'yyyy-MM-dd'), description: entry.description, amount: entry.amount.toString(), paymentMethod: entry.paymentMethod || '', client: entry.client || '', commission: entry.commission && entry.amount > 0 ? ((entry.commission / entry.amount) * 100).toString() : '' });
    } else {
      setFormData({ date: format(defaultDate || new Date(), 'yyyy-MM-dd'), description: '', amount: '', paymentMethod: '', client: '', commission: '' });
      setSelectedServices([]);
    }
    setErrors({});
  }, [entry, show, defaultDate]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      const isSelected = prev.includes(serviceId);
      const newSelection = isSelected ? prev.filter(id => id !== serviceId) : [...prev, serviceId];
      const selectedList = services.filter(s => newSelection.includes(s.id));
      const totalAmount = selectedList.reduce((sum, s) => sum + s.sale_price, 0);
      setFormData(prev => ({ ...prev, description: selectedList.map(s => s.name).join(', ') || prev.description, amount: totalAmount > 0 ? totalAmount.toString() : prev.amount }));
      return newSelection;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valor deve ser maior que zero';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave({ date: parse(formData.date, 'yyyy-MM-dd', new Date()), description: formData.description.trim(), type: 'entrada', amount: parseFloat(formData.amount), paymentMethod: formData.paymentMethod, client: formData.client.trim() || undefined, commission: formData.commission ? parseFloat(formData.commission) : undefined });
    onClose();
  };

  const paymentMethods = ['Dinheiro', 'Pix', 'Cartão de Débito', 'Cartão de Crédito', 'Crédito Parcelado', 'Transferência Bancária'];

  const inputStyle: React.CSSProperties = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, color: '#f0f0f8' }}>
        <style>{`
          .entry-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
          .entry-input::placeholder { color: #606078 !important; }
          .entry-select option { background: #1c1c26; color: #f0f0f8; }
          .svc-item:hover { background: rgba(255,255,255,0.04) !important; }
          .svc-item.selected { background: rgba(201,168,76,0.08) !important; border-color: rgba(201,168,76,0.25) !important; }
        `}</style>

        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8' }}>
            {entry ? 'Editar Entrada Financeira' : 'Adicionar Nova Entrada Financeira'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          
          {/* Data */}
          <div>
            <label style={labelStyle}><Calendar size={12} /> Data</label>
            <input className="entry-input" style={inputStyle} type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
          </div>

          {/* Serviços */}
          {services.length > 0 && (
            <div>
              <label style={labelStyle}><Tag size={12} /> Serviços Prestados (Opcional)</label>
              <div style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 10, maxHeight: 140, overflowY: 'auto', padding: 4 }}>
                {loadingServices ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#9090a8', fontSize: 13 }}>Carregando...</div>
                ) : (
                  services.map(service => (
                    <div
                      key={service.id}
                      className={`svc-item ${selectedServices.includes(service.id) ? 'selected' : ''}`}
                      onClick={() => handleServiceToggle(service.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', border: '1px solid transparent', marginBottom: 2, transition: 'all 0.15s' }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selectedServices.includes(service.id) ? '#c9a84c' : '#3a3a4a'}`, background: selectedServices.includes(service.id) ? '#c9a84c' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {selectedServices.includes(service.id) && <span style={{ color: '#0a0a0f', fontSize: 10, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: selectedServices.includes(service.id) ? '#c9a84c' : '#f0f0f8', flex: 1 }}>{service.name}</span>
                      <span style={{ fontSize: 12, color: '#00c896', fontWeight: 500 }}>R$ {service.sale_price.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label style={labelStyle}><Tag size={12} /> Descrição *</label>
            <input className="entry-input" style={{ ...inputStyle, borderColor: errors.description ? '#ff4d6a' : '#2a2a38' }} placeholder="Ex: Serviço de Manicure - Ana Paula" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
            {errors.description && <p style={{ fontSize: 12, color: '#ff4d6a', marginTop: 4 }}>{errors.description}</p>}
          </div>

          {/* Valor */}
          <div>
            <label style={labelStyle}><DollarSign size={12} /> Valor (R$) *</label>
            <input className="entry-input" style={{ ...inputStyle, borderColor: errors.amount ? '#ff4d6a' : '#2a2a38' }} type="number" step="0.01" min="0" placeholder="0,00" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} />
            {errors.amount && <p style={{ fontSize: 12, color: '#ff4d6a', marginTop: 4 }}>{errors.amount}</p>}
          </div>

          {/* Comissão */}
          <div>
            <label style={labelStyle}><Percent size={12} /> Comissão (%) — Opcional</label>
            <input className="entry-input" style={inputStyle} type="number" step="0.1" min="0" max="100" placeholder="0,0" value={formData.commission} onChange={e => setFormData(p => ({ ...p, commission: e.target.value }))} />
            <p style={{ fontSize: 11, color: '#606078', marginTop: 4 }}>Se não informado, será usado o percentual dos parâmetros do negócio</p>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label style={labelStyle}><CreditCard size={12} /> Forma de Pagamento *</label>
            <select className="entry-input entry-select" style={{ ...inputStyle, borderColor: errors.paymentMethod ? '#ff4d6a' : '#2a2a38', cursor: 'pointer' }} value={formData.paymentMethod} onChange={e => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}>
              <option value="">Selecione a forma de pagamento</option>
              {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.paymentMethod && <p style={{ fontSize: 12, color: '#ff4d6a', marginTop: 4 }}>{errors.paymentMethod}</p>}
          </div>

          {/* Cliente */}
          <div>
            <label style={labelStyle}><User size={12} /> Cliente — Opcional</label>
            <input className="entry-input" style={inputStyle} placeholder="Nome do cliente" value={formData.client} onChange={e => setFormData(p => ({ ...p, client: e.target.value }))} />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg,#00c896,#00a07a)', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
              {entry ? 'Salvar Alterações' : 'Salvar Entrada'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a38', borderRadius: 10, padding: '12px', fontSize: 14, color: '#9090a8', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntryModal;
