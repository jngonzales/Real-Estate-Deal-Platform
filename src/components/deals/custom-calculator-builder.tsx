"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Calculator, Info, X, Check, AlertCircle } from "@/components/ui/icons";
import {
  FORMULA_VARIABLES,
  validateFormula,
  CustomCalculator,
  CustomCalculatorInput,
} from "@/lib/formulas/formula-engine";
import { cn } from "@/lib/utils";

interface CustomCalculatorBuilderProps {
  calculator: CustomCalculator | null;
  onSave: (calculator: CustomCalculator) => void;
  onDelete?: () => void;
  result: number;
  formatCurrency: (amount: number) => string;
}

export function CustomCalculatorBuilder({
  calculator,
  onSave,
  onDelete,
  result,
  formatCurrency,
}: CustomCalculatorBuilderProps) {
  const [isEditing, setIsEditing] = useState(!calculator);
  const [name, setName] = useState(calculator?.name || "My Custom Calculator");
  const [formula, setFormula] = useState(calculator?.formula || "ARV * 0.65 - Repairs");
  const [description, setDescription] = useState(calculator?.description || "Custom calculation");
  const [inputs, setInputs] = useState<CustomCalculatorInput[]>(
    calculator?.inputs || []
  );
  const [error, setError] = useState<string | null>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAddInput = (variableId: string) => {
    const variable = FORMULA_VARIABLES.find((v) => v.id === variableId);
    if (!variable) return;

    // Don't add duplicates
    if (inputs.some((i) => i.variableId === variableId)) {
      setShowAddInput(false);
      return;
    }

    setInputs([
      ...inputs,
      {
        variableId,
        label: variable.label,
        defaultValue: variable.defaultValue,
      },
    ]);
    setShowAddInput(false);
  };

  const handleRemoveInput = (variableId: string) => {
    setInputs(inputs.filter((i) => i.variableId !== variableId));
  };

  const handleSave = () => {
    const validation = validateFormula(formula);
    if (!validation.valid) {
      setError(validation.error || "Invalid formula");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    onSave({
      id: calculator?.id || `custom-${Date.now()}`,
      name: name.trim(),
      formula,
      inputs,
      description: description.trim() || formula,
    });
    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    if (calculator) {
      setName(calculator.name);
      setFormula(calculator.formula);
      setDescription(calculator.description);
      setInputs(calculator.inputs);
    }
    setIsEditing(false);
    setError(null);
  };

  const insertVariable = (varName: string) => {
    setFormula((prev) => prev + " " + varName);
    setShowVariables(false);
  };

  // If no calculator exists and not editing, show placeholder
  if (!calculator && !isEditing) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border dark:border-border p-6 text-center">
        <Calculator className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
          Create your own custom calculator
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Calculator
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Calculator className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-0 px-2 py-1 text-sm font-semibold rounded border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-secondary text-emerald-900 dark:text-emerald-100"
              placeholder="Calculator name..."
            />
          ) : (
            <span className="min-w-0 text-sm font-semibold text-emerald-900 dark:text-emerald-100 [overflow-wrap:anywhere]">
              {name}
            </span>
          )}
        </div>
        
        <div className="flex shrink-0 items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                title="Save"
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
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                title="Edit"
              >
                <Calculator className="h-4 w-4" />
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Result */}
      {!isEditing && (
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(result)}
          </p>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4">
          {/* Formula */}
          <div>
            <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              Formula
            </label>
            <textarea
              value={formula}
              onChange={(e) => {
                setFormula(e.target.value);
                setError(null);
              }}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm font-mono resize-none",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                "bg-white dark:bg-secondary dark:border-border dark:text-white",
                error && "border-red-500"
              )}
              rows={2}
              placeholder="e.g., ARV * 0.65 - Repairs"
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
              <div className="absolute left-0 top-6 z-50 w-64 max-w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-white dark:border-border dark:bg-secondary shadow-lg">
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

          {/* Operators */}
          <div className="flex flex-wrap gap-1">
            {["+", "-", "*", "/", "(", ")", "0.70", "0.65", "100"].map((op) => (
              <button
                key={op}
                onClick={() => setFormula((prev) => prev + " " + op)}
                className="px-2 py-1 text-xs font-mono rounded bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300"
              >
                {op}
              </button>
            ))}
          </div>

          {/* Custom Inputs (optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Custom Inputs (optional)
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowAddInput(!showAddInput)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add input
                </button>
                
                {showAddInput && (
                  <div className="absolute right-0 top-6 z-50 w-48 max-h-48 overflow-y-auto rounded-lg border border-border bg-white dark:border-border dark:bg-secondary shadow-lg">
                    {FORMULA_VARIABLES.filter((v) => !inputs.some((i) => i.variableId === v.id)).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleAddInput(v.id)}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-muted dark:hover:bg-secondary/80 border-b border-border dark:border-border last:border-0"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {inputs.length > 0 && (
              <div className="space-y-1">
                {inputs.map((input) => (
                  <div
                    key={input.variableId}
                    className="flex items-center gap-2 p-2 rounded bg-white dark:bg-secondary text-xs"
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="flex-1">{input.label}</span>
                    <button
                      onClick={() => handleRemoveInput(input.variableId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-secondary dark:border-border dark:text-white"
              placeholder="Describe your formula..."
            />
          </div>
        </div>
      )}

      {/* Display formula when not editing */}
      {!isEditing && (
        <div className="mt-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-3">
          <div className="flex items-start space-x-2 text-xs text-emerald-700 dark:text-emerald-300">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="font-mono">{description || formula}</span>
          </div>
        </div>
      )}
    </div>
  );
}
