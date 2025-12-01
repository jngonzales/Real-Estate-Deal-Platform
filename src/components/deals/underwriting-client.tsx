"use client";

import { useState, useMemo } from "react";
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
  Info,
} from "lucide-react";
import { CompsLookup } from "./comps-lookup";
import { CurrencyInput, NumberInput } from "@/components/ui/currency-input";

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

  // Calculated values using useMemo
  const mao = useMemo(() => {
    return calculateMAO({
      arv,
      repairCosts,
      holdingMonths,
      monthlyHoldingCost,
      buyingClosingCosts,
      sellingClosingCosts,
      targetProfitPercent,
    });
  }, [arv, repairCosts, holdingMonths, monthlyHoldingCost, buyingClosingCosts, sellingClosingCosts, targetProfitPercent]);

  const rule70 = useMemo(() => {
    return calculate70PercentRule(arv, repairCosts);
  }, [arv, repairCosts]);

  // Hedge Fund Buy Box calculation: (ARV * BuyBox%) - Rehab
  const buyBoxOffer = useMemo(() => {
    return calculateBuyBoxOffer(arv, buyBoxPercent, repairCosts);
  }, [arv, buyBoxPercent, repairCosts]);

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
            className="mb-2 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Deal
          </Link>
          <h2 className="flex items-center text-2xl font-bold text-slate-900">
            <Calculator className="mr-2 h-6 w-6 text-slate-400" />
            Underwriting Analysis
          </h2>
          <p className="flex items-center text-slate-600">
            <Home className="mr-1 h-4 w-4" />
            {deal.property?.address ?? 'N/A'}
            <span className="mx-2">•</span>
            <MapPin className="mr-1 h-4 w-4" />
            {deal.property?.city ?? ''}, {deal.property?.state ?? ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave("submitted")}
            disabled={isSaving}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <span className="text-slate-500">Asking Price</span>
                <p className="font-semibold text-slate-900">{formatCurrency(deal.asking_price)}</p>
              </div>
              <div>
                <span className="text-slate-500">Type</span>
                <p className="font-semibold text-slate-900 capitalize">{deal.property?.property_type.replace("_", " ") ?? 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500">Sqft</span>
                <p className="font-semibold text-slate-900">{deal.property?.sqft?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-500">Year Built</span>
                <p className="font-semibold text-slate-900">{deal.property?.year_built || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* ARV Section */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="flex items-center font-semibold text-slate-900">
                <TrendingUp className="mr-2 h-5 w-5 text-slate-400" />
                After Repair Value (ARV)
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">ARV Amount</label>
                  <CurrencyInput
                    value={arv || 0}
                    onChange={(val) => setArv(val)}
                    step={5000}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Source</label>
                  <select
                    value={arvSource}
                    onChange={(e) => setArvSource(e.target.value as typeof arvSource)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="flex items-center font-semibold text-slate-900">
                <Hammer className="mr-2 h-5 w-5 text-slate-400" />
                Repair Estimates
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Repair Scope</label>
                  <select
                    value={repairScope}
                    onChange={(e) => setRepairScope(e.target.value as typeof repairScope)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="cosmetic">Cosmetic ($10-25/sqft)</option>
                    <option value="moderate">Moderate ($25-50/sqft)</option>
                    <option value="extensive">Extensive ($50-100/sqft)</option>
                    <option value="gut">Gut Rehab ($100-200/sqft)</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    {repairCostGuides[repairScope].description}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Total Repair Cost</label>
                  <CurrencyInput
                    value={repairCosts || 0}
                    onChange={(val) => setRepairCosts(val)}
                    step={1000}
                    className="mt-1"
                  />
                  <button
                    type="button"
                    onClick={estimateRepairs}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Auto-estimate based on sqft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Holding & Closing Costs */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="flex items-center font-semibold text-slate-900">
                <DollarSign className="mr-2 h-5 w-5 text-slate-400" />
                Holding & Closing Costs
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Holding Period (months)</label>
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
                  <label className="block text-sm font-medium text-slate-700">Monthly Holding Cost</label>
                  <CurrencyInput
                    value={monthlyHoldingCost}
                    onChange={(val) => setMonthlyHoldingCost(val)}
                    step={100}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-slate-500">Insurance, taxes, utilities, etc.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Total Holding</label>
                  <p className="mt-1 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-900">
                    {formatCurrency(holdingMonths * monthlyHoldingCost)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Buying Closing Costs</label>
                  <CurrencyInput
                    value={buyingClosingCosts}
                    onChange={(val) => setBuyingClosingCosts(val)}
                    step={500}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Selling Closing Costs</label>
                  <CurrencyInput
                    value={sellingClosingCosts}
                    onChange={(val) => setSellingClosingCosts(val)}
                    step={500}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-slate-500">~8% of ARV (commissions, title, etc.)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Target Profit %</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={targetProfitPercent}
                      onChange={(e) => setTargetProfitPercent(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-8 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                      min={0}
                      max={100}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Hedge Fund Buy Box %</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={buyBoxPercent}
                      onChange={(e) => setBuyBoxPercent(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-8 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                      min={0}
                      max={100}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Typical: 65-75% of ARV</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="font-semibold text-slate-900">Notes</h3>
            </div>
            <div className="p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Add any notes about this analysis..."
              />
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* MAO Result */}
          <div className="rounded-lg border-2 border-slate-900 bg-white p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">Maximum Allowable Offer</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">{formatCurrency(mao)}</p>
              <p className="mt-1 text-sm text-slate-500">
                Based on {targetProfitPercent}% profit target
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <div className="flex items-start space-x-2 text-xs text-slate-600">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <span>MAO = ARV × (1 - profit%) - repairs - holding - closing</span>
              </div>
            </div>
          </div>

          {/* 70% Rule */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">70% Rule Offer</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(rule70)}</p>
              <p className="mt-1 text-sm text-slate-500">ARV × 70% - repairs</p>
            </div>
          </div>

          {/* Hedge Fund Buy Box */}
          <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-700">Hedge Fund Buy Box Offer</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">{formatCurrency(buyBoxOffer)}</p>
              <p className="mt-1 text-sm text-emerald-600">(ARV × {buyBoxPercent}%) - Rehab</p>
            </div>
            <div className="mt-4 rounded-lg bg-emerald-100 p-3">
              <div className="flex items-start space-x-2 text-xs text-emerald-700">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <span>Formula: ({formatCurrency(arv)} × {buyBoxPercent}%) - {formatCurrency(repairCosts)}</span>
              </div>
            </div>
          </div>

          {/* Comparison to Asking */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h4 className="font-semibold text-slate-900">vs. Asking Price</h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Asking</span>
                <span className="font-medium">{formatCurrency(deal.asking_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Your MAO</span>
                <span className="font-medium">{formatCurrency(mao)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Difference</span>
                  <span className={`font-semibold ${mao >= deal.asking_price ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(mao - deal.asking_price)}
                  </span>
                </div>
              </div>
            </div>
            {mao < deal.asking_price && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                <AlertCircle className="mb-1 inline h-4 w-4" /> Your MAO is below asking. Consider negotiating or passing.
              </div>
            )}
            {mao >= deal.asking_price && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle className="mb-1 inline h-4 w-4" /> Deal meets your profit criteria!
              </div>
            )}
          </div>

          {/* Profit Analysis */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h4 className="font-semibold text-slate-900">If You Buy at MAO</h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estimated Profit</span>
                <span className={`font-semibold ${profit.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(profit.profit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Profit Margin</span>
                <span className="font-medium">{profit.profitPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">ROI</span>
                <span className="font-medium">{profit.roi}%</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h4 className="font-semibold text-slate-900">Cost Breakdown</h4>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Purchase (MAO)</span>
                <span>{formatCurrency(mao)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Repairs</span>
                <span>{formatCurrency(repairCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Holding Costs</span>
                <span>{formatCurrency(holdingMonths * monthlyHoldingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Closing Costs</span>
                <span>{formatCurrency(buyingClosingCosts + sellingClosingCosts)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                <span>Total Investment</span>
                <span>
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
