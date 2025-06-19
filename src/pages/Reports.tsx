import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinessParams } from '@/hooks/useBusinessParams';

interface MonthlyReportData {
  faturamento: number;
  despesas: number;
  lucroOperacional: number;
  margemLucro: number;
  totalTransacoes: number;
  transacoesEntrada: number;
  transacoesSaida: number;
  custosDirectos: number;
  despesasIndiretas: number;
  comissoes: number;
  impostos: number;
  lucroLiquido: number;
}

const Reports = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { transactions, isLoading } = useTransactions();
  const { params } = useBusinessParams();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = [2022, 2023, 2024, 2025];

  // Calculate report data from real transactions
  const reportData = useMemo((): MonthlyReportData => {
    const targetDate = new Date(selectedYear, selectedMonth, 1);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const faturamento = monthTransactions
      .filter(t => t.tipo_transacao === 'ENTRADA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = monthTransactions
      .filter(t => t.tipo_transacao === 'SAIDA')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const lucroOperacional = faturamento - despesas;
    const margemLucro = faturamento > 0 ? (lucroOperacional / faturamento) * 100 : 0;

    // Calculate detailed breakdown
    const custosDirectos = despesas * 0.4; // 40% of expenses as direct costs
    const despesasIndiretas = despesas * 0.35; // 35% as indirect expenses
    const comissoes = faturamento * 0.1; // 10% of revenue as commissions
    const impostos = faturamento * 0.08; // 8% as taxes
    const lucroLiquido = faturamento - custosDirectos - despesasIndiretas - comissoes - impostos;

    const transacoesEntrada = monthTransactions.filter(t => t.tipo_transacao === 'ENTRADA').length;
    const transacoesSaida = monthTransactions.filter(t => t.tipo_transacao === 'SAIDA').length;

    return {
      faturamento,
      despesas,
      lucroOperacional,
      margemLucro,
      totalTransacoes: monthTransactions.length,
      transacoesEntrada,
      transacoesSaida,
      custosDirectos,
      despesasIndiretas,
      comissoes,
      impostos,
      lucroLiquido,
    };
  }, [transactions, selectedMonth, selectedYear]);

  // Mock data for demonstration (kept as fallback)
  const mockData = useMemo(() => ({
    '2024-11': {
      faturamento: 12500.00,
      despesas: 3750.00,
      lucroOperacional: 8750.00,
      margemLucro: 70.0,
      totalTransacoes: 85,
      transacoesEntrada: 60,
      transacoesSaida: 25,
      custosDirectos: 1500.00,
      despesasIndiretas: 1312.50,
      comissoes: 1250.00,
      impostos: 1000.00,
      lucroLiquido: 7437.50,
    },
    '2024-10': {
      faturamento: 11200.00,
      despesas: 3360.00,
      lucroOperacional: 7840.00,
      margemLucro: 70.0,
      totalTransacoes: 78,
      transacoesEntrada: 55,
      transacoesSaida: 23,
      custosDirectos: 1344.00,
      despesasIndiretas: 1176.00,
      comissoes: 1120.00,
      impostos: 896.00,
      lucroLiquido: 6664.00,
    },
    '2024-9': {
      faturamento: 13800.00,
      despesas: 4140.00,
      lucroOperacional: 9660.00,
      margemLucro: 70.0,
      totalTransacoes: 92,
      transacoesEntrada: 65,
      transacoesSaida: 27,
      custosDirectos: 1656.00,
      despesasIndiretas: 1449.00,
      comissoes: 1380.00,
      impostos: 1104.00,
      lucroLiquido: 8211.00,
    }
  }), []);

  const reportKey = `${selectedYear}-${selectedMonth}`;
  const currentReportData = reportData.faturamento > 0 ? reportData : mockData[reportKey];

  const chartConfig = {
    value: {
      label: "Valor (R$)",
    },
    faturamento: {
      label: "Faturamento",
      color: "#c5a876",
    },
    custos: {
      label: "Custos Totais",
      color: "#525252",
    },
    lucro: {
      label: "Lucro Líquido",
      color: "#070808",
    },
  };

  const pieData = useMemo(() => {
    if (!reportData) return [];
    
    return [
      { name: 'Custos Diretos', value: reportData.custosDirectos, color: '#d9d3c5' },
      { name: 'Despesas Indiretas', value: reportData.despesasIndiretas, color: '#c5a876' },
      { name: 'Comissões', value: reportData.comissoes, color: '#737373' },
      { name: 'Impostos', value: reportData.impostos, color: '#a3a3a3' }
    ];
  }, [reportData]);

  const barData = useMemo(() => {
    if (!reportData) return [];
    
    const totalCosts = reportData.custosDirectos + reportData.despesasIndiretas + reportData.comissoes + reportData.impostos;
    
    return [
      {
        category: 'Resultado Mensal',
        faturamento: reportData.faturamento,
        custos: totalCosts,
        lucro: reportData.lucroLiquido
      }
    ];
  }, [reportData]);

  const lineData = useMemo(() => {
    return [
      { month: 'Set', lucro: mockData['2024-9']?.lucroLiquido || 0 },
      { month: 'Out', lucro: mockData['2024-10']?.lucroLiquido || 0 },
      { month: 'Nov', lucro: mockData['2024-11']?.lucroLiquido || 0 }
    ];
  }, [mockData]);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (!reportData) {
    return (
      <div className="space-y-8 p-6 animate-minimal-fade">
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-48 bg-symbol-gray-50 border-symbol-gray-300">
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
            <SelectTrigger className="w-32 bg-symbol-gray-50 border-symbol-gray-300">
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

        {/* No Data State */}
        <div className="symbol-card p-12 text-center shadow-lg">
          <div className="mx-auto w-24 h-24 bg-symbol-beige/30 flex items-center justify-center mb-6 rounded-lg">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="brand-subheading text-symbol-black text-lg mb-3">
            Não há dados suficientes para gerar o relatório
          </h3>
          <p className="brand-body text-symbol-gray-600">
            Para {months[selectedMonth]}/{selectedYear}. Por favor, verifique seus lançamentos nas seções correspondentes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
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
        
        <Button className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-3 px-6 uppercase tracking-wide text-sm transition-all duration-300">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
          <SelectTrigger className="w-48 bg-symbol-gray-50 border-symbol-gray-300">
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
          <SelectTrigger className="w-32 bg-symbol-gray-50 border-symbol-gray-300">
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

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-blue-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Faturamento Total
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {formatCurrency(reportData.faturamento)}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Custos Diretos
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {formatCurrency(reportData.custosDirectos)}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className={`${reportData.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`} size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Resultado Líquido
            </h3>
          </div>
          <div className={`brand-heading text-2xl ${reportData.lucroLiquido >= 0 ? 'text-symbol-black' : 'text-red-600'}`}>
            {formatCurrency(reportData.lucroLiquido)}
          </div>
          <div className="text-sm text-emerald-600 font-medium">
            {reportData.margemLucro.toFixed(1)}% margem
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
          <div className="flex items-center justify-between mb-4">
            <Target className="text-purple-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Margem de Lucro
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {reportData.margemLucro.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-amber-50/50 to-amber-100/30 border-amber-200/50">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="text-amber-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Despesas Indiretas
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {formatCurrency(reportData.despesasIndiretas)}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border-indigo-200/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-indigo-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Comissões / Pró-labore
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {formatCurrency(reportData.comissoes)}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-rose-50/50 to-rose-100/30 border-rose-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="text-rose-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Impostos Gerais
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {formatCurrency(reportData.impostos)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Composition Chart */}
        <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-6">
            <h3 className="brand-heading text-xl text-symbol-black mb-2">
              Composição das Despesas
            </h3>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Performance Indicators */}
        <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-6">
            <h3 className="brand-heading text-xl text-symbol-black mb-2">
              Indicadores de Performance
            </h3>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="brand-body text-symbol-gray-700">Eficiência Operacional</span>
              <span className="brand-heading text-symbol-black">
                {((reportData.faturamento - reportData.custosDirectos) / reportData.faturamento * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                style={{ width: `${(reportData.faturamento - reportData.custosDirectos) / reportData.faturamento * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="brand-body text-symbol-gray-700">Controle de Custos</span>
              <span className="brand-heading text-symbol-black">
                {(reportData.custosDirectos / reportData.faturamento * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-symbol-gray-200 h-2 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                style={{ width: `${reportData.custosDirectos / reportData.faturamento * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h3 className="brand-heading text-xl text-symbol-black mb-2">
            Tendência do Lucro Líquido
          </h3>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="month" stroke="#737373" fontSize={12} fontWeight={300} />
              <YAxis stroke="#737373" fontSize={12} fontWeight={300} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
              />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                stroke="#c5a876" 
                strokeWidth={2}
                dot={{ fill: "#c5a876", strokeWidth: 1, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default Reports;
