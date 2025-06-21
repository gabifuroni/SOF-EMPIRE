import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { 
  CreditCard, 
  Banknote, 
  Smartphone
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
}

interface WorkingDays {
  segunda: boolean;
  terca: boolean;
  quarta: boolean;
  quinta: boolean;
  sexta: boolean;
  sabado: boolean;
  domingo: boolean;
}

export const usePaymentSettingsLogic = () => {
  const { toast } = useToast();
  const { params, updateParams } = useBusinessParams();
  const { saveSettings } = useBusinessSettings();
  const { paymentMethods: dbPaymentMethods, updatePaymentMethod: updateDbPaymentMethod } = usePaymentMethods();

  // State management
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Depreciation state
  const [valorMobilizado, setValorMobilizado] = useState(0);
  const [totalDepreciado, setTotalDepreciado] = useState(0);
  const depreciacaoMensal = totalDepreciado / 60;

  // Working days state
  const [workingDays, setWorkingDays] = useState<WorkingDays>({
    segunda: true,
    terca: true,
    quarta: true,
    quinta: true,
    sexta: true,
    sabado: false,
    domingo: false
  });

  // Holidays state
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', date: '2024-01-01', name: 'Confraternização Universal' },
    { id: '2', date: '2024-04-21', name: 'Tiradentes' },
    { id: '3', date: '2024-09-07', name: 'Independência do Brasil' }
  ]);

  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [numProfessionals, setNumProfessionals] = useState(2);

  // Margins state
  const [lucroDesejado, setLucroDesejado] = useState(21.0);
  const [despesasIndiretasDepreciacao, setDespesasIndiretasDepreciacao] = useState(35.0);
  const [impostosRate, setImpostosRate] = useState(8.0);
  const despesasDiretas = 100 - lucroDesejado - despesasIndiretasDepreciacao;

  // Utility functions
  const removeDuplicatePaymentMethods = useCallback((methods: PaymentMethod[]): PaymentMethod[] => {
    const uniqueMethods = new Map<string, PaymentMethod>();
    const similarityGroups: { [key: string]: string[] } = {};
    
    methods.forEach(method => {
      const name = method.name.toLowerCase().trim();
      let groupKey = name;
      
      for (const [group, variations] of Object.entries(similarityGroups)) {
        if (variations.some(variation => name.includes(variation) || variation.includes(name))) {
          groupKey = group;
          break;
        }
      }
      
      if (!uniqueMethods.has(groupKey)) {
        const standardNames: { [key: string]: string } = {
          'credito': 'Crédito',
          'credito_parcelado': 'Crédito Parcelado',
          'debito': 'Débito',
          'pix': 'PIX',
          'dinheiro': 'Dinheiro/Pix',
          'transferencia': 'Transferência Bancária'
        };
        
        uniqueMethods.set(groupKey, {
          ...method,
          name: standardNames[groupKey] || method.name,
          id: groupKey
        });
      } else {
        const existing = uniqueMethods.get(groupKey)!;
        uniqueMethods.set(groupKey, {
          ...existing,
          distributionPercentage: Math.max(existing.distributionPercentage, method.distributionPercentage),
          taxRate: method.taxRate > 0 ? method.taxRate : existing.taxRate,
          isActive: existing.isActive || method.isActive
        });
      }
    });
    
    return Array.from(uniqueMethods.values());
  }, []);

  const getDefaultPaymentMethods = useCallback((): PaymentMethod[] => [
    {
      id: 'credit',
      name: 'Crédito',
      icon: CreditCard,
      isActive: true,
      distributionPercentage: 50.0,
      taxRate: 3.20
    },
    {
      id: 'credit_installment',
      name: 'Crédito Parcelado',
      icon: CreditCard,
      isActive: true,
      distributionPercentage: 5.0,
      taxRate: 6.34
    },
    {
      id: 'debit',
      name: 'Débito',
      icon: CreditCard,
      isActive: true,
      distributionPercentage: 15.0,
      taxRate: 1.39
    },
    {
      id: 'cash',
      name: 'Dinheiro/Pix',
      icon: Banknote,
      isActive: true,
      distributionPercentage: 30.0,
      taxRate: 0.00
    }
  ], []);

  const calculateWeightedAverageRate = useCallback(() => {
    const activeMethods = paymentMethods.filter(method => method.isActive);
    const totalDistribution = activeMethods.reduce((sum, method) => sum + method.distributionPercentage, 0);
    
    if (totalDistribution === 0) return 0;
    
    const weightedSum = activeMethods.reduce((sum, method) => 
      sum + (method.taxRate * method.distributionPercentage), 0
    );
    
    return weightedSum / totalDistribution;
  }, [paymentMethods]);

  const getTotalDistribution = useCallback(() => {
    return paymentMethods
      .filter(method => method.isActive)
      .reduce((sum, method) => sum + method.distributionPercentage, 0);
  }, [paymentMethods]);

  const calculateWorkingDaysPerYear = useCallback(() => {
    const daysPerWeek = Object.values(workingDays).filter(day => day).length;
    const totalWorkingDaysInYear = daysPerWeek * 52;
    return totalWorkingDaysInYear - holidays.length;
  }, [workingDays, holidays]);

  // Computed values
  const weightedAverageRate = calculateWeightedAverageRate();
  const totalDistribution = getTotalDistribution();
  const workingDaysPerYear = calculateWorkingDaysPerYear();
  const totalMargins = lucroDesejado + despesasIndiretasDepreciacao + despesasDiretas;

  return {
    // State
    paymentMethods,
    setPaymentMethods,
    isInitialized,
    setIsInitialized,
    isSaving,
    setIsSaving,
    valorMobilizado,
    setValorMobilizado,
    totalDepreciado,
    setTotalDepreciado,
    depreciacaoMensal,
    workingDays,
    setWorkingDays,
    holidays,
    setHolidays,
    newHolidayDate,
    setNewHolidayDate,
    newHolidayName,
    setNewHolidayName,
    numProfessionals,
    setNumProfessionals,
    lucroDesejado,
    setLucroDesejado,
    despesasIndiretasDepreciacao,
    setDespesasIndiretasDepreciacao,
    despesasDiretas,
    impostosRate,
    setImpostosRate,

    // Computed values
    weightedAverageRate,
    totalDistribution,
    workingDaysPerYear,
    totalMargins,

    // External dependencies
    toast,
    params,
    updateParams,
    saveSettings,
    dbPaymentMethods,
    updateDbPaymentMethod,

    // Utility functions
    removeDuplicatePaymentMethods,
    getDefaultPaymentMethods,
    calculateWeightedAverageRate,
    getTotalDistribution,
    calculateWorkingDaysPerYear
  };
};
