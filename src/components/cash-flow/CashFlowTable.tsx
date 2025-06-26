
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CashFlowEntry } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface CashFlowTableProps {
  entries: CashFlowEntry[];
  onEdit: (entry: CashFlowEntry) => void;
  onDelete: (id: string) => void;
}

// Extend CashFlowEntry to include runningBalance for internal calculations
interface CashFlowEntryWithBalance extends CashFlowEntry {
  runningBalance: number;
}

const CashFlowTable = ({ entries, onEdit, onDelete }: CashFlowTableProps) => {
  const navigate = useNavigate();
  // Calculate running balance
  const entriesWithBalance: CashFlowEntryWithBalance[] = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry, index, sortedEntries) => {
      const previousBalance = index === 0 ? 0 : (sortedEntries[index - 1] as CashFlowEntryWithBalance).runningBalance || 0;
      const dayBalance = entry.type === 'entrada' ? entry.amount : -entry.amount;
      const runningBalance = previousBalance + dayBalance;
      
      return {
        ...entry,
        runningBalance
      };
    });

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-elite-pearl-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">💰</span>
        </div>
        <h3 className="text-lg font-medium text-elite-charcoal-800 mb-2">
          Nenhum lançamento financeiro neste período
        </h3>
        <p className="text-elite-charcoal-600 mb-6">
          Que tal adicionar sua primeira entrada ou saída?
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className='text-gray-700'>
            <TableHead className='text-gray-700'>Data</TableHead>
            <TableHead className='text-gray-700'>Descrição</TableHead>
            <TableHead className='text-gray-700'>Forma de Pagamento</TableHead>
            <TableHead className='text-gray-700'>Categoria</TableHead>
            <TableHead className="text-right text-gray-700">Entrada (R$)</TableHead>
            <TableHead className="text-right text-gray-700">Comissão (%)</TableHead>
            <TableHead className="text-right text-gray-700">Saída (R$)</TableHead>
            <TableHead className="text-right text-gray-700">Saldo Acumulado (R$)</TableHead>
            <TableHead className="text-center text-gray-700">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entriesWithBalance.map((entry, index) => (
            <TableRow key={entry.id} className={index % 2 === 0 ? 'bg-elite-pearl-25' : ''}>
              <TableCell>
                {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium">{entry.description}</TableCell>
              <TableCell>
                {entry.type === 'entrada' ? entry.paymentMethod || '-' : '-'}
              </TableCell>
              <TableCell>
                {entry.type === 'saida' ? entry.category || '-' : '-'}
              </TableCell>
              <TableCell className="text-right">
                {entry.type === 'entrada' ? (
                  <span className="text-green-600 font-semibold">
                    R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {entry.type === 'entrada' && entry.commission && entry.amount > 0 ? (
                  <span className="text-blue-600 font-semibold">
                    {((entry.commission / entry.amount) * 100).toFixed(1)}%
                  </span>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {entry.type === 'saida' ? (
                  <span className="text-red-600 font-semibold">
                    R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right font-semibold">
                <span className={entry.runningBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  R$ {entry.runningBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  {entry.type === 'entrada' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(entry)}
                        className="text-elite-charcoal-600 hover:text-elite-rose-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(entry.id)}
                        className="text-elite-charcoal-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {entry.type === 'saida' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/expenses')}
                      className="text-elite-charcoal-600 hover:text-blue-600 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Despesas
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CashFlowTable;
