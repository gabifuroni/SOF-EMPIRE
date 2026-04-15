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

  usePaymentMethodsInitialization(
    logic.dbPaymentMethods, logic.isInitialized, logic.paymentMethods,
    logic.setPaymentMethods, logic.setIsInitialized,
    () => [], logic.removeDuplicatePaymentMethods
  );

  useBusinessParamsInitialization(
    logic.params, logic.setLucroDesejado, logic.setDespesasIndiretasDepreciacao,
    logic.setImpostosRate, logic.setValorMobilizado, logic.setTotalDepreciado,
    logic.setNumProfessionals, logic.setWorkingDays, logic.setHolidays
  );

  const saveFunctions = createSaveFunctions({
    toast: logic.toast, saveSettings: logic.saveSettings, updateParams: logic.updateParams,
    paymentMethods: logic.paymentMethods, dbPaymentMethods: logic.dbPaymentMethods,
    updateDbPaymentMethod: logic.updateDbPaymentMethod, setIsSaving: logic.setIsSaving,
    calculateWeightedAverageRate: logic.calculateWeightedAverageRate,
    calculateWorkingDaysPerYear: logic.calculateWorkingDaysPerYear,
    getTotalDistribution: logic.getTotalDistribution,
  });

  const paymentMethodUtils = createPaymentMethodUtils(
    logic.paymentMethods, logic.setPaymentMethods, logic.dbPaymentMethods,
    logic.updateDbPaymentMethod, () => [], logic.removeDuplicatePaymentMethods, logic.toast
  );

  const holidayUtils = createHolidayUtils(
    logic.holidays, logic.setHolidays, logic.newHolidayDate, logic.setNewHolidayDate,
    logic.newHolidayName, logic.setNewHolidayName
  );

  const handleSaveAll = async () => {
    await saveFunctions.handleSaveMargins(logic.lucroDesejado, logic.despesasIndiretasDepreciacao, logic.despesasDiretas, logic.impostosRate, logic.valorMobilizado, logic.totalDepreciado, logic.depreciacaoMensal, logic.numProfessionals);
    await saveFunctions.handleSavePaymentMethods();
  };

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        /* Override light theme components for dark mode */
        .payment-settings-wrap .symbol-card { background: #13131a !important; border-color: #2a2a38 !important; color: #f0f0f8 !important; }
        .payment-settings-wrap input:not([type=checkbox]), .payment-settings-wrap select { background: #1c1c26 !important; border-color: #2a2a38 !important; color: #f0f0f8 !important; }
        .payment-settings-wrap input:focus, .payment-settings-wrap select:focus { border-color: #c9a84c !important; }
        .payment-settings-wrap label, .payment-settings-wrap h1, .payment-settings-wrap h2, .payment-settings-wrap h3, .payment-settings-wrap h4, .payment-settings-wrap p { color: #f0f0f8 !important; }
        .payment-settings-wrap .text-symbol-gray-600, .payment-settings-wrap .text-symbol-gray-700 { color: #9090a8 !important; }
        .payment-settings-wrap .text-symbol-black { color: #f0f0f8 !important; }
        .payment-settings-wrap .bg-symbol-gray-50, .payment-settings-wrap .bg-symbol-gray-100 { background: #1c1c26 !important; }
        .payment-settings-wrap .border-symbol-gray-200, .payment-settings-wrap .border-symbol-gray-300 { border-color: #2a2a38 !important; }
        .payment-settings-wrap table { background: #13131a !important; }
        .payment-settings-wrap th { background: #1c1c26 !important; color: #9090a8 !important; border-color: #2a2a38 !important; }
        .payment-settings-wrap td { border-color: #2a2a38 !important; color: #f0f0f8 !important; }
        .payment-settings-wrap tr:hover td { background: rgba(255,255,255,0.02) !important; }
      `}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Parâmetros do Negócio</h1>
        <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
        <p style={{ fontSize: 13, color: '#9090a8' }}>Configure todos os parâmetros do seu negócio para cálculos precisos</p>
      </div>

      <div className="payment-settings-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <MarginsConfiguration
          lucroDesejado={logic.lucroDesejado} setLucroDesejado={logic.setLucroDesejado}
          despesasIndiretasDepreciacao={logic.despesasIndiretasDepreciacao} setDespesasIndiretasDepreciacao={logic.setDespesasIndiretasDepreciacao}
          despesasDiretas={logic.despesasDiretas} impostosRate={logic.impostosRate} setImpostosRate={logic.setImpostosRate}
          isSaving={logic.isSaving}
          onSave={() => saveFunctions.handleSaveMargins(logic.lucroDesejado, logic.despesasIndiretasDepreciacao, logic.despesasDiretas, logic.impostosRate, logic.valorMobilizado, logic.totalDepreciado, logic.depreciacaoMensal, logic.numProfessionals)}
        />
        <DepreciationSection
          valorMobilizado={logic.valorMobilizado} setValorMobilizado={logic.setValorMobilizado}
          totalDepreciado={logic.totalDepreciado} setTotalDepreciado={logic.setTotalDepreciado}
          depreciacaoMensal={logic.depreciacaoMensal} isSaving={logic.isSaving}
          addToIndirectExpenses={logic.addToIndirectExpenses} setAddToIndirectExpenses={logic.setAddToIndirectExpenses}
          isAddingToIndirectExpenses={logic.isAddingToIndirectExpenses}
          onSave={() => saveFunctions.handleSaveDepreciation(logic.lucroDesejado, logic.despesasIndiretasDepreciacao, logic.impostosRate, logic.valorMobilizado, logic.totalDepreciado, logic.depreciacaoMensal, logic.numProfessionals, logic.addToIndirectExpenses, logic.setIsAddingToIndirectExpenses, logic.addDepreciationToIndirectExpenses, logic.removeDepreciationFromIndirectExpenses)}
        />
        <WorkingDaysSection
          workingDays={logic.workingDays} setWorkingDays={logic.setWorkingDays}
          holidays={logic.holidays} setHolidays={logic.setHolidays}
          newHolidayDate={logic.newHolidayDate} setNewHolidayDate={logic.setNewHolidayDate}
          newHolidayName={logic.newHolidayName} setNewHolidayName={logic.setNewHolidayName}
          workingDaysPerYear={logic.workingDaysPerYear} isSaving={logic.isSaving}
          onAddHoliday={holidayUtils.addHoliday} onRemoveHoliday={holidayUtils.removeHoliday}
          onSave={() => saveFunctions.handleSaveWorkingDays(logic.lucroDesejado, logic.despesasIndiretasDepreciacao, logic.impostosRate, logic.valorMobilizado, logic.totalDepreciado, logic.depreciacaoMensal, logic.numProfessionals, logic.workingDays, logic.holidays)}
        />
        <TeamSection
          numProfessionals={logic.numProfessionals} setNumProfessionals={logic.setNumProfessionals} isSaving={logic.isSaving}
          onSave={() => saveFunctions.handleSaveTeam(logic.lucroDesejado, logic.despesasIndiretasDepreciacao, logic.impostosRate, logic.valorMobilizado, logic.totalDepreciado, logic.depreciacaoMensal, logic.numProfessionals, logic.workingDays, logic.holidays)}
        />
        <PaymentMethodsSection
          paymentMethods={logic.paymentMethods} totalDistribution={logic.totalDistribution}
          weightedAverageRate={logic.weightedAverageRate} isSaving={logic.isSaving}
          onUpdatePaymentMethod={paymentMethodUtils.updatePaymentMethod}
          onNormalizeDistribution={paymentMethodUtils.normalizeDistributionPercentages}
          onCleanDuplicates={paymentMethodUtils.cleanDuplicatesFromDatabase}
          onSavePaymentMethods={saveFunctions.handleSavePaymentMethods}
          onResetToDefaults={paymentMethodUtils.resetToDefaults}
        />
        <SummaryCard
          paymentMethods={logic.paymentMethods} totalDistribution={logic.totalDistribution}
          weightedAverageRate={logic.weightedAverageRate} workingDaysPerYear={logic.workingDaysPerYear}
          totalMargins={logic.totalMargins}
        />
        <SaveAllButton isSaving={logic.isSaving} onSaveAll={handleSaveAll} />
      </div>
    </div>
  );
};

export default PaymentSettings;
