import { Plus, Trash2, Save, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  { key: "january", label: "Janeiro" },
  { key: "february", label: "Fevereiro" },
  { key: "march", label: "Março" },
  { key: "april", label: "Abril" },
  { key: "may", label: "Maio" },
  { key: "june", label: "Junho" },
  { key: "july", label: "Julho" },
  { key: "august", label: "Agosto" },
  { key: "september", label: "Setembro" },
  { key: "october", label: "Outubro" },
  { key: "november", label: "Novembro" },
  { key: "december", label: "Dezembro" },
];

// Component for individual expense input
const ExpenseInput = ({
  categoryId,
  initialValue,
  isDisabled,
  onValueChange,
  hasChanges,
}: {
  categoryId: string;
  initialValue: number;
  isDisabled: boolean;
  onValueChange: (value: number) => void;
  hasChanges: boolean;
}) => {
  const [localValue, setLocalValue] = useState(() => 
    initialValue === 0 ? "" : initialValue.toString()
  );
  const [isFocused, setIsFocused] = useState(false);
  const previousInitialValue = useRef(initialValue);

  // Only update local value when initialValue changes significantly and not focused
  useEffect(() => {
    if (!isFocused && previousInitialValue.current !== initialValue) {
      setLocalValue(initialValue === 0 ? "" : initialValue.toString());
      previousInitialValue.current = initialValue;
    }
  }, [initialValue, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    
    // Allow empty string or valid numbers
    if (value === "" || !isNaN(parseFloat(value))) {
      const numericValue = value === "" ? 0 : parseFloat(value);
      onValueChange(numericValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseFloat(localValue) || 0;
    
    // Only update display if value is different
    if (localValue !== (numericValue === 0 ? "" : numericValue.toString())) {
      setLocalValue(numericValue === 0 ? "" : numericValue.toString());
    }
    
    // Final notification to parent
    onValueChange(numericValue);
  };

  return (
    <div className="relative">
      <Input
        type="number"
        min="0"
        step="0.01"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`text-right max-w-32 ml-auto focus:border-symbol-gold ${
          hasChanges
            ? "bg-symbol-beige/30 border-symbol-gold/50"
            : "bg-symbol-gray-50 border-symbol-gray-300"
        }`}
        placeholder="0,00"
        disabled={isDisabled}
      />
      {hasChanges && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-symbol-gold rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

const IndirectExpensesTable = ({
  categories,
  expenses,
  fixedExpenses,
  selectedMonth,
  selectedYear,
  newCategoryName,
  showAddCategory,
  hasUnsavedChanges,
  onUpdateExpense,
  onSaveExpenseValues,
  onToggleFixedExpense,
  onRemoveCategory,
  onAddNewCategory,
  onEditCategory,
  onSetNewCategoryName,
  onSetShowAddCategory,
  getExpenseForCategory,
  getTempExpenseValue,
  calculateYearlyTotal,
  calculateMonthTotal,
}: IndirectExpensesTableProps) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  
  const selectedMonthLabel =
    MONTHS.find((m) => m.key === selectedMonth)?.label || "";

  const handleStartEdit = (category: ExpenseCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      onEditCategory(editingCategoryId, editingCategoryName.trim());
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  return (
    <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Despesas Indiretas - {selectedMonthLabel} - {selectedYear}
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        {hasUnsavedChanges && (
          <Button
            onClick={onSaveExpenseValues}
            className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                Categoria
              </TableHead>
              <TableHead className="text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                Valor Fixo
              </TableHead>
              <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                Valor do Mês (R$)
              </TableHead>
              <TableHead className="text-right brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                Total Anual (R$)
              </TableHead>
              <TableHead className="w-20 text-center brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-symbol-gray-500 text-lg">📊</div>
                    <p className="text-symbol-gray-600 font-medium">Sem categorias no momento</p>
                    <p className="text-symbol-gray-500 text-sm">Adicione uma nova categoria para começar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category, index) => {
              const expense = getExpenseForCategory(category.id);
              const savedValue =
                (expense[selectedMonth as keyof MonthlyExpense] as number) || 0;
              const currentValue = getTempExpenseValue(category.id);
              const hasChanges = currentValue !== savedValue;
              const yearlyTotal = calculateYearlyTotal(category.id);
              const isFixed = fixedExpenses[category.id] || false;

              return (
                <TableRow
                  key={category.id}
                  className={index % 2 === 0 ? "bg-symbol-gray-50/30" : ""}
                >
                  <TableCell className="font-medium brand-body text-symbol-black">
                    {editingCategoryId === category.id ? (
                      <Input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="border-symbol-gold"
                        autoFocus
                      />
                    ) : (
                      category.name
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-3 bg-symbol-gray-50 p-3 rounded-xl border-2 border-symbol-gray-200 hover:border-symbol-gold transition-all duration-300 shadow-sm hover:shadow-md">
                        <Checkbox
                          checked={isFixed}
                          onCheckedChange={(checked) =>
                            onToggleFixedExpense(
                              category.id,
                              checked as boolean
                            )
                          }
                          className="data-[state=checked]:bg-symbol-gold data-[state=checked]:border-symbol-gold h-6 w-6 border-2 border-symbol-gray-400 rounded-md shadow-sm hover:shadow-md transition-all duration-300"
                        />
                        <span className="text-sm font-semibold text-symbol-gray-800 min-w-[60px]">
                          FIXO
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ExpenseInput
                      categoryId={category.id}
                      initialValue={currentValue}
                      isDisabled={isFixed && selectedMonth !== "january"}
                      onValueChange={(value) =>
                        onUpdateExpense(category.id, value)
                      }
                      hasChanges={hasChanges}
                    />
                    {isFixed && selectedMonth !== "january" && (
                      <p className="text-xs text-symbol-gray-500 mt-1">
                        Valor fixo definido
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold brand-body text-symbol-black">
                    R${" "}
                    {yearlyTotal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {editingCategoryId === category.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0 transition-all duration-200"
                            title="Salvar alterações"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 h-8 w-8 p-0 transition-all duration-200"
                            title="Cancelar edição"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(category)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0 transition-all duration-200"
                            title="Editar categoria"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (category.isCustom) {
                                if (window.confirm(`Tem certeza que deseja remover a categoria "${category.name}"?`)) {
                                  onRemoveCategory(category.id);
                                }
                              } else {
                                if (window.confirm(`ATENÇÃO: "${category.name}" é uma categoria padrão do sistema. Tem certeza que deseja removê-la? Esta ação não pode ser desfeita.`)) {
                                  onRemoveCategory(category.id);
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 transition-all duration-200 shadow-sm hover:shadow-md"
                            title={category.isCustom ? "Remover categoria personalizada" : "Remover categoria padrão (cuidado!)"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}                    </div>
                  </TableCell>
                </TableRow>
              );
            })
            )}

            {/* Add Category Row */}
            {showAddCategory ? (
              <TableRow className="bg-symbol-beige/20 border-2 border-dashed border-symbol-gold/40">
                <TableCell>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => onSetNewCategoryName(e.target.value)}
                    placeholder="Nome da nova categoria"
                    className="border-none bg-transparent focus:border-symbol-gold"
                    onKeyPress={(e) => e.key === "Enter" && onAddNewCategory()}
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={onAddNewCategory}
                      className="h-8 bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onSetShowAddCategory(false);
                        onSetNewCategoryName("");
                      }}
                      className="h-8 text-symbol-gray-600 hover:text-symbol-black"
                    >
                      ✕
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => onSetShowAddCategory(true)}
                    className="border-dashed border-symbol-gold/40 text-symbol-gray-600 hover:bg-symbol-beige/20 font-light"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Nova Categoria
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {/* Total Monthly Row */}
            <TableRow className="bg-symbol-gold/10 border-t-2 border-symbol-gold/30 font-semibold">
              <TableCell className="font-bold brand-subheading text-symbol-black">
                Total do Mês
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-bold text-symbol-gold">
                R${" "}
                {calculateMonthTotal().toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Total Annual Row */}
            <TableRow className="bg-symbol-beige/20 font-semibold">
              <TableCell className="font-bold brand-subheading text-symbol-black">
                Total Anual
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-bold brand-body text-symbol-black">
                R${" "}
                {expenses
                  .reduce((total, expense) => {
                    return (
                      total +
                      MONTHS.reduce((categoryTotal, month) => {
                        const monthKey = month.key as keyof MonthlyExpense;
                        return (
                          categoryTotal + ((expense[monthKey] as number) || 0)
                        );
                      }, 0)
                    );
                  }, 0)
                  .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IndirectExpensesTable;
