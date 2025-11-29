import { z } from "zod";

export const underwritingSchema = z.object({
  // ARV (After Repair Value)
  arv: z.coerce.number().min(0, "ARV must be positive"),
  arvSource: z.enum(["comps", "appraisal", "estimate"]).default("estimate"),
  arvNotes: z.string().optional(),

  // Repair Estimates
  repairCosts: z.coerce.number().min(0, "Repair costs must be positive"),
  repairScope: z.enum(["cosmetic", "moderate", "extensive", "gut"]).default("moderate"),
  repairNotes: z.string().optional(),

  // Holding Costs
  holdingMonths: z.coerce.number().min(1).max(24).default(6),
  monthlyHoldingCost: z.coerce.number().min(0).default(0),

  // Closing Costs
  buyingClosingCosts: z.coerce.number().min(0).default(0),
  sellingClosingCosts: z.coerce.number().min(0).default(0),

  // Financing
  financingType: z.enum(["cash", "hard_money", "conventional", "private"]).default("cash"),
  loanAmount: z.coerce.number().min(0).default(0),
  interestRate: z.coerce.number().min(0).max(30).default(0),

  // Target Profit
  targetProfitPercent: z.coerce.number().min(0).max(100).default(20),
  targetProfitAmount: z.coerce.number().min(0).default(0),
});

export type UnderwritingForm = z.infer<typeof underwritingSchema>;

// MAO Formula: Maximum Allowable Offer = ARV × (1 - profit%) - repairs - holding - closing
export function calculateMAO(data: {
  arv: number;
  repairCosts: number;
  holdingMonths: number;
  monthlyHoldingCost: number;
  buyingClosingCosts: number;
  sellingClosingCosts: number;
  targetProfitPercent: number;
}): number {
  const {
    arv,
    repairCosts,
    holdingMonths,
    monthlyHoldingCost,
    buyingClosingCosts,
    sellingClosingCosts,
    targetProfitPercent,
  } = data;

  const totalHoldingCosts = holdingMonths * monthlyHoldingCost;
  const totalClosingCosts = buyingClosingCosts + sellingClosingCosts;
  const profitMultiplier = 1 - targetProfitPercent / 100;

  const mao = arv * profitMultiplier - repairCosts - totalHoldingCosts - totalClosingCosts;

  return Math.max(0, Math.round(mao));
}

// 70% Rule: Offer = ARV × 70% - repairs
export function calculate70PercentRule(arv: number, repairCosts: number): number {
  const offer = arv * 0.7 - repairCosts;
  return Math.max(0, Math.round(offer));
}

// Hedge Fund Buy Box Formula: MAO = (ARV × BuyBox%) - Rehab
export function calculateBuyBoxOffer(arv: number, buyBoxPercent: number, rehabCost: number): number {
  const offer = (arv * (buyBoxPercent / 100)) - rehabCost;
  return Math.max(0, Math.round(offer));
}

// Calculate potential profit
export function calculateProfit(data: {
  arv: number;
  purchasePrice: number;
  repairCosts: number;
  holdingMonths: number;
  monthlyHoldingCost: number;
  buyingClosingCosts: number;
  sellingClosingCosts: number;
}): { profit: number; profitPercent: number; roi: number } {
  const {
    arv,
    purchasePrice,
    repairCosts,
    holdingMonths,
    monthlyHoldingCost,
    buyingClosingCosts,
    sellingClosingCosts,
  } = data;

  const totalHoldingCosts = holdingMonths * monthlyHoldingCost;
  const totalClosingCosts = buyingClosingCosts + sellingClosingCosts;
  const totalInvestment = purchasePrice + repairCosts + totalHoldingCosts + totalClosingCosts;

  const profit = arv - totalInvestment;
  const profitPercent = arv > 0 ? (profit / arv) * 100 : 0;
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

  return {
    profit: Math.round(profit),
    profitPercent: Math.round(profitPercent * 10) / 10,
    roi: Math.round(roi * 10) / 10,
  };
}

// Repair cost estimates by scope
export const repairCostGuides: Record<string, { perSqft: { low: number; high: number }; description: string }> = {
  cosmetic: {
    perSqft: { low: 10, high: 25 },
    description: "Paint, flooring, fixtures, minor updates",
  },
  moderate: {
    perSqft: { low: 25, high: 50 },
    description: "Kitchen/bath refresh, some systems updates",
  },
  extensive: {
    perSqft: { low: 50, high: 100 },
    description: "Full kitchen/bath remodel, major repairs",
  },
  gut: {
    perSqft: { low: 100, high: 200 },
    description: "Complete renovation, structural work",
  },
};
