import { useState, useMemo } from 'react';
import { format, parse, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, CheckCircle, Clock, ChevronLeft, ChevronRight, RefreshCw, TrendingUp } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { usePagamentosComissoes } from '@/hooks/usePagamentosComissoes';
import { useTransactions as useAddTransaction } from '@/hooks/useTransactions';

const ComissoesColaboradoras = () => {
  const today = new Date();
  const [mesReferencia, setMesReferencia] = useState(format(today, 'yyyy-MM'));
  const [marcandoPago, setMarcandoPago] = useState<string | null>(null);

  const { params } = useBusinessParams();
  const { transactions } = useTransactions();
  const { pagamentos, isLoading, upsertPagamento, marcarComoPago } = usePagamentosComissoes(mesReferencia);
  const { addTransaction } = useAddTransaction();

  // Colaboradoras com comissão definida
  const colaboradoras = useMemo(() => {
    return (params.equipeNomesProfissionais || [])
      .filter((c: any) => c.nome?.trim() && (c.comissao_percentual ?? 0) > 0);
  }, [params.equipeNomesProfissionais]);

  // Período do mês selecionado
  const periodoInicio = useMemo(() => {
    const d = parse(mesReferencia, 'yyyy-MM', new Date());
    return startOfMonth(d);
  }, [mesReferencia]);

  const periodoFim = useMemo(() => {
    const d = parse(mesReferencia, 'yyyy-MM', new Date());
    return endOfMonth(d);
  }, [mesReferencia]);

  // Entradas do período filtradas por colaboradora
  const entradasPorColaboradora = useMemo(() => {
    if (!transactions) return {};
    const map: Record<string, number> = {};
    transactions
      .filter(t => {
        if (t.tipo_transacao !== 'ENTRADA') return false;
        if (!t.date) return false;
        const d = parse(t.date, 'yyyy-MM-dd', new Date());
        return isWithinInterval(d, { start: periodoInicio, end: periodoFim });
      })
      .forEach(t => {
        const nome = (t as any).profissional_nome;
        if (!nome) return;
        map[nome] = (map[nome] || 0) + Number(t.valor || 0);
      });
    return map;
  }, [transactions, periodoInicio, periodoFim]);

  // Monta resumo por colaboradora
  const resumo = useMemo(() => {
    return colaboradoras.map((col: any) => {
      const valorFaturado = entradasPorColaboradora[col.nome] || 0;
      const percentual = col.comissao_percentual ?? 0;
      const valorComissao = (valorFaturado * percentual) / 100;
      const pagamento = pagamentos.find(
        p => p.colaboradora_id === col.id && p.mes_referencia === mesReferencia
      );
      return {
        id: col.id,
        nome: col.nome,
        percentual,
        valorFaturado,
        valorComissao,
        status: pagamento?.status ?? 'pendente',
        pagamentoId: pagamento?.id,
        dataPagamento: pagamento?.data_pagamento,
      };
    });
  }, [colaboradoras, entradasPorColaboradora, pagamentos, mesReferencia]);

  const totalComissoes = resumo.reduce((s, r) => s + r.valorComissao, 0);
  const totalPago = resumo.filter(r => r.status === 'pago').reduce((s, r) => s + r.valorComissao, 0);
  const totalPendente = totalComissoes - totalPago;

  const navegarMes = (delta: number) => {
    const d = parse(mesReferencia, 'yyyy-MM', new Date());
    d.setMonth(d.getMonth() + delta);
    setMesReferencia(format(d, 'yyyy-MM'));
  };

  const handleCalcular = async (col: (typeof resumo)[0]) => {
    if (col.valorComissao <= 0) return;
    await upsertPagamento.mutateAsync({
      colaboradora_id: col.id,
      colaboradora_nome: col.nome,
      mes_referencia: mesReferencia,
      valor_faturado: col.valorFaturado,
      percentual_comissao: col.percentual,
      valor_comissao: col.valorComissao,
      status: col.status === 'pago' ? 'pago' : 'pendente',
      data_pagamento: col.dataPagamento ?? null,
    });
  };

  const handleMarcarPago = async (col: (typeof resumo)[0]) => {
    setMarcandoPago(col.id);
    try {
      const hoje = format(new Date(), 'yyyy-MM-dd');

      // Se já tem registro, atualiza; senão cria
      if (col.pagamentoId) {
        await marcarComoPago.mutateAsync({ id: col.pagamentoId, data_pagamento: hoje });
      } else {
        const inserted = await upsertPagamento.mutateAsync({
          colaboradora_id: col.id,
          colaboradora_nome: col.nome,
          mes_referencia: mesReferencia,
          valor_faturado: col.valorFaturado,
          percentual_comissao: col.percentual,
          valor_comissao: col.valorComissao,
          status: 'pendente',
          data_pagamento: null,
        });
        if (inserted?.id) {
          await marcarComoPago.mutateAsync({ id: inserted.id, data_pagamento: hoje });
        }
      }

      // Lança como custo direto nas transações
      await addTransaction.mutateAsync({
        description: `Comissão ${col.nome} — ${format(parse(mesReferencia, 'yyyy-MM', new Date()), 'MMMM/yyyy', { locale: ptBR })}`,
        valor: col.valorComissao,
        tipo_transacao: 'SAIDA',
        date: hoje,
        payment_method: null,
        commission: null,
        profissional_nome: col.nome,
        servicos_realizados: null,
      } as any);
    } finally {
      setMarcandoPago(null);
    }
  };

  const mesLabel = format(parse(mesReferencia, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ptBR });

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .com-card { animation: fadeUp 0.4s ease both; background: #13131a; border: 1px solid #2a2a38; border-radius: 12px; transition: border-color 0.2s; }
        .com-card:hover { border-color: #3a3a4a; }
        .com-row:hover { background: rgba(255,255,255,0.02) !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .pay-btn:hover { opacity: 0.85 !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>
            Pagamento de Comissões
          </h1>
          <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
          <p style={{ fontSize: 13, color: '#9090a8' }}>
            Gerencie os repasses das suas colaboradoras
          </p>
        </div>

        {/* Navegação de mês */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#13131a', border: '1px solid #2a2a38', borderRadius: 10, padding: '6px 8px' }}>
          <button className="nav-btn" onClick={() => navegarMes(-1)} style={{ background: 'transparent', border: 'none', color: '#9090a8', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 600, color: '#f0f0f8', minWidth: 130, textAlign: 'center', textTransform: 'capitalize' }}>
            {mesLabel}
          </span>
          <button className="nav-btn" onClick={() => navegarMes(1)} style={{ background: 'transparent', border: 'none', color: '#9090a8', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
        <div className="com-card" style={{ padding: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <DollarSign size={16} style={{ color: '#c9a84c' }} />
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Total em Comissões</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#f0f0f8' }}>
            R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="com-card" style={{ padding: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Clock size={16} style={{ color: '#ff4d6a' }} />
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Pendente</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#ff4d6a' }}>
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="com-card" style={{ padding: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <CheckCircle size={16} style={{ color: '#00c896' }} />
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Pago</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#00c896' }}>
            R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="com-card" style={{ padding: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77,159,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <TrendingUp size={16} style={{ color: '#4d9fff' }} />
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>Colaboradoras</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 600, color: '#f0f0f8' }}>
            {resumo.filter(r => r.valorFaturado > 0).length} / {resumo.length}
          </div>
          <div style={{ fontSize: 11, color: '#9090a8', marginTop: 2 }}>com faturamento</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="com-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>
              Comissões — {mesLabel}
            </h3>
            <div style={{ width: 24, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 12, color: '#9090a8' }}>
            {resumo.filter(r => r.status === 'pago').length} de {resumo.length} pagas
          </div>
        </div>

        {colaboradoras.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>
              Nenhuma colaboradora com comissão
            </h3>
            <p style={{ fontSize: 13, color: '#9090a8' }}>
              Defina a % de comissão nas colaboradoras em <strong style={{ color: '#c9a84c' }}>Parâmetros do Negócio → Equipe</strong>
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <style>{`
              .com-table { width: 100%; border-collapse: collapse; }
              .com-table th { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #606078; padding: 12px 16px; text-align: left; background: #1c1c26; border-bottom: 1px solid #2a2a38; }
              .com-table td { padding: 14px 16px; font-size: 13px; color: #f0f0f8; border-bottom: 1px solid #1c1c26; vertical-align: middle; }
              .com-table tr:last-child td { border-bottom: none; }
            `}</style>
            <table className="com-table">
              <thead>
                <tr>
                  <th>Colaboradora</th>
                  <th style={{ textAlign: 'right' }}>Faturado no Mês</th>
                  <th style={{ textAlign: 'center' }}>Comissão %</th>
                  <th style={{ textAlign: 'right' }}>Valor a Pagar</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Data Pagamento</th>
                  <th style={{ textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {resumo.map(col => (
                  <tr key={col.id} className="com-row" style={{ transition: 'background 0.15s' }}>
                    {/* Nome */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#c9a84c', fontWeight: 700, flexShrink: 0 }}>
                          {col.nome.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{col.nome}</span>
                      </div>
                    </td>
                    {/* Faturado */}
                    <td style={{ textAlign: 'right', fontFamily: 'Sora, sans-serif', fontWeight: 600, color: col.valorFaturado > 0 ? '#00c896' : '#606078' }}>
                      R$ {col.valorFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    {/* % */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 99, padding: '2px 10px' }}>
                        {col.percentual}%
                      </span>
                    </td>
                    {/* Valor comissão */}
                    <td style={{ textAlign: 'right', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14, color: col.status === 'pago' ? '#00c896' : col.valorComissao > 0 ? '#f0f0f8' : '#606078' }}>
                      R$ {col.valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99,
                        background: col.status === 'pago' ? 'rgba(0,200,150,0.12)' : 'rgba(255,77,106,0.12)',
                        color: col.status === 'pago' ? '#00c896' : '#ff4d6a',
                        border: `1px solid ${col.status === 'pago' ? 'rgba(0,200,150,0.2)' : 'rgba(255,77,106,0.2)'}`,
                      }}>
                        {col.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    {/* Data pagamento */}
                    <td style={{ textAlign: 'center', color: '#9090a8', fontSize: 12 }}>
                      {col.dataPagamento
                        ? format(new Date(col.dataPagamento + 'T12:00:00'), 'dd/MM/yyyy')
                        : <span style={{ color: '#3a3a4a' }}>—</span>}
                    </td>
                    {/* Ação */}
                    <td style={{ textAlign: 'center' }}>
                      {col.status === 'pago' ? (
                        <span style={{ color: '#00c896', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <CheckCircle size={14} /> Pago
                        </span>
                      ) : (
                        <button
                          className="pay-btn"
                          disabled={col.valorComissao <= 0 || marcandoPago === col.id}
                          onClick={() => handleMarcarPago(col)}
                          style={{
                            background: col.valorComissao > 0 ? 'linear-gradient(135deg,#00c896,#00a07a)' : '#1c1c26',
                            border: 'none', borderRadius: 8, padding: '6px 14px', cursor: col.valorComissao > 0 ? 'pointer' : 'default',
                            color: col.valorComissao > 0 ? '#0a0a0f' : '#3a3a4a',
                            fontSize: 12, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                            display: 'flex', alignItems: 'center', gap: 5, margin: '0 auto',
                            opacity: marcandoPago === col.id ? 0.6 : 1, transition: 'opacity 0.15s',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {marcandoPago === col.id ? (
                            <><RefreshCw size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> Salvando...</>
                          ) : (
                            <><CheckCircle size={12} /> Marcar Pago</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default ComissoesColaboradoras;
