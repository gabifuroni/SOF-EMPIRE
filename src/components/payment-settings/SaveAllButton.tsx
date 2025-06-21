import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SaveAllButtonProps {
  isSaving: boolean;
  onSaveAll: () => void;
}

export const SaveAllButton = ({
  isSaving,
  onSaveAll
}: SaveAllButtonProps) => {
  return (
    <div className="flex justify-center pt-6 sm:pt-8">
      <div className="text-center w-full max-w-md">
        <p className="text-sm text-symbol-gray-600 mb-4">
          Ou salve todas as configurações de uma vez:
        </p>
        <Button 
          onClick={onSaveAll}
          disabled={isSaving}
          className="w-full bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-4 px-6 sm:px-8 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </Button>
      </div>
    </div>
  );
};
