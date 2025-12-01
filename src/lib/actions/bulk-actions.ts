"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createInAppNotification as createNotification } from "./notification-actions";
import { createAuditLog } from "./audit-actions";
import type { DealStatus } from "./deal-actions";

export async function bulkUpdateStatus(dealIds: string[], newStatus: DealStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated", updated: 0 };
  
  // Check permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (!["admin", "underwriter"].includes(profile?.role || "")) {
    return { error: "Not authorized for bulk operations", updated: 0 };
  }
  
  let updated = 0;
  const errors: string[] = [];
  
  for (const dealId of dealIds) {
    const { error } = await supabase
      .from("deals")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId);
    
    if (error) {
      errors.push(`Failed to update deal ${dealId}`);
    } else {
      updated++;
      
      // Log audit
      await createAuditLog({
        action: "bulk_status_update",
        entityType: "deal",
        entityId: dealId,
        newValues: { status: newStatus },
      });
    }
  }
  
  revalidatePath("/dashboard/deals");
  
  return { 
    error: errors.length > 0 ? errors.join(", ") : null, 
    updated 
  };
}

export async function bulkAssign(dealIds: string[], assigneeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated", updated: 0 };
  
  // Check permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== "admin") {
    return { error: "Only admins can bulk assign", updated: 0 };
  }
  
  // Get assignee name for notification
  const { data: assignee } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", assigneeId)
    .single();
  
  let updated = 0;
  const errors: string[] = [];
  
  for (const dealId of dealIds) {
    const { error } = await supabase
      .from("deals")
      .update({ 
        assigned_to: assigneeId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId);
    
    if (error) {
      errors.push(`Failed to assign deal ${dealId}`);
    } else {
      updated++;
      
      // Log audit
      await createAuditLog({
        action: "bulk_assignment",
        entityType: "deal",
        entityId: dealId,
        newValues: { assigned_to: assigneeId },
      });
    }
  }
  
  // Send one notification for all assignments
  if (updated > 0) {
    await createNotification({
      userId: assigneeId,
      type: "bulk_assignment",
      title: "New Deals Assigned",
      message: `${updated} deal(s) have been assigned to you`,
    });
  }
  
  revalidatePath("/dashboard/deals");
  
  return { 
    error: errors.length > 0 ? errors.join(", ") : null, 
    updated 
  };
}

export async function bulkDelete(dealIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated", deleted: 0 };
  
  // Check permissions - only admins can bulk delete
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== "admin") {
    return { error: "Only admins can bulk delete", deleted: 0 };
  }
  
  let deleted = 0;
  const errors: string[] = [];
  
  for (const dealId of dealIds) {
    // Get deal info for audit log
    const { data: deal } = await supabase
      .from("deals")
      .select("*, properties(address)")
      .eq("id", dealId)
      .single();
    
    const { error } = await supabase
      .from("deals")
      .delete()
      .eq("id", dealId);
    
    if (error) {
      errors.push(`Failed to delete deal ${dealId}`);
    } else {
      deleted++;
      
      // Log audit
      await createAuditLog({
        action: "bulk_delete",
        entityType: "deal",
        entityId: dealId,
        oldValues: deal,
      });
    }
  }
  
  revalidatePath("/dashboard/deals");
  
  return { 
    error: errors.length > 0 ? errors.join(", ") : null, 
    deleted 
  };
}

export async function bulkExport(dealIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated", data: null };
  
  const { data: deals, error } = await supabase
    .from("deals")
    .select(`
      id,
      status,
      asking_price,
      offer_price,
      seller_name,
      seller_email,
      seller_phone,
      seller_motivation,
      notes,
      submitted_at,
      updated_at,
      properties(
        address,
        city,
        state,
        zip,
        property_type,
        bedrooms,
        bathrooms,
        sqft,
        year_built
      ),
      underwriting_records(
        arv,
        rehab_cost,
        max_offer,
        risk_score
      ),
      agent:profiles!deals_agent_id_fkey(full_name, email),
      assignee:profiles!deals_assigned_to_fkey(full_name, email)
    `)
    .in("id", dealIds);
  
  if (error) {
    return { error: error.message, data: null };
  }
  
  // Format for CSV export
  const csvData = deals.map(deal => {
    const property = Array.isArray(deal.properties) ? deal.properties[0] : deal.properties;
    const underwriting = deal.underwriting_records?.[0];
    const agent = Array.isArray(deal.agent) ? deal.agent[0] : deal.agent;
    const assignee = Array.isArray(deal.assignee) ? deal.assignee[0] : deal.assignee;
    return {
      "Deal ID": deal.id,
      "Status": deal.status,
      "Address": property?.address || "",
      "City": property?.city || "",
      "State": property?.state || "",
      "ZIP": property?.zip || "",
      "Property Type": property?.property_type || "",
      "Bedrooms": property?.bedrooms || "",
      "Bathrooms": property?.bathrooms || "",
      "Sqft": property?.sqft || "",
      "Year Built": property?.year_built || "",
      "Asking Price": deal.asking_price,
      "Offer Price": deal.offer_price || "",
      "ARV": underwriting?.arv || "",
      "Rehab Cost": underwriting?.rehab_cost || "",
      "Max Offer": underwriting?.max_offer || "",
      "Risk Score": underwriting?.risk_score || "",
      "Seller Name": deal.seller_name,
      "Seller Email": deal.seller_email || "",
      "Seller Phone": deal.seller_phone || "",
      "Seller Motivation": deal.seller_motivation || "",
      "Notes": deal.notes || "",
      "Agent": agent?.full_name || agent?.email || "",
      "Assignee": assignee?.full_name || assignee?.email || "",
      "Submitted": deal.submitted_at,
      "Last Updated": deal.updated_at,
    };
  });
  
  return { error: null, data: csvData };
}

export async function bulkSetPriority(dealIds: string[], priority: "low" | "medium" | "high" | "urgent") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated", updated: 0 };
  
  // Check permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (!["admin", "underwriter"].includes(profile?.role || "")) {
    return { error: "Not authorized", updated: 0 };
  }
  
  const { error, count } = await supabase
    .from("deals")
    .update({ 
      priority,
      updated_at: new Date().toISOString(),
    })
    .in("id", dealIds);
  
  if (error) {
    return { error: error.message, updated: 0 };
  }
  
  revalidatePath("/dashboard/deals");
  
  return { error: null, updated: count || dealIds.length };
}
