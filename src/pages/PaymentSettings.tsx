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
        /* Cards */
        .payment-settings-wrap .symbol-card,[class*=symbol-card]{background:#13131a!important;border:1px solid #2a2a38!important;border-radius:12px!important}
        /* Inputs */
        .payment-settings-wrap input:not([type=checkbox]),.payment-settings-wrap select,.payment-settings-wrap textarea{background:#1c1c26!important;border-color:#2a2a38!important;color:#f0f0f8!important;border-radius:8px!important}
        .payment-settings-wrap input:focus,.payment-settings-wrap select:focus{border-color:#c9a84c!important;box-shadow:0 0 0 2px rgba(201,168,76,0.15)!important}
        .payment-settings-wrap input::placeholder{color:#606078!important}
        /* Text */
        .payment-settings-wrap label,.payment-settings-wrap h2,.payment-settings-wrap h3,.payment-settings-wrap h4,.payment-settings-wrap p,.payment-settings-wrap span{color:#f0f0f8!important}
        .payment-settings-wrap .text-symbol-gray-600,.payment-settings-wrap .text-symbol-gray-700,.payment-settings-wrap .text-gray-600,.payment-settings-wrap .text-xs{color:#9090a8!important}
        .payment-settings-wrap .text-symbol-black,.payment-settings-wrap .text-gray-900{color:#f0f0f8!important}
        /* Backgrounds */
        .payment-settings-wrap .bg-symbol-gray-50,.payment-settings-wrap .bg-symbol-gray-100,.payment-settings-wrap .bg-gray-50,.payment-settings-wrap .bg-white{background:#1c1c26!important}
        .payment-settings-wrap .bg-symbol-beige\/20,.payment-settings-wrap [class*=bg-symbol-beige]{background:rgba(201,168,76,0.08)!important;border-color:rgba(201,168,76,0.2)!important}
        .payment-settings-wrap [class*=bg-symbol-gold\/10]{background:rgba(201,168,76,0.08)!important}
        .payment-settings-wrap .bg-symbol-gold{background:linear-gradient(135deg,#c9a84c,#8a6520)!important;color:#0a0a0f!important}
        /* Borders */
        .payment-settings-wrap [class*=border-symbol-gray],.payment-settings-wrap .border-gray-200,.payment-settings-wrap .border-gray-300{border-color:#2a2a38!important}
        /* Buttons - save buttons golden */
        .payment-settings-wrap .bg-symbol-gold,.payment-settings-wrap [class*=bg-symbol-gold]{background:linear-gradient(135deg,#c9a84c,#8a6520)!important;color:#0a0a0f!important;border:none!important;border-radius:10px!important;font-weight:600!important}
        .payment-settings-wrap .bg-symbol-black,.payment-settings-wrap .bg-gray-900{background:linear-gradient(135deg,#c9a84c,#8a6520)!important;color:#0a0a0f!important;border:none!important;border-radius:10px!important;font-weight:600!important}
        /* Secondary buttons */
        .payment-settings-wrap button[variant=outline],.payment-settings-wrap .border-red-300,.payment-settings-wrap [class*=hover\:bg-red]{background:rgba(255,77,106,0.08)!important;border-color:rgba(255,77,106,0.25)!important;color:#ff4d6a!important;border-radius:8px!important}
        /* Table */
        .payment-settings-wrap table{background:#13131a!important}
        .payment-settings-wrap th{background:#1c1c26!important;color:#606078!important;border-color:#2a2a38!important;font-size:10px!important;letter-spacing:0.1em!important;text-transform:uppercase!important}
        .payment-settings-wrap td{border-color:#2a2a38!important;color:#f0f0f8!important}
        .payment-settings-wrap tr:hover td{background:rgba(255,255,255,0.02)!important}
        /* Toggle/switch */
        .payment-settings-wrap [data-state=checked]{background:#c9a84c!important}
        /* Checkbox */
        .payment-settings-wrap [role=checkbox],[data-radix-checkbox-root]{background:#1c1c26!important;border-color:#3a3a4a!important}
        .payment-settings-wrap [data-state=checked][role=checkbox]{background:#c9a84c!important;border-color:#c9a84c!important}
        /* Section dividers */
        .payment-settings-wrap .w-8.h-px,.payment-settings-wrap [class*=h-px]{background:linear-gradient(90deg,#c9a84c,transparent)!important}
        /* Rounded containers */
        .payment-settings-wrap .rounded-lg,.payment-settings-wrap .rounded-xl{background:#1c1c26!important}
        /* Text colors for special values */
        .payment-settings-wrap .text-symbol-gold,.payment-settings-wrap .text-amber-600{color:#c9a84c!important}
        .payment-settings-wrap .text-emerald-600,.payment-settings-wrap .text-green-600{color:#00c896!important}
        .payment-settings-wrap .text-red-600{color:#ff4d6a!important}
        .payment-settings-wrap .text-blue-600{color:#4d9fff!important}
      `}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Parâmetros do Negócio</h1>
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
