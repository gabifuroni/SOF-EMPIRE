import { Edit, Trash2, BarChart3 } from 'lucide-react';
import { Service } from '@/types';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { useMaterials } from '@/hooks/useMaterials';

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onAnalyze: (service: Service) => void;
}

const ServiceTable = ({ services, onEdit, onDelete, onAnalyze }: ServiceTableProps) => {
  const { params } = useBusinessParams();
  const { materials } = useMaterials();

  const getMaterialName = (materialId: string) => materials.find(m => m.id === materialId)?.name || 'Material não encontrado';

  if (services.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <BarChart3 size={28} style={{ color: '#c9a84c' }} />
        </div>
        <h3 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>Nenhum serviço cadastrado</h3>
        <p style={{ fontSize: 13, color: '#9090a8' }}>Adicione seus primeiros serviços para analisar a precificação</p>
      </div>
    );
  }

  const headers = [
    { label: 'Serviço', color: '#f0f0f8' },
    { label: 'Preço (R$)', color: '#f0f0f8' },
    { label: 'Comissão (%)', color: '#fb923c' },
    { label: 'Valor Comissão (R$)', color: '#fb923c' },
    { label: 'Mat. Prima (R$)', color: '#00c896' },
    { label: 'Mat. Prima (%)', color: '#00c896' },
    { label: 'Cartão (%)', color: '#4d9fff' },
    { label: 'Cartão (R$)', color: '#4d9fff' },
    { label: 'Imposto (%)', color: '#a78bfa' },
    { label: 'Imposto (R$)', color: '#a78bfa' },
    { label: 'Total (R$)', color: '#ff4d6a' },
    { label: 'Total (%)', color: '#ff4d6a' },
    { label: 'Margem Op. (R$)', color: '#00c896' },
    { label: 'Margem Op. (%)', color: '#00c896' },
    { label: 'Custo Op. (R$)', color: '#4d9fff' },
    { label: 'Custo Op. (%)', color: '#4d9fff' },
    { label: 'Lucro Parcial (R$)', color: '#c9a84c' },
    { label: 'Lucro Parcial (%)', color: '#c9a84c' },
    { label: 'Ações', color: '#9090a8' },
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <style>{`
        .svc-tbl { width: 100%; border-collapse: collapse; }
        .svc-tbl th { padding: 12px 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: #1c1c26; border-bottom: 2px solid #2a2a38; white-space: nowrap; }
        .svc-tbl td { padding: 14px 14px; font-size: 13px; border-bottom: 1px solid #2a2a38; vertical-align: middle; white-space: nowrap; background: #13131a; }
        .svc-tbl tr:last-child td { border-bottom: none; }
        .svc-tbl tr:hover td { background: #1a1a24 !important; }
        .svc-icon-btn { background: rgba(255,255,255,0.04); border: 1px solid #2a2a38; border-radius: 6px; padding: 6px 8px; cursor: pointer; display: inline-flex; align-items: center; transition: all 0.15s; }
        .svc-icon-btn:hover { background: rgba(255,255,255,0.08); border-color: #3a3a4a; }
        .svc-icon-btn.danger:hover { background: rgba(255,77,106,0.1); border-color: rgba(255,77,106,0.3); }
        .svc-icon-btn.gold:hover { background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.3); }
      `}</style>
      <table className="svc-tbl">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ color: h.color, textAlign: i === headers.length - 1 ? 'center' : 'left' }}>{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map(service => {
            const commissionCost = (service.salePrice * service.commissionRate) / 100;
            const cardTaxCost = (service.salePrice * params.weightedAverageRate) / 100;
            const taxCost = (service.salePrice * params.impostosRate) / 100;
            const materialCosts = service.materialCosts || [];
            const totalMaterialCost = materialCosts.reduce((s, mc) => s + mc.cost, 0);
            const materialCostPct = service.salePrice > 0 ? (totalMaterialCost / service.salePrice) * 100 : 0;
            const totalDirectCosts = service.totalCost;
            const directExpensePct = service.salePrice > 0 ? (totalDirectCosts / service.salePrice) * 100 : 0;
            const operationalMargin = service.salePrice - totalDirectCosts;
            const operationalMarginPct = service.salePrice > 0 ? (operationalMargin / service.salePrice) * 100 : 0;
            const operationalCost = (service.salePrice * params.despesasIndiretasDepreciacao) / 100;
            const partialProfit = operationalMargin - operationalCost;
            const partialProfitPct = service.salePrice > 0 ? (partialProfit / service.salePrice) * 100 : 0;

            return (
              <tr key={service.id}>
                {/* Serviço */}
                <td style={{ fontFamily: 'serif', fontWeight: 600, color: '#f0f0f8', fontSize: 14 }}>{service.name}</td>
                {/* Preço */}
                <td style={{ color: '#f0f0f8', fontWeight: 500 }}>R$ {service.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                {/* Comissão % */}
                <td style={{ color: '#fb923c' }}>{service.commissionRate.toFixed(1)}%</td>
                {/* Valor Comissão */}
                <td style={{ color: '#fb923c' }}>R$ {commissionCost.toFixed(2)}</td>
                {/* Mat Prima R$ */}
                <td style={{ color: '#00c896' }}>
                  <div>R$ {totalMaterialCost.toFixed(2)}</div>
                  {materialCosts.length > 0 && <div style={{ fontSize: 10, color: '#00a07a' }}>{materialCosts.length} item{materialCosts.length > 1 ? 's' : ''}</div>}
                </td>
                {/* Mat Prima % */}
                <td style={{ color: '#00c896' }}>
                  <div>{materialCostPct.toFixed(1)}%</div>
                  {materialCosts.length > 0 && <div style={{ fontSize: 10, color: '#00a07a' }}>do total</div>}
                </td>
                {/* Cartão % */}
                <td style={{ color: '#4d9fff' }}>{params.weightedAverageRate.toFixed(1)}%</td>
                {/* Cartão R$ */}
                <td style={{ color: '#4d9fff' }}>R$ {cardTaxCost.toFixed(2)}</td>
                {/* Imposto % */}
                <td style={{ color: '#a78bfa' }}>{params.impostosRate.toFixed(1)}%</td>
                {/* Imposto R$ */}
                <td style={{ color: '#a78bfa' }}>R$ {taxCost.toFixed(2)}</td>
                {/* Total R$ */}
                <td style={{ color: '#ff4d6a', fontWeight: 600 }}>R$ {totalDirectCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                {/* Total % */}
                <td style={{ color: '#ff4d6a', fontWeight: 600 }}>{directExpensePct.toFixed(1)}%</td>
                {/* Margem Op R$ */}
                <td style={{ color: '#00c896', fontWeight: 600 }}>R$ {operationalMargin.toFixed(2)}</td>
                {/* Margem Op % */}
                <td style={{ color: '#00c896', fontWeight: 600 }}>{operationalMarginPct.toFixed(1)}%</td>
                {/* Custo Op R$ */}
                <td style={{ color: '#4d9fff' }}>R$ {operationalCost.toFixed(2)}</td>
                {/* Custo Op % */}
                <td style={{ color: '#4d9fff' }}>{params.despesasIndiretasDepreciacao.toFixed(1)}%</td>
                {/* Lucro Parcial R$ */}
                <td style={{ color: '#c9a84c', fontWeight: 700 }}>R$ {partialProfit.toFixed(2)}</td>
                {/* Lucro Parcial % */}
                <td style={{ color: '#c9a84c', fontWeight: 700 }}>{partialProfitPct.toFixed(1)}%</td>
                {/* Ações */}
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="svc-icon-btn gold" onClick={() => onAnalyze(service)} title="Analisar">
                      <BarChart3 size={14} style={{ color: '#c9a84c' }} />
                    </button>
                    <button className="svc-icon-btn" onClick={() => onEdit(service)} title="Editar">
                      <Edit size={14} style={{ color: '#9090a8' }} />
                    </button>
                    <button className="svc-icon-btn danger" onClick={() => onDelete(service.id)} title="Excluir">
                      <Trash2 size={14} style={{ color: '#ff4d6a' }} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;
