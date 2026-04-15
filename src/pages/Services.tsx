import { useState } from 'react';
import { Plus, BarChart3, Scissors, TrendingUp, Target, Award } from 'lucide-react';
import ServiceTable from '@/components/services/ServiceTable';
import AddServiceModal from '@/components/services/AddServiceModal';
import ServiceAnalysisModal from '@/components/services/ServiceAnalysisModal';
import { useServices } from '@/hooks/useServices';
import { useMaterials } from '@/hooks/useMaterials';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import type { Service } from '@/types';

const Services = () => {
  const { services, isLoading: servicesLoading, addService, updateService, deleteService } = useServices();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { params } = useBusinessParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analyzingService, setAnalyzingService] = useState<Service | null>(null);

  const handleAddService = async (data: Omit<Service, 'id'>) => {
    try { await addService.mutateAsync(data); setIsAddModalOpen(false); } catch {}
  };
  const handleEditService = async (data: Omit<Service, 'id'>) => {
    if (!editingService) return;
    try { await updateService.mutateAsync({ id: editingService.id, serviceData: data }); setEditingService(null); } catch {}
  };
  const handleDeleteService = async (id: string) => { try { await deleteService.mutateAsync(id); } catch {} };
  const handleAnalyzeService = (service: Service) => { setAnalyzingService(service); setIsAnalysisModalOpen(true); };

  const totalServices = services.length;
  const averageProfit = totalServices > 0 ? services.reduce((s, sv) => s + sv.grossProfit, 0) / totalServices : 0;
  const averageMargin = totalServices > 0 ? services.reduce((s, sv) => s + sv.profitMargin, 0) / totalServices : 0;
  const bestService = services.length > 0 ? services.reduce((best, cur) => cur.profitMargin > best.profitMargin ? cur : best, services[0]) : null;

  if (servicesLoading || materialsLoading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #2a2a38', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const summaryCards = [
    { icon: <Scissors size={16} style={{ color: '#4d9fff' }} />, bg: 'rgba(77,159,255,0.1)', label: 'Total de Serviços', value: String(totalServices), sub: '' },
    { icon: <TrendingUp size={16} style={{ color: '#00c896' }} />, bg: 'rgba(0,200,150,0.1)', label: 'Lucro Médio', value: `R$ ${averageProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: '' },
    { icon: <Target size={16} style={{ color: '#a78bfa' }} />, bg: 'rgba(167,139,250,0.1)', label: 'Margem Média', value: `${averageMargin.toFixed(1)}%`, sub: '' },
    { icon: <Award size={16} style={{ color: '#c9a84c' }} />, bg: 'rgba(201,168,76,0.1)', label: 'Melhor Performance', value: bestService?.name || 'N/A', sub: bestService ? `${bestService.profitMargin.toFixed(1)}% margem` : '' },
  ];

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .svc-card{animation:fadeUp 0.4s ease both;background:#13131a;border:1px solid #2a2a38;border-radius:12px;transition:border-color 0.2s}
        .svc-card:hover{border-color:#3a3a4a}
        /* Override ServiceTable colors for dark theme */
        .svc-wrap table{background:#13131a!important}
        .svc-wrap th{background:#1c1c26!important;color:#606078!important;border-color:#2a2a38!important;font-size:10px!important;letter-spacing:0.1em!important;text-transform:uppercase!important}
        .svc-wrap td{border-color:#2a2a38!important;color:#f0f0f8!important}
        .svc-wrap tr:hover td{background:rgba(255,255,255,0.02)!important}
        .svc-wrap .text-symbol-black,.svc-wrap .text-symbol-gray-700{color:#f0f0f8!important}
        .svc-wrap .text-symbol-gray-600,.svc-wrap .text-symbol-gray-500{color:#9090a8!important}
        .svc-wrap .symbol-card{background:#1c1c26!important;border-color:#2a2a38!important}
      `}</style>

      {/* Header */}
      <div className="svc-card" style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24, padding: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Serviços & Preços</h1>
          <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
          <p style={{ fontSize: 13, color: '#9090a8' }}>Gerencie seus serviços e configure preços estratégicos</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6520)', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter,sans-serif' }}>
          <Plus size={16} /> Novo Serviço
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
        {summaryCards.map((card, i) => (
          <div key={i} className="svc-card" style={{ padding: 20, animationDelay: `${i * 0.05}s` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{card.icon}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontFamily: 'serif', fontSize: i === 0 ? 28 : 18, fontWeight: 600, color: '#f0f0f8', marginBottom: card.sub ? 4 : 0 }}>{card.value}</div>
            {card.sub && <div style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Services Table */}
      <div className="svc-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={16} style={{ color: '#c9a84c' }} />
          <h2 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>Lista de Serviços</h2>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9090a8', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 20, padding: '2px 10px' }}>{totalServices} serviços</span>
        </div>
        <div className="svc-wrap" style={{ overflowX: 'auto' }}>
          <ServiceTable services={services} onEdit={setEditingService} onDelete={handleDeleteService} onAnalyze={handleAnalyzeService} />
        </div>
      </div>

      <AddServiceModal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddService} materials={materials} />
      {editingService && <AddServiceModal show={true} onClose={() => setEditingService(null)} onSave={handleEditService} materials={materials} service={editingService} />}
      <ServiceAnalysisModal service={analyzingService} materials={materials} businessParams={params} show={isAnalysisModalOpen} onClose={() => { setIsAnalysisModalOpen(false); setAnalyzingService(null); }} />
    </div>
  );
};

export default Services;
