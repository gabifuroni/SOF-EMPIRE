import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, BarChart3 } from 'lucide-react';
import { Service, Material } from '@/types';
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

  // Função auxiliar para obter o nome do material
  const getMaterialName = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.name || 'Material não encontrado';
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-elite-pearl-200 rounded-full flex items-center justify-center">
          <BarChart3 size={32} className="text-elite-pearl-500" />
        </div>
        <h3 className="font-playfair text-xl font-semibold text-elite-charcoal-800 mb-2">
          Nenhum serviço cadastrado
        </h3>
        <p className="text-elite-charcoal-600">
          Comece adicionando seus primeiros serviços para analisar a precificação
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-elite-charcoal-800">Serviço</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Preço ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Comissão (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Valor Comissão ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Mat. Prima ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Mat. Prima (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Cartão (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Cartão ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Imposto (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Imposto ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Total ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Total (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Margem Op. ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Margem Op. (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Custo Op. ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Custo Op. (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Lucro Parcial ($)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Lucro Parcial (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => {
            // Cálculos dos custos diretos
            const commissionCost = (service.salePrice * service.commissionRate) / 100;
            const cardTaxCost = (service.salePrice * params.weightedAverageRate) / 100;
            const taxCost = (service.salePrice * params.impostosRate) / 100;
            
            // Cálculo do custo total de matéria-prima
            const materialCosts = service.materialCosts || [];
            const totalMaterialCost = materialCosts.reduce((sum, mc) => sum + mc.cost, 0);
            const materialCostPercentage = service.salePrice > 0 ? (totalMaterialCost / service.salePrice) * 100 : 0;
            
            const totalDirectCosts = service.totalCost;
            const directExpensePercentage = service.salePrice > 0 ? (totalDirectCosts / service.salePrice) * 100 : 0;
            
            // Cálculos corrigidos conforme especificação:
            // Margem Operacional = Custo Cobrado no Serviço - Despesas Diretas Totais
            const operationalMargin = service.salePrice - totalDirectCosts;
            const operationalMarginPercentage = service.salePrice > 0 ? (operationalMargin / service.salePrice) * 100 : 0;
            
            // Custo Operacional (definido nos parâmetros do negócio)
            const operationalCost = (service.salePrice * params.despesasIndiretasDepreciacao) / 100;
            
            // Lucro Parcial = Margem Operacional - Custo Operacional
            const partialProfit = operationalMargin - operationalCost;
            const partialProfitMargin = service.salePrice > 0 ? (partialProfit / service.salePrice) * 100 : 0;
            
            return (
            <TableRow key={service.id} className="hover:bg-elite-pearl-50">
              <TableCell className="font-medium text-elite-charcoal-900">
                {service.name}
              </TableCell>
              <TableCell className="text-elite-charcoal-700">
                R$ {service.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-orange-600">
                {service.commissionRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-orange-600">
                R$ {commissionCost.toFixed(2)}
              </TableCell>
              <TableCell className="text-emerald-600 font-medium">
                <div className="flex flex-col" title={materialCosts.length > 0 ? 
                  materialCosts.map(mc => `${getMaterialName(mc.materialId)}: R$ ${mc.cost.toFixed(2)}`).join('\n') : 
                  'Nenhuma matéria-prima utilizada'
                }>
                  <span>R$ {totalMaterialCost.toFixed(2)}</span>
                  {materialCosts.length > 0 && (
                    <span className="text-xs text-emerald-500">
                      {materialCosts.length} item{materialCosts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-emerald-600 font-medium">
                <div className="flex flex-col" title={`${materialCostPercentage.toFixed(2)}% do valor total do serviço`}>
                  <span>{materialCostPercentage.toFixed(1)}%</span>
                  {materialCosts.length > 0 && (
                    <span className="text-xs text-emerald-500">
                      do total
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-blue-600">
                {params.weightedAverageRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-blue-600">
                R$ {cardTaxCost.toFixed(2)}
              </TableCell>
              <TableCell className="text-purple-600">
                {params.impostosRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-purple-600">
                R$ {taxCost.toFixed(2)}
              </TableCell>
              <TableCell className="text-red-600 font-medium">
                R$ {totalDirectCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-red-600 font-medium">
                {directExpensePercentage.toFixed(1)}%
              </TableCell>
              <TableCell className="text-green-600 font-medium">
                R$ {operationalMargin.toFixed(2)}
              </TableCell>
              <TableCell className="text-green-600 font-medium">
                {operationalMarginPercentage.toFixed(1)}%
              </TableCell>
              <TableCell className="text-blue-600">
                R$ {operationalCost.toFixed(2)}
              </TableCell>
              <TableCell className="text-blue-600">
                {params.despesasIndiretasDepreciacao.toFixed(1)}%
              </TableCell>
              <TableCell className="text-emerald-600 font-bold">
                R$ {partialProfit.toFixed(2)}
              </TableCell>
              <TableCell className="text-emerald-600 font-bold">
                {partialProfitMargin.toFixed(1)}%
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAnalyze(service)}
                    className="text-elite-rose-600 hover:text-elite-rose-700 hover:bg-elite-rose-50"
                  >
                    <BarChart3 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(service)}
                    className="text-elite-beige-600 hover:text-elite-beige-700 hover:bg-elite-beige-50"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(service.id)}
                    className="text-elite-charcoal-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceTable;
