import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { lookupProperty, estimateARV, calculateRentToPriceRatio } from '@/lib/integrations/property-data';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { address, purchasePrice, condition, bedrooms } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Lookup property data from free sources
    const result = await lookupProperty(address);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Property not found' },
        { status: 404 }
      );
    }

    // Calculate additional metrics if purchase price provided
    const propertyData = result.data;
    let analysis = null;

    if (purchasePrice && purchasePrice > 0) {
      const arvEstimate = estimateARV(propertyData, condition || 'good');
      const rentToPrice = calculateRentToPriceRatio(propertyData, purchasePrice, bedrooms);
      
      // Calculate 70% rule MAO
      const mao70Rule = arvEstimate ? (arvEstimate * 0.7) - (purchasePrice * 0.15) : null;
      
      // Calculate potential profit
      const potentialProfit = arvEstimate ? arvEstimate - purchasePrice - (purchasePrice * 0.15) : null;
      
      // Calculate ROI
      const roi = potentialProfit && purchasePrice > 0 
        ? (potentialProfit / purchasePrice) * 100 
        : null;

      analysis = {
        arvEstimate,
        mao70Rule,
        potentialProfit,
        roi: roi ? Math.round(roi * 100) / 100 : null,
        rentToPrice: rentToPrice ? Math.round(rentToPrice * 100) / 100 : null,
        fairMarketRent: propertyData.fairMarketRent,
        medianRent: propertyData.medianRent,
        medianHomeValue: propertyData.medianHomeValue,
        medianIncome: propertyData.medianIncome,
        recommendation: getRecommendation(roi, rentToPrice)
      };
    }

    return NextResponse.json({
      success: true,
      property: propertyData,
      analysis,
      dataSources: propertyData.sources
    });
  } catch (error) {
    console.error('Property lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup property' },
      { status: 500 }
    );
  }
}

function getRecommendation(roi: number | null, rentToPrice: number | null): string {
  if (roi === null && rentToPrice === null) {
    return 'Insufficient data for recommendation';
  }

  const scores: string[] = [];

  if (roi !== null) {
    if (roi >= 30) scores.push('Excellent ROI potential');
    else if (roi >= 20) scores.push('Good ROI potential');
    else if (roi >= 10) scores.push('Moderate ROI');
    else scores.push('Low ROI - proceed with caution');
  }

  if (rentToPrice !== null) {
    if (rentToPrice >= 1) scores.push('Strong rental income (1%+ rule)');
    else if (rentToPrice >= 0.8) scores.push('Decent rental income');
    else scores.push('Below-market rental potential');
  }

  return scores.join('. ') || 'Analysis complete';
}
