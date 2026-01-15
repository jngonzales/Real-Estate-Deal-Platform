import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { scoreDeal, DealData } from "@/lib/ai/deal-scoring";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const dealData: DealData = body.dealData;

    if (!dealData) {
      return NextResponse.json({ error: "Deal data is required" }, { status: 400 });
    }

    // Score the deal using AI
    const score = await scoreDeal(dealData);

    // Optionally save the score to the database
    if (body.dealId) {
      await supabase
        .from("deals")
        .update({ 
          ai_score: score.score,
          ai_grade: score.grade,
          ai_recommendation: score.recommendation,
          ai_analysis: score,
          updated_at: new Date().toISOString()
        })
        .eq("id", body.dealId);
    }

    return NextResponse.json({ 
      success: true, 
      score 
    });
  } catch (error) {
    console.error("Deal scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score deal" },
      { status: 500 }
    );
  }
}
