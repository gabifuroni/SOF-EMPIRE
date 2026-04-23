import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, User } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transacoes_financeiras'> & {
  profissional_nome?: string | null;
  servicos_realizados?: any;
};

interface DailyCashFlowTableProps {
  todayEntries: Transaction[];
  today: Date;
  onDeleteEntry: (id: string) => void;
}

const DailyCashFlowTable = ({ todayEntries, today, onDeleteEntry }: DailyCashFlowTableProps) => {
  if (todayEntries.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>
          Nenhum lançamento hoje
        </h3>
        <p style={{ fontSize: 13, color: '#9090a8' }}>
          Adicione sua primeira entrada ou saída do dia
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <style>{`
        .dcf-table { width: 100%; border-collapse: collapse; }
        .dcf-table th { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #606078; padding: 12px 16px; text-align: left; background: #1c1c26; border-bottom: 1px solid #2a2a38; }
        .dcf-table td { padding: 13px 16px; font-size: 13px; color: #f0f0f8; border-bottom: 1px solid #2a2a38; vertical-align: middle; }
        .dcf-table tr:last-child td { border-bottom: none; }
        .dcf-table tr:hover td { background: rgba(255,255,255,0.02); }
        .dcf-del-btn { background: rgba(255,77,106,0.08); border: 1px solid rgba(255,77,106,0.2); border-radius: 6px; padding: 5px 8px; cursor: pointer; color: #ff4d6a; display: flex; align-items: center; transition: all 0.15s; }
        .dcf-del-btn:hover { background: rgba(255,77,106,0.15); }
      `}</style>
      <table className="dcf-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Profissional</th>
            <th style={{ textAlign: 'right' }}>Valor (R$)</th>
            <th style={{ textAlign: 'center' }}>Horário</th>
            <th style={{ textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {[...todayEntries]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map(entry => {
              const profissional = (entry as any).profissional_nome;
              return (
                <tr key={entry.id}>
                  <td style={{ fontWeight: 500, maxWidth: 280 }}>
                    <div>{entry.description}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: entry.tipo_transacao === 'ENTRADA' ? 'rgba(0,200,150,0.12)' : 'rgba(255,77,106,0.12)', color: entry.tipo_transacao === 'ENTRADA' ? '#00c896' : '#ff4d6a' }}>
                      {entry.tipo_transacao === 'ENTRADA' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td>
                    {profissional ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#c9a84c', fontWeight: 700, flexShrink: 0 }}>
                          {profissional.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, color: '#f0f0f8' }}>{profissional}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#3a3a4a', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'Sora, sans-serif', fontWeight: 600, color: entry.tipo_transacao === 'ENTRADA' ? '#00c896' : '#ff4d6a' }}>
                    R$ {Number(entry.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center', color: '#9090a8', fontSize: 12 }}>
                    {format(new Date(entry.created_at), 'HH:mm', { locale: ptBR })}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="dcf-del-btn" onClick={() => onDeleteEntry(entry.id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default DailyCashFlowTable;
