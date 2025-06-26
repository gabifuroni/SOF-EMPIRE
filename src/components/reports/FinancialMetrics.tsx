import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Percent, Calculator } from 'lucide-react';

interface FinancialMetricsProps {
  faturamentoBruto: number;
  custosDirectos: number;
  custosIndirectos: number;
  servicosRealizados: number;
  ticketMedio: number;
  resultadoLiquido: number;
  margemLucro: number;
  isLoading?: boolean;
}

const FinancialMetrics = ({
  faturamentoBruto,
  custosDirectos,
  custosIndirectos,
  servicosRealizados,
  ticketMedio,
  resultadoLiquido,
  margemLucro,
  isLoading = false
}: FinancialMetricsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Faturamento Bruto */}
      <Card className="symbol-card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-symbol-gray-700 uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Faturamento Bruto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-symbol-black">
            {formatCurrency(faturamentoBruto)}
          </div>
        </CardContent>
      </Card>

      {/* Custos Diretos */}
      <Card className="symbol-card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50/50 to-orange-100/30 border-orange-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-symbol-gray-700 uppercase tracking-wider">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            Custos Diretos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-symbol-black">
            {formatCurrency(custosDirectos)}
          </div>
        </CardContent>
      </Card>

      {/* Custos Indiretos */}
      <Card className="symbol-card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-symbol-gray-700 uppercase tracking-wider">
            <Calculator className="h-4 w-4 text-red-600" />
            Custos Indiretos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-symbol-black">
            {formatCurrency(custosIndirectos)}
          </div>
        </CardContent>
      </Card>

      {/* Serviços Realizados */}
      <Card className="symbol-card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-symbol-gray-700 uppercase tracking-wider">
            <Users className="h-4 w-4 text-blue-600" />
            Serviços Realizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-symbol-black">
            {formatNumber(servicosRealizados)}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card className="symbol-card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-symbol-gray-700 uppercase tracking-wider">
            <Target className="h-4 w-4 text-purple-600" />
            Ticket Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-symbol-black">
            {formatCurrency(ticketMedio)}
          </div>
        </CardContent>
      </Card>

      {/* Resultado Líquido */}
      <Card className={`symbol-card hover:shadow-xl transition-all duration-300 ${
        resultadoLiquido >= 0 
          ? 'bg-gradient-to-br from-green-50/50 to-green-100/30 border-green-200/50' 
          : 'bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50'
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-symbol-gray-700 uppercase tracking-wider">
            <DollarSign className={`h-4 w-4 ${resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            Resultado Líquido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${resultadoLiquido >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(resultadoLiquido)}
          </div>
        </CardContent>
      </Card>

      {/* Margem de Lucro */}
      <Card className={`symbol-card hover:shadow-xl transition-all duration-300 ${
        margemLucro >= 0 
          ? 'bg-gradient-to-br from-green-50/50 to-green-100/30 border-green-200/50' 
          : 'bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50'
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-symbol-gray-700 uppercase tracking-wider">
            <Percent className={`h-4 w-4 ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            Margem de Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${margemLucro >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatPercentage(margemLucro)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetrics;
