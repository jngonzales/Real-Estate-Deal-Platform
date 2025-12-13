"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Clock,
  DollarSign,
  BarChart3,
  Shield
} from "lucide-react";
import { getDealRecommendations } from "@/lib/actions/recommendation-actions";
import type { DealRecommendation, SimilarDeal } from "@/lib/actions/recommendation-actions";

interface DealRecommendationsProps {
  dealId: string;
}

const severityConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-900 dark:text-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    textColor: "text-amber-900 dark:text-amber-100",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-900 dark:text-green-100",
  },
};

const typeConfig = {
  pricing: { label: "Pricing", icon: DollarSign },
  timeline: { label: "Timeline", icon: Clock },
  market: { label: "Market", icon: TrendingUp },
  financing: { label: "Financing", icon: BarChart3 },
  risk: { label: "Risk", icon: Shield },
};

export function DealRecommendations({ dealId }: DealRecommendationsProps) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<DealRecommendation[]>([]);
  const [similarDeals, setSimilarDeals] = useState<SimilarDeal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const result = await getDealRecommendations(dealId);
        if (result.error) {
          setError(result.error);
        } else {
          setRecommendations(result.recommendations);
          setSimilarDeals(result.similarDeals);
        }
      } catch (err) {
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [dealId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Analyzing similar deals...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Based on {similarDeals.length} similar deal{similarDeals.length !== 1 ? 's' : ''} in this market
              </CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Not enough data to generate recommendations yet.
              </p>
            </div>
          ) : (
            recommendations.map((rec, idx) => {
              const severity = severityConfig[rec.severity];
              const type = typeConfig[rec.type];
              const Icon = severity.icon;
              const TypeIcon = type.icon;

              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 ${severity.bgColor} ${severity.borderColor}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${severity.bgColor}`}>
                      <Icon className={`h-4 w-4 ${severity.iconColor}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`h-4 w-4 ${severity.iconColor}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wide ${severity.iconColor}`}>
                          {type.label}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${severity.textColor}`}>
                        {rec.message}
                      </p>
                      {rec.suggestedAction && (
                        <p className={`text-xs ${severity.textColor} opacity-80`}>
                          💡 {rec.suggestedAction}
                        </p>
                      )}
                      {rec.impact && (
                        <p className={`text-xs font-medium ${severity.iconColor}`}>
                          {rec.impact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Similar Deals */}
      {similarDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Deals</CardTitle>
            <CardDescription>
              Recent closed deals in the same market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {similarDeals.slice(0, 5).map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{deal.address}</p>
                    <p className="text-xs text-muted-foreground">{deal.city} • {deal.property_type}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      ${(deal.offer_price || 0).toLocaleString()}
                    </p>
                    {deal.roi && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {deal.roi}% ROI
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
