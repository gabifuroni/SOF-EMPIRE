import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useContaControl, ContaControl } from '@/hooks/useContaControl';
import AddContaModal from './AddContaModal';

interface Category {
  id: string;
  nome: string;
}

interface ContaControlTabProps {
  mesReferencia: string;
  indiretasCategorias: Category[];
  diretasCategorias: Category[];
  onPagarConta: (categoriaId: string, tipoDespesa: 'indireta' | 'direta', valor: number) => Promise<void>;
}

const ContaControlTab = ({ mesReferencia, indiretasCategorias, diretasCategorias, onPagarConta }: ContaControlTabProps) => {
  const { contas, isLoading, addConta, deleteConta, marcarComoPago, totalPlanejado, totalPago, totalPendente } = useContaControl(mesReferencia);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagandoId, setPagandoId] = useState<string | null>(null);
  const [valorReal, setValorReal] = useState<Record<string, string>>({});

  const handlePagar = async (conta: ContaControl) => {
    const valor = parseFloat(valorReal[conta.id] || conta.valor_planejado.toString());
    try {
      await marcarComoPago.mutateAsync({
        conta,
        valorReal: valor,
        updateExpenseValue: conta.categoria_id
          ? async (catId, val) => { await onPagarConta(catId, conta.tipo_despesa, val); }
          : undefined,
      });
      setPagandoId(null);
      toast.success(`"${conta.nome}" marcado como pago! ${conta.categoria_id ? 'Valor atualizado nas Despesas automaticamente.' : ''}`);
    } catch {
      toast.error('Erro ao marcar como pago');
    }
  };

  const isVencida = (data?: string) => {
    if (!data) return false;
    return new Date(data) < new Date(new Date().toDateString());
  };

  const getCatNome = (conta: ContaControl) => {
    const lista = conta.tipo_despesa === 'indireta' ? indiretasCategorias : diretasCategorias;
    return lista.find(c => c.id === conta.categoria_id)?.nome;
  };

  const pagas = contas.filter(c => c.pago).length;
  const pct = contas.length > 0 ? Math.round((pagas / contas.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Mini cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total Planejado', value: `R$ ${totalPlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#c9a84c' },
          { label: 'Total Pago', value: `R$ ${totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#00c896' },
          { label: 'A Pagar', value: `R$ ${totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#ff4d6a' },
        ].map(card => (
          <div key={card.label} style={{ background: '#0f0f18', border: '1px solid #1e1e2a', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#606078', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: card.color, fontFamily: 'Sora, sans-serif' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e1e2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f8' }}>Contas do Mês</span>
            <span style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.2)' }}>
              {contas.length} contas
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a8852e)', border: 'none', borderRadius: 8, padding: '7px 14px', fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer' }}
          >
            + Adicionar Conta
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#606078', fontSize: 13 }}>Carregando...</div>
        ) : contas.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, color: '#f0f0f8', marginBottom: 6 }}>Nenhuma conta cadastrada</div>
            <div style={{ fontSize: 12, color: '#606078' }}>Adicione suas contas fixas e parcelamentos do mês</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f0f18', borderBottom: '1px solid #1e1e2a' }}>
                  {['Conta', 'Categoria Vinculada', 'Observação', 'Planejado', 'Valor Real', 'Vencimento', 'Status', 'Pago'].map(h => (
                    <th key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#606078', padding: '10px 14px', textAlign: h === 'Pago' ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contas.map(conta => (
                  <tr key={conta.id} style={{ borderBottom: '1px solid #1a1a24' }}>
                    {/* Nome */}
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#f0f0f8', fontWeight: 500 }}>
                      {conta.nome}
                    </td>

                    {/* Categoria */}
                    <td style={{ padding: '11px 14px' }}>
                      {getCatNome(conta) ? (
                        <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a38', borderRadius: 5, padding: '2px 8px', fontSize: 10, color: conta.tipo_despesa === 'indireta' ? '#9090a8' : '#c9a84c' }}>
                          ↗ {getCatNome(conta)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#3a3a4a' }}>—</span>
                      )}
                    </td>

                    {/* Observação */}
                    <td style={{ padding: '11px 14px', fontSize: 11, color: '#606078', fontStyle: 'italic' }}>
                      {conta.observacao || '—'}
                    </td>

                    {/* Planejado */}
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#9090a8' }}>
                      R$ {conta.valor_planejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Valor Real */}
                    <td style={{ padding: '11px 14px' }}>
                      {conta.pago ? (
                        <span style={{ fontSize: 13, color: '#00c896', fontWeight: 500 }}>
                          R$ {(conta.valor_real || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : pagandoId === conta.id ? (
                        <input
                          style={{ width: 90, background: '#1c1c26', border: '1px solid #c9a84c', borderRadius: 6, padding: '5px 8px', color: '#f0f0f8', fontSize: 12, fontFamily: 'Sora, sans-serif', outline: 'none' }}
                          type="number"
                          step="0.01"
                          placeholder={conta.valor_planejado.toString()}
                          value={valorReal[conta.id] || ''}
                          onChange={e => setValorReal(p => ({ ...p, [conta.id]: e.target.value }))}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: '#3a3a4a' }}>—</span>
                      )}
                    </td>

                    {/* Vencimento */}
                    <td style={{ padding: '11px 14px' }}>
                      {conta.data_vencimento ? (
                        <span style={{ fontSize: 11.5, color: isVencida(conta.data_vencimento) && !conta.pago ? '#ff4d6a' : '#9090a8' }}>
                          {isVencida(conta.data_vencimento) && !conta.pago ? '⚠ ' : ''}
                          {new Date(conta.data_vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      ) : <span style={{ color: '#3a3a4a', fontSize: 11 }}>—</span>}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '11px 14px' }}>
                      {conta.pago ? (
                        <span style={{ background: 'rgba(0,200,150,0.1)', color: '#00c896', border: '1px solid rgba(0,200,150,0.2)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>✓ Pago</span>
                      ) : isVencida(conta.data_vencimento) ? (
                        <span style={{ background: 'rgba(255,77,106,0.1)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.2)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>• Pendente</span>
                      ) : (
                        <span style={{ background: 'rgba(144,144,168,0.1)', color: '#9090a8', border: '1px solid rgba(144,144,168,0.15)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>○ A Pagar</span>
                      )}
                    </td>

                    {/* Pago checkbox */}
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {conta.pago ? (
                          <div style={{ width: 20, height: 20, borderRadius: 5, background: '#00c896', border: '2px solid #00c896', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0a0a0f' }}>✓</div>
                        ) : pagandoId === conta.id ? (
                          <>
                            <button
                              onClick={() => handlePagar(conta)}
                              style={{ background: '#00c896', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setPagandoId(null)}
                              style={{ background: 'transparent', border: '1px solid #2a2a38', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#9090a8', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <div
                              onClick={() => setPagandoId(conta.id)}
                              style={{ width: 20, height: 20, borderRadius: 5, border: '2px solid #3a3a4a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            />
                            <button
                              onClick={() => deleteConta.mutate(conta.id)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3a3a4a', padding: 2 }}
                              title="Remover conta"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Progress bar */}
        {contas.length > 0 && (
          <div style={{ background: '#0f0f18', borderTop: '1px solid #1e1e2a', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 11, color: '#606078', whiteSpace: 'nowrap' }}>Progresso do mês</span>
            <div style={{ flex: 1, height: 5, background: '#1e1e2a', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#00c896,#00a07a)', borderRadius: 99, width: `${pct}%`, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 11, color: '#00c896', fontWeight: 600, whiteSpace: 'nowrap' }}>{pct}% pago</span>
          </div>
        )}
      </div>

      <AddContaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={data => addConta.mutate(data)}
        mesReferencia={mesReferencia}
        indiretasCategorias={indiretasCategorias}
        diretasCategorias={diretasCategorias}
      />
    </div>
  );
};

export default ContaControlTab;
