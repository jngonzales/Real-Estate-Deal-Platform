"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator,
  Plus,
  Trash2,
  Play,
  Save,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
} from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Common real estate variables
const AVAILABLE_VARIABLES = [
  { name: "ARV", label: "After Repair Value", description: "Expected value after repairs", default: 350000 },
  { name: "PURCHASE_PRICE", label: "Purchase Price", description: "Acquisition cost", default: 200000 },
  { name: "REPAIR_COST", label: "Repair Cost", description: "Total renovation budget", default: 50000 },
  { name: "HOLDING_COST", label: "Holding Cost", description: "Monthly holding costs", default: 2000 },
  { name: "HOLDING_MONTHS", label: "Holding Months", description: "Expected time to close", default: 4 },
  { name: "CLOSING_COSTS", label: "Closing Costs", description: "Transaction fees", default: 15000 },
  { name: "COMMISSION", label: "Agent Commission %", description: "Realtor fees", default: 6 },
  { name: "DESIRED_PROFIT", label: "Desired Profit", description: "Target profit amount", default: 40000 },
  { name: "SQFT", label: "Square Footage", description: "Property size", default: 1800 },
  { name: "PRICE_PER_SQFT", label: "Price per Sqft", description: "Market price/sqft", default: 195 },
  { name: "RENTAL_INCOME", label: "Monthly Rent", description: "Expected rental income", default: 2200 },
  { name: "DOWN_PAYMENT", label: "Down Payment %", description: "Loan down payment", default: 20 },
  { name: "INTEREST_RATE", label: "Interest Rate %", description: "Loan interest rate", default: 7 },
];

// Pre-built formulas
const TEMPLATE_FORMULAS = [
  {
    name: "70% Rule MAO",
    formula: "(ARV * 0.70) - REPAIR_COST",
    description: "Classic wholesaler maximum allowable offer",
  },
  {
    name: "Conservative MAO",
    formula: "(ARV * 0.65) - REPAIR_COST - (ARV * COMMISSION / 100) - CLOSING_COSTS",
    description: "More conservative with all costs included",
  },
  {
    name: "Flip Profit",
    formula: "ARV - PURCHASE_PRICE - REPAIR_COST - (HOLDING_COST * HOLDING_MONTHS) - (ARV * COMMISSION / 100) - CLOSING_COSTS",
    description: "Expected profit from a flip deal",
  },
  {
    name: "ROI Percentage",
    formula: "((ARV - PURCHASE_PRICE - REPAIR_COST - (HOLDING_COST * HOLDING_MONTHS) - CLOSING_COSTS) / (PURCHASE_PRICE + REPAIR_COST)) * 100",
    description: "Return on investment as a percentage",
  },
  {
    name: "Cash on Cash Return",
    formula: "((RENTAL_INCOME * 12) - (HOLDING_COST * 12)) / (PURCHASE_PRICE * DOWN_PAYMENT / 100) * 100",
    description: "Annual return on cash invested",
  },
  {
    name: "ARV from Comps",
    formula: "SQFT * PRICE_PER_SQFT",
    description: "Calculate ARV based on square footage",
  },
  {
    name: "Break-Even Analysis",
    formula: "PURCHASE_PRICE + REPAIR_COST + (HOLDING_COST * HOLDING_MONTHS) + CLOSING_COSTS + (PURCHASE_PRICE * COMMISSION / 100)",
    description: "Minimum sale price to break even",
  },
];

interface FormulaVariable {
  name: string;
  value: number;
}

interface FormulaBuilderProps {
  onSave?: (formula: { name: string; formula: string; variables: FormulaVariable[] }) => void;
}

export function FormulaBuilder({ onSave }: FormulaBuilderProps) {
  const [formulaName, setFormulaName] = useState("My Custom Formula");
  const [formula, setFormula] = useState("(ARV * 0.70) - REPAIR_COST");
  const [variables, setVariables] = useState<FormulaVariable[]>([
    { name: "ARV", value: 350000 },
    { name: "REPAIR_COST", value: 50000 },
  ]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);

  const addVariable = (varName: string) => {
    if (variables.find((v) => v.name === varName)) {
      toast.error("Variable already added");
      return;
    }
    const varInfo = AVAILABLE_VARIABLES.find((v) => v.name === varName);
    if (varInfo) {
      setVariables([...variables, { name: varName, value: varInfo.default }]);
    }
  };

  const removeVariable = (varName: string) => {
    setVariables(variables.filter((v) => v.name !== varName));
  };

  const updateVariableValue = (varName: string, value: number) => {
    setVariables(variables.map((v) => (v.name === varName ? { ...v, value } : v)));
  };

  const evaluateFormula = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Build variables object
      const varObj: Record<string, number> = {};
      variables.forEach((v) => {
        varObj[v.name] = v.value;
      });

      // Try local evaluation first (faster)
      try {
        let evalFormula = formula;
        Object.entries(varObj).forEach(([key, val]) => {
          evalFormula = evalFormula.replace(new RegExp(key, "g"), val.toString());
        });
        
        // Safe eval using Function constructor
        const safeEval = new Function(`return ${evalFormula}`);
        const localResult = safeEval();
        
        if (typeof localResult === "number" && !isNaN(localResult)) {
          setResult(localResult);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to AI evaluation
      }

      // Fallback to AI evaluation
      const response = await fetch("/api/deals/formula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula, variables: varObj }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate formula");
      }

      const data = await response.json();
      if (data.result?.result !== undefined) {
        setResult(data.result.result);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: typeof TEMPLATE_FORMULAS[0]) => {
    setFormula(template.formula);
    setFormulaName(template.name);
    
    // Extract variables from formula and add them
    const usedVars = AVAILABLE_VARIABLES.filter((v) => template.formula.includes(v.name));
    setVariables(usedVars.map((v) => ({ name: v.name, value: v.default })));
    setShowTemplates(false);
    setResult(null);
    toast.success(`Loaded "${template.name}" template`);
  };

  const copyFormula = () => {
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Formula copied!");
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ name: formulaName, formula, variables });
      toast.success("Formula saved!");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Custom Formula Engine
          </h2>
          <p className="text-muted-foreground">
            Build your own deal evaluation formulas
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
          {showTemplates ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
          Templates
        </Button>
      </div>

      {/* Templates */}
      {showTemplates && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Formula Templates</CardTitle>
              <CardDescription>Start with a pre-built formula</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TEMPLATE_FORMULAS.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => loadTemplate(template)}
                    className="p-3 text-left rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formula Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Formula Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Formula Name</Label>
              <Input
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                placeholder="My Custom Formula"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Formula Expression</Label>
                <Button variant="ghost" size="sm" onClick={copyFormula}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="(ARV * 0.70) - REPAIR_COST"
                className="font-mono text-sm"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Use variable names in CAPS. Supports: +, -, *, /, (, ), %
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={evaluateFormula} disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Calculate
              </Button>
              {onSave && (
                <Button variant="outline" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </div>

            {/* Result */}
            {result !== null && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/30"
              >
                <p className="text-sm text-muted-foreground mb-1">Result</p>
                <p className="text-3xl font-bold text-primary">
                  {result >= 0 && result < 1000
                    ? `${result.toFixed(2)}%`
                    : formatCurrency(result)}
                </p>
              </motion.div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Variables</CardTitle>
              <Select onValueChange={addVariable}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add Variable" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_VARIABLES.filter(
                    (v) => !variables.find((vv) => vv.name === v.name)
                  ).map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {variables.map((variable) => {
                const varInfo = AVAILABLE_VARIABLES.find((v) => v.name === variable.name);
                return (
                  <div key={variable.name} className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">{varInfo?.label || variable.name}</Label>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {variable.name}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{varInfo?.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        type="number"
                        value={variable.value}
                        onChange={(e) =>
                          updateVariableValue(variable.name, parseFloat(e.target.value) || 0)
                        }
                        className="font-mono"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariable(variable.name)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}

              {variables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p>Add variables to use in your formula</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <Badge
                key={v.name}
                variant="outline"
                className={cn(
                  "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                  variables.find((vv) => vv.name === v.name) && "bg-primary/20"
                )}
                onClick={() => {
                  setFormula((f) => f + " " + v.name);
                  if (!variables.find((vv) => vv.name === v.name)) {
                    addVariable(v.name);
                  }
                }}
              >
                <span className="font-mono">{v.name}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
