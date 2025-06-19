
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transacoes_financeiras'>;

interface DailyCashFlowTableProps {
  todayEntries: Transaction[];
  today: Date;
  onDeleteEntry: (id: string) => void;
}

const DailyCashFlowTable = ({ todayEntries, today, onDeleteEntry }: DailyCashFlowTableProps) => {
  if (todayEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-symbol-beige/30 flex items-center justify-center mb-4">
          <span className="text-3xl">💰</span>
        </div>
        <h3 className="brand-subheading text-symbol-black text-lg mb-3">
          Nenhum lançamento hoje
        </h3>
        <p className="brand-body text-symbol-gray-600 mb-6">
          Adicione sua primeira entrada ou saída do dia
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>        <TableHeader>
          <TableRow>
            <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Descrição</TableHead>
            <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Tipo</TableHead>
            <TableHead className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Método/Categoria</TableHead>
            <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Valor (R$)</TableHead>
            <TableHead className="text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Horário</TableHead>
            <TableHead className="text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {todayEntries
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((entry, index) => (            <TableRow key={entry.id} className={index % 2 === 0 ? 'bg-symbol-gray-50/30' : ''}>
              <TableCell className="font-medium brand-body text-symbol-black">{entry.description}</TableCell>
              <TableCell>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  entry.tipo_transacao === 'ENTRADA' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {entry.tipo_transacao === 'ENTRADA' ? 'Entrada' : 'Saída'}
                </span>
              </TableCell>
              <TableCell className="text-sm text-symbol-gray-600">
                {entry.payment_method || entry.category || '-'}
              </TableCell>
              <TableCell className="text-right">
                <span className={`font-semibold ${
                  entry.tipo_transacao === 'ENTRADA' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  R$ {Number(entry.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </TableCell>
              <TableCell className="text-center text-sm text-symbol-gray-600">
                {format(new Date(entry.created_at), 'HH:mm', { locale: ptBR })}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteEntry(entry.id)}
                  className="text-symbol-gray-600 hover:text-red-600 font-light"
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DailyCashFlowTable;
