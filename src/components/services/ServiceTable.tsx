import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, BarChart3 } from 'lucide-react';
import { Service } from '@/types';
import { useBusinessParams } from '@/hooks/useBusinessParams';

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onAnalyze: (service: Service) => void;
}

const ServiceTable = ({ services, onEdit, onDelete, onAnalyze }: ServiceTableProps) => {
  const { params } = useBusinessParams();

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
            <TableHead className="font-semibold text-elite-charcoal-800">Nome do Serviço</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Preço de Venda</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Custo Total</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Desp. Diretas (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Custo Operacional</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Lucro Bruto</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Margem Op. (%)</TableHead>
            <TableHead className="font-semibold text-elite-charcoal-800">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => {
            const directExpensePercentage = service.salePrice > 0 ? (service.totalCost / service.salePrice) * 100 : 0;
            const operationalCost = (service.salePrice * params.despesasIndiretasDepreciacao) / 100;
            const operationalProfit = service.grossProfit - operationalCost;
            const operationalMargin = service.salePrice > 0 ? (operationalProfit / service.salePrice) * 100 : 0;
            
            return (
            <TableRow key={service.id} className="hover:bg-elite-pearl-50">
              <TableCell className="font-medium text-elite-charcoal-900">
                {service.name}
              </TableCell>
              <TableCell className="text-elite-charcoal-700">
                R$ {service.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-elite-charcoal-700">
                R$ {service.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-red-600 font-medium">
                R$ {service.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({directExpensePercentage.toFixed(1)}%)
              </TableCell>
              <TableCell className="text-blue-600 font-medium">
                R$ {operationalCost.toFixed(2)} ({params.despesasIndiretasDepreciacao.toFixed(1)}%)
              </TableCell>
              <TableCell className="text-elite-beige-700 font-medium">
                R$ {service.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-green-600 font-medium">
                {operationalMargin.toFixed(1)}%
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
