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
  Save,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from "@/components/ui/icons";
import { CompsLookup } from "./comps-lookup";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DealWorkspaceHeading, formatDealCurrency as formatCurrency } from "./deal-workspace-heading";
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
  const [buyBoxPercent, setBuyBoxPercent] = useState(70); // Hedge fund buy box (%)
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
    if (isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
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

      if (!result.success) {
        setSaveMessage({ type: "error", text: result.error || "Could not save underwriting. Try again." });
        return;
      }

      const savedText = status === "submitted" ? "Underwriting submitted." : "Draft saved.";
      try {
        const offerResult = await updateDealOfferPrice(deal.id, mao);
        setSaveMessage(offerResult.error
          ? { type: "error", text: savedText + " The deal’s offer price could not be updated." }
          : { type: "success", text: savedText });
      } catch {
        setSaveMessage({ type: "error", text: savedText + " The deal’s offer price could not be updated." });
      }
      router.refresh();
    } catch {
      setSaveMessage({ type: "error", text: "Could not save underwriting. Your entries are still here." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <DealWorkspaceHeading
        address={deal.property?.address}
        location={[deal.property?.city, deal.property?.state].filter(Boolean).join(", ")}
        section="Underwriting"
        status={deal.status}
        backHref={"/dashboard/deals/" + deal.id}
        backLabel="Back to deal"
        actions={
          <>
            <Button variant="outline" className="min-h-11" onClick={() => handleSave("draft")} aria-disabled={isSaving}>
              <Save aria-hidden="true" />
              Save draft
            </Button>
            <Button className="min-h-11 whitespace-normal" onClick={() => handleSave("submitted")} aria-disabled={isSaving}>
              <CheckCircle aria-hidden="true" />
              Submit underwriting
            </Button>
          </>
        }
      />

      <div role="status" className="text-sm text-muted-foreground">
        {isSaving ? "Saving underwriting…" : saveMessage?.type === "success" ? saveMessage.text : null}
      </div>
      <div role="alert">
        {saveMessage?.type === "error" && <p className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{saveMessage.text}</p>}
      </div>

      <dl className="grid gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Asking price</dt>
          <dd className="text-xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatCurrency(deal.asking_price)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Offer price</dt>
          <dd className="font-semibold tabular-nums [overflow-wrap:anywhere]">{formatCurrency(deal.offer_price)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Saved maximum offer</dt>
          <dd className="font-semibold tabular-nums [overflow-wrap:anywhere]">{formatCurrency(existingUnderwriting?.max_offer)}</dd>
        </div>
      </dl>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-6 [&_input]:min-h-11 [&_input]:tabular-nums" aria-labelledby="underwriting-assumptions">
          <div>
            <h2 id="underwriting-assumptions" className="text-xl font-semibold">Assumptions</h2>
            {existingUnderwriting && (
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">After-repair value, repairs, and notes come from the saved underwriting. The source, scope, holding costs, closing costs, and targets start with worksheet defaults.</p>
            )}
          </div>

          {/* ARV Section */}
          <div className="min-w-0 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h3 className="flex items-center font-semibold text-foreground ">
                After-repair value
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="underwriting-arv" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">After-repair value (USD)</label>
                  <CurrencyInput id="underwriting-arv"
                    value={arv || 0}
                    onChange={(val) => setArv(val)}
                    step={5000}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="arv-source" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Source</label>
                  <select id="arv-source"
                    value={arvSource}
                    onChange={(e) => setArvSource(e.target.value as typeof arvSource)}
                    className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <option value="comps">Comparable sales</option>
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
          <div className="min-w-0 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h3 className="flex items-center font-semibold text-foreground ">
                Repair estimates
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="repair-scope" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Repair scope</label>
                  <select id="repair-scope"
                    value={repairScope}
                    onChange={(e) => setRepairScope(e.target.value as typeof repairScope)}
                    className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <option value="cosmetic">Cosmetic ($10-25/sq ft)</option>
                    <option value="moderate">Moderate ($25-50/sq ft)</option>
                    <option value="extensive">Extensive ($50-100/sq ft)</option>
                    <option value="gut">Gut Rehab ($100-200/sq ft)</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {repairCostGuides[repairScope].description}
                  </p>
                </div>
                <div>
                  <label htmlFor="underwriting-repairs" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Repair cost (USD)</label>
                  <CurrencyInput id="underwriting-repairs"
                    value={repairCosts || 0}
                    onChange={(val) => setRepairCosts(val)}
                    step={1000}
                    className="mt-1"
                  />
                  <button
                    type="button"
                    onClick={estimateRepairs}
                    className="mt-2 min-h-11 text-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    Estimate from floor area
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Holding costs, closing costs and targets */}
          <div className="min-w-0 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h3 className="flex items-center font-semibold text-foreground ">
                Holding costs, closing costs and targets
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="holding-months" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Holding period (months)</label>
                  <Input
                    id="holding-months"
                    type="number"
                    value={holdingMonths}
                    onChange={(event) => setHoldingMonths(Number(event.target.value))}
                    onBlur={() => setHoldingMonths(Math.max(1, Math.min(24, holdingMonths)))}
                    min={1}
                    max={24}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="holding-cost" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Monthly holding cost (USD)</label>
                  <CurrencyInput id="holding-cost"
                    value={monthlyHoldingCost}
                    onChange={(val) => setMonthlyHoldingCost(val)}
                    step={100}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Insurance, taxes, utilities, etc.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Total Holding</label>
                  <p className="mt-1 font-semibold tabular-nums">
                    {formatCurrency(holdingMonths * monthlyHoldingCost)}
                  </p>
                </div>
                <div>
                  <label htmlFor="buying-cost" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Buying closing costs (USD)</label>
                  <CurrencyInput id="buying-cost"
                    value={buyingClosingCosts}
                    onChange={(val) => setBuyingClosingCosts(val)}
                    step={500}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="selling-cost" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Selling closing costs (USD)</label>
                  <CurrencyInput id="selling-cost"
                    value={sellingClosingCosts}
                    onChange={(val) => setSellingClosingCosts(val)}
                    step={500}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">~8% of ARV (commissions, title, etc.)</p>
                </div>
                <div>
                  <label htmlFor="target-profit" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Target profit (%)</label>
                  <div className="relative mt-1">
                    <input id="target-profit"
                      type="number"
                      value={targetProfitPercent}
                      onChange={(e) => setTargetProfitPercent(Number(e.target.value))}
                      className="min-h-11 w-full rounded-md border border-input bg-background px-3 pr-8 text-base focus-visible:outline-2 focus-visible:outline-ring"
                      min={0}
                      max={100}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="buy-box" className="block text-sm font-medium text-foreground/90 dark:text-foreground/90">Hedge fund buy box (%)</label>
                  <div className="relative mt-1">
                    <input id="buy-box"
                      type="number"
                      value={buyBoxPercent}
                      onChange={(e) => setBuyBoxPercent(Number(e.target.value))}
                      className="min-h-11 w-full rounded-md border border-input bg-background px-3 pr-8 text-base focus-visible:outline-2 focus-visible:outline-ring"
                      min={0}
                      max={100}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Typical: 65-75% of ARV</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="min-w-0 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h3 id="underwriting-notes-label" className="font-semibold">Notes</h3>
            </div>
            <div className="p-4 sm:p-6">
              <Textarea
                id="underwriting-notes"
                aria-labelledby="underwriting-notes-label"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="text-base"
                placeholder="Add notes about the analysis"
              />
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-6" aria-labelledby="underwriting-returns">
          <div>
            <h2 id="underwriting-returns" className="text-xl font-semibold">Returns</h2>
            <p className="mt-1 text-sm text-muted-foreground">Results update as you edit the assumptions.</p>
            <Button variant="link" className="min-h-11 px-0" asChild>
              <Link href={"/dashboard/deals/" + deal.id + "#deal-actions"}>View offer actions</Link>
            </Button>
          </div>
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
                      borderColor="border-border"
                      bgColor="bg-card"
                      resultColor="text-foreground"
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
                      borderColor="border-border"
                      bgColor="bg-card"
                      resultColor="text-foreground"
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
                      borderColor="border-border"
                      bgColor="bg-card"
                      resultColor="text-foreground"
                      textColor="text-muted-foreground"
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

          <Button variant="outline" className="min-h-11" onClick={handleResetFormulas} disabled={isSaving || isResettingFormulas}>
            <RotateCcw aria-hidden="true" />
            Reset formulas to defaults
          </Button>

          {/* Comparison to Asking */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h3 className="font-semibold text-foreground ">Asking price comparison</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-3 text-sm tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Asking</span>
                <span className="font-medium ">{formatCurrency(deal.asking_price)}</span>
              </div>
              <div className="flex justify-between gap-3 text-sm tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Calculated maximum offer</span>
                <span className="font-medium ">{formatCurrency(mao)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between gap-3 text-sm tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Difference</span>
                  <span className={`font-semibold ${mao >= deal.asking_price ? "text-primary" : "text-destructive"}`}>
                    {formatCurrency(deal.asking_price == null ? null : mao - deal.asking_price)}
                  </span>
                </div>
              </div>
            </div>
            {deal.asking_price != null && mao < deal.asking_price && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertCircle className="mb-1 inline h-4 w-4" /> Calculated maximum offer is below asking. Consider negotiating or passing.
              </div>
            )}
            {deal.asking_price != null && mao >= deal.asking_price && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="mb-1 inline h-4 w-4" /> The calculated maximum offer covers the asking price.
              </div>
            )}
          </div>

          {/* Profit Analysis */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h3 className="font-semibold text-foreground ">Buying at the maximum offer</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-3 text-sm tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Estimated profit</span>
                <span className={`font-semibold ${profit.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatCurrency(profit.profit)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-sm tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Profit margin</span>
                <span className="font-medium ">{profit.profitPercent}%</span>
              </div>
              <div className="flex justify-between gap-3 text-sm tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">ROI</span>
                <span className="font-medium ">{profit.roi}%</span>
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h3 className="font-semibold text-foreground ">Cost breakdown</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Purchase at maximum offer</span>
                <span className="">{formatCurrency(mao)}</span>
              </div>
              <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Repairs</span>
                <span className="">{formatCurrency(repairCosts)}</span>
              </div>
              <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Holding costs</span>
                <span className="">{formatCurrency(holdingMonths * monthlyHoldingCost)}</span>
              </div>
              <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span className="text-muted-foreground">Closing costs</span>
                <span className="">{formatCurrency(buyingClosingCosts + sellingClosingCosts)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span className="">Total investment</span>
                <span className="">
                  {formatCurrency(
                    mao + repairCosts + holdingMonths * monthlyHoldingCost + buyingClosingCosts + sellingClosingCosts
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-3 font-semibold tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                <span>After-repair value</span>
                <span>{formatCurrency(arv)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
