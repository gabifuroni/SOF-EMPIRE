import { useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceTable from '@/components/services/ServiceTable';
import AddServiceModal from '@/components/services/AddServiceModal';
import ServiceAnalysisModal from '@/components/services/ServiceAnalysisModal';
import { Service, Material } from '@/types';

const Services = () => {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Manicure Clássica',
      salePrice: 35.00,
      materialCosts: [
        { materialId: '1', quantity: 2, cost: 7.66 },
        { materialId: '2', quantity: 1, cost: 2.17 },
        { materialId: '3', quantity: 1, cost: 1.93 }
      ],
      cardTaxRate: 3.99,
      serviceTaxRate: 6.0,
      commissionRate: 30.0,
      totalCost: 23.26,
      grossProfit: 11.74,
      profitMargin: 33.5
    }
  ]);

  const [materials] = useState<Material[]>([
    {
      id: '1',
      name: 'Esmalte Premium Rosa',
      batchQuantity: 12,
      unit: 'ml',
      batchPrice: 45.90,
      unitCost: 3.83
    },
    {
      id: '2',
      name: 'Base Coat Profissional',
      batchQuantity: 15,
      unit: 'ml',
      batchPrice: 32.50,
      unitCost: 2.17
    },
    {
      id: '3',
      name: 'Top Coat Brilho',
      batchQuantity: 15,
      unit: 'ml',
      batchPrice: 28.90,
      unitCost: 1.93
    }
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analyzingService, setAnalyzingService] = useState<Service | null>(null);

  const handleAddService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString()
    };
    
    setServices(prev => [...prev, newService]);
    setIsAddModalOpen(false);
  };

  const handleEditService = (serviceData: Omit<Service, 'id'>) => {
    if (!editingService) return;
    
    const updatedService: Service = {
      ...serviceData,
      id: editingService.id
    };
    
    setServices(prev => prev.map(service => 
      service.id === editingService.id ? updatedService : service
    ));
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const handleAnalyzeService = (service: Service) => {
    setAnalyzingService(service);
    setIsAnalysisModalOpen(true);
  };

  // Calculate summary metrics
  const totalServices = services.length;
  const averageProfit = services.reduce((sum, service) => sum + service.grossProfit, 0) / totalServices || 0;
  const averageMargin = services.reduce((sum, service) => sum + service.profitMargin, 0) / totalServices || 0;
  const bestPerformingService = services.reduce((best, current) => 
    current.profitMargin > best.profitMargin ? current : best, services[0]
  );

  const openEditModal = (service: Service) => {
    setEditingService(service);
  };

  const closeEditModal = () => {
    setEditingService(null);
  };

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="brand-heading text-3xl text-symbol-black mb-2">
            Serviços & Preços
          </h1>
          <div className="w-12 h-px bg-symbol-gold mb-4"></div>
          <p className="brand-body text-symbol-gray-600">
            Gerencie seus serviços e configure preços estratégicos
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="text-blue-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Total de Serviços
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {totalServices}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="text-emerald-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Lucro Médio
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {averageProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="text-purple-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Margem Média
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black">
            {averageMargin.toFixed(1)}%
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-amber-50/50 to-amber-100/30 border-amber-200/50">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="text-amber-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Melhor Performance
            </h3>
          </div>
          <div className="brand-heading text-lg text-symbol-black">
            {bestPerformingService?.name || 'N/A'}
          </div>
          <div className="text-sm text-amber-600 font-medium">
            {bestPerformingService?.profitMargin.toFixed(1)}% margem
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Lista de Serviços
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <ServiceTable 
          services={services}
          onEdit={openEditModal}
          onDelete={handleDeleteService}
          onAnalyze={handleAnalyzeService}
        />
      </div>

      <AddServiceModal
        show={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddService}
        materials={materials}
      />

      {editingService && (
        <AddServiceModal
          show={true}
          onClose={closeEditModal}
          onSave={handleEditService}
          materials={materials}
          service={editingService}
        />
      )}

      <ServiceAnalysisModal
        service={analyzingService}
        materials={materials}
        show={isAnalysisModalOpen}
        onClose={() => {
          setIsAnalysisModalOpen(false);
          setAnalyzingService(null);
        }}
      />
    </div>
  );
};

export default Services;
