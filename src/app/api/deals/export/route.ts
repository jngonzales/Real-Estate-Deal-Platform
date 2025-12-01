import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { dealsToCSV, defaultExportColumns } from "@/lib/utils/csv-export";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check user role (only admin/underwriter can export all deals)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdminOrUnderwriter = profile?.role === "admin" || profile?.role === "underwriter";

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    let dealsQuery = supabase
      .from("deals")
      .select("*")
      .order("submitted_at", { ascending: false });

    // Filter by agent if not admin
    if (!isAdminOrUnderwriter) {
      dealsQuery = dealsQuery.eq("agent_id", user.id);
    }

    // Apply status filter
    if (status) {
      const statuses = status.split(",");
      dealsQuery = dealsQuery.in("status", statuses);
    }

    // Apply date filters
    if (startDate) {
      dealsQuery = dealsQuery.gte("submitted_at", startDate);
    }
    if (endDate) {
      dealsQuery = dealsQuery.lte("submitted_at", endDate);
    }

    const { data: deals, error: dealsError } = await dealsQuery;

    if (dealsError) {
      return NextResponse.json(
        { error: dealsError.message },
        { status: 500 }
      );
    }

    if (!deals || deals.length === 0) {
      return new NextResponse("No deals to export", { status: 404 });
    }

    // Get property and user data
    const propertyIds = [...new Set(deals.map(d => d.property_id))];
    const agentIds = [...new Set(deals.map(d => d.agent_id))];
    const assigneeIds = [...new Set(deals.map(d => d.assigned_to).filter(Boolean))];
    const allUserIds = [...new Set([...agentIds, ...assigneeIds])];

    const [propertiesResult, usersResult] = await Promise.all([
      supabase.from("properties").select("*").in("id", propertyIds),
      isAdminOrUnderwriter && allUserIds.length > 0
        ? supabase.from("profiles").select("id, full_name, email").in("id", allUserIds)
        : Promise.resolve({ data: null, error: null }),
    ]);

    // Create maps for lookup
    const propertyMap = new Map(propertiesResult.data?.map(p => [p.id, p]) || []);
    const userMap = new Map(usersResult.data?.map(u => [u.id, u]) || []);

    // Combine deals with related data
    const dealsWithData = deals.map(deal => ({
      ...deal,
      property: propertyMap.get(deal.property_id) || null,
      agent: userMap.get(deal.agent_id) || null,
      assignee: deal.assigned_to ? userMap.get(deal.assigned_to) || null : null,
    }));

    // Generate CSV
    const csvContent = dealsToCSV(dealsWithData, defaultExportColumns);

    // Generate filename
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = status 
      ? `dealflow-${status.replace(",", "-")}-${dateStr}.csv`
      : `dealflow-pipeline-${dateStr}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
