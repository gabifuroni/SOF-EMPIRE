
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional';
  salonName?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  monthlyRevenue?: number;
  // New expanded fields from profile
  nomeSalao?: string;
  descricaoSalao?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string;
  currentPatenteId?: string;
}

export interface PatenteLevel {
  name: string;
  minRevenue: number;
  icon: string;
}

export const PATENTE_LEVELS: PatenteLevel[] = [
  { name: 'Beauty Starters', minRevenue: 0, icon: '🌟' },
  { name: 'Glow Achievers', minRevenue: 3000, icon: '✨' },
  { name: 'Elegance Experts', minRevenue: 6000, icon: '💫' },
  { name: 'Luxury Creators', minRevenue: 9000, icon: '👑' },
  { name: 'Empire Queens', minRevenue: 12000, icon: '💎' },
  { name: 'Imperatrizes Elite', minRevenue: 15000, icon: '🏆' },
];

export interface Material {
  id: string;
  name: string;
  batchQuantity: number;
  batchPrice: number;
  unit: string;
  unitCost: number;
}

export interface MaterialCost {
  materialId: string;
  quantity: number;
  cost: number;
}

export interface Service {
  id: string;
  name: string;
  salePrice: number;
  materialCosts?: MaterialCost[];
  cardTaxRate: number;
  serviceTaxRate: number;
  commissionRate: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

export interface CashFlowEntry {
  id: string;
  date: Date;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  paymentMethod?: string; // For entrada
  category?: string; // For saida
  client?: string; // Optional for entrada
  supplier?: string; // Optional for saida
  commission?: number; // Optional commission for entrada
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface MonthlyExpense {
  categoryId: string;
  year: number;
  january: number;
  february: number;
  march: number;
  april: number;
  may: number;
  june: number;
  july: number;
  august: number;
  september: number;
  october: number;
  november: number;
  december: number;
}

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: 'Aluguel', isCustom: false },
  { id: '2', name: 'Contabilidade', isCustom: false },
  { id: '3', name: 'Energia Elétrica', isCustom: false },
  { id: '4', name: 'Água', isCustom: false },
  { id: '5', name: 'Internet/Telefone', isCustom: false },
  { id: '6', name: 'Software/Assinaturas', isCustom: false },
  { id: '7', name: 'Marketing e Publicidade', isCustom: false },
  { id: '8', name: 'Material de Escritório', isCustom: false },
  { id: '9', name: 'Salários e Encargos', isCustom: false },
  { id: '10', name: 'Pró-labore', isCustom: false },
  { id: '11', name: 'Impostos Fixos', isCustom: false },
  { id: '12', name: 'Limpeza e Higiene', isCustom: false },
  { id: '13', name: 'Outras Despesas', isCustom: false },
];
