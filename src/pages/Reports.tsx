import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart as PieChartIcon, Activity, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { useIndirectExpenseValues } from '@/hooks/useIndirectExpenses';
import { useMaterials } from '@/hooks/useMaterials';
import { useServices } from '@/hooks/useServices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MonthlyReportData {
  faturamento: number;
  custosDirectos: number;
  custoOperacional: number;
  despesasIndiretas: number;
  comissoes: number;
  impostos: number;
  lucroOperacional: number;
  lucroLiquido: number;
  margemLucro: number;
  margemOperacional: number;
  totalTransacoes: number;
  transacoesEntrada: number;
  transacoesSaida: number;
  ticketMedio: number;
  servicosRealizados: number;
  custoMateriasPrimas: number;
  percentualCustosDirectos: number;
  percentualCustoOperacional: number;
  ebitda: number;
}

// Modal components for detailed explanations
const InfoModal = ({ title, children, trigger }: { title: string, children: React.ReactNode, trigger: React.ReactNode }) => (
  <Dialog>
    <DialogTrigger asChild>
      {trigger}
    </DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="brand-heading text-xl text-symbol-black">{title}</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        {children}
      </div>
    </DialogContent>
  </Dialog>
);

const FaturamentoModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> Faturamento é toda a receita bruta gerada pelo seu negócio através da venda de serviços e produtos em um período específico.
    </p>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-2">Como é calculado:</h4>
      <p className="text-sm text-blue-700">
        Soma de todas as transações de entrada (vendas) registradas no mês selecionado.
      </p>
    </div>
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="font-semibold text-green-800 mb-2">Por que é importante:</h4>
      <ul className="text-sm text-green-700 space-y-1">
        <li>• Indica o volume de negócios gerado</li>
        <li>• Base para calcular todos os outros indicadores</li>
        <li>• Mostra a capacidade de geração de receita</li>
      </ul>
    </div>
  </div>
);

const CustosDirectosModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> Custos diretamente relacionados à produção dos serviços, incluindo materiais, produtos e mão de obra direta.
    </p>
    <div className="bg-red-50 p-4 rounded-lg">
      <h4 className="font-semibold text-red-800 mb-2">Inclui:</h4>
      <ul className="text-sm text-red-700 space-y-1">
        <li>• Materiais e produtos utilizados nos serviços</li>
        <li>• Mão de obra direta (25% do faturamento por padrão)</li>
        <li>• Insumos consumidos na prestação do serviço</li>
      </ul>
    </div>
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h4 className="font-semibold text-yellow-800 mb-2">Meta ideal:</h4>
      <p className="text-sm text-yellow-700">
        Manter abaixo de 30% do faturamento para garantir boa margem de lucro.
      </p>
    </div>
  </div>
);

const CustoOperacionalModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> Custos fixos e administrativos necessários para manter o negócio funcionando, independentemente do volume de vendas.
    </p>
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h4 className="font-semibold text-yellow-800 mb-2">Inclui:</h4>
      <ul className="text-sm text-yellow-700 space-y-1">
        <li>• Aluguel e condomínio</li>
        <li>• Energia elétrica e água</li>
        <li>• Internet e telefone</li>
        <li>• Salários administrativos</li>
        <li>• Contabilidade e softwares</li>
        <li>• Limpeza e materiais de escritório</li>
      </ul>
    </div>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-2">Como é calculado:</h4>
      <p className="text-sm text-blue-700">
        Despesas indiretas registradas + 15% do faturamento (estimativa de custos administrativos).
      </p>
    </div>
  </div>
);

const ResultadoLiquidoModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> O lucro final que sobra após descontar todos os custos, impostos e comissões do faturamento.
    </p>
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="font-semibold text-green-800 mb-2">Fórmula:</h4>
      <p className="text-sm text-green-700 font-mono">
        Faturamento - Custos Diretos - Custo Operacional - Comissões - Impostos
      </p>
    </div>
    <div className="bg-purple-50 p-4 rounded-lg">
      <h4 className="font-semibold text-purple-800 mb-2">Interpretação:</h4>
      <ul className="text-sm text-purple-700 space-y-1">
        <li>• <strong>Positivo:</strong> Negócio lucrativo</li>
        <li>• <strong>Negativo:</strong> Prejuízo no período</li>
        <li>• <strong>Meta:</strong> Manter sempre positivo e crescente</li>
      </ul>
    </div>
  </div>
);

const MargemLucroModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> Percentual do faturamento que se converte em lucro líquido, indicando a eficiência financeira do negócio.
    </p>
    <div className="bg-purple-50 p-4 rounded-lg">
      <h4 className="font-semibold text-purple-800 mb-2">Fórmula:</h4>
      <p className="text-sm text-purple-700 font-mono">
        (Lucro Líquido ÷ Faturamento) × 100
      </p>
    </div>
    <div className="bg-gradient-to-r from-red-50 to-green-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-2">Classificação:</h4>
      <ul className="text-sm space-y-1">
        <li>• <span className="text-green-600 font-semibold">15%+:</span> Excelente performance</li>
        <li>• <span className="text-yellow-600 font-semibold">10-15%:</span> Boa performance</li>
        <li>• <span className="text-red-600 font-semibold">Abaixo de 10%:</span> Precisa melhorar</li>
      </ul>
    </div>
  </div>
);

const ComposicaoDespesasModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que mostra:</strong> Distribuição visual de como o faturamento está sendo utilizado entre diferentes categorias de gastos e lucro.
    </p>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-2">Como interpretar:</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Fatias maiores = maior proporção do faturamento</li>
        <li>• Ideal: fatia do lucro líquido ser significativa</li>
        <li>• Compare as proporções entre custos</li>
      </ul>
    </div>
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="font-semibold text-green-800 mb-2">Use para:</h4>
      <ul className="text-sm text-green-700 space-y-1">
        <li>• Identificar onde estão os maiores gastos</li>
        <li>• Definir prioridades de otimização</li>
        <li>• Acompanhar mudanças na estrutura de custos</li>
      </ul>
    </div>
  </div>
);

const IndicadoresPerformanceModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que são:</strong> Métricas-chave que avaliam diferentes aspectos da eficiência e saúde financeira do seu negócio.
    </p>
    <div className="space-y-3">
      <div className="bg-green-50 p-3 rounded-lg">
        <h5 className="font-semibold text-green-800 text-sm">Eficiência Operacional</h5>
        <p className="text-xs text-green-700 mt-1">
          Mostra quanto sobra após custos diretos. Meta: acima de 70%
        </p>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg">
        <h5 className="font-semibold text-blue-800 text-sm">Controle de Custos</h5>
        <p className="text-xs text-blue-700 mt-1">
          Percentual gasto em custos diretos. Meta: abaixo de 30%
        </p>
      </div>
      <div className="bg-purple-50 p-3 rounded-lg">
        <h5 className="font-semibold text-purple-800 text-sm">Margem Operacional</h5>
        <p className="text-xs text-purple-700 mt-1">
          Lucro antes de comissões e impostos. Meta: acima de 20%
        </p>
      </div>
    </div>
  </div>
);

const TendenciaLucroModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que mostra:</strong> Evolução do lucro líquido nos últimos 6 meses, permitindo identificar tendências e padrões de crescimento.
    </p>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-2">Como interpretar:</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• <strong>Linha ascendente:</strong> Crescimento consistente</li>
        <li>• <strong>Linha descendente:</strong> Declínio preocupante</li>
        <li>• <strong>Oscilações:</strong> Instabilidade sazonal</li>
      </ul>
    </div>
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="font-semibold text-green-800 mb-2">Use para:</h4>
      <ul className="text-sm text-green-700 space-y-1">
        <li>• Identificar sazonalidade do negócio</li>
        <li>• Avaliar eficácia de estratégias implementadas</li>
        <li>• Planejar ações corretivas ou investimentos</li>
      </ul>
    </div>
  </div>
);

const Reports = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { params } = useBusinessParams();
  const { expenses: indirectExpenses, isLoading: expensesLoading, getTotalByMonth } = useIndirectExpenseValues();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { services, isLoading: servicesLoading } = useServices();

  const isLoading = transactionsLoading || expensesLoading || materialsLoading || servicesLoading;

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = [2022, 2023, 2024, 2025, 2026, 2027];

  // Calculate report data from real database data
  const reportData = useMemo((): MonthlyReportData => {
    const targetDate = new Date(selectedYear, selectedMonth, 1);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const monthKey = format(targetDate, 'yyyy-MM');

    // Filter transactions for the selected month
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    // Calculate revenue (faturamento)
    const faturamento = monthTransactions
      .filter(t => t.tipo_transacao === 'ENTRADA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    // Calculate total expenses from transactions
    const totalExpenses = monthTransactions
      .filter(t => t.tipo_transacao === 'SAIDA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    // Get indirect expenses from database for the specific month
    const despesasIndiretas = getTotalByMonth(monthKey);

    // Calculate material costs (raw materials used in services)
    const custoMateriasPrimas = services.reduce((total, service) => {
      const serviceMaterialCost = service.materialCosts?.reduce((materialTotal, material) => {
        const materialData = materials.find(m => m.id === material.materialId);
        if (materialData) {
          return materialTotal + (materialData.unitCost * material.quantity);
        }
        return materialTotal;
      }, 0) || 0;
      return total + serviceMaterialCost;
    }, 0);

    // Calculate direct costs (materials + direct labor)
    // Using default percentages since these fields don't exist in BusinessParams
    const percentualCustosDirectos = 25; // 25% default
    const custosDirectos = custoMateriasPrimas + (faturamento * (percentualCustosDirectos / 100));

    // Calculate operational cost (indirect expenses + admin costs)
    const percentualCustoOperacional = 15; // 15% default
    const custoOperacional = despesasIndiretas + (faturamento * (percentualCustoOperacional / 100));

    // Calculate commissions based on business params
    const percentualComissao = 10; // 10% default
    const comissoes = faturamento * (percentualComissao / 100);

    // Calculate taxes based on business params
    const percentualImposto = params?.impostosRate || 8; // 8% default
    const impostos = faturamento * (percentualImposto / 100);

    // Calculate profits
    const lucroOperacional = faturamento - custosDirectos - custoOperacional;
    const lucroLiquido = faturamento - custosDirectos - custoOperacional - comissoes - impostos;
    
    // Calculate margins
    const margemLucro = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0;
    const margemOperacional = faturamento > 0 ? (lucroOperacional / faturamento) * 100 : 0;

    // Calculate EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)
    const ebitda = lucroOperacional + impostos;

    // Transaction metrics
    const transacoesEntrada = monthTransactions.filter(t => t.tipo_transacao === 'ENTRADA').length;
    const transacoesSaida = monthTransactions.filter(t => t.tipo_transacao === 'SAIDA').length;
    const totalTransacoes = monthTransactions.length;
    const ticketMedio = transacoesEntrada > 0 ? faturamento / transacoesEntrada : 0;
    const servicosRealizados = transacoesEntrada; // Assuming each income transaction is a service

    return {
      faturamento,
      custosDirectos,
      custoOperacional,
      despesasIndiretas,
      comissoes,
      impostos,
      lucroOperacional,
      lucroLiquido,
      margemLucro,
      margemOperacional,
      totalTransacoes,
      transacoesEntrada,
      transacoesSaida,
      ticketMedio,
      servicosRealizados,
      custoMateriasPrimas,
      percentualCustosDirectos: faturamento > 0 ? (custosDirectos / faturamento) * 100 : 0,
      percentualCustoOperacional: faturamento > 0 ? (custoOperacional / faturamento) * 100 : 0,
      ebitda,
    };
  }, [transactions, selectedMonth, selectedYear, getTotalByMonth, services, materials, params]);

  // Historical data for trend analysis (last 6 months)
  const historicalData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(selectedYear, selectedMonth, 1), i);
      const monthKey = format(date, 'yyyy-MM');
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const faturamento = monthTransactions
        .filter(t => t.tipo_transacao === 'ENTRADA')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      const despesasIndiretas = getTotalByMonth(monthKey);
      const percentualCustosDirectos = 25;
      const percentualCustoOperacional = 15;
      const custosDirectos = faturamento * (percentualCustosDirectos / 100);
      const custoOperacional = despesasIndiretas + (faturamento * (percentualCustoOperacional / 100));
      const comissoes = faturamento * (10 / 100);
      const impostos = faturamento * ((params?.impostosRate || 8) / 100);
      const lucroLiquido = faturamento - custosDirectos - custoOperacional - comissoes - impostos;

      months.push({
        month: format(date, 'MMM', { locale: ptBR }),
        monthFull: format(date, 'MMMM yyyy', { locale: ptBR }),
        faturamento,
        lucroLiquido,
        custosDirectos,
        custoOperacional,
        despesasIndiretas,
      });
    }
    return months;
  }, [transactions, selectedMonth, selectedYear, getTotalByMonth, params]);

  const chartConfig = {
    value: {
      label: "Valor (R$)",
    },
    faturamento: {
      label: "Faturamento",
      color: "#c5a876",
    },
    custosDirectos: {
      label: "Custos Diretos",
      color: "#d9d3c5",
    },
    custoOperacional: {
      label: "Custo Operacional",
      color: "#b8860b",
    },
    lucroLiquido: {
      label: "Lucro Líquido",
      color: "#070808",
    },
    despesasIndiretas: {
      label: "Despesas Indiretas",
      color: "#737373",
    },
    comissoes: {
      label: "Comissões",
      color: "#a3a3a3",
    },
    impostos: {
      label: "Impostos",
      color: "#d4d4d8",
    },
  };

  // Pie chart data for cost breakdown
  const pieData = useMemo(() => {
    if (!reportData || reportData.faturamento === 0) return [];
    
    return [
      { 
        name: 'Custos Diretos', 
        value: reportData.custosDirectos, 
        color: '#ef4444', // Vermelho mais vibrante para custos diretos
        percentage: reportData.percentualCustosDirectos.toFixed(1)
      },
      { 
        name: 'Custo Operacional', 
        value: reportData.custoOperacional, 
        color: '#f97316', // Laranja para custo operacional
        percentage: reportData.percentualCustoOperacional.toFixed(1)
      },
      { 
        name: 'Comissões', 
        value: reportData.comissoes, 
        color: '#8b5cf6', // Roxo para comissões
        percentage: ((reportData.comissoes / reportData.faturamento) * 100).toFixed(1)
      },
      { 
        name: 'Impostos', 
        value: reportData.impostos, 
        color: '#64748b', // Cinza azulado para impostos
        percentage: ((reportData.impostos / reportData.faturamento) * 100).toFixed(1)
      },
      { 
        name: 'Lucro Líquido', 
        value: reportData.lucroLiquido, 
        color: reportData.lucroLiquido >= 0 ? '#22c55e' : '#dc2626', // Verde para lucro, vermelho para prejuízo
        percentage: reportData.margemLucro.toFixed(1)
      }
    ].filter(item => item.value > 0);
  }, [reportData]);

  // Bar chart data for monthly comparison
  const barData = useMemo(() => {
    if (!reportData) return [];
    
    const totalCosts = reportData.custosDirectos + reportData.custoOperacional + reportData.comissoes + reportData.impostos;
    
    return [
      {
        category: 'Resultado Mensal',
        faturamento: reportData.faturamento,
        custosDirectos: reportData.custosDirectos,
        custoOperacional: reportData.custoOperacional,
        comissoes: reportData.comissoes,
        impostos: reportData.impostos,
        lucroLiquido: reportData.lucroLiquido,
        totalCosts
      }
    ];
  }, [reportData]);

  // Line chart data for historical trend
  const lineData = useMemo(() => {
    return historicalData;
  }, [historicalData]);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 animate-minimal-fade">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Carregando dados do relatório...</div>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.faturamento === 0) {
    return (
      <div className="space-y-8 p-6 animate-minimal-fade">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="brand-heading text-3xl text-symbol-black">Relatórios Mensais</h1>
            <div className="w-12 h-px bg-symbol-gold mb-4"></div>
            <p className="brand-body text-symbol-gray-600 mt-2">Análise completa do desempenho financeiro</p>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-40 bg-symbol-gray-50 border-symbol-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24 bg-symbol-gray-50 border-symbol-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="symbol-card p-8 text-center">
          <CardContent>
            <div className="text-symbol-gray-500">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-symbol-gray-300" />
              <h3 className="brand-heading text-xl text-symbol-black mb-2">Sem dados para este período</h3>
              <p className="brand-body">Não há transações registradas para {months[selectedMonth]} de {selectedYear}.</p>
              <p className="mt-2 text-sm brand-body text-symbol-gray-600">Registre algumas transações para visualizar o relatório mensal.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 animate-minimal-fade">
      {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="brand-heading text-3xl text-symbol-black mb-2">
              Relatório Mensal
            </h1>
            <div className="w-12 h-px bg-symbol-gold mb-4"></div>
            <p className="brand-body text-symbol-gray-600">
              Análise consolidada da saúde financeira do seu negócio
            </p>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-48 bg-symbol-gray-50 border-symbol-gray-300">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-32 bg-symbol-gray-50 border-symbol-gray-300">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Executive Summary */}
        <div className="symbol-card p-4 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-symbol-gold/10 to-symbol-beige/20 border-symbol-gold/30">
          <div className="mb-4 lg:mb-6">
            <h3 className="brand-heading text-lg lg:text-xl text-symbol-black mb-2">
              Resumo Executivo - {months[selectedMonth]} {selectedYear}
            </h3>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl mb-2">
                {reportData.lucroLiquido >= 0 ? '📈' : '📉'}
              </div>
              <p className="text-xs lg:text-sm text-symbol-gray-600 mb-1">Status Financeiro</p>
              <p className={`font-semibold text-sm lg:text-base ${reportData.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.lucroLiquido >= 0 ? 'Lucrativo' : 'Prejuízo'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl mb-2">🎯</div>
              <p className="text-xs lg:text-sm text-symbol-gray-600 mb-1">Ticket Médio</p>
              <p className="font-semibold text-symbol-black text-sm lg:text-base">
                {formatCurrency(reportData.ticketMedio)}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl mb-2">📊</div>
              <p className="text-xs lg:text-sm text-symbol-gray-600 mb-1">Eficiência</p>
              <p className={`font-semibold text-sm lg:text-base ${reportData.margemLucro >= 15 ? 'text-green-600' : reportData.margemLucro >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {reportData.margemLucro >= 15 ? 'Excelente' : reportData.margemLucro >= 10 ? 'Boa' : 'Baixa'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl mb-2">⚡</div>
              <p className="text-xs lg:text-sm text-symbol-gray-600 mb-1">Serviços Realizados</p>
              <p className="font-semibold text-symbol-black text-sm lg:text-base">
                {reportData.servicosRealizados}
              </p>
            </div>
          </div>
          <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-white/50 rounded-lg">
            <p className="text-xs lg:text-sm text-symbol-gray-700 leading-relaxed">
              <strong>Análise:</strong> 
              {reportData.lucroLiquido >= 0 
                ? ` Mês positivo com margem de ${reportData.margemLucro.toFixed(1)}%. ` 
                : ` Mês com prejuízo de ${reportData.margemLucro.toFixed(1)}%. `}
              {reportData.margemLucro >= 15 
                ? 'Excelente performance financeira!' 
                : reportData.margemLucro >= 10 
                  ? 'Performance boa, com espaço para otimização.' 
                  : 'Recomenda-se revisar custos e preços.'}
            </p>
          </div>
        </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <DollarSign className="text-blue-600" size={20} />
            <InfoModal 
              title="Faturamento Total" 
              trigger={
                <button className="p-2 hover:bg-blue-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-blue-600 cursor-pointer" />
                </button>
              }
            >
              <FaturamentoModal />
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Faturamento Total
            </h3>
          </div>
          <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
            {formatCurrency(reportData.faturamento)}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            {reportData.transacoesEntrada} transações
          </div>
        </div>

        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <TrendingDown className="text-red-600" size={20} />
            <InfoModal 
              title="Custos Diretos" 
              trigger={
                <button className="p-2 hover:bg-red-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-red-600 cursor-pointer" />
                </button>
              }
            >
              <CustosDirectosModal />
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Custos Diretos
            </h3>
          </div>
          <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
            {formatCurrency(reportData.custosDirectos)}
          </div>
          <div className="text-xs text-red-600 font-medium mt-1">
            {reportData.percentualCustosDirectos.toFixed(1)}% do faturamento
          </div>
        </div>

        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 border-yellow-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <Activity className="text-yellow-600" size={20} />
            <InfoModal 
              title="Custo Operacional" 
              trigger={
                <button className="p-2 hover:bg-yellow-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-yellow-600 cursor-pointer" />
                </button>
              }
            >
              <CustoOperacionalModal />
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Custo Operacional
            </h3>
          </div>
          <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
            {formatCurrency(reportData.custoOperacional)}
          </div>
          <div className="text-xs text-yellow-600 font-medium mt-1">
            {reportData.percentualCustoOperacional.toFixed(1)}% do faturamento
          </div>
        </div>

        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <TrendingUp className={`${reportData.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`} size={20} />
            <InfoModal 
              title="Resultado Líquido" 
              trigger={
                <button className="p-2 hover:bg-emerald-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-emerald-600 cursor-pointer" />
                </button>
              }
            >
              <ResultadoLiquidoModal />
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Resultado Líquido
            </h3>
          </div>
          <div className={`brand-heading text-lg lg:text-2xl ${reportData.lucroLiquido >= 0 ? 'text-symbol-black' : 'text-red-600'}`}>
            {formatCurrency(reportData.lucroLiquido)}
          </div>
          <div className={`text-xs font-medium mt-1 ${reportData.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {reportData.margemLucro.toFixed(1)}% margem
          </div>
        </div>

        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <Target className="text-purple-600" size={20} />
            <InfoModal 
              title="Margem de Lucro" 
              trigger={
                <button className="p-2 hover:bg-purple-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-purple-600 cursor-pointer" />
                </button>
              }
            >
              <MargemLucroModal />
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Margem de Lucro
            </h3>
          </div>
          <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
            {reportData.margemLucro.toFixed(1)}%
          </div>
          <div className={`text-xs font-medium mt-1 ${reportData.margemLucro >= 15 ? 'text-green-600' : reportData.margemLucro >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
            {reportData.margemLucro >= 15 ? 'Excelente' : reportData.margemLucro >= 10 ? 'Boa' : 'Precisa melhorar'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-amber-50/50 to-amber-100/30 border-amber-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <BarChart3 className="text-amber-600" size={20} />
            <InfoModal 
              title="Despesas Indiretas" 
              trigger={
                <button className="p-2 hover:bg-amber-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-amber-600 cursor-pointer" />
                </button>
              }
            >
              <div className="space-y-4">
                <p className="text-sm text-symbol-gray-700 leading-relaxed">
                  <strong>O que são:</strong> Gastos fixos mensais necessários para manter o negócio funcionando, independentemente do volume de vendas.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Exemplos:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Aluguel e condomínio</li>
                    <li>• Energia elétrica e água</li>
                    <li>• Internet e telefone</li>
                    <li>• Contabilidade</li>
                    <li>• Limpeza e materiais de escritório</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Importância:</h4>
                  <p className="text-sm text-blue-700">
                    Controlar essas despesas é fundamental para manter a lucratividade, pois elas ocorrem mesmo quando não há vendas.
                  </p>
                </div>
              </div>
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Despesas Indiretas
            </h3>
          </div>
          <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
            {formatCurrency(reportData.despesasIndiretas)}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            Custos fixos mensais
          </div>
        </div>

        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border-indigo-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <DollarSign className="text-indigo-600" size={20} />
            <InfoModal 
              title="Comissões / Pró-labore" 
              trigger={
                <button className="p-2 hover:bg-indigo-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-indigo-600 cursor-pointer" />
                </button>
              }
            >
              <div className="space-y-4">
                <p className="text-sm text-symbol-gray-700 leading-relaxed">
                  <strong>O que são:</strong> Comissões pagas aos profissionais e pró-labore dos sócios, representando a remuneração variável do negócio.
                </p>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Inclui:</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Comissões de vendas</li>
                    <li>• Pró-labore dos sócios</li>
                    <li>• Bonificações por performance</li>
                    <li>• Participação nos lucros</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Vantagem:</h4>
                  <p className="text-sm text-green-700">
                    É um custo variável - aumenta com as vendas, garantindo sustentabilidade do negócio.
                  </p>
                </div>
              </div>
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Comissões / Pró-labore
            </h3>
          </div>
          <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
            {formatCurrency(reportData.comissoes)}
          </div>
          <div className="text-xs text-indigo-600 font-medium mt-1">
            10% do faturamento
          </div>
        </div>

        <div className="symbol-card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-rose-50/50 to-rose-100/30 border-rose-200/50">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <TrendingDown className="text-rose-600" size={20} />
            <InfoModal 
              title="Impostos Gerais" 
              trigger={
                <button className="p-2 hover:bg-rose-100 rounded-full transition-colors touch-manipulation">
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-rose-600 cursor-pointer" />
                </button>
              }
            >
              <div className="space-y-4">
                <p className="text-sm text-symbol-gray-700 leading-relaxed">
                  <strong>O que são:</strong> Impostos e taxas sobre o faturamento, variando conforme o regime tributário da empresa.
                </p>
                <div className="bg-rose-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-rose-800 mb-2">Principais tipos:</h4>
                  <ul className="text-sm text-rose-700 space-y-1">
                    <li>• MEI: Taxa fixa mensal</li>
                    <li>• Simples Nacional: % sobre faturamento</li>
                    <li>• ISS: Imposto sobre serviços</li>
                    <li>• Taxas de cartão e PIX</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Dica:</h4>
                  <p className="text-sm text-yellow-700">
                    Consulte um contador para otimizar seu regime tributário e reduzir este percentual.
                  </p>
                </div>
              </div>
            </InfoModal>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-xs lg:text-sm uppercase tracking-wider">
              Impostos Gerais
            </h3>
          </div>
          <div className="brand-heading text-lg lg:text-2xl text-symbol-black">
            {formatCurrency(reportData.impostos)}
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            {((reportData.impostos / reportData.faturamento) * 100).toFixed(1)}% do faturamento
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Expense Composition Chart */}
        <div className="symbol-card p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="brand-heading text-lg lg:text-xl text-symbol-black">
                Composição das Despesas
              </h3>
              <InfoModal 
                title="Composição das Despesas" 
                trigger={
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation">
                    <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-symbol-gray-700 cursor-pointer" />
                  </button>
                }
              >
                <ComposicaoDespesasModal />
              </InfoModal>
            </div>
            <p className="text-xs lg:text-sm text-symbol-gray-600 mb-4">
              Distribuição percentual do faturamento entre custos operacionais, diretos e lucro líquido
            </p>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          <div className="flex justify-center items-center">
            <ChartContainer config={chartConfig} className="h-56 sm:h-64 lg:h-72 w-full max-w-md mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="70%"
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent 
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                      labelFormatter={() => ''}
                    />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-white shadow-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-symbol-gray-700 font-medium truncate">
                    {item.name}
                  </span>
                  <span className="text-symbol-gray-600 font-semibold ml-auto">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
            
            {/* Resumo visual para mobile */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100 sm:hidden">
              <div className="text-center">
                <p className="text-xs text-symbol-gray-600 mb-1">Distribuição do Faturamento</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-600 font-medium">
                    Custos: {(reportData.percentualCustosDirectos + reportData.percentualCustoOperacional).toFixed(1)}%
                  </span>
                  <span className="text-purple-600 font-medium">
                    Deduções: {(((reportData.comissoes + reportData.impostos) / reportData.faturamento) * 100).toFixed(1)}%
                  </span>
                  <span className={`font-bold ${reportData.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Lucro: {reportData.margemLucro.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="symbol-card p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="brand-heading text-lg lg:text-xl text-symbol-black">
                Indicadores de Performance
              </h3>
              <InfoModal 
                title="Indicadores de Performance" 
                trigger={
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation">
                    <Info className="w-4 h-4 lg:w-5 lg:h-5 text-symbol-gray-500 hover:text-symbol-gray-700 cursor-pointer" />
                  </button>
                }
              >
                <IndicadoresPerformanceModal />
              </InfoModal>
            </div>
            <p className="text-xs lg:text-sm text-symbol-gray-600 mb-4">
              Métricas essenciais para avaliar a saúde financeira e eficiência operacional
            </p>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          <div className="space-y-4 lg:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                <span className="brand-body text-symbol-gray-700 text-sm lg:text-base">Eficiência Operacional</span>
                <span className="brand-heading text-symbol-black text-lg lg:text-xl">
                  {((reportData.faturamento - reportData.custosDirectos) / reportData.faturamento * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((reportData.faturamento - reportData.custosDirectos) / reportData.faturamento * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-symbol-gray-500 mt-1">
                Meta ideal: acima de 70% • Atual: {((reportData.faturamento - reportData.custosDirectos) / reportData.faturamento * 100).toFixed(1)}%
              </p>
            </div>
            
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                <span className="brand-body text-symbol-gray-700 text-sm lg:text-base">Controle de Custos</span>
                <span className="brand-heading text-symbol-black text-lg lg:text-xl">
                  {(reportData.custosDirectos / reportData.faturamento * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(reportData.custosDirectos / reportData.faturamento * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-symbol-gray-500 mt-1">
                Meta ideal: abaixo de 30% • Atual: {(reportData.custosDirectos / reportData.faturamento * 100).toFixed(1)}%
              </p>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                <span className="brand-body text-symbol-gray-700 text-sm lg:text-base">Margem Operacional</span>
                <span className="brand-heading text-symbol-black text-lg lg:text-xl">
                  {reportData.margemOperacional.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${reportData.margemOperacional >= 0 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(reportData.margemOperacional), 100)}%` }}
                />
              </div>
              <p className="text-xs text-symbol-gray-500 mt-1">
                Meta ideal: acima de 20% • Atual: {reportData.margemOperacional.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reports;
