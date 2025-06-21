import type { Tables } from '@/integrations/supabase/types';
import type { Service, Material, MaterialCost, ExpenseCategory, MonthlyExpense } from '@/types';

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
export const convertMaterialToDb = (material: Omit<Material, 'id'>): Omit<Tables<'materias_primas'>, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'unit_cost'> => {
  return {
    name: material.name,
    batch_quantity: material.batchQuantity,
    batch_price: material.batchPrice,
    unit: material.unit,
    // Não incluir unit_cost pois é uma coluna gerada pelo banco
  };
};

// Converte categoria de despesa do banco para tipo da aplicação
export const convertExpenseCategoryFromDb = (dbCategory: Tables<'despesas_indiretas_categorias'>): ExpenseCategory => {
  return {
    id: dbCategory.id,
    name: dbCategory.nome_categoria_despesa,
    isCustom: !dbCategory.is_predefinida,
  };
};

// Converte categoria de despesa da aplicação para formato do banco
export const convertExpenseCategoryToDb = (category: Omit<ExpenseCategory, 'id'>): Omit<Tables<'despesas_indiretas_categorias'>, 'id' | 'user_id' | 'created_at' | 'updated_at'> => {
  return {
    nome_categoria_despesa: category.name,
    is_predefinida: !category.isCustom,
  };
};

// Converte valores de despesa indireta do banco para tipo da aplicação
export const convertMonthlyExpenseFromDb = (dbExpenses: Tables<'despesas_indiretas_valores'>[], categoryId: string, year: number): MonthlyExpense => {
  const monthlyExpense: MonthlyExpense = {
    categoryId,
    year,
    january: 0,
    february: 0,
    march: 0,
    april: 0,
    may: 0,
    june: 0,
    july: 0,
    august: 0,
    september: 0,
    october: 0,
    november: 0,
    december: 0,
  };
  // Map database month references to expense object properties
  const monthMap: Record<string, keyof Omit<MonthlyExpense, 'categoryId' | 'year'>> = {
    'janeiro': 'january',
    'fevereiro': 'february',
    'março': 'march',
    'abril': 'april',
    'maio': 'may',
    'junho': 'june',
    'julho': 'july',
    'agosto': 'august',
    'setembro': 'september',
    'outubro': 'october',
    'novembro': 'november',
    'dezembro': 'december',
  };
  // Fill in the values from database records
  dbExpenses
    .filter(expense => expense.categoria_id === categoryId)
    .forEach(expense => {
      const monthKey = monthMap[expense.mes_referencia];
      if (monthKey) {
        monthlyExpense[monthKey] = expense.valor_mensal;
      }
    });

  return monthlyExpense;
};

// Converte valores de despesa da aplicação para formato do banco
export const convertMonthlyExpenseToDb = (expense: MonthlyExpense, userId: string): Omit<Tables<'despesas_indiretas_valores'>, 'id' | 'created_at' | 'updated_at'>[] => {
  const monthMap: Record<keyof MonthlyExpense, string> = {
    categoryId: '',
    year: '',
    january: 'janeiro',
    february: 'fevereiro',
    march: 'março',
    april: 'abril',
    may: 'maio',
    june: 'junho',
    july: 'julho',
    august: 'agosto',
    september: 'setembro',
    october: 'outubro',
    november: 'novembro',
    december: 'dezembro',
  };

  const dbRecords: Omit<Tables<'despesas_indiretas_valores'>, 'id' | 'created_at' | 'updated_at'>[] = [];

  // Create one record per month
  Object.entries(monthMap).forEach(([monthKey, monthName]) => {
    if (monthKey !== 'categoryId' && monthKey !== 'year' && monthName) {
      const value = expense[monthKey as keyof MonthlyExpense] as number;
      if (value > 0) { // Only create records for non-zero values
        dbRecords.push({
          categoria_id: expense.categoryId,
          mes_referencia: monthName,
          valor_mensal: value,
          user_id: userId,
        });
      }
    }
  });

  return dbRecords;
};
