"use server";

// AI Deal Quality Score - Formula-based scoring model
// Scoring weights based on real estate investment best practices

export interface DealScoreInput {
  // Property Fundamentals (40%)
  propertyType?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  yearBuilt?: number | null;
  
  // Financial Metrics (40%)
  askingPrice: number;
  arv?: number;
  repairCost?: number;
  mao?: number;
  
  // Strategic Fit (20%)
  sellerMotivation?: string | null;
  daysOnMarket?: number;
  marketDemand?: "high" | "medium" | "low";
}

export interface DealScoreResult {
  overallScore: number; // 1-100
  grade: "A" | "B" | "C" | "D" | "F";
  recommendation: "Strong Buy" | "Buy" | "Review" | "Pass" | "Avoid";
  
  // Component scores (0-100 each)
  propertyScore: number;
  financialScore: number;
  strategicScore: number;
  
  // Explanations
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

// Calculate property fundamentals score (40% weight)
function calculatePropertyScore(input: DealScoreInput): { score: number; strengths: string[]; weaknesses: string[] } {
  let score = 50; // Start at baseline
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Property type scoring
  const propertyTypeScores: Record<string, number> = {
    single_family: 20,
    multi_family: 18,
    townhouse: 15,
    condo: 12,
    commercial: 10,
    land: 5,
    other: 8,
  };
  
  if (input.propertyType) {
    const typeScore = propertyTypeScores[input.propertyType] || 8;
    score += typeScore - 10; // Adjust from baseline
    if (typeScore >= 18) {
      strengths.push(`${input.propertyType.replace("_", " ")} property type is highly desirable`);
    }
  }
  
  // Bedrooms scoring (3-4 beds optimal for most markets)
  if (input.bedrooms) {
    if (input.bedrooms >= 3 && input.bedrooms <= 4) {
      score += 15;
      strengths.push(`${input.bedrooms} bedrooms is ideal for family renters/buyers`);
    } else if (input.bedrooms >= 2 && input.bedrooms <= 5) {
      score += 10;
    } else if (input.bedrooms < 2) {
      score -= 5;
      weaknesses.push("Limited bedrooms may reduce buyer/renter pool");
    } else {
      score += 5; // 6+ bedrooms - niche market
    }
  }
  
  // Bathrooms scoring
  if (input.bathrooms) {
    if (input.bathrooms >= 2) {
      score += 10;
      if (input.bathrooms >= 2.5) {
        strengths.push("Multiple bathrooms increase property value");
      }
    } else {
      score -= 5;
      weaknesses.push("Single bathroom limits buyer interest");
    }
  }
  
  // Square footage scoring
  if (input.sqft) {
    if (input.sqft >= 1500 && input.sqft <= 3000) {
      score += 15;
      strengths.push("Optimal square footage for market appeal");
    } else if (input.sqft >= 1000 && input.sqft < 1500) {
      score += 5;
    } else if (input.sqft < 1000) {
      score -= 10;
      weaknesses.push("Small square footage limits buyer pool");
    } else if (input.sqft > 3000) {
      score += 8; // Large homes can be harder to sell but have upside
    }
  }
  
  // Age scoring
  if (input.yearBuilt) {
    const age = new Date().getFullYear() - input.yearBuilt;
    if (age <= 10) {
      score += 15;
      strengths.push("Newer construction reduces major repair risk");
    } else if (age <= 30) {
      score += 10;
    } else if (age <= 50) {
      score += 0;
    } else {
      score -= 10;
      weaknesses.push("Older property may have hidden maintenance issues");
    }
  }
  
  return { score: Math.min(100, Math.max(0, score)), strengths, weaknesses };
}

// Calculate financial metrics score (40% weight)
function calculateFinancialScore(input: DealScoreInput): { score: number; strengths: string[]; weaknesses: string[] } {
  let score = 30; // Start lower, must prove financial viability
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  const askingPrice = input.askingPrice;
  const arv = input.arv || askingPrice * 1.3; // Estimate if not provided
  const repairCost = input.repairCost || askingPrice * 0.15;
  const mao = input.mao || arv * 0.7 - repairCost;
  
  // Calculate key metrics
  const potentialProfit = arv - askingPrice - repairCost;
  const roi = askingPrice > 0 ? (potentialProfit / askingPrice) * 100 : 0;
  const discountToArv = arv > 0 ? ((arv - askingPrice) / arv) * 100 : 0;
  const repairToArvRatio = arv > 0 ? (repairCost / arv) * 100 : 0;
  
  // ROI scoring (most important financial metric)
  if (roi >= 30) {
    score += 35;
    strengths.push(`Excellent ROI potential of ${roi.toFixed(1)}%`);
  } else if (roi >= 20) {
    score += 25;
    strengths.push(`Strong ROI potential of ${roi.toFixed(1)}%`);
  } else if (roi >= 15) {
    score += 15;
    strengths.push(`Good ROI potential of ${roi.toFixed(1)}%`);
  } else if (roi >= 10) {
    score += 5;
  } else if (roi >= 0) {
    score -= 5;
    weaknesses.push(`Low ROI of ${roi.toFixed(1)}% - thin margins`);
  } else {
    score -= 20;
    weaknesses.push("Negative ROI - deal loses money at current price");
  }
  
  // Discount to ARV scoring
  if (discountToArv >= 30) {
    score += 20;
    strengths.push(`Property priced ${discountToArv.toFixed(0)}% below ARV - excellent entry point`);
  } else if (discountToArv >= 20) {
    score += 10;
  } else if (discountToArv < 10) {
    score -= 10;
    weaknesses.push("Minimal discount to ARV reduces margin of safety");
  }
  
  // Repair ratio scoring (lower is better for risk)
  if (repairToArvRatio <= 10) {
    score += 15;
    strengths.push("Low repair cost relative to ARV reduces execution risk");
  } else if (repairToArvRatio <= 20) {
    score += 5;
  } else if (repairToArvRatio > 30) {
    score -= 10;
    weaknesses.push("High repair costs increase project risk");
  }
  
  // MAO vs asking price
  if (askingPrice <= mao) {
    score += 10;
    strengths.push("Asking price at or below calculated MAO");
  } else {
    const overMao = ((askingPrice - mao) / mao) * 100;
    if (overMao > 20) {
      score -= 15;
      weaknesses.push(`Asking price ${overMao.toFixed(0)}% above MAO - significant negotiation needed`);
    } else if (overMao > 10) {
      score -= 5;
      weaknesses.push("Asking price above MAO - negotiation required");
    }
  }
  
  return { score: Math.min(100, Math.max(0, score)), strengths, weaknesses };
}

// Calculate strategic fit score (20% weight)
function calculateStrategicScore(input: DealScoreInput): { score: number; strengths: string[]; weaknesses: string[] } {
  let score = 50;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Seller motivation
  if (input.sellerMotivation === "high") {
    score += 25;
    strengths.push("Highly motivated seller increases negotiation leverage");
  } else if (input.sellerMotivation === "medium") {
    score += 10;
  } else if (input.sellerMotivation === "low") {
    score -= 10;
    weaknesses.push("Low seller motivation may lead to slow negotiation");
  }
  
  // Days on market
  if (input.daysOnMarket !== undefined) {
    if (input.daysOnMarket >= 90) {
      score += 20;
      strengths.push("Extended days on market suggests seller flexibility");
    } else if (input.daysOnMarket >= 45) {
      score += 10;
    } else if (input.daysOnMarket < 7) {
      score -= 5;
      weaknesses.push("New listing - less negotiation opportunity");
    }
  }
  
  // Market demand
  if (input.marketDemand === "high") {
    score += 15;
    strengths.push("High market demand supports faster exit");
  } else if (input.marketDemand === "low") {
    score -= 15;
    weaknesses.push("Low market demand may extend holding period");
  }
  
  return { score: Math.min(100, Math.max(0, score)), strengths, weaknesses };
}

// Determine grade from score
function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

// Determine recommendation from score
function getRecommendation(score: number): "Strong Buy" | "Buy" | "Review" | "Pass" | "Avoid" {
  if (score >= 85) return "Strong Buy";
  if (score >= 70) return "Buy";
  if (score >= 55) return "Review";
  if (score >= 40) return "Pass";
  return "Avoid";
}

// Generate summary based on scores
function generateSummary(
  overall: number,
  property: number,
  financial: number,
  strategic: number
): string {
  const summaries: string[] = [];
  
  if (overall >= 85) {
    summaries.push("This is an exceptional deal with strong fundamentals across all metrics.");
  } else if (overall >= 70) {
    summaries.push("This deal shows solid potential with acceptable risk levels.");
  } else if (overall >= 55) {
    summaries.push("This deal has mixed signals and requires careful due diligence.");
  } else if (overall >= 40) {
    summaries.push("This deal presents significant challenges that may outweigh potential returns.");
  } else {
    summaries.push("This deal has substantial red flags and is not recommended.");
  }
  
  // Add specific insights
  if (financial >= 75 && property < 60) {
    summaries.push("Strong financial metrics may compensate for property limitations.");
  } else if (property >= 75 && financial < 60) {
    summaries.push("Quality property but pricing needs to improve for viable returns.");
  }
  
  if (strategic >= 75) {
    summaries.push("Favorable market conditions support this investment.");
  }
  
  return summaries.join(" ");
}

// Main scoring function
export async function calculateDealScore(input: DealScoreInput): Promise<DealScoreResult> {
  // Calculate component scores
  const propertyResult = calculatePropertyScore(input);
  const financialResult = calculateFinancialScore(input);
  const strategicResult = calculateStrategicScore(input);
  
  // Calculate weighted overall score
  // Property: 40%, Financial: 40%, Strategic: 20%
  const overallScore = Math.round(
    propertyResult.score * 0.4 +
    financialResult.score * 0.4 +
    strategicResult.score * 0.2
  );
  
  const grade = getGrade(overallScore);
  const recommendation = getRecommendation(overallScore);
  
  // Combine strengths and weaknesses
  const allStrengths = [
    ...propertyResult.strengths,
    ...financialResult.strengths,
    ...strategicResult.strengths,
  ];
  
  const allWeaknesses = [
    ...propertyResult.weaknesses,
    ...financialResult.weaknesses,
    ...strategicResult.weaknesses,
  ];
  
  // Limit to top items for readability
  const strengths = allStrengths.slice(0, 5);
  const weaknesses = allWeaknesses.slice(0, 5);
  
  const summary = generateSummary(
    overallScore,
    propertyResult.score,
    financialResult.score,
    strategicResult.score
  );
  
  return {
    overallScore,
    grade,
    recommendation,
    propertyScore: propertyResult.score,
    financialScore: financialResult.score,
    strategicScore: strategicResult.score,
    strengths,
    weaknesses,
    summary,
  };
}
