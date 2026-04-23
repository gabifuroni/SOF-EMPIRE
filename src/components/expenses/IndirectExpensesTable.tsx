import { Plus, Trash2, Save, Edit2, Check, X } from "lucide-react";
import { ExpenseCategory, MonthlyExpense } from "@/types";
import { useState, useEffect, useRef } from "react";

interface IndirectExpensesTableProps {
  categories: ExpenseCategory[];
  expenses: MonthlyExpense[];
  fixedExpenses: Record<string, boolean>;
  selectedMonth: string;
  selectedYear: string;
  newCategoryName: string;
  showAddCategory: boolean;
  hasUnsavedChanges: boolean;
  onUpdateExpense: (categoryId: string, value: number) => void;
  onSaveExpenseValues: () => void;
  onToggleFixedExpense: (categoryId: string, isFixed: boolean) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddNewCategory: () => void;
  onEditCategory: (categoryId: string, newName: string) => void;
  onSetNewCategoryName: (name: string) => void;
  onSetShowAddCategory: (show: boolean) => void;
  getExpenseForCategory: (categoryId: string) => MonthlyExpense;
  getTempExpenseValue: (categoryId: string) => number;
  calculateYearlyTotal: (categoryId: string) => number;
  calculateMonthTotal: () => number;
}

const MONTHS = [
  { key: "january", label: "Janeiro" }, { key: "february", label: "Fevereiro" },
  { key: "march", label: "Março" }, { key: "april", label: "Abril" },
  { key: "may", label: "Maio" }, { key: "june", label: "Junho" },
  { key: "july", label: "Julho" }, { key: "august", label: "Agosto" },
  { key: "september", label: "Setembro" }, { key: "october", label: "Outubro" },
  { key: "november", label: "Novembro" }, { key: "december", label: "Dezembro" },
];

const inputStyle: React.CSSProperties = {
  background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 6,
  padding: '6px 10px', color: '#f0f0f8', fontSize: 13, outline: 'none',
  fontFamily: 'Sora, sans-serif', width: '100%', boxSizing: 'border-box',
};

const ExpenseInput = ({ categoryId, initialValue, isDisabled, onValueChange, hasChanges }: {
  categoryId: string; initialValue: number; isDisabled: boolean;
  onValueChange: (value: number) => void; hasChanges: boolean;
}) => {
  const [localValue, setLocalValue] = useState(() => initialValue === 0 ? "" : initialValue.toString());
  const [isFocused, setIsFocused] = useState(false);
  const previousInitialValue = useRef(initialValue);

  useEffect(() => {
    if (!isFocused && previousInitialValue.current !== initialValue) {
      setLocalValue(initialValue === 0 ? "" : initialValue.toString());
      previousInitialValue.current = initialValue;
    }
  }, [initialValue, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    if (value === "" || !isNaN(parseFloat(value))) {
      onValueChange(value === "" ? 0 : parseFloat(value));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseFloat(localValue) || 0;
    if (localValue !== (numericValue === 0 ? "" : numericValue.toString())) {
      setLocalValue(numericValue === 0 ? "" : numericValue.toString());
    }
    onValueChange(numericValue);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        type="number" min="0" step="0.01"
        value={localValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder="0,00"
        disabled={isDisabled}
        style={{
          ...inputStyle,
          width: 110, textAlign: 'right',
          borderColor: hasChanges ? '#c9a84c' : '#2a2a38',
          background: hasChanges ? 'rgba(201,168,76,0.08)' : '#1c1c26',
          opacity: isDisabled ? 0.4 : 1,
          cursor: isDisabled ? 'not-allowed' : 'text',
        }}
      />
      {hasChanges && (
        <div style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: '#c9a84c' }} />
      )}
    </div>
  );
};

const IndirectExpensesTable = ({
  categories, expenses, fixedExpenses, selectedMonth, selectedYear,
  newCategoryName, showAddCategory, hasUnsavedChanges,
  onUpdateExpense, onSaveExpenseValues, onToggleFixedExpense,
  onRemoveCategory, onAddNewCategory, onEditCategory,
  onSetNewCategoryName, onSetShowAddCategory,
  getExpenseForCategory, getTempExpenseValue, calculateYearlyTotal, calculateMonthTotal,
}: IndirectExpensesTableProps) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const selectedMonthLabel = MONTHS.find((m) => m.key === selectedMonth)?.label || "";

  const handleSaveEdit = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      onEditCategory(editingCategoryId, editingCategoryName.trim());
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };

  const th: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
    color: '#606078', padding: '10px 16px', textAlign: 'left', whiteSpace: 'nowrap',
  };

  return (
    <div style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e1e2a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f8', fontFamily: 'Sora, sans-serif' }}>
            Despesas Indiretas
          </span>
          <span style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.2)' }}>
            {selectedMonthLabel} {selectedYear}
          </span>
          <span style={{ background: 'rgba(144,144,168,0.1)', color: '#9090a8', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(144,144,168,0.15)' }}>
            {categories.length} categorias
          </span>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={onSaveExpenseValues}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a8852e)', border: 'none', borderRadius: 8, padding: '7px 14px', fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={13} /> Salvar Alterações
          </button>
        )}
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, color: '#f0f0f8', marginBottom: 6 }}>Sem categorias no momento</div>
          <div style={{ fontSize: 12, color: '#606078' }}>Adicione uma nova categoria para começar</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f0f18', borderBottom: '1px solid #1e1e2a' }}>
                <th style={th}>Categoria</th>
                <th style={{ ...th, textAlign: 'center' }}>Valor Fixo</th>
                <th style={{ ...th, textAlign: 'right' }}>Valor do Mês (R$)</th>
                <th style={{ ...th, textAlign: 'right' }}>Total Anual (R$)</th>
                <th style={{ ...th, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const expense = getExpenseForCategory(category.id);
                const savedValue = (expense[selectedMonth as keyof MonthlyExpense] as number) || 0;
                const currentValue = getTempExpenseValue(category.id);
                const hasChanges = currentValue !== savedValue;
                const yearlyTotal = calculateYearlyTotal(category.id);
                const isFixed = fixedExpenses[category.id] || false;

                return (
                  <tr key={category.id} style={{ borderBottom: '1px solid #1a1a24' }}>
                    {/* Categoria */}
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#f0f0f8', fontWeight: 500 }}>
                      {editingCategoryId === category.id ? (
                        <input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") { setEditingCategoryId(null); setEditingCategoryName(""); }
                          }}
                          style={{ ...inputStyle, borderColor: '#c9a84c' }}
                          autoFocus
                        />
                      ) : category.name}
                    </td>

                    {/* Valor Fixo */}
                    <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                      <div
                        onClick={() => onToggleFixedExpense(category.id, !isFixed)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: isFixed ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isFixed ? 'rgba(201,168,76,0.3)' : '#2a2a38'}`, borderRadius: 8, cursor: 'pointer' }}
                      >
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: isFixed ? '#c9a84c' : 'transparent', border: `2px solid ${isFixed ? '#c9a84c' : '#3a3a4a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isFixed && <Check size={9} color="#0a0a0f" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isFixed ? '#c9a84c' : '#606078', letterSpacing: '0.05em' }}>FIXO</span>
                      </div>
                    </td>

                    {/* Valor do Mês */}
                    <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                      <ExpenseInput
                        categoryId={category.id}
                        initialValue={currentValue}
                        isDisabled={isFixed && selectedMonth !== "january"}
                        onValueChange={(value) => onUpdateExpense(category.id, value)}
                        hasChanges={hasChanges}
                      />
                      {isFixed && selectedMonth !== "january" && (
                        <div style={{ fontSize: 10, color: '#606078', marginTop: 3 }}>Valor fixo definido</div>
                      )}
                    </td>

                    {/* Total Anual */}
                    <td style={{ padding: '11px 16px', textAlign: 'right', fontSize: 13, color: '#9090a8', fontWeight: 500 }}>
                      R$ {yearlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {editingCategoryId === category.id ? (
                          <>
                            <button onClick={handleSaveEdit} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#00c896', padding: 4 }} title="Salvar">
                              <Check size={14} />
                            </button>
                            <button onClick={() => { setEditingCategoryId(null); setEditingCategoryName(""); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9090a8', padding: 4 }} title="Cancelar">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingCategoryId(category.id); setEditingCategoryName(category.name); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#606078', padding: 4 }} title="Editar">
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Remover a categoria "${category.name}"?`)) onRemoveCategory(category.id);
                              }}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3a3a4a', padding: 4 }} title="Remover"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Add category row */}
              {showAddCategory ? (
                <tr style={{ borderBottom: '1px solid #1a1a24', background: 'rgba(201,168,76,0.04)' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <input
                      value={newCategoryName}
                      onChange={(e) => onSetNewCategoryName(e.target.value)}
                      placeholder="Nome da nova categoria"
                      onKeyDown={(e) => e.key === 'Enter' && onAddNewCategory()}
                      style={{ ...inputStyle, borderColor: '#c9a84c', borderStyle: 'dashed' }}
                      autoFocus
                    />
                  </td>
                  <td /><td /><td />
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={onAddNewCategory} style={{ background: 'linear-gradient(135deg,#c9a84c,#a8852e)', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer' }}>
                        <Plus size={12} />
                      </button>
                      <button onClick={() => { onSetShowAddCategory(false); onSetNewCategoryName(""); }} style={{ background: 'transparent', border: '1px solid #2a2a38', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: '#9090a8', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => onSetShowAddCategory(true)}
                      style={{ background: 'transparent', border: '1px dashed #2a2a38', borderRadius: 8, padding: '7px 16px', fontSize: 12, color: '#606078', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Sora, sans-serif' }}
                    >
                      <Plus size={12} /> Adicionar Nova Categoria
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Total row */}
      <div style={{ background: '#0f0f18', borderTop: '1px solid #1e1e2a', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#606078' }}>Total do Mês</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#c9a84c', fontFamily: 'Sora, sans-serif' }}>
          R$ {calculateMonthTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};

export default IndirectExpensesTable;
