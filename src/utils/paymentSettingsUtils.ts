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

interface DbPaymentMethod {
  id: string;
  nome_metodo: string;
  is_ativo: boolean;
  prazo_recebimento_dias: number;
  taxa_percentual: number;
}

interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

interface Toast {
  (props: ToastProps): void;
}

interface UpdateDbPaymentMethodParams {
  id: string;
  nome_metodo: string;
  is_ativo: boolean;
  prazo_recebimento_dias: number;
  taxa_percentual: number;
}

interface UpdateDbPaymentMethod {
  mutateAsync: (params: UpdateDbPaymentMethodParams) => Promise<unknown>;
}

export const createPaymentMethodUtils = (
  paymentMethods: PaymentMethod[],
  setPaymentMethods: (methods: PaymentMethod[] | ((prev: PaymentMethod[]) => PaymentMethod[])) => void,
  dbPaymentMethods: DbPaymentMethod[],
  updateDbPaymentMethod: UpdateDbPaymentMethod,
  getDefaultPaymentMethods: () => PaymentMethod[],
  removeDuplicatePaymentMethods: (methods: PaymentMethod[]) => PaymentMethod[],
  toast: Toast
) => {  const updatePaymentMethod = (id: string, field: keyof PaymentMethod, value: string | number | boolean) => {
    setPaymentMethods((prev: PaymentMethod[]) => 
      prev.map((method: PaymentMethod) => 
        method.id === id 
          ? { ...method, [field]: value }
          : method
      )
    );
  };
  const normalizeDistributionPercentages = () => {
    const activeMethods = paymentMethods.filter((method: PaymentMethod) => method.isActive);
    const currentTotal = activeMethods.reduce((sum: number, method: PaymentMethod) => sum + method.distributionPercentage, 0);
    
    if (currentTotal === 0) {
      const equalPercentage = 100 / activeMethods.length;
      setPaymentMethods((prev: PaymentMethod[]) => 
        prev.map((method: PaymentMethod) => 
          method.isActive 
            ? { ...method, distributionPercentage: equalPercentage }
            : method
        )
      );
    } else {
      const scaleFactor = 100 / currentTotal;
      setPaymentMethods((prev: PaymentMethod[]) => 
        prev.map((method: PaymentMethod) => 
          method.isActive 
            ? { ...method, distributionPercentage: method.distributionPercentage * scaleFactor }
            : method
        )
      );
    }
  };
  const cleanDuplicatesFromDatabase = async () => {
    try {
      const uniqueMethods = removeDuplicatePaymentMethods(paymentMethods);
      
      setPaymentMethods(uniqueMethods);
      
      const savePromises = uniqueMethods.map(async (method: PaymentMethod) => {
        const dbMethod = dbPaymentMethods.find((m: DbPaymentMethod) => 
          m.id === method.id || 
          m.nome_metodo.toLowerCase().includes(method.name.toLowerCase().split(' ')[0])
        );
          
        if (dbMethod && updateDbPaymentMethod) {
          await updateDbPaymentMethod.mutateAsync({
            id: dbMethod.id,
            nome_metodo: method.name,
            is_ativo: method.isActive,
            prazo_recebimento_dias: Math.round(method.distributionPercentage),
            taxa_percentual: method.taxRate,
          });
        }
      });

      await Promise.allSettled(savePromises);
      
      toast({
        title: "Sucesso!",
        description: "Duplicatas removidas e dados limpos com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar duplicatas. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const resetToDefaults = async () => {
    const confirmed = window.confirm(
      "Isso irá resetar todos os métodos de pagamento para os valores padrão. Continuar?"
    );
    
    if (confirmed) {
      try {
        const defaultMethods = getDefaultPaymentMethods();
        setPaymentMethods(defaultMethods);
        
        toast({
          title: "Sucesso!",
          description: "Métodos de pagamento resetados para valores padrão!",
          variant: "default"
        });
      } catch (error) {
        console.error('Error resetting to defaults:', error);
        toast({
          title: "Erro",
          description: "Erro ao resetar valores. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  return {
    updatePaymentMethod,
    normalizeDistributionPercentages,
    cleanDuplicatesFromDatabase,
    resetToDefaults
  };
};

export const createHolidayUtils = (
  holidays: Holiday[],
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>,
  newHolidayDate: string,
  setNewHolidayDate: (value: string) => void,
  newHolidayName: string,
  setNewHolidayName: (value: string) => void
) => {
  const addHoliday = () => {
    if (newHolidayDate && newHolidayName) {
      const newHoliday: Holiday = {
        id: Date.now().toString(),
        date: newHolidayDate,
        name: newHolidayName
      };
      setHolidays([...holidays, newHoliday]);
      setNewHolidayDate('');
      setNewHolidayName('');
    }
  };

  const removeHoliday = (id: string) => {
    setHolidays(holidays.filter(holiday => holiday.id !== id));
  };

  return {
    addHoliday,
    removeHoliday
  };
};
