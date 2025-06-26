import React from 'react';

export const FaturamentoModal = () => (
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

export const CustosDirectosModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> Custos diretamente relacionados à execução dos serviços, como matéria-prima, insumos, impostos e taxas, entre outros. <br />
      <span className="font-semibold">Atenção:</span> Comissões não entram aqui, pois são lançadas diretamente na entrada de caixa.
    </p>
    <div className="bg-red-50 p-4 rounded-lg">
      <h4 className="font-semibold text-red-800 mb-2">Inclui:</h4>
      <ul className="text-sm text-red-700 space-y-1">
        <li>• Matéria-prima e insumos utilizados nos serviços</li>
        <li>• Impostos e taxas pagos por serviço</li>
        <li>• Outros custos diretamente ligados à execução do serviço</li>
      </ul>
    </div>
    <div className="bg-symbol-beige/20 p-4 rounded-lg">
      <h4 className="font-semibold text-symbol-black mb-2">Como lançar:</h4>
      <p className="text-sm text-symbol-gray-700">
        Adicione todos os custos diretos na tabela de Despesas Diretas, exceto comissão, que deve ser informada no momento do lançamento da entrada de caixa.
      </p>
    </div>
    <div className="bg-symbol-beige/20 p-4 rounded-lg">
      <h4 className="font-semibold text-symbol-black mb-2">Meta ideal:</h4>
      <p className="text-sm text-symbol-gray-700">
        Manter abaixo de 30% do faturamento para garantir boa margem de lucro.
      </p>
    </div>
  </div>
);

export const CustoOperacionalModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> Custos fixos e administrativos necessários para manter o negócio funcionando, independentemente do volume de vendas.
    </p>
    <div className="bg-symbol-beige/20 p-4 rounded-lg">
      <h4 className="font-semibold text-symbol-black mb-2">Inclui:</h4>
      <ul className="text-sm text-symbol-gray-700 space-y-1">
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

export const ResultadoLiquidoModal = () => (
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
        <li>• Positivo: Negócio lucrativo</li>
        <li>• Negativo: Prejuízo no período</li>
        <li>• Manter sempre positivo e crescente</li>
      </ul>
    </div>
  </div>
);

export const MargemLucroModal = () => (
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
        <li>• <span className="text-green-600 font-semibold">Acima de 15%:</span> Excelente performance</li>
        <li>• <span className="text-symbol-gold font-semibold">10-15%:</span> Boa performance</li>
        <li>• <span className="text-red-600 font-semibold">Abaixo de 10%:</span> Precisa melhorar</li>
      </ul>
    </div>
  </div>
);

export const ComposicaoDespesasModal = () => (
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

export const IndicadoresPerformanceModal = () => (
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

export const TendenciaLucroModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que mostra:</strong> Evolução do lucro líquido nos últimos 6 meses, permitindo identificar tendências e padrões de crescimento.
    </p>
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-2">Como interpretar:</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Linha ascendente: Crescimento consistente</li>
        <li>• Linha descendente: Declínio preocupante</li>
        <li>• Variações: Sazonalidade do negócio</li>
      </ul>
    </div>
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="font-semibold text-green-800 mb-2">Use para:</h4>
      <ul className="text-sm text-green-700 space-y-1">
        <li>• Identificar padrões de crescimento</li>
        <li>• Planejar estratégias futuras</li>
        <li>• Detectar problemas antecipadamente</li>
      </ul>
    </div>
  </div>
);

export const CustosIndiretosModal = () => (
  <div className="space-y-4">
    <p className="text-sm text-symbol-gray-700 leading-relaxed">
      <strong>O que é:</strong> Despesas que não estão diretamente ligadas à execução de um serviço específico, mas são necessárias para manter o negócio funcionando. <br />
      Exemplos: aluguel, água, luz, internet, salários administrativos, contabilidade, limpeza, etc.
    </p>
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h4 className="font-semibold text-yellow-800 mb-2">Como lançar:</h4>
      <p className="text-sm text-yellow-700">
        Adicione esses valores na tabela de Despesas Indiretas.
      </p>
    </div>
  </div>
);
