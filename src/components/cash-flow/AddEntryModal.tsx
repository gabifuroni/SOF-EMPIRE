import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CashFlowEntry, ServicoRealizado } from '@/types';
import { format, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, DollarSign, Tag, User, Minus, Plus } from 'lucide-react';
import { useBusinessParams } from '@/hooks/useBusinessParams';

interface AddEntryModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CashFlowEntry, 'id'>) => void;
  entry?: CashFlowEntry;
  defaultDate?: Date;
}

interface Service { id: string; name: string; sale_price: number; }

const AddEntryModal = ({ show, onClose, onSave, entry, defaultDate }: AddEntryModalProps) => {
  const { params } = useBusinessParams();

  // Active collaborators for the dropdown
  const colaboradoras = (params.equipeNomesProfissionais || [])
    .filter((c: any) => c.ativo !== false && c.nome?.trim());

  const [formData, setFormData] = useState({
    date: format(defaultDate || new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    profissionalNome: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  // Map serviceId → quantity (0 = not selected)
  const [serviceQtd, setServiceQtd] = useState<Record<string, number>>({});

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
        if (!error) setServices(data || []);
      } catch {} finally { setLoadingServices(false); }
    };
    loadServices();
  }, [show]);

  useEffect(() => {
    if (entry) {
      setFormData({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        description: entry.description,
        amount: entry.amount.toString(),
        profissionalNome: entry.profissionalNome || '',
      });
      // Rebuild serviceQtd from servicosRealizados if editing
      if (entry.servicosRealizados) {
        const map: Record<string, number> = {};
        entry.servicosRealizados.forEach(s => { map[s.id] = s.quantidade; });
        setServiceQtd(map);
      } else {
        setServiceQtd({});
      }
    } else {
      setFormData({ date: format(defaultDate || new Date(), 'yyyy-MM-dd'), description: '', amount: '', profissionalNome: '' });
      setServiceQtd({});
    }
    setErrors({});
  }, [entry, show, defaultDate]);

  // Recalculate total + description whenever serviceQtd changes
  useEffect(() => {
    const selected = services.filter(s => (serviceQtd[s.id] || 0) > 0);
    if (selected.length === 0) return;
    const total = selected.reduce((sum, s) => sum + s.sale_price * (serviceQtd[s.id] || 1), 0);
    const desc = selected.map(s => {
      const q = serviceQtd[s.id] || 1;
      return q > 1 ? `${s.name} (x${q})` : s.name;
    }).join(', ');
    setFormData(p => ({ ...p, description: desc, amount: total.toString() }));
  }, [serviceQtd, services]);

  const handleQtdChange = (serviceId: string, delta: number) => {
    setServiceQtd(prev => {
      const current = prev[serviceId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [serviceId]: next };
    });
  };

  const handleQtdInput = (serviceId: string, val: string) => {
    const n = parseInt(val) || 0;
    setServiceQtd(prev => ({ ...prev, [serviceId]: Math.max(0, n) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valor deve ser maior que zero';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const servicosRealizados: ServicoRealizado[] = services
      .filter(s => (serviceQtd[s.id] || 0) > 0)
      .map(s => ({ id: s.id, nome: s.name, quantidade: serviceQtd[s.id], valor_unitario: s.sale_price }));

    onSave({
      date: parse(formData.date, 'yyyy-MM-dd', new Date()),
      description: formData.description.trim(),
      type: 'entrada',
      amount: parseFloat(formData.amount),
      paymentMethod: undefined,
      client: undefined,
      commission: undefined,
      profissionalNome: formData.profissionalNome || undefined,
      servicosRealizados: servicosRealizados.length > 0 ? servicosRealizados : undefined,
    });
    onClose();
  };

  const inputStyle: React.CSSProperties = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, color: '#f0f0f8' }}>
        <style>{`
          .entry-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
          .entry-input::placeholder { color: #606078 !important; }
          .svc-row:hover { background: rgba(255,255,255,0.03) !important; }
          .qtd-btn:hover { background: rgba(201,168,76,0.2) !important; }
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

          {/* Profissional */}
          {colaboradoras.length > 0 && (
            <div>
              <label style={labelStyle}><User size={12} /> Profissional</label>
              <select
                className="entry-input"
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={formData.profissionalNome}
                onChange={e => setFormData(p => ({ ...p, profissionalNome: e.target.value }))}
              >
                <option value="">Selecionar profissional...</option>
                {colaboradoras.map((c: any) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
          )}

          {/* Serviços com quantidade */}
          {services.length > 0 && (
            <div>
              <label style={labelStyle}><Tag size={12} /> Serviços Prestados (Opcional)</label>
              <div style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 10, maxHeight: 200, overflowY: 'auto', padding: 4 }}>
                {loadingServices ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#9090a8', fontSize: 13 }}>Carregando...</div>
                ) : (
                  services.map(service => {
                    const qty = serviceQtd[service.id] || 0;
                    const selected = qty > 0;
                    return (
                      <div
                        key={service.id}
                        className="svc-row"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: `1px solid ${selected ? 'rgba(201,168,76,0.2)' : 'transparent'}`, background: selected ? 'rgba(201,168,76,0.06)' : 'transparent', marginBottom: 2, transition: 'all 0.15s' }}
                      >
                        {/* Nome + preço */}
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleQtdChange(service.id, qty === 0 ? 1 : -qty)}>
                          <div style={{ fontSize: 13, color: selected ? '#c9a84c' : '#f0f0f8' }}>{service.name}</div>
                          <div style={{ fontSize: 11, color: '#606078' }}>
                            R$ {service.sale_price.toFixed(2)}{selected && qty > 1 ? ` × ${qty} = R$ ${(service.sale_price * qty).toFixed(2)}` : ''}
                          </div>
                        </div>
                        {/* Stepper de quantidade */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button type="button" className="qtd-btn" onClick={() => handleQtdChange(service.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={10} />
                          </button>
                          <input
                            type="number" min="0"
                            value={qty || ''}
                            placeholder="0"
                            onChange={e => handleQtdInput(service.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 36, background: '#13131a', border: '1px solid #2a2a38', borderRadius: 6, padding: '3px 4px', color: '#f0f0f8', fontSize: 13, textAlign: 'center', outline: 'none', fontFamily: 'Sora, sans-serif' }}
                          />
                          <button type="button" className="qtd-btn" onClick={() => handleQtdChange(service.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label style={labelStyle}><Tag size={12} /> Descrição *</label>
            <input className="entry-input" style={{ ...inputStyle, borderColor: errors.description ? '#ff4d6a' : '#2a2a38' }} placeholder="Ex: Design de sobrancelhas - Ana" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
            {errors.description && <p style={{ fontSize: 12, color: '#ff4d6a', marginTop: 4 }}>{errors.description}</p>}
          </div>

          {/* Valor */}
          <div>
            <label style={labelStyle}><DollarSign size={12} /> Valor Total (R$) *</label>
            <input className="entry-input" style={{ ...inputStyle, borderColor: errors.amount ? '#ff4d6a' : '#2a2a38' }} type="number" step="0.01" min="0" placeholder="0,00" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} />
            {errors.amount && <p style={{ fontSize: 12, color: '#ff4d6a', marginTop: 4 }}>{errors.amount}</p>}
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
