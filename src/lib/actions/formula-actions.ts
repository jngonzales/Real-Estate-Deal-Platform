"use server";

import { createClient } from "@/utils/supabase/server";
import { CustomFormula, CustomCalculator, DEFAULT_FORMULAS } from "@/lib/formulas/formula-engine";

export interface UserFormulaSettings {
  mao: CustomFormula;
  rule70: CustomFormula;
  buyBox: CustomFormula;
  customCalculator: CustomCalculator | null;
}

// Get user's saved formulas
export async function getUserFormulas(): Promise<UserFormulaSettings> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      mao: DEFAULT_FORMULAS.mao,
      rule70: DEFAULT_FORMULAS.rule70,
      buyBox: DEFAULT_FORMULAS.buyBox,
      customCalculator: null,
    };
  }

  const { data } = await supabase
    .from("user_formula_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!data) {
    return {
      mao: DEFAULT_FORMULAS.mao,
      rule70: DEFAULT_FORMULAS.rule70,
      buyBox: DEFAULT_FORMULAS.buyBox,
      customCalculator: null,
    };
  }

  return {
    mao: data.mao_formula ? JSON.parse(data.mao_formula) : DEFAULT_FORMULAS.mao,
    rule70: data.rule70_formula ? JSON.parse(data.rule70_formula) : DEFAULT_FORMULAS.rule70,
    buyBox: data.buybox_formula ? JSON.parse(data.buybox_formula) : DEFAULT_FORMULAS.buyBox,
    customCalculator: data.custom_calculator ? JSON.parse(data.custom_calculator) : null,
  };
}

// Save user's formulas
export async function saveUserFormulas(
  formulas: Partial<{
    mao: CustomFormula;
    rule70: CustomFormula;
    buyBox: CustomFormula;
    customCalculator: CustomCalculator | null;
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if record exists
  const { data: existing } = await supabase
    .from("user_formula_settings")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const payload: Record<string, string | null> = {};
  
  if (formulas.mao !== undefined) {
    payload.mao_formula = JSON.stringify(formulas.mao);
  }
  if (formulas.rule70 !== undefined) {
    payload.rule70_formula = JSON.stringify(formulas.rule70);
  }
  if (formulas.buyBox !== undefined) {
    payload.buybox_formula = JSON.stringify(formulas.buyBox);
  }
  if (formulas.customCalculator !== undefined) {
    payload.custom_calculator = formulas.customCalculator 
      ? JSON.stringify(formulas.customCalculator) 
      : null;
  }

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from("user_formula_settings")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating formulas:", error);
      return { success: false, error: error.message };
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from("user_formula_settings")
      .insert({
        user_id: user.id,
        ...payload,
      });

    if (error) {
      console.error("Error inserting formulas:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

// Reset formulas to defaults
export async function resetUserFormulas(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_formula_settings")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Error resetting formulas:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
