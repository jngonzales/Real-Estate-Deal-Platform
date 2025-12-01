"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type RiskFactor = {
  category: string;
  factor: string;
  score: number;
  weight: number;
  notes?: string;
};

export type RiskAssessment = {
  overallScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  recommendation: string;
};

// Calculate risk score based on deal data
export function calculateRiskScore(data: {
  askingPrice: number;
  arv: number;
  maxOffer: number;
  rehabCost: number;
  propertyType: string;
  daysOnMarket?: number;
  sellerMotivation?: string;
  propertyCondition?: string;
}): RiskAssessment {
  const factors: RiskFactor[] = [];
  
  // 1. Price to ARV Ratio (30% weight)
  const priceToArv = data.askingPrice / data.arv;
  const priceFactor: RiskFactor = {
    category: "Valuation",
    factor: "Price to ARV Ratio",
    score: 0,
    weight: 30,
  };
  
  if (priceToArv <= 0.60) {
    priceFactor.score = 1;
    priceFactor.notes = "Excellent deal - asking price well below market";
  } else if (priceToArv <= 0.70) {
    priceFactor.score = 3;
    priceFactor.notes = "Good deal - healthy margin";
  } else if (priceToArv <= 0.80) {
    priceFactor.score = 5;
    priceFactor.notes = "Average deal - standard margins";
  } else if (priceToArv <= 0.90) {
    priceFactor.score = 7;
    priceFactor.notes = "Tight margins - limited profit potential";
  } else {
    priceFactor.score = 9;
    priceFactor.notes = "High risk - asking price near or above ARV";
  }
  factors.push(priceFactor);
  
  // 2. Rehab to ARV Ratio (25% weight)
  const rehabToArv = data.rehabCost / data.arv;
  const rehabFactor: RiskFactor = {
    category: "Renovation",
    factor: "Rehab to ARV Ratio",
    score: 0,
    weight: 25,
  };
  
  if (rehabToArv <= 0.10) {
    rehabFactor.score = 1;
    rehabFactor.notes = "Minor repairs - low renovation risk";
  } else if (rehabToArv <= 0.20) {
    rehabFactor.score = 3;
    rehabFactor.notes = "Moderate rehab - manageable scope";
  } else if (rehabToArv <= 0.30) {
    rehabFactor.score = 5;
    rehabFactor.notes = "Significant rehab - careful budgeting needed";
  } else if (rehabToArv <= 0.40) {
    rehabFactor.score = 7;
    rehabFactor.notes = "Major renovation - high cost risk";
  } else {
    rehabFactor.score = 9;
    rehabFactor.notes = "Extensive renovation - very high risk";
  }
  factors.push(rehabFactor);
  
  // 3. Profit Margin (25% weight)
  const profitMargin = (data.arv - data.maxOffer - data.rehabCost) / data.arv;
  const profitFactor: RiskFactor = {
    category: "Returns",
    factor: "Expected Profit Margin",
    score: 0,
    weight: 25,
  };
  
  if (profitMargin >= 0.25) {
    profitFactor.score = 1;
    profitFactor.notes = "Excellent margins - strong profit potential";
  } else if (profitMargin >= 0.20) {
    profitFactor.score = 3;
    profitFactor.notes = "Good margins - solid returns expected";
  } else if (profitMargin >= 0.15) {
    profitFactor.score = 5;
    profitFactor.notes = "Average margins - acceptable returns";
  } else if (profitMargin >= 0.10) {
    profitFactor.score = 7;
    profitFactor.notes = "Thin margins - limited room for error";
  } else {
    profitFactor.score = 9;
    profitFactor.notes = "Minimal margins - high loss potential";
  }
  factors.push(profitFactor);
  
  // 4. Property Type (10% weight)
  const typeFactor: RiskFactor = {
    category: "Property",
    factor: "Property Type",
    score: 0,
    weight: 10,
  };
  
  const typeScores: Record<string, { score: number; notes: string }> = {
    single_family: { score: 2, notes: "Single family - most liquid" },
    townhouse: { score: 3, notes: "Townhouse - good liquidity" },
    condo: { score: 4, notes: "Condo - HOA considerations" },
    duplex: { score: 3, notes: "Duplex - income potential" },
    triplex: { score: 4, notes: "Triplex - multi-family management" },
    fourplex: { score: 5, notes: "Fourplex - commercial considerations" },
    multi_family: { score: 6, notes: "Multi-family - complex management" },
    land: { score: 8, notes: "Land - limited financing options" },
    commercial: { score: 7, notes: "Commercial - specialized market" },
    other: { score: 6, notes: "Other - assess individually" },
  };
  
  const typeInfo = typeScores[data.propertyType] || typeScores.other;
  typeFactor.score = typeInfo.score;
  typeFactor.notes = typeInfo.notes;
  factors.push(typeFactor);
  
  // 5. Seller Motivation (10% weight)
  const motivationFactor: RiskFactor = {
    category: "Deal Quality",
    factor: "Seller Motivation",
    score: 5, // Default to medium if unknown
    weight: 10,
  };
  
  if (data.sellerMotivation) {
    const motivationLower = data.sellerMotivation.toLowerCase();
    if (motivationLower.includes("foreclosure") || motivationLower.includes("distress")) {
      motivationFactor.score = 2;
      motivationFactor.notes = "High motivation - distressed sale";
    } else if (motivationLower.includes("relocat") || motivationLower.includes("divorce")) {
      motivationFactor.score = 3;
      motivationFactor.notes = "Motivated seller - life event";
    } else if (motivationLower.includes("inherited") || motivationLower.includes("probate")) {
      motivationFactor.score = 3;
      motivationFactor.notes = "Estate sale - potentially motivated";
    } else if (motivationLower.includes("investor") || motivationLower.includes("tired landlord")) {
      motivationFactor.score = 4;
      motivationFactor.notes = "Investor exit - negotiable";
    } else {
      motivationFactor.notes = "Standard motivation";
    }
  } else {
    motivationFactor.notes = "Motivation unknown";
  }
  factors.push(motivationFactor);
  
  // Calculate weighted average
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const weightedSum = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);
  const overallScore = Math.round((weightedSum / totalWeight) * 10) / 10;
  
  // Determine risk level
  let riskLevel: "low" | "medium" | "high" | "critical";
  let recommendation: string;
  
  if (overallScore <= 3) {
    riskLevel = "low";
    recommendation = "Strong deal fundamentals. Recommend proceeding with standard due diligence.";
  } else if (overallScore <= 5) {
    riskLevel = "medium";
    recommendation = "Acceptable risk profile. Review all factors carefully before proceeding.";
  } else if (overallScore <= 7) {
    riskLevel = "high";
    recommendation = "Elevated risk. Consider additional contingencies or negotiate better terms.";
  } else {
    riskLevel = "critical";
    recommendation = "High risk deal. Strongly recommend passing unless exceptional circumstances apply.";
  }
  
  return {
    overallScore,
    riskLevel,
    factors,
    recommendation,
  };
}

// Save risk assessment to underwriting record
export async function saveRiskAssessment(
  underwritingId: string, 
  assessment: RiskAssessment
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("underwriting_records")
    .update({
      risk_score: Math.round(assessment.overallScore),
      risk_factors: assessment,
    })
    .eq("id", underwritingId)
    .select()
    .single();
  
  if (error) {
    console.error("Error saving risk assessment:", error);
    return { error: "Failed to save risk assessment" };
  }
  
  // Revalidate deal page
  const { data: deal } = await supabase
    .from("deals")
    .select("id")
    .eq("id", data.deal_id)
    .single();
  
  if (deal) {
    revalidatePath(`/dashboard/deals/${deal.id}`);
  }
  
  return { data, error: null };
}

// Get risk level color
export function getRiskLevelColor(level: string): string {
  switch (level) {
    case "low": return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
    case "medium": return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
    case "high": return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30";
    case "critical": return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
    default: return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/30";
  }
}

// Get risk score color
export function getRiskScoreColor(score: number): string {
  if (score <= 3) return "text-green-600 dark:text-green-400";
  if (score <= 5) return "text-yellow-600 dark:text-yellow-400";
  if (score <= 7) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}
