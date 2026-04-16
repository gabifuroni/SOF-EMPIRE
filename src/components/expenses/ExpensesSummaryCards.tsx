import { Receipt, DollarSign, Calculator, TrendingUp, ShoppingCart, Building } from 'lucide-react';

interface ExpensesSummaryCardsProps {
  totalCategories: number;
  monthTotal: number;
  fixedExpensesTotal: number;
  variableExpenses: number;
  directExpensesTotal: number;
  indirectExpensesTotal: number;
}

const ExpensesSummaryCards = ({ totalCategories, monthTotal, fixedExpensesTotal, variableExpenses, directExpensesTotal, indirectExpensesTotal }: ExpensesSummaryCardsProps) => {
  const cards = [
    { icon: <Receipt size={16} style={{ color: '#4d9fff' }} />, bg: 'rgba(77,159,255,0.08)', label: 'Total de Categorias', value: totalCategories, isNumber: true },
    { icon: <DollarSign size={16} style={{ color: '#ff4d6a' }} />, bg: 'rgba(255,77,106,0.08)', label: 'Total do Mês', value: monthTotal, isNumber: false },
    { icon: <Calculator size={16} style={{ color: '#00c896' }} />, bg: 'rgba(0,200,150,0.08)', label: 'Despesas Fixas', value: fixedExpensesTotal, isNumber: false },
    { icon: <TrendingUp size={16} style={{ color: '#c9a84c' }} />, bg: 'rgba(201,168,76,0.08)', label: 'Despesas Variáveis', value: variableExpenses, isNumber: false },
    { icon: <ShoppingCart size={16} style={{ color: '#fb923c' }} />, bg: 'rgba(251,146,60,0.08)', label: 'Despesas Diretas', value: directExpensesTotal, isNumber: false },
    { icon: <Building size={16} style={{ color: '#a78bfa' }} />, bg: 'rgba(167,139,250,0.08)', label: 'Despesas Indiretas', value: indirectExpensesTotal, isNumber: false },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
      {cards.map((card, i) => (
        <div key={i} style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '16px 18px', transition: 'border-color 0.2s' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            {card.icon}
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 4 }}>{card.label}</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 600, color: '#f0f0f8' }}>
            {card.isNumber ? card.value : `R$ ${(card.value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpensesSummaryCards;
