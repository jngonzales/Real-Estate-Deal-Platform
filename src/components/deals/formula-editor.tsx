"use client";

import { useState } from "react";
import { Pencil, X, Check, Info, AlertCircle } from "lucide-react";
import {
  CustomFormula,
  FORMULA_VARIABLES,
  validateFormula,
  DEFAULT_FORMULAS,
} from "@/lib/formulas/formula-engine";
import { cn } from "@/lib/utils";

interface FormulaEditorProps {
  formulaId: string;
  formula: CustomFormula;
  result: number;
  onSave: (formula: CustomFormula) => void;
  formatCurrency: (amount: number) => string;
  resultColor?: string;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export function FormulaEditor({
  formulaId,
  formula,
  result,
  onSave,
  formatCurrency,
  resultColor = "text-foreground dark:text-white",
  borderColor = "border-border dark:border-border",
  bgColor = "bg-white dark:bg-secondary",
  textColor = "text-muted-foreground dark:text-muted-foreground",
  className,
}: FormulaEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editExpression, setEditExpression] = useState(formula.expression);
  const [error, setError] = useState<string | null>(null);
  const [showVariables, setShowVariables] = useState(false);

  const handleStartEdit = () => {
    setEditExpression(formula.expression); // Sync before editing
    setIsEditing(true);
  };

  const handleSave = () => {
    const validation = validateFormula(editExpression);
    if (!validation.valid) {
      setError(validation.error || "Invalid formula");
      return;
    }

    onSave({
      ...formula,
      expression: editExpression,
      isDefault: editExpression === DEFAULT_FORMULAS[formulaId]?.expression,
    });
    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setEditExpression(formula.expression);
    setIsEditing(false);
    setError(null);
  };

  const insertVariable = (varName: string) => {
    setEditExpression((prev) => prev + " " + varName);
    setShowVariables(false);
  };

  const isModified = formula.expression !== DEFAULT_FORMULAS[formulaId]?.expression;

  return (
    <div className={cn(`rounded-lg border-2 p-6 ${borderColor} ${bgColor}`, className)}>
      {/* Header with Edit Button */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1" />
        {!isEditing ? (
          <button
            onClick={handleStartEdit}
            className="p-1.5 rounded-md hover:bg-muted dark:hover:bg-secondary/80 text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground/90 transition-colors"
            title="Edit formula"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
              title="Save formula"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Result Display */}
      <div className="text-center">
        <p className={`text-sm font-medium ${textColor}`}>
          {formula.name}
          {isModified && (
            <span className="ml-2 text-xs text-amber-500 dark:text-amber-400">(Custom)</span>
          )}
        </p>
        <p className={`mt-2 text-4xl font-bold ${resultColor}`}>{formatCurrency(result)}</p>
      </div>

      {/* Formula Display / Editor */}
      {isEditing ? (
        <div className="mt-4 space-y-3">
          <div className="relative">
            <textarea
              value={editExpression}
              onChange={(e) => {
                setEditExpression(e.target.value);
                setError(null);
              }}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm font-mono resize-none",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                "dark:bg-secondary dark:border-border dark:text-white",
                error && "border-red-500"
              )}
              rows={2}
              placeholder="Enter formula..."
            />
            {error && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          {/* Variable Helper */}
          <div className="relative">
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Info className="h-3 w-3" />
              Insert variable
            </button>
            
            {showVariables && (
              <div className="absolute left-0 top-6 z-50 w-64 max-h-48 overflow-y-auto rounded-lg border border-border bg-white dark:border-border dark:bg-secondary shadow-lg">
                {FORMULA_VARIABLES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => insertVariable(v.name)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted dark:hover:bg-secondary/80 border-b border-border dark:border-border last:border-0"
                  >
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{v.name}</span>
                    <span className="ml-2 text-muted-foreground dark:text-muted-foreground">- {v.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Operators Helper */}
          <div className="flex flex-wrap gap-1">
            {["+", "-", "*", "/", "(", ")", "0.70", "0.65", "100"].map((op) => (
              <button
                key={op}
                onClick={() => setEditExpression((prev) => prev + " " + op)}
                className="px-2 py-1 text-xs font-mono rounded bg-muted dark:bg-secondary hover:bg-muted dark:hover:bg-secondary/80 text-foreground/90 dark:text-foreground/90"
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-muted p-3 dark:bg-secondary">
          <div className="flex items-start space-x-2 text-xs text-muted-foreground dark:text-foreground/90">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="font-mono">{formula.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}
