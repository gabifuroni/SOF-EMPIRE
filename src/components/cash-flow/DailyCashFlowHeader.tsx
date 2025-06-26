
import { Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface DailyCashFlowHeaderProps {
  today: Date;
  onAddEntry: () => void;
}

const DailyCashFlowHeader = ({ today, onAddEntry }: DailyCashFlowHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Fluxo de Caixa Diário
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Controle suas entradas do dia {format(today, 'dd/MM/yyyy', { locale: ptBR })}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onAddEntry}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Entrada
        </Button>
        
        <Button 
          onClick={() => navigate('/expenses')}
          variant="outline"
          className="bg-transparent border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50 font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Gerenciar Despesas
        </Button>
      </div>
    </div>
  );
};

export default DailyCashFlowHeader;
