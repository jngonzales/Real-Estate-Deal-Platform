import "server-only";
import { GoogleGenAI } from "@google/genai";

const defaultModel = "gemini-3.5-flash-lite";
let genAI: GoogleGenAI | undefined;

async function generateText(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is missing");

  genAI ??= new GoogleGenAI({ apiKey, vertexai: false });
  const model = process.env.GOOGLE_GEMINI_MODEL?.trim() || defaultModel;
  const response = await genAI.models.generateContent({ model, contents: prompt });
  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && ["RECITATION", "SAFETY", "LANGUAGE"].includes(finishReason)) {
    throw new Error("Gemini response blocked");
  }

  const text = response.text;
  if (!text?.trim()) throw new Error("Gemini returned no text");
  return text;
}

export interface DealData {
  address?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  askingPrice?: number;
  arv?: number;
  repairCost?: number;
  profitMargin?: number;
  roi?: number;
  mao?: number;
  offerPrice?: number;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  daysOnMarket?: number;
  condition?: string;
}

export interface DealScore {
  score: number; // 1-100
  grade: "A" | "B" | "C" | "D" | "F";
  recommendation: "STRONG BUY" | "BUY" | "REVIEW" | "PASS" | "REJECT";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  riskFactors: string[];
  profitPotential: "HIGH" | "MEDIUM" | "LOW";
  timeToClose: string;
}

export interface FormulaEvaluation {
  result: number;
  breakdown: Record<string, number>;
  explanation: string;
}

/**
 * Score a real estate deal using AI
 */
export async function scoreDeal(dealData: DealData): Promise<DealScore> {
  const prompt = `You are an expert real estate investment analyst. Analyze this deal and provide a detailed scoring.

DEAL DATA:
${JSON.stringify(dealData, null, 2)}

SCORING CRITERIA:
1. Financial Metrics (40%): ARV accuracy, profit margin, ROI, cash flow potential
2. Property Fundamentals (30%): Location quality, property condition, market demand
3. Risk Assessment (20%): Market volatility, renovation risks, exit strategy risks
4. Strategic Fit (10%): Time to close, complexity, capital requirements

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{
  "score": <number 1-100>,
  "grade": "<A|B|C|D|F>",
  "recommendation": "<STRONG BUY|BUY|REVIEW|PASS|REJECT>",
  "summary": "<1-2 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "riskFactors": ["<risk 1>", "<risk 2>"],
  "profitPotential": "<HIGH|MEDIUM|LOW>",
  "timeToClose": "<estimated time like '2-3 months'>"
}

If data is insufficient, provide reasonable estimates based on typical deals. Always return valid JSON.`;

  try {
    const response = await generateText(prompt);
    
    // Clean the response - remove any markdown code blocks
    const cleanedResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    const parsed = JSON.parse(cleanedResponse) as DealScore;
    
    // Validate and normalize the response
    return {
      score: Math.min(100, Math.max(1, parsed.score || 50)),
      grade: parsed.grade || getGradeFromScore(parsed.score),
      recommendation: parsed.recommendation || getRecommendationFromScore(parsed.score),
      summary: parsed.summary || "Analysis complete",
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      riskFactors: parsed.riskFactors || [],
      profitPotential: parsed.profitPotential || "MEDIUM",
      timeToClose: parsed.timeToClose || "Unknown",
    };
  } catch (error) {
    console.error("AI Deal Scoring Error:", error);
    
    // Return a fallback score based on available data
    return calculateFallbackScore(dealData);
  }
}

/**
 * Evaluate a custom formula using AI
 */
export async function evaluateFormula(
  formula: string,
  variables: Record<string, number>
): Promise<FormulaEvaluation> {
  const prompt = `You are a mathematical formula evaluator for real estate calculations.

FORMULA: ${formula}

VARIABLES:
${JSON.stringify(variables, null, 2)}

Evaluate this formula step by step and provide the result.

Common real estate formulas:
- MAO = ARV × 0.70 - Repair Cost
- ROI = (Profit / Total Investment) × 100
- Cap Rate = NOI / Purchase Price × 100
- Cash on Cash = Annual Cash Flow / Cash Invested × 100

RESPOND WITH VALID JSON ONLY (no markdown):
{
  "result": <final calculated number>,
  "breakdown": {
    "<step1>": <value>,
    "<step2>": <value>
  },
  "explanation": "<brief explanation of calculation>"
}`;

  try {
    const response = await generateText(prompt);
    
    const cleanedResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    return JSON.parse(cleanedResponse) as FormulaEvaluation;
  } catch (error) {
    console.error("Formula Evaluation Error:", error);
    return {
      result: 0,
      breakdown: {},
      explanation: "Unable to evaluate formula",
    };
  }
}

/**
 * Get AI-powered deal recommendations
 */
export async function getDealRecommendations(
  dealData: DealData,
  userPreferences?: {
    riskTolerance?: "low" | "medium" | "high";
    investmentStrategy?: "flip" | "rental" | "wholesale" | "brrrr";
    maxBudget?: number;
  }
): Promise<string[]> {
  const prompt = `You are a real estate investment advisor. Based on this deal and user preferences, provide actionable recommendations.

DEAL DATA:
${JSON.stringify(dealData, null, 2)}

USER PREFERENCES:
${JSON.stringify(userPreferences || {}, null, 2)}

Provide 3-5 specific, actionable recommendations for this deal.

RESPOND WITH VALID JSON ONLY:
{
  "recommendations": [
    "<specific recommendation 1>",
    "<specific recommendation 2>",
    "<specific recommendation 3>"
  ]
}`;

  try {
    const response = await generateText(prompt);
    
    const cleanedResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    const parsed = JSON.parse(cleanedResponse);
    return parsed.recommendations || [];
  } catch (error) {
    console.error("Recommendations Error:", error);
    return ["Unable to generate recommendations at this time"];
  }
}

/**
 * Generate a deal summary for reports/PDF
 */
export async function generateDealSummary(dealData: DealData): Promise<string> {
  const prompt = `Write a professional 2-3 paragraph executive summary for this real estate investment deal. 
Include key metrics, investment thesis, and risk assessment.

DEAL DATA:
${JSON.stringify(dealData, null, 2)}

Write in professional business language suitable for investors. Do not use markdown formatting.`;

  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return "Unable to generate summary at this time.";
  }
}

// Helper functions
function getGradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function getRecommendationFromScore(score: number): "STRONG BUY" | "BUY" | "REVIEW" | "PASS" | "REJECT" {
  if (score >= 85) return "STRONG BUY";
  if (score >= 75) return "BUY";
  if (score >= 60) return "REVIEW";
  if (score >= 40) return "PASS";
  return "REJECT";
}

function calculateFallbackScore(dealData: DealData): DealScore {
  let score = 50; // Base score
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const riskFactors: string[] = [];

  // Calculate based on available metrics
  if (dealData.profitMargin) {
    if (dealData.profitMargin >= 20) {
      score += 15;
      strengths.push("Strong profit margin above 20%");
    } else if (dealData.profitMargin >= 10) {
      score += 5;
    } else {
      score -= 10;
      weaknesses.push("Low profit margin");
    }
  }

  if (dealData.roi) {
    if (dealData.roi >= 30) {
      score += 15;
      strengths.push("Excellent ROI potential");
    } else if (dealData.roi >= 15) {
      score += 5;
    } else {
      score -= 5;
    }
  }

  if (dealData.arv && dealData.askingPrice) {
    const discount = ((dealData.arv - dealData.askingPrice) / dealData.arv) * 100;
    if (discount >= 30) {
      score += 10;
      strengths.push(`Significant discount at ${discount.toFixed(1)}% below ARV`);
    } else if (discount < 15) {
      score -= 10;
      weaknesses.push("Limited discount from ARV");
    }
  }

  if (dealData.condition === "poor" || dealData.condition === "needs_work") {
    riskFactors.push("Property requires significant repairs");
  }

  score = Math.min(100, Math.max(1, score));

  return {
    score,
    grade: getGradeFromScore(score),
    recommendation: getRecommendationFromScore(score),
    summary: "Score calculated based on available financial metrics",
    strengths: strengths.length > 0 ? strengths : ["Data available for analysis"],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
    riskFactors: riskFactors.length > 0 ? riskFactors : ["Standard market risks apply"],
    profitPotential: score >= 70 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW",
    timeToClose: "2-4 months",
  };
}
