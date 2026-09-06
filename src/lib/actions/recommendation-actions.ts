"use server";

import { createClient } from "@/utils/supabase/server";

export interface DealRecommendation {
  type: "pricing" | "timeline" | "market" | "financing" | "risk";
  severity: "info" | "warning" | "success";
  message: string;
  suggestedAction?: string;
  impact?: string;
}

export interface SimilarDeal {
  id: string;
  address: string;
  city: string;
  asking_price: number;
  offer_price: number | null;
  status: string;
  property_type: string;
  submitted_at: string;
  closed_at: string | null;
  holding_months?: number;
  roi?: number;
}

interface ComparableProperty {
  address: string;
  city: string;
  property_type: string;
}

interface ComparableUnderwriting {
  recommended_offer?: number | null;
  holding_months?: number | null;
  estimated_roi?: number | null;
}

function firstRelated<Row>(relation: Row | Row[] | null | undefined): Row | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation ?? null;
}

interface SimilarDealRaw {
  id: string;
  asking_price: number;
  offer_price: number | null;
  status: string;
  submitted_at: string;
  closed_at: string | null;
  property: ComparableProperty | ComparableProperty[] | null;
  underwriting: ComparableUnderwriting | ComparableUnderwriting[] | null;
}

export async function getDealRecommendations(dealId: string) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { recommendations: [], similarDeals: [], error: "Deal not found" };
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();
    const organizationId = profile?.organization_id;
    const legacyScope = `and(organization_id.is.null,or(agent_id.eq.${user.id},assigned_to.eq.${user.id}))`;

    // Get current deal with all details
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select(`
        *,
        property:properties(*),
        underwriting:underwriting_records(*)
      `)
      .eq("id", dealId)
      .or(organizationId ? `organization_id.eq.${organizationId},${legacyScope}` : legacyScope)
      .single();

    if (dealError || !deal) {
      return { recommendations: [], similarDeals: [], error: "Deal not found" };
    }

    const property = firstRelated<ComparableProperty>(deal.property);
    if (!organizationId) {
      return {
        recommendations: [],
        similarDeals: [],
        dealAddress: property?.address || "Unknown",
        dealCity: property?.city || "Unknown",
      };
    }

    const underwriting = firstRelated<ComparableUnderwriting>(deal.underwriting);
    if (!property?.city || !property.property_type) {
      return { recommendations: [], similarDeals: [], error: "Property details are unavailable for comparison" };
    }

    // Find similar successful deals in the same market
    const { data: similarDeals, error: similarError } = await supabase
      .from("deals")
      .select(`
        id,
        asking_price,
        offer_price,
        status,
        submitted_at,
        closed_at,
        property:properties!inner(address, city, property_type),
        underwriting:underwriting_records(*)
      `)
      .eq("status", "closed")
      .eq("organization_id", organizationId)
      .eq("property.city", property.city)
      .eq("property.property_type", property.property_type)
      .not("id", "eq", dealId)
      .order("submitted_at", { ascending: false })
      .limit(10);

    if (similarError) {
      console.error("Error fetching similar deals:", similarError);
      return { recommendations: [], similarDeals: [], error: "Could not load similar deals" };
    }

    const recommendations: DealRecommendation[] = [];
    const formattedSimilarDeals: SimilarDeal[] = [];
    const typedSimilarDeals: SimilarDealRaw[] = (similarDeals ?? []) as SimilarDealRaw[];

    if (typedSimilarDeals.length > 0) {
      typedSimilarDeals.forEach((d) => {
        const comparableProperty = firstRelated(d.property);
        const comparableUnderwriting = firstRelated(d.underwriting);
        if (comparableProperty) {
          formattedSimilarDeals.push({
            id: d.id,
            address: comparableProperty.address,
            city: comparableProperty.city,
            asking_price: d.asking_price,
            offer_price: d.offer_price,
            status: d.status,
            property_type: comparableProperty.property_type,
            submitted_at: d.submitted_at,
            closed_at: d.closed_at,
            holding_months: comparableUnderwriting?.holding_months ?? undefined,
            roi: comparableUnderwriting?.estimated_roi ?? undefined,
          });
        }
      });

      // Pricing Analysis
      const validDeals = typedSimilarDeals.filter((d) => d.offer_price && d.asking_price);
      if (validDeals.length >= 3) {
        const avgOfferPrice = validDeals.reduce((sum, d) => sum + (d.offer_price || 0), 0) / validDeals.length;
        const avgAskingPrice = validDeals.reduce((sum, d) => sum + d.asking_price, 0) / validDeals.length;
        const avgDiscount = ((avgAskingPrice - avgOfferPrice) / avgAskingPrice) * 100;

        if (underwriting?.recommended_offer) {
          const currentDiscount = ((deal.asking_price - underwriting.recommended_offer) / deal.asking_price) * 100;
          
          if (currentDiscount < avgDiscount - 5) {
            recommendations.push({
              type: "pricing",
              severity: "warning",
              message: `Your offer discount (${currentDiscount.toFixed(1)}%) is lower than similar successful deals (${avgDiscount.toFixed(1)}%).`,
              suggestedAction: `Consider negotiating to $${Math.round(deal.asking_price * (1 - avgDiscount / 100)).toLocaleString()}`,
              impact: `Potential savings: $${Math.round((underwriting.recommended_offer - deal.asking_price * (1 - avgDiscount / 100))).toLocaleString()}`,
            });
          } else if (currentDiscount > avgDiscount + 5) {
            recommendations.push({
              type: "pricing",
              severity: "success",
              message: `Your offer is ${(currentDiscount - avgDiscount).toFixed(1)}% more aggressive than market average.`,
              suggestedAction: "Strong negotiation position - good deal if accepted!",
              impact: `Above average discount compared to similar deals`,
            });
          }
        }
      }

      // Timeline Analysis
      const dealsWithTimeline = typedSimilarDeals.filter(
        (d) => (firstRelated(d.underwriting)?.holding_months ?? 0) > 0
      );
      if (dealsWithTimeline.length >= 3) {
        const avgHoldingMonths = dealsWithTimeline.reduce(
          (sum, d) => sum + (firstRelated(d.underwriting)?.holding_months || 6),
          0
        ) / dealsWithTimeline.length;
        
        if (underwriting?.holding_months) {
          if (underwriting.holding_months < avgHoldingMonths - 2) {
            recommendations.push({
              type: "timeline",
              severity: "warning",
              message: `Your ${underwriting.holding_months}-month timeline is optimistic. Similar deals averaged ${avgHoldingMonths.toFixed(1)} months.`,
              suggestedAction: `Budget for ${Math.ceil(avgHoldingMonths)} months of holding costs`,
              impact: `Additional $${Math.round((avgHoldingMonths - underwriting.holding_months) * 3000).toLocaleString()} in costs`,
            });
          } else if (underwriting.holding_months > avgHoldingMonths + 2) {
            recommendations.push({
              type: "timeline",
              severity: "info",
              message: `Your timeline (${underwriting.holding_months} months) is conservative compared to market average (${avgHoldingMonths.toFixed(1)} months).`,
              suggestedAction: "Consider if faster turnaround is possible to improve ROI",
            });
          }
        }
      }

      // ROI Comparison
      const dealsWithROI = typedSimilarDeals.filter(
        (d) => (firstRelated(d.underwriting)?.estimated_roi ?? 0) > 0
      );
      if (dealsWithROI.length >= 3 && underwriting?.estimated_roi) {
        const avgROI = dealsWithROI.reduce(
          (sum, d) => sum + (firstRelated(d.underwriting)?.estimated_roi || 0),
          0
        ) / dealsWithROI.length;

        if (underwriting.estimated_roi < avgROI - 10) {
          recommendations.push({
            type: "risk",
            severity: "warning",
            message: `Projected ROI (${underwriting.estimated_roi}%) is below market average (${avgROI.toFixed(1)}%).`,
            suggestedAction: "Review repair costs and ARV assumptions",
            impact: "Consider passing unless you can negotiate better terms",
          });
        } else if (underwriting.estimated_roi > avgROI + 15) {
          recommendations.push({
            type: "risk",
            severity: "info",
            message: `High ROI projection (${underwriting.estimated_roi}%) vs market average (${avgROI.toFixed(1)}%).`,
            suggestedAction: "Verify ARV and repair estimates are conservative",
            impact: "Double-check assumptions to avoid over-optimistic projections",
          });
        }
      }

      // Market Velocity
      if (validDeals.length >= 5) {
        const recentDeals = validDeals.filter((d) => {
          const daysAgo = Math.floor((Date.now() - new Date(d.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
          return daysAgo <= 90;
        });

        if (recentDeals.length >= 3) {
          recommendations.push({
            type: "market",
            severity: "success",
            message: `${recentDeals.length} similar deals closed in ${property.city} in the last 90 days.`,
            suggestedAction: "Active market - good liquidity for this property type",
            impact: "Higher confidence in exit strategy",
          });
        } else {
          recommendations.push({
            type: "market",
            severity: "warning",
            message: `Only ${recentDeals.length} similar deals in the last 90 days.`,
            suggestedAction: "Slower market - ensure exit strategy is solid",
            impact: "May take longer to sell after rehab",
          });
        }
      }
    } else {
      // No similar deals found
      recommendations.push({
        type: "market",
        severity: "info",
        message: "No similar deals found in this market for comparison.",
        suggestedAction: "Conduct additional market research or expand search criteria",
        impact: "Higher risk due to limited comparable data",
      });
    }

    return {
      recommendations,
      similarDeals: formattedSimilarDeals,
      dealAddress: property.address || "Unknown",
      dealCity: property.city || "Unknown",
    };
  } catch (error) {
    console.error("Error getting deal recommendations:", error);
    return {
      recommendations: [],
      similarDeals: [],
      error: "Failed to generate recommendations",
    };
  }
}
