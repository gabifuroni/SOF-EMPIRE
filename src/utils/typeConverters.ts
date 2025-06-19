import type { Tables } from '@/integrations/supabase/types';
import type { Service, Material, MaterialCost } from '@/types';

// Converte dados do banco (snake_case) para tipos da aplicação (camelCase)
export const convertServiceFromDb = (dbService: Tables<'servicos'>): Service => {
  const materialCosts: MaterialCost[] = Array.isArray(dbService.material_costs) 
    ? (dbService.material_costs as unknown as MaterialCost[]).map((cost: MaterialCost) => ({
        materialId: cost.materialId,
        quantity: cost.quantity,
        cost: cost.cost,
      }))
    : [];

  return {
    id: dbService.id,
    name: dbService.name,
    salePrice: dbService.sale_price,
    materialCosts,
    cardTaxRate: dbService.card_tax_rate,
    serviceTaxRate: dbService.service_tax_rate,
    commissionRate: dbService.commission_rate,
    totalCost: dbService.total_cost,
    grossProfit: dbService.gross_profit,
    profitMargin: dbService.profit_margin,
  };
};

// Converte dados da aplicação (camelCase) para formato do banco (snake_case)
export const convertServiceToDb = (service: Omit<Service, 'id'>): Omit<Tables<'servicos'>, 'id' | 'user_id' | 'created_at' | 'updated_at'> => {
  const materialCosts = service.materialCosts?.map(cost => ({
    materialId: cost.materialId,
    quantity: cost.quantity,
    cost: cost.cost,
  })) || [];

  return {
    name: service.name,
    sale_price: service.salePrice,
    material_costs: materialCosts as unknown as Tables<'servicos'>['material_costs'],
    card_tax_rate: service.cardTaxRate,
    service_tax_rate: service.serviceTaxRate,
    commission_rate: service.commissionRate,
    total_cost: service.totalCost,
    gross_profit: service.grossProfit,
    profit_margin: service.profitMargin,
  };
};

// Converte material do banco para tipo da aplicação
export const convertMaterialFromDb = (dbMaterial: Tables<'materias_primas'>): Material => {
  return {
    id: dbMaterial.id,
    name: dbMaterial.name,
    batchQuantity: dbMaterial.batch_quantity,
    batchPrice: dbMaterial.batch_price,
    unit: dbMaterial.unit,
    unitCost: dbMaterial.unit_cost,
  };
};

// Converte material da aplicação para formato do banco
export const convertMaterialToDb = (material: Omit<Material, 'id'>): Omit<Tables<'materias_primas'>, 'id' | 'user_id' | 'created_at' | 'updated_at'> => {
  return {
    name: material.name,
    batch_quantity: material.batchQuantity,
    batch_price: material.batchPrice,
    unit: material.unit,
    unit_cost: material.unitCost,
  };
};
