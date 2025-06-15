
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyCashFlowHeaderProps {
  today: Date;
  onAddEntry: () => void;
  onAddExpense: () => void;
}

const DailyCashFlowHeader = ({ today, onAddEntry, onAddExpense }: DailyCashFlowHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Fluxo de Caixa Diário
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Controle suas movimentações do dia {format(today, 'dd/MM/yyyy', { locale: ptBR })}
        </p>
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={onAddEntry}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Entrada
        </Button>
        
        <Button 
          onClick={onAddExpense}
          className="bg-red-600 hover:bg-red-700 text-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Minus className="w-4 h-4 mr-2" />
          Adicionar Saída
        </Button>
      </div>
    </div>
  );
};

export default DailyCashFlowHeader;
