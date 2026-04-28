import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CashFlowEntry, ServicoRealizado } from '@/types';
import { format, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, DollarSign, Tag, User, Minus, Plus, Percent } from 'lucide-react';
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
  const [serviceQtd, setServiceQtd] = useState<Record<string, number>>({});
  // comissão % por serviço (pode ser editada individualmente)
  const [serviceComissao, setServiceComissao] = useState<Record<string, number>>({});

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
      if (entry.servicosRealizados) {
        const qtdMap: Record<string, number> = {};
        const comMap: Record<string, number> = {};
        entry.servicosRealizados.forEach(s => {
          qtdMap[s.id] = s.quantidade;
          comMap[s.id] = s.comissao_percentual ?? 0;
        });
        setServiceQtd(qtdMap);
        setServiceComissao(comMap);
      } else {
        setServiceQtd({});
        setServiceComissao({});
      }
    } else {
      setFormData({ date: format(defaultDate || new Date(), 'yyyy-MM-dd'), description: '', amount: '', profissionalNome: '' });
      setServiceQtd({});
      setServiceComissao({});
    }
    setErrors({});
  }, [entry, show, defaultDate]);

  // Quando profissional muda → atualiza % de comissão padrão em todos os serviços
  useEffect(() => {
    if (!formData.profissionalNome) return;
    const col = colaboradoras.find((c: any) => c.nome === formData.profissionalNome);
    const pct = (col as any)?.comissao_percentual ?? 0;
    if (pct === 0) return;
    setServiceComissao(prev => {
      const updated = { ...prev };
      services.forEach(s => { updated[s.id] = pct; });
      return updated;
    });
  }, [formData.profissionalNome, services]);

  // Recalcula total + descrição quando serviceQtd muda
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
      const next = Math.max(0, (prev[serviceId] || 0) + delta);
      // Se adicionado pela primeira vez, preenche comissão padrão da profissional
      if (next > 0 && !prev[serviceId]) {
        const col = colaboradoras.find((c: any) => c.nome === formData.profissionalNome);
        const pct = (col as any)?.comissao_percentual ?? 0;
        setServiceComissao(pc => ({ ...pc, [serviceId]: pc[serviceId] ?? pct }));
      }
      return { ...prev, [serviceId]: next };
    });
  };

  const handleQtdInput = (serviceId: string, val: string) => {
    const n = Math.max(0, parseInt(val) || 0);
    setServiceQtd(prev => ({ ...prev, [serviceId]: n }));
  };

  const handleComissaoInput = (serviceId: string, val: string) => {
    const n = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setServiceComissao(prev => ({ ...prev, [serviceId]: n }));
  };

  // Calcula total de comissão dos serviços selecionados
  const totalComissao = services
    .filter(s => (serviceQtd[s.id] || 0) > 0)
    .reduce((sum, s) => {
      const valor = s.sale_price * (serviceQtd[s.id] || 1);
      const pct = serviceComissao[s.id] ?? 0;
      return sum + (valor * pct) / 100;
    }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valor deve ser maior que zero';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const servicosRealizados: ServicoRealizado[] = services
      .filter(s => (serviceQtd[s.id] || 0) > 0)
      .map(s => {
        const qty = serviceQtd[s.id];
        const pct = serviceComissao[s.id] ?? 0;
        const valorTotal = s.sale_price * qty;
        return {
          id: s.id,
          nome: s.name,
          quantidade: qty,
          valor_unitario: s.sale_price,
          comissao_percentual: pct,
          comissao_valor: (valorTotal * pct) / 100,
        };
      });

    onSave({
      date: parse(formData.date, 'yyyy-MM-dd', new Date()),
      description: formData.description.trim(),
      type: 'entrada',
      amount: parseFloat(formData.amount),
      paymentMethod: undefined,
      client: undefined,
      commission: totalComissao > 0 ? totalComissao : undefined,
      profissionalNome: formData.profissionalNome || undefined,
      servicosRealizados: servicosRealizados.length > 0 ? servicosRealizados : undefined,
    });
    onClose();
  };

  const inputStyle: React.CSSProperties = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 };

  const selectedServices = services.filter(s => (serviceQtd[s.id] || 0) > 0);

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, color: '#f0f0f8' }}>
        <style>{`
          .entry-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
          .entry-input::placeholder { color: #606078 !important; }
          .svc-row:hover { background: rgba(255,255,255,0.03) !important; }
          .qtd-btn:hover { background: rgba(201,168,76,0.2) !important; }
          .com-input:focus { border-color: #c9a84c !important; outline: none; }
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
          <div>
            <label style={labelStyle}><User size={12} /> Profissional</label>
            {colaboradoras.length > 0 ? (
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
            ) : (
              <input
                className="entry-input"
                style={inputStyle}
                placeholder="Nome da profissional"
                value={formData.profissionalNome}
                onChange={e => setFormData(p => ({ ...p, profissionalNome: e.target.value }))}
              />
            )}
          </div>

          {/* Serviços com quantidade + comissão */}
          {services.length > 0 && (
            <div>
              <label style={labelStyle}><Tag size={12} /> Serviços Prestados (Opcional)</label>
              <div style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 10, maxHeight: 220, overflowY: 'auto', padding: 4 }}>
                {loadingServices ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#9090a8', fontSize: 13 }}>Carregando...</div>
                ) : (
                  services.map(service => {
                    const qty = serviceQtd[service.id] || 0;
                    const selected = qty > 0;
                    const comPct = serviceComissao[service.id] ?? 0;
                    const comValor = selected ? (service.sale_price * qty * comPct) / 100 : 0;
                    return (
                      <div
                        key={service.id}
                        className="svc-row"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${selected ? 'rgba(201,168,76,0.2)' : 'transparent'}`, background: selected ? 'rgba(201,168,76,0.06)' : 'transparent', marginBottom: 2, transition: 'all 0.15s', flexWrap: 'wrap' }}
                      >
                        {/* Nome + preço */}
                        <div style={{ flex: 1, minWidth: 100, cursor: 'pointer' }} onClick={() => handleQtdChange(service.id, qty === 0 ? 1 : -qty)}>
                          <div style={{ fontSize: 13, color: selected ? '#c9a84c' : '#f0f0f8' }}>{service.name}</div>
                          <div style={{ fontSize: 11, color: '#606078' }}>
                            R$ {service.sale_price.toFixed(2)}{selected && qty > 1 ? ` × ${qty} = R$ ${(service.sale_price * qty).toFixed(2)}` : ''}
                          </div>
                        </div>

                        {/* Stepper quantidade */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <button type="button" className="qtd-btn" onClick={() => handleQtdChange(service.id, -1)} style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={9} />
                          </button>
                          <input
                            type="number" min="0"
                            value={qty || ''}
                            placeholder="0"
                            onChange={e => handleQtdInput(service.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 32, background: '#13131a', border: '1px solid #2a2a38', borderRadius: 6, padding: '3px 4px', color: '#f0f0f8', fontSize: 12, textAlign: 'center', outline: 'none', fontFamily: 'Sora, sans-serif' }}
                          />
                          <button type="button" className="qtd-btn" onClick={() => handleQtdChange(service.id, 1)} style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={9} />
                          </button>
                        </div>

                        {/* Campo comissão % — só aparece quando selecionado */}
                        {selected && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Percent size={10} style={{ color: '#9090a8', flexShrink: 0 }} />
                            <div style={{ display: 'flex', alignItems: 'center', background: '#13131a', border: '1px solid #2a2a38', borderRadius: 6, overflow: 'hidden' }}>
                              <input
                                type="number"
                                min="0" max="100" step="0.5"
                                value={comPct || ''}
                                placeholder="0"
                                className="com-input"
                                onChange={e => handleComissaoInput(service.id, e.target.value)}
                                onClick={e => e.stopPropagation()}
                                style={{ width: 38, background: 'transparent', border: 'none', outline: 'none', color: '#c9a84c', fontSize: 12, fontWeight: 600, padding: '3px 5px', fontFamily: 'Sora, sans-serif', textAlign: 'right' }}
                              />
                              <span style={{ fontSize: 11, color: '#9090a8', paddingRight: 5 }}>%</span>
                            </div>
                          </div>
                        )}
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
