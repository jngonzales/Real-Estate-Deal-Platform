"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  DealWithProperty,
  UnderwritingRecord,
  saveUnderwriting,
  updateDealOfferPrice,
} from "@/lib/actions/deal-actions";
import {
  calculateMAO,
  calculate70PercentRule,
  calculateBuyBoxOffer,
  calculateProfit,
  repairCostGuides,
} from "@/lib/schemas/underwriting";
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  Home,
  MapPin,
  Hammer,
  TrendingUp,
  Save,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { CompsLookup } from "./comps-lookup";
import { CurrencyInput, NumberInput } from "@/components/ui/currency-input";
import { FormulaEditor } from "./formula-editor";
import { CustomCalculatorBuilder } from "./custom-calculator-builder";
import { SortableFormulaList } from "./sortable-formula-list";
import {
  CustomFormula,
  CustomCalculator,
  DEFAULT_FORMULAS,
  buildFormulaContext,
  evaluateFormula,
} from "@/lib/formulas/formula-engine";
import {
  getUserFormulas,
  saveUserFormulas,
  resetUserFormulas,
} from "@/lib/actions/formula-actions";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface UnderwritingClientProps {
  deal: DealWithProperty;
  existingUnderwriting: UnderwritingRecord | null;
}

export function UnderwritingClient({ deal, existingUnderwriting }: UnderwritingClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isResettingFormulas, setIsResettingFormulas] = useState(false);

  // Form state
  const [arv, setArv] = useState(existingUnderwriting?.arv || 0);
  const [arvSource, setArvSource] = useState<"comps" | "appraisal" | "estimate">("estimate");
  const [repairCosts, setRepairCosts] = useState(existingUnderwriting?.repair_estimate || 0);
  const [repairScope, setRepairScope] = useState<"cosmetic" | "moderate" | "extensive" | "gut">("moderate");
  const [holdingMonths, setHoldingMonths] = useState(6);
  const [monthlyHoldingCost, setMonthlyHoldingCost] = useState(1500);
  const [buyingClosingCosts, setBuyingClosingCosts] = useState(5000);
  const [sellingClosingCosts, setSellingClosingCosts] = useState(Math.round((existingUnderwriting?.arv || 0) * 0.08));
  const [targetProfitPercent, setTargetProfitPercent] = useState(20);
  const [buyBoxPercent, setBuyBoxPercent] = useState(70); // Hedge Fund Buy Box %
  const [notes, setNotes] = useState(existingUnderwriting?.notes || "");

  // Custom formula state
  const [maoFormula, setMaoFormula] = useState<CustomFormula>(DEFAULT_FORMULAS.mao);
  const [rule70Formula, setRule70Formula] = useState<CustomFormula>(DEFAULT_FORMULAS.rule70);
  const [buyBoxFormula, setBuyBoxFormula] = useState<CustomFormula>(DEFAULT_FORMULAS.buyBox);
  const [customCalculator, setCustomCalculator] = useState<CustomCalculator | null>(null);
  const [formulaBoxOrder, setFormulaBoxOrder] = useState<string[]>(["mao", "rule70", "buyBox", "custom"]);
  const hasFetchedFormulas = useRef(false);

  // Load user's saved formulas on mount
  useEffect(() => {
    if (hasFetchedFormulas.current) return;
    hasFetchedFormulas.current = true;

    async function loadFormulas() {
      const formulas = await getUserFormulas();
      setMaoFormula(formulas.mao);
      setRule70Formula(formulas.rule70);
      setBuyBoxFormula(formulas.buyBox);
      setCustomCalculator(formulas.customCalculator);
    }
    loadFormulas();
  }, []);

  // Build formula context for evaluation
  const formulaContext = useMemo(() => {
    return buildFormulaContext({
      arv,
      repairCosts,
      holdingMonths,
      monthlyHoldingCost,
      buyingClosingCosts,
      sellingClosingCosts,
      targetProfitPercent,
      buyBoxPercent,
      askingPrice: deal.asking_price,
    });
  }, [arv, repairCosts, holdingMonths, monthlyHoldingCost, buyingClosingCosts, sellingClosingCosts, targetProfitPercent, buyBoxPercent, deal.asking_price]);

  // Calculated values using custom formulas when available
  const mao = useMemo(() => {
    if (maoFormula.isDefault) {
      return calculateMAO({
        arv,
        repairCosts,
        holdingMonths,
        monthlyHoldingCost,
        buyingClosingCosts,
        sellingClosingCosts,
        targetProfitPercent,
      });
    }
    return evaluateFormula(maoFormula.expression, formulaContext);
  }, [arv, repairCosts, holdingMonths, monthlyHoldingCost, buyingClosingCosts, sellingClosingCosts, targetProfitPercent, maoFormula, formulaContext]);

  const rule70 = useMemo(() => {
    if (rule70Formula.isDefault) {
      return calculate70PercentRule(arv, repairCosts);
    }
    return evaluateFormula(rule70Formula.expression, formulaContext);
  }, [arv, repairCosts, rule70Formula, formulaContext]);

  // Hedge Fund Buy Box calculation
  const buyBoxOffer = useMemo(() => {
    if (buyBoxFormula.isDefault) {
      return calculateBuyBoxOffer(arv, buyBoxPercent, repairCosts);
    }
    return evaluateFormula(buyBoxFormula.expression, formulaContext);
  }, [arv, buyBoxPercent, repairCosts, buyBoxFormula, formulaContext]);

  // Custom calculator result
  const customResult = useMemo(() => {
    if (!customCalculator) return 0;
    return evaluateFormula(customCalculator.formula, formulaContext);
  }, [customCalculator, formulaContext]);

  const profit = useMemo(() => {
    return calculateProfit({
      arv,
      purchasePrice: mao,
      repairCosts,
      holdingMonths,
      monthlyHoldingCost,
      buyingClosingCosts,
      sellingClosingCosts,
    });
  }, [arv, mao, repairCosts, holdingMonths, monthlyHoldingCost, buyingClosingCosts, sellingClosingCosts]);

  // Save formula handlers
  const handleSaveFormula = async (formulaType: 'mao' | 'rule70' | 'buyBox', formula: CustomFormula) => {
    if (formulaType === 'mao') setMaoFormula(formula);
    if (formulaType === 'rule70') setRule70Formula(formula);
    if (formulaType === 'buyBox') setBuyBoxFormula(formula);

    const result = await saveUserFormulas({ [formulaType]: formula });
    if (result.success) {
      toast.success("Formula saved", { description: "Your custom formula has been saved." });
    } else {
      toast.error("Failed to save formula", { description: result.error });
    }
  };

  const handleSaveCustomCalculator = async (calc: CustomCalculator) => {
    setCustomCalculator(calc);
    const result = await saveUserFormulas({ customCalculator: calc });
    if (result.success) {
      toast.success("Calculator saved", { description: "Your custom calculator has been saved." });
    } else {
      toast.error("Failed to save calculator", { description: result.error });
    }
  };

  const handleDeleteCustomCalculator = async () => {
    setCustomCalculator(null);
    const result = await saveUserFormulas({ customCalculator: null });
    if (result.success) {
      toast.success("Calculator deleted");
    }
  };

  const handleResetFormulas = async () => {
    setIsResettingFormulas(true);
    const result = await resetUserFormulas();
    if (result.success) {
      setMaoFormula(DEFAULT_FORMULAS.mao);
      setRule70Formula(DEFAULT_FORMULAS.rule70);
      setBuyBoxFormula(DEFAULT_FORMULAS.buyBox);
      // Note: Keep custom calculator as requested
      toast.success("Formulas reset", { description: "All formulas restored to defaults." });
    } else {
      toast.error("Failed to reset formulas", { description: result.error });
    }
    setIsResettingFormulas(false);
  };

  // Estimate repairs based on scope and sqft
  const estimateRepairs = () => {
    const sqft = deal.property?.sqft || 1500;
    const guide = repairCostGuides[repairScope];
    const avgPerSqft = (guide.perSqft.low + guide.perSqft.high) / 2;
    setRepairCosts(Math.round(sqft * avgPerSqft));
  };

  const handleSave = async (status: "draft" | "submitted") => {
    setIsSaving(true);
    setSaveMessage(null);

    const result = await saveUnderwriting({
      dealId: deal.id,
      arv,
      repairEstimate: repairCosts,
      maxOffer: mao,
      recommendedOffer: rule70,
      profitEstimate: profit.profit,
      notes,
      status,
    });

    if (result.success) {
      setSaveMessage({ type: "success", text: status === "submitted" ? "Underwriting submitted!" : "Draft saved!" });
      toast.success(status === "submitted" ? "Underwriting submitted!" : "Draft saved!", {
        description: `MAO: ${formatCurrency(mao)}`,
      });
      
      // Also update the deal's offer price
      await updateDealOfferPrice(deal.id, mao);
      
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } else {
      setSaveMessage({ type: "error", text: result.error || "Failed to save" });
      toast.error("Failed to save underwriting", {
        description: result.error || "Please try again.",
      });
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/dashboard/deals/${deal.id}`}
            className="mb-2 inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Deal
          </Link>
          <h2 className="flex items-center text-2xl font-bold text-slate-900 dark:text-white">
            <Calculator className="mr-2 h-6 w-6 text-slate-400" />
            Underwriting Analysis
          </h2>
          <p className="flex items-center text-slate-600 dark:text-slate-400">
            <Home className="mr-1 h-4 w-4" />
            {deal.property?.address ?? 'N/A'}
            <span className="mx-2">•</span>
            <MapPin className="mr-1 h-4 w-4" />
            {deal.property?.city ?? ''}, {deal.property?.state ?? ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleResetFormulas}
            disabled={isSaving || isResettingFormulas}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Reset all formulas to default"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Default Formulas
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave("submitted")}
            disabled={isSaving}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`flex items-center rounded-lg p-4 ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle className="mr-2 h-5 w-5" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5" />
          )}
          {saveMessage.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Inputs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Property Quick Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Asking Price</span>
                <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(deal.asking_price)}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Type</span>
                <p className="font-semibold text-slate-900 capitalize dark:text-white">{deal.property?.property_type.replace("_", " ") ?? 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Sqft</span>
                <p className="font-semibold text-slate-900 dark:text-white">{deal.property?.sqft?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Year Built</span>
                <p className="font-semibold text-slate-900 dark:text-white">{deal.property?.year_built || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* ARV Section */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                <TrendingUp className="mr-2 h-5 w-5 text-slate-400" />
                After Repair Value (ARV)
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ARV Amount</label>
                  <CurrencyInput
                    value={arv || 0}
                    onChange={(val) => setArv(val)}
                    step={5000}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
                  <select
                    value={arvSource}
                    onChange={(e) => setArvSource(e.target.value as typeof arvSource)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="comps">Comparable Sales</option>
                    <option value="appraisal">Appraisal</option>
                    <option value="estimate">Estimate</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* PropStream Comps Lookup */}
          {deal.property && (
            <CompsLookup
              address={deal.property.address}
              city={deal.property.city}
              state={deal.property.state}
              zip={deal.property.zip}
              beds={deal.property.bedrooms ?? undefined}
              baths={deal.property.bathrooms ?? undefined}
              sqft={deal.property.sqft ?? undefined}
              onSelectARV={(selectedArv) => {
                setArv(selectedArv);
                setArvSource("comps");
                // Also update selling closing costs (8% of ARV)
                setSellingClosingCosts(Math.round(selectedArv * 0.08));
              }}
            />
          )}

          {/* Repair Costs Section */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                <Hammer className="mr-2 h-5 w-5 text-slate-400" />
                Repair Estimates
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Repair Scope</label>
                  <select
                    value={repairScope}
                    onChange={(e) => setRepairScope(e.target.value as typeof repairScope)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="cosmetic">Cosmetic ($10-25/sqft)</option>
                    <option value="moderate">Moderate ($25-50/sqft)</option>
                    <option value="extensive">Extensive ($50-100/sqft)</option>
                    <option value="gut">Gut Rehab ($100-200/sqft)</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {repairCostGuides[repairScope].description}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total Repair Cost</label>
                  <CurrencyInput
                    value={repairCosts || 0}
                    onChange={(val) => setRepairCosts(val)}
                    step={1000}
                    className="mt-1"
                  />
                  <button
                    type="button"
                    onClick={estimateRepairs}
                    className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Auto-estimate based on sqft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Holding & Closing Costs */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                <DollarSign className="mr-2 h-5 w-5 text-slate-400" />
                Holding & Closing Costs
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Holding Period (months)</label>
                  <NumberInput
                    value={holdingMonths}
                    onChange={(val) => setHoldingMonths(val)}
                    min={1}
                    max={24}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Holding Cost</label>
                  <CurrencyInput
                    value={monthlyHoldingCost}
                    onChange={(val) => setMonthlyHoldingCost(val)}
                    step={100}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Insurance, taxes, utilities, etc.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total Holding</label>
                  <p className="mt-1 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-900 dark:bg-slate-700 dark:text-white">
                    {formatCurrency(holdingMonths * monthlyHoldingCost)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Buying Closing Costs</label>
                  <CurrencyInput
                    value={buyingClosingCosts}
                    onChange={(val) => setBuyingClosingCosts(val)}
                    step={500}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Selling Closing Costs</label>
                  <CurrencyInput
                    value={sellingClosingCosts}
                    onChange={(val) => setSellingClosingCosts(val)}
                    step={500}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">~8% of ARV (commissions, title, etc.)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Profit %</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={targetProfitPercent}
                      onChange={(e) => setTargetProfitPercent(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-8 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      min={0}
                      max={100}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hedge Fund Buy Box %</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={buyBoxPercent}
                      onChange={(e) => setBuyBoxPercent(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-8 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      min={0}
                      max={100}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Typical: 65-75% of ARV</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notes</h3>
            </div>
            <div className="p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                placeholder="Add any notes about this analysis..."
              />
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6 overflow-visible">
          {/* Sortable Formula Boxes */}
          <SortableFormulaList
            items={formulaBoxOrder}
            onReorder={setFormulaBoxOrder}
          >
            {(id) => {
              switch (id) {
                case "mao":
                  return (
                    <FormulaEditor
                      formulaId="mao"
                      formula={maoFormula}
                      result={mao}
                      onSave={(f) => handleSaveFormula('mao', f)}
                      formatCurrency={formatCurrency}
                      borderColor="border-slate-900 dark:border-blue-500"
                      bgColor="bg-white dark:bg-slate-800"
                      resultColor="text-slate-900 dark:text-white"
                    />
                  );
                case "rule70":
                  return (
                    <FormulaEditor
                      formulaId="rule70"
                      formula={rule70Formula}
                      result={rule70}
                      onSave={(f) => handleSaveFormula('rule70', f)}
                      formatCurrency={formatCurrency}
                      borderColor="border-slate-200 dark:border-slate-700"
                      bgColor="bg-white dark:bg-slate-800"
                      resultColor="text-slate-900 dark:text-white"
                    />
                  );
                case "buyBox":
                  return (
                    <FormulaEditor
                      formulaId="buyBox"
                      formula={buyBoxFormula}
                      result={buyBoxOffer}
                      onSave={(f) => handleSaveFormula('buyBox', f)}
                      formatCurrency={formatCurrency}
                      borderColor="border-emerald-500"
                      bgColor="bg-emerald-50 dark:bg-emerald-900/30"
                      resultColor="text-emerald-900 dark:text-emerald-300"
                      textColor="text-emerald-700 dark:text-emerald-400"
                    />
                  );
                case "custom":
                  return (
                    <CustomCalculatorBuilder
                      calculator={customCalculator}
                      onSave={handleSaveCustomCalculator}
                      onDelete={handleDeleteCustomCalculator}
                      result={customResult}
                      formatCurrency={formatCurrency}
                    />
                  );
                default:
                  return null;
              }
            }}
          </SortableFormulaList>

          {/* Comparison to Asking */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white">vs. Asking Price</h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Asking</span>
                <span className="font-medium dark:text-white">{formatCurrency(deal.asking_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Your MAO</span>
                <span className="font-medium dark:text-white">{formatCurrency(mao)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Difference</span>
                  <span className={`font-semibold ${mao >= deal.asking_price ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(mao - deal.asking_price)}
                  </span>
                </div>
              </div>
            </div>
            {mao < deal.asking_price && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertCircle className="mb-1 inline h-4 w-4" /> Your MAO is below asking. Consider negotiating or passing.
              </div>
            )}
            {mao >= deal.asking_price && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="mb-1 inline h-4 w-4" /> Deal meets your profit criteria!
              </div>
            )}
          </div>

          {/* Profit Analysis */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white">If You Buy at MAO</h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Estimated Profit</span>
                <span className={`font-semibold ${profit.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(profit.profit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Profit Margin</span>
                <span className="font-medium dark:text-white">{profit.profitPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">ROI</span>
                <span className="font-medium dark:text-white">{profit.roi}%</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white">Cost Breakdown</h4>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Purchase (MAO)</span>
                <span className="dark:text-white">{formatCurrency(mao)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Repairs</span>
                <span className="dark:text-white">{formatCurrency(repairCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Holding Costs</span>
                <span className="dark:text-white">{formatCurrency(holdingMonths * monthlyHoldingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Closing Costs</span>
                <span className="dark:text-white">{formatCurrency(buyingClosingCosts + sellingClosingCosts)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold dark:border-slate-700">
                <span className="dark:text-white">Total Investment</span>
                <span className="dark:text-white">
                  {formatCurrency(
                    mao + repairCosts + holdingMonths * monthlyHoldingCost + buyingClosingCosts + sellingClosingCosts
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-green-600">
                <span>ARV (Sell Price)</span>
                <span>{formatCurrency(arv)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
