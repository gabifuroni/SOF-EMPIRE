
import { useState } from 'react';
import { Plus, Filter, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CashFlowTable from '@/components/cash-flow/CashFlowTable';
import AddEntryModal from '@/components/cash-flow/AddEntryModal';
import { format } from 'date-fns';
import { useTransactions } from '@/hooks/useTransactions';
import { CashFlowEntry } from '@/types';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  date: string;
  description: string;
  tipo_transacao: 'ENTRADA' | 'SAIDA';
  valor: number;
  payment_method?: string | null;
  category?: string | null;
  commission?: number | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface EntryData {
  description: string;
  amount: number;
  date: Date;
  paymentMethod?: string;
  category?: string;
  commission?: number;
}

type FilterType = 'todos' | 'entradas' | 'saidas';

const CashFlow = () => {
  const navigate = useNavigate();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  // Convert Supabase transactions to CashFlowEntry format for compatibility
  const convertedEntries: CashFlowEntry[] = transactions.map((t: Transaction) => ({
    id: t.id,
    date: new Date(t.date),
    description: t.description,
    type: t.tipo_transacao === 'ENTRADA' ? 'entrada' as const : 'saida' as const,
    amount: Number(t.valor),
    paymentMethod: t.payment_method || undefined,
    category: t.category || undefined,
    commission: t.commission || undefined,
  }));

  // Filter entries based on current filters
  const filteredEntries = convertedEntries.filter(entry => {
    if (filterType !== 'todos') {
      const typeFilter = filterType === 'entradas' ? 'entrada' : 'saida';
      if (entry.type !== typeFilter) return false;
    }
    
    if (startDate) {
      const entryDate = format(entry.date, 'yyyy-MM-dd');
      if (entryDate < startDate) return false;
    }
    
    if (endDate) {
      const entryDate = format(entry.date, 'yyyy-MM-dd');
      if (entryDate > endDate) return false;
    }
    
    return true;
  });

  const totalEntradas = filteredEntries
    .filter(entry => entry.type === 'entrada')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalSaidas = filteredEntries
    .filter(entry => entry.type === 'saida')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const saldoPeriodo = totalEntradas - totalSaidas;

  const handleAddEntry = async (entryData: EntryData) => {
    try {
      await addTransaction.mutateAsync({
        description: entryData.description,
        valor: entryData.amount,
        tipo_transacao: 'ENTRADA',
        date: format(entryData.date, 'yyyy-MM-dd'),
        payment_method: entryData.paymentMethod,
        commission: entryData.commission ? (entryData.amount * entryData.commission) / 100 : null,
      });
      setIsAddEntryModalOpen(false);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleEditEntry = async (entryData: EntryData) => {
    if (!editingEntry) return;
    
    try {
      await updateTransaction.mutateAsync({
        id: editingEntry.id,
        description: entryData.description,
        valor: entryData.amount,
        date: format(entryData.date, 'yyyy-MM-dd'),
        payment_method: entryData.paymentMethod,
        commission: entryData.commission ? (entryData.amount * entryData.commission) / 100 : null,
      });
      setEditingEntry(null);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const openEditModal = (entry: CashFlowEntry) => {
    // Só permite editar entradas
    if (entry.type === 'entrada') {
      setEditingEntry(entry);
      setIsAddEntryModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setEditingEntry(null);
    setIsAddEntryModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-symbol-gold border-t-symbol-beige rounded-full animate-spin mx-auto"></div>
          <p className="brand-body text-symbol-gray-600">Carregando transações...</p>
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
            Fluxo de Caixa
          </h1>
          <div className="w-12 h-px bg-symbol-gold mb-4"></div>
          <p className="brand-body text-symbol-gray-600">
            Controle suas entradas financeiras diárias
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setIsAddEntryModalOpen(true)}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Total de Entradas
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="text-red-600" size={20} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/expenses')}
              className="text-xs px-2 py-1 h-6"
            >
              Ver Despesas
            </Button>
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Total de Saídas
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className={`${saldoPeriodo >= 0 ? 'text-blue-600' : 'text-red-600'}`} size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Saldo do Período
            </h3>
          </div>
          <div className={`brand-heading text-2xl ${saldoPeriodo >= 0 ? 'text-symbol-black' : 'text-red-600'}`}>
            R$ {saldoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h3 className="brand-heading text-xl text-symbol-black mb-2 flex items-center gap-2">
            <Filter className="w-5 h-5 text-symbol-gray-600" />
            Filtros
          </h3>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <Label htmlFor="start-date" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Data Início
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
            />
          </div>
          
          <div>
            <Label htmlFor="end-date" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Data Fim
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
            />
          </div>
          
          <div>
            <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
              Tipo
            </Label>
            <Select value={filterType} onValueChange={(value: string) => setFilterType(value as FilterType)}>
              <SelectTrigger className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="entradas">Entradas</SelectItem>
                <SelectItem value="saidas">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="w-full mt-2 border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50 font-light"
              onClick={() => {
                // Filter logic is already applied in real-time
              }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h3 className="brand-heading text-xl text-symbol-black mb-2">
            Lançamentos Financeiros
          </h3>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        {/* Mobile View: Card List */}
        <div className="space-y-4 lg:hidden">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="symbol-card p-4 bg-symbol-gray-50 border border-symbol-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="brand-subheading text-symbol-black font-medium text-sm mb-1">
                    {entry.description}
                  </h4>
                  <p className="text-xs text-symbol-gray-500">
                    {format(new Date(entry.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    entry.type === 'entrada' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {entry.type === 'entrada' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    {entry.type === 'entrada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    {entry.type === 'entrada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                    {entry.type === 'saida' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/expenses')}
                        className="h-8 px-2 text-xs"
                      >
                        Ver em Despesas
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {entry.paymentMethod && (
                <p className="text-xs text-symbol-gray-600">
                  <span className="font-medium">Método:</span> {entry.paymentMethod}
                </p>
              )}
              {entry.category && (
                <p className="text-xs text-symbol-gray-600">
                  <span className="font-medium">Categoria:</span> {entry.category}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block">
          <CashFlowTable 
            entries={filteredEntries}
            onEdit={openEditModal}
            onDelete={handleDeleteEntry}
          />
        </div>
      </div>

      <AddEntryModal
        show={isAddEntryModalOpen && !editingEntry}
        onClose={() => setIsAddEntryModalOpen(false)}
        onSave={handleAddEntry}
      />

      {editingEntry && editingEntry.type === 'entrada' && (
        <AddEntryModal
          show={true}
          onClose={closeEditModal}
          onSave={handleEditEntry}
          entry={editingEntry}
        />
      )}
    </div>
  );
};

export default CashFlow;
