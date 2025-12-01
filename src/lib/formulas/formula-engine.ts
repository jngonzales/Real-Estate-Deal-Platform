// Formula Engine for Custom Underwriting Calculations

export interface FormulaVariable {
  id: string;
  name: string;
  label: string;
  description: string;
  defaultValue: number;
}

// Available variables for formulas
export const FORMULA_VARIABLES: FormulaVariable[] = [
  { id: "arv", name: "ARV", label: "After Repair Value", description: "Expected value after repairs", defaultValue: 0 },
  { id: "repairCosts", name: "Repairs", label: "Repair Costs", description: "Total estimated repair costs", defaultValue: 0 },
  { id: "holdingMonths", name: "Months", label: "Holding Months", description: "Number of months holding property", defaultValue: 6 },
  { id: "monthlyHoldingCost", name: "Monthly", label: "Monthly Holding Cost", description: "Monthly expenses while holding", defaultValue: 1500 },
  { id: "totalHoldingCosts", name: "Holding", label: "Total Holding Costs", description: "Months × Monthly cost", defaultValue: 9000 },
  { id: "buyingClosingCosts", name: "BuyClose", label: "Buying Closing Costs", description: "Costs when purchasing", defaultValue: 5000 },
  { id: "sellingClosingCosts", name: "SellClose", label: "Selling Closing Costs", description: "Costs when selling (~8% of ARV)", defaultValue: 0 },
  { id: "totalClosingCosts", name: "TotalClose", label: "Total Closing Costs", description: "Buy + Sell closing costs", defaultValue: 0 },
  { id: "targetProfitPercent", name: "ProfitPct", label: "Target Profit %", description: "Desired profit percentage", defaultValue: 20 },
  { id: "buyBoxPercent", name: "BuyBoxPct", label: "Buy Box %", description: "Hedge fund buy box percentage", defaultValue: 70 },
  { id: "askingPrice", name: "Asking", label: "Asking Price", description: "Seller's asking price", defaultValue: 0 },
];

export interface CustomFormula {
  id: string;
  name: string;
  expression: string;
  description: string;
  isDefault: boolean;
}

// Default formulas
export const DEFAULT_FORMULAS: Record<string, CustomFormula> = {
  mao: {
    id: "mao",
    name: "Maximum Allowable Offer",
    expression: "ARV * (1 - ProfitPct / 100) - Repairs - Holding - TotalClose",
    description: "MAO = ARV × (1 - profit%) - repairs - holding - closing",
    isDefault: true,
  },
  rule70: {
    id: "rule70",
    name: "70% Rule Offer",
    expression: "ARV * 0.70 - Repairs",
    description: "ARV × 70% - repairs",
    isDefault: true,
  },
  buyBox: {
    id: "buyBox",
    name: "Hedge Fund Buy Box Offer",
    expression: "(ARV * BuyBoxPct / 100) - Repairs",
    description: "(ARV × Buy Box %) - Rehab",
    isDefault: true,
  },
};

export interface FormulaContext {
  arv: number;
  repairCosts: number;
  holdingMonths: number;
  monthlyHoldingCost: number;
  buyingClosingCosts: number;
  sellingClosingCosts: number;
  targetProfitPercent: number;
  buyBoxPercent: number;
  askingPrice: number;
}

// Build context with computed values
export function buildFormulaContext(data: FormulaContext): Record<string, number> {
  const totalHoldingCosts = data.holdingMonths * data.monthlyHoldingCost;
  const totalClosingCosts = data.buyingClosingCosts + data.sellingClosingCosts;

  return {
    // Raw values
    ARV: data.arv,
    Repairs: data.repairCosts,
    Months: data.holdingMonths,
    Monthly: data.monthlyHoldingCost,
    BuyClose: data.buyingClosingCosts,
    SellClose: data.sellingClosingCosts,
    ProfitPct: data.targetProfitPercent,
    BuyBoxPct: data.buyBoxPercent,
    Asking: data.askingPrice,
    // Computed values
    Holding: totalHoldingCosts,
    TotalClose: totalClosingCosts,
  };
}

// Safe math expression evaluator (no eval!)
export function evaluateFormula(expression: string, context: Record<string, number>): number {
  try {
    // Handle empty or whitespace-only expressions
    if (!expression || !expression.trim()) {
      return 0;
    }

    // Replace variable names with their values
    let expr = expression;
    
    // Sort keys by length (longest first) to avoid partial replacements
    const sortedKeys = Object.keys(context).sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expr = expr.replace(regex, String(context[key]));
    }

    // Remove any remaining letters (unrecognized variables)
    expr = expr.replace(/[a-zA-Z_]+/g, '0');

    // Validate expression only contains numbers and math operators
    const sanitized = expr.replace(/\s/g, '');
    if (!sanitized || !/^[\d.+\-*/()]+$/.test(sanitized)) {
      return 0;
    }

    // Check for empty parentheses or invalid patterns
    if (/\(\s*\)/.test(sanitized) || /[+\-*/]{2,}/.test(sanitized)) {
      return 0;
    }

    // Use Function constructor for safe evaluation (still controlled)
    const result = Function(`"use strict"; return (${expr})`)();
    
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return 0;
    }
    
    return Math.max(0, Math.round(result));
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return 0;
  }
}

// Validate formula syntax
export function validateFormula(expression: string): { valid: boolean; error?: string } {
  try {
    // Check for valid variable names and operators
    const validPattern = /^[\w\s.+\-*/()%]+$/;
    if (!validPattern.test(expression)) {
      return { valid: false, error: "Invalid characters in formula" };
    }

    // Check parentheses are balanced
    let depth = 0;
    for (const char of expression) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth < 0) return { valid: false, error: "Unbalanced parentheses" };
    }
    if (depth !== 0) return { valid: false, error: "Unbalanced parentheses" };

    // Try to evaluate with dummy values
    const dummyContext: Record<string, number> = {};
    for (const v of FORMULA_VARIABLES) {
      dummyContext[v.name] = 100;
    }
    
    evaluateFormula(expression, dummyContext);
    
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid formula syntax" };
  }
}

// User's saved formulas type
export interface UserFormulas {
  mao?: CustomFormula;
  rule70?: CustomFormula;
  buyBox?: CustomFormula;
  custom?: CustomFormula[];
}

// Custom calculator input type
export interface CustomCalculatorInput {
  variableId: string;
  label: string;
  defaultValue: number;
}

export interface CustomCalculator {
  id: string;
  name: string;
  formula: string;
  inputs: CustomCalculatorInput[];
  description: string;
}
