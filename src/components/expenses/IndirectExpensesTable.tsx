import { Plus, Trash2, Save, Edit2, Check, X } from "lucide-react";
import { ExpenseCategory, MonthlyExpense } from "@/types";
import { useState, useEffect, useRef } from "react";

interface IndirectExpensesTableProps {
  categories: ExpenseCategory[];
  expenses: MonthlyExpense[];
  selectedMonth: string;
  selectedYear: string;
  newCategoryName: string;
  showAddCategory: boolean;
  hasUnsavedChanges: boolean;
  onUpdateExpense: (categoryId: string, value: number) => void;
  onSaveExpenseValues: () => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddNewCategory: () => void;
  onEditCategory: (categoryId: string, newName: string) => void;
  onSetNewCategoryName: (name: string) => void;
  onSetShowAddCategory: (show: boolean) => void;
  getTempExpenseValue: (categoryId: string) => number;
  calculateMonthTotal: () => number;
  // kept for compatibility but unused
  fixedExpenses?: Record<string, boolean>;
  onToggleFixedExpense?: (categoryId: string, isFixed: boolean) => void;
  getExpenseForCategory?: (categoryId: string) => MonthlyExpense;
  calculateYearlyTotal?: (categoryId: string) => number;
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

const ExpenseInput = ({ categoryId, initialValue, onValueChange, hasChanges }: {
  categoryId: string; initialValue: number;
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
        style={{
          ...inputStyle, width: 110, textAlign: 'right',
          borderColor: hasChanges ? '#c9a84c' : '#2a2a38',
          background: hasChanges ? 'rgba(201,168,76,0.08)' : '#1c1c26',
        }}
      />
      {hasChanges && (
        <div style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: '#c9a84c' }} />
      )}
    </div>
  );
};

const IndirectExpensesTable = ({
  categories, expenses, selectedMonth, selectedYear,
  newCategoryName, showAddCategory, hasUnsavedChanges,
  onUpdateExpense, onSaveExpenseValues, onRemoveCategory,
  onAddNewCategory, onEditCategory, onSetNewCategoryName,
  onSetShowAddCategory, getTempExpenseValue, calculateMonthTotal,
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

  const getSavedValue = (categoryId: string) => {
    const exp = expenses.find(e => (e as any).categoria_id === categoryId);
    return exp ? ((exp as any).valor_mensal || 0) : 0;
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
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, color: '#f0f0f8', marginBottom: 6 }}>Sem categorias no momento</div>
          <div style={{ fontSize: 12, color: '#606078', marginBottom: 16 }}>Adicione uma nova categoria para começar</div>
          {showAddCategory ? (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', maxWidth: 360, margin: '0 auto' }}>
              <input
                value={newCategoryName}
                onChange={(e) => onSetNewCategoryName(e.target.value)}
                placeholder="Nome da nova categoria"
                onKeyDown={(e) => e.key === 'Enter' && onAddNewCategory()}
                style={{ ...inputStyle, borderColor: '#c9a84c', borderStyle: 'dashed' }}
                autoFocus
              />
              <button onClick={onAddNewCategory} style={{ background: 'linear-gradient(135deg,#c9a84c,#a8852e)', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 11, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer' }}>
                <Plus size={12} />
              </button>
              <button onClick={() => { onSetShowAddCategory(false); onSetNewCategoryName(''); }} style={{ background: 'transparent', border: '1px solid #2a2a38', borderRadius: 6, padding: '7px 10px', fontSize: 11, color: '#9090a8', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSetShowAddCategory(true)}
              style={{ background: 'transparent', border: '1px dashed #2a2a38', borderRadius: 8, padding: '7px 16px', fontSize: 12, color: '#606078', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Sora, sans-serif' }}
            >
              <Plus size={12} /> Adicionar Nova Categoria
            </button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f0f18', borderBottom: '1px solid #1e1e2a' }}>
                <th style={th}>Categoria</th>
                <th style={{ ...th, textAlign: 'right' }}>Valor do Mês (R$)</th>
                <th style={{ ...th, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const savedValue = getSavedValue(category.id);
                const currentValue = getTempExpenseValue(category.id);
                const hasChanges = currentValue !== savedValue;

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

                    {/* Valor do Mês */}
                    <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                      <ExpenseInput
                        categoryId={category.id}
                        initialValue={currentValue}
                        onValueChange={(value) => onUpdateExpense(category.id, value)}
                        hasChanges={hasChanges}
                      />
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
                  <td />
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
                  <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'center' }}>
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
