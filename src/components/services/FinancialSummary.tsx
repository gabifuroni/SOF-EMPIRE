interface FinancialSummaryProps {
  salePrice: number; commissionRate: number; commissionCost: number;
  cardTaxRate: number; cardTaxCost: number; serviceTaxRate: number; serviceTaxCost: number;
  materialCost: number; materialCostPercentage: number; totalDirectCosts: number;
  totalDirectCostsPercentage: number; operationalMargin: number; operationalMarginPercentage: number;
  operationalCost: number; operationalCostPercentage: number; partialProfit: number; partialProfitPercentage: number;
}

const FinancialSummary = ({ salePrice, commissionRate, commissionCost, cardTaxRate, cardTaxCost, serviceTaxRate, serviceTaxCost, materialCost, materialCostPercentage, totalDirectCosts, totalDirectCostsPercentage, operationalMargin, operationalMarginPercentage, operationalCost, operationalCostPercentage, partialProfit, partialProfitPercentage }: FinancialSummaryProps) => {
  const s = { borderRadius: 10, padding: '12px 14px', marginBottom: 0 };

  return (
    <div style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 12, padding: '20px 24px' }}>
      <h3 style={{ fontFamily: 'serif', fontSize: 18, fontWeight: 600, color: '#f0f0f8', marginBottom: 16 }}>Resumo Financeiro</h3>

      {/* Preço */}
      <div style={{ ...s, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 8 }}>💰 Preço do Serviço</div>
        <div style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 600, color: '#c9a84c' }}>
          R$ {salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Custos Diretos */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 10 }}>📊 Custos Diretos</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Comissão/Rateio', value: commissionCost, pct: commissionRate, color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)' },
            { label: 'Taxa Cartão', value: cardTaxCost, pct: cardTaxRate, color: '#4d9fff', bg: 'rgba(77,159,255,0.08)', border: 'rgba(77,159,255,0.2)' },
            { label: 'Impostos', value: serviceTaxCost, pct: serviceTaxRate, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
            { label: 'Matéria-Prima', value: materialCost, pct: materialCostPercentage, color: '#00c896', bg: 'rgba(0,200,150,0.08)', border: 'rgba(0,200,150,0.2)' },
          ].map((item, i) => (
            <div key={i} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: item.color, marginBottom: 4 }}>{item.label}:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f8' }}>R$ {item.value.toFixed(2)}</span>
                <span style={{ fontSize: 11, color: item.color, fontWeight: 500 }}>{item.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
        {/* Total diretos */}
        <div style={{ background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 8, padding: '12px 14px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#ff4d6a' }}>Total Custos Diretos:</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#ff4d6a' }}>R$ {totalDirectCosts.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: '#ff8fa3' }}>{totalDirectCostsPercentage.toFixed(1)}% do preço</div>
          </div>
        </div>
      </div>

      {/* Análise de Margem */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 10 }}>📈 Análise de Margem</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#00c896' }}>Margem Operacional:</div>
              <div style={{ fontSize: 11, color: '#9090a8' }}>Valor - Custos Diretos</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#00c896' }}>R$ {operationalMargin.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: '#00a07a' }}>{operationalMarginPercentage.toFixed(1)}%</div>
            </div>
          </div>
          <div style={{ background: 'rgba(77,159,255,0.08)', border: '1px solid rgba(77,159,255,0.2)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4d9fff' }}>Custo Operacional:</div>
              <div style={{ fontSize: 11, color: '#9090a8' }}>Despesas Indiretas</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#4d9fff' }}>R$ {operationalCost.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: '#4d9fff' }}>{operationalCostPercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lucro Parcial */}
      <div style={{ background: partialProfit >= 0 ? 'rgba(201,168,76,0.08)' : 'rgba(255,77,106,0.08)', border: `1px solid ${partialProfit >= 0 ? 'rgba(201,168,76,0.3)' : 'rgba(255,77,106,0.3)'}`, borderRadius: 10, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'serif', fontSize: 15, fontWeight: 600, color: '#f0f0f8' }}>💎 Lucro Parcial:</div>
            <div style={{ fontSize: 11, color: '#9090a8' }}>Margem Op. - Custo Op.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, color: partialProfit >= 0 ? '#c9a84c' : '#ff4d6a' }}>
              R$ {partialProfit.toFixed(2)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: partialProfit >= 0 ? '#c9a84c' : '#ff4d6a' }}>
              {partialProfitPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
        {partialProfitPercentage < 0 && (
          <div style={{ background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#ff8fa3' }}>
            ⚠️ Atenção: Este serviço está operando com prejuízo!
          </div>
        )}
        {partialProfitPercentage >= 0 && partialProfitPercentage < 10 && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#fcd34d' }}>
            ⚠️ Margem baixa: Considere revisar os custos ou preço.
          </div>
        )}
        {partialProfitPercentage >= 10 && (
          <div style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#00c896' }}>
            ✅ Boa margem de lucro para este serviço!
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSummary;
