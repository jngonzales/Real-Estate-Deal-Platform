import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { evaluateFormula } from "@/lib/ai/deal-scoring";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { formula, variables } = body;

    if (!formula) {
      return NextResponse.json({ error: "Formula is required" }, { status: 400 });
    }

    // Evaluate the formula using AI
    const result = await evaluateFormula(formula, variables || {});

    return NextResponse.json({ 
      success: true, 
      result 
    });
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate formula" },
      { status: 500 }
    );
  }
}
