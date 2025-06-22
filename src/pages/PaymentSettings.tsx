import { MarginsConfiguration } from '@/components/payment-settings/MarginsConfiguration';
import { DepreciationSection } from '@/components/payment-settings/DepreciationSection';
import { WorkingDaysSection } from '@/components/payment-settings/WorkingDaysSection';
import { TeamSection } from '@/components/payment-settings/TeamSection';
import { PaymentMethodsSection } from '@/components/payment-settings/PaymentMethodsSection';
import { SummaryCard } from '@/components/payment-settings/SummaryCard';
import { SaveAllButton } from '@/components/payment-settings/SaveAllButton';
import { usePaymentSettingsLogic } from '@/hooks/usePaymentSettingsLogic';
import { usePaymentMethodsInitialization } from '@/hooks/usePaymentMethodsInitialization';
import { useBusinessParamsInitialization } from '@/hooks/useBusinessParamsInitialization';
import { createSaveFunctions } from '@/utils/paymentSettingsSaveFunctions';
import { createPaymentMethodUtils, createHolidayUtils } from '@/utils/paymentSettingsUtils';

const PaymentSettings = () => {
  const logic = usePaymentSettingsLogic();

  // Initialize payment methods
  usePaymentMethodsInitialization(
    logic.dbPaymentMethods,
    logic.isInitialized,
    logic.paymentMethods,
    logic.setPaymentMethods,
    logic.setIsInitialized,
    logic.getDefaultPaymentMethods,
    logic.removeDuplicatePaymentMethods
  );

  // Initialize business parameters
  useBusinessParamsInitialization(
    logic.params,
    logic.setLucroDesejado,
    logic.setDespesasIndiretasDepreciacao,
    logic.setImpostosRate,
    logic.setValorMobilizado,
    logic.setTotalDepreciado,
    logic.setNumProfessionals,
    logic.setWorkingDays,
    logic.setHolidays
  );

  // Create save functions
  const saveFunctions = createSaveFunctions({
    toast: logic.toast,
    saveSettings: logic.saveSettings,
    updateParams: logic.updateParams,
    paymentMethods: logic.paymentMethods,
    dbPaymentMethods: logic.dbPaymentMethods,
    updateDbPaymentMethod: logic.updateDbPaymentMethod,
    setIsSaving: logic.setIsSaving,
    calculateWeightedAverageRate: logic.calculateWeightedAverageRate,
    calculateWorkingDaysPerYear: logic.calculateWorkingDaysPerYear,
    getTotalDistribution: logic.getTotalDistribution
  });

  // Create utility functions
  const paymentMethodUtils = createPaymentMethodUtils(
    logic.paymentMethods,
    logic.setPaymentMethods,
    logic.dbPaymentMethods,
    logic.updateDbPaymentMethod,
    logic.getDefaultPaymentMethods,
    logic.removeDuplicatePaymentMethods,
    logic.toast
  );

  const holidayUtils = createHolidayUtils(
    logic.holidays,
    logic.setHolidays,
    logic.newHolidayDate,
    logic.setNewHolidayDate,
    logic.newHolidayName,
    logic.setNewHolidayName
  );
  const handleSaveAll = async () => {
    await saveFunctions.handleSaveMargins(
      logic.lucroDesejado,
      logic.despesasIndiretasDepreciacao,
      logic.despesasDiretas,
      logic.impostosRate,
      logic.valorMobilizado,
      logic.totalDepreciado,
      logic.depreciacaoMensal,
      logic.numProfessionals
    );
    await saveFunctions.handleSavePaymentMethods();
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 animate-minimal-fade">
      <div className="mb-8">
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Parâmetros do Negócio
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Configure todos os parâmetros do seu negócio para cálculos precisos
        </p>
      </div>

      <MarginsConfiguration
        lucroDesejado={logic.lucroDesejado}
        setLucroDesejado={logic.setLucroDesejado}
        despesasIndiretasDepreciacao={logic.despesasIndiretasDepreciacao}
        setDespesasIndiretasDepreciacao={logic.setDespesasIndiretasDepreciacao}
        despesasDiretas={logic.despesasDiretas}
        impostosRate={logic.impostosRate}
        setImpostosRate={logic.setImpostosRate}
        isSaving={logic.isSaving}
        onSave={() => saveFunctions.handleSaveMargins(
          logic.lucroDesejado,
          logic.despesasIndiretasDepreciacao,
          logic.despesasDiretas,
          logic.impostosRate,
          logic.valorMobilizado,
          logic.totalDepreciado,
          logic.depreciacaoMensal,
          logic.numProfessionals
        )}
      />

      <DepreciationSection
        valorMobilizado={logic.valorMobilizado}
        setValorMobilizado={logic.setValorMobilizado}
        totalDepreciado={logic.totalDepreciado}
        setTotalDepreciado={logic.setTotalDepreciado}
        depreciacaoMensal={logic.depreciacaoMensal}
        isSaving={logic.isSaving}        onSave={() => saveFunctions.handleSaveDepreciation(
          logic.lucroDesejado,
          logic.despesasIndiretasDepreciacao,
          logic.impostosRate,
          logic.valorMobilizado,
          logic.totalDepreciado,
          logic.depreciacaoMensal,
          logic.numProfessionals
        )}
      />

      <WorkingDaysSection
        workingDays={logic.workingDays}
        setWorkingDays={logic.setWorkingDays}
        holidays={logic.holidays}
        setHolidays={logic.setHolidays}
        newHolidayDate={logic.newHolidayDate}
        setNewHolidayDate={logic.setNewHolidayDate}
        newHolidayName={logic.newHolidayName}
        setNewHolidayName={logic.setNewHolidayName}
        workingDaysPerYear={logic.workingDaysPerYear}
        isSaving={logic.isSaving}
        onAddHoliday={holidayUtils.addHoliday}
        onRemoveHoliday={holidayUtils.removeHoliday}        onSave={() => saveFunctions.handleSaveWorkingDays(
          logic.lucroDesejado,
          logic.despesasIndiretasDepreciacao,
          logic.impostosRate,
          logic.valorMobilizado,
          logic.totalDepreciado,
          logic.depreciacaoMensal,
          logic.numProfessionals,
          logic.workingDays,
          logic.holidays
        )}
      />

      <TeamSection
        numProfessionals={logic.numProfessionals}
        setNumProfessionals={logic.setNumProfessionals}
        isSaving={logic.isSaving}        onSave={() => saveFunctions.handleSaveTeam(
          logic.lucroDesejado,
          logic.despesasIndiretasDepreciacao,
          logic.impostosRate,
          logic.valorMobilizado,
          logic.totalDepreciado,
          logic.depreciacaoMensal,
          logic.numProfessionals,
          logic.workingDays,
          logic.holidays
        )}
      />

      <PaymentMethodsSection
        paymentMethods={logic.paymentMethods}
        totalDistribution={logic.totalDistribution}
        weightedAverageRate={logic.weightedAverageRate}
        isSaving={logic.isSaving}
        onUpdatePaymentMethod={paymentMethodUtils.updatePaymentMethod}
        onNormalizeDistribution={paymentMethodUtils.normalizeDistributionPercentages}
        onCleanDuplicates={paymentMethodUtils.cleanDuplicatesFromDatabase}
        onSavePaymentMethods={saveFunctions.handleSavePaymentMethods}
        onResetToDefaults={paymentMethodUtils.resetToDefaults}
      />

      <SummaryCard
        paymentMethods={logic.paymentMethods}
        totalDistribution={logic.totalDistribution}
        weightedAverageRate={logic.weightedAverageRate}
        workingDaysPerYear={logic.workingDaysPerYear}
        totalMargins={logic.totalMargins}
      />

      <SaveAllButton
        isSaving={logic.isSaving}
        onSaveAll={handleSaveAll}
      />
    </div>
  );
};

export default PaymentSettings;
