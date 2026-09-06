"use client";

import { useState, useRef } from "react";
import { 
  FileText, 
  Loader2,
  Printer,
  Download,
  Building2
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Deal {
  id: string;
  title: string;
  status: string;
  property_address?: string;
  property_type?: string;
  asking_price?: number;
  estimated_arv?: number;
  estimated_repair_cost?: number;
  mao?: number;
  cap_rate?: number;
  cash_on_cash?: number;
  noi?: number;
  ai_score?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface DealReportProps {
  deal: Deal;
  onClose?: () => void;
}

export function DealReport({ deal }: DealReportProps) {
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "N/A";
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number | undefined) => {
    if (!value) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  const calculateROI = () => {
    if (deal.estimated_arv && deal.asking_price && deal.estimated_repair_cost) {
      const totalInvestment = deal.asking_price + deal.estimated_repair_cost;
      const profit = deal.estimated_arv - totalInvestment;
      return (profit / totalInvestment) * 100;
    }
    return undefined;
  };

  const calculateSpread = () => {
    if (deal.mao && deal.asking_price) {
      return deal.mao - deal.asking_price;
    }
    return undefined;
  };

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Deal Report - ${deal.title}</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                  color: #1a1a1a;
                }
                h1 { 
                  color: #2563eb; 
                  border-bottom: 3px solid #2563eb;
                  padding-bottom: 10px;
                }
                h2 { 
                  color: #374151; 
                  margin-top: 30px;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 5px;
                }
                .metric { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 10px 0; 
                  border-bottom: 1px solid #f3f4f6;
                }
                .metric-label { color: #6b7280; }
                .metric-value { font-weight: 600; }
                .highlight { 
                  background: #dbeafe; 
                  padding: 15px; 
                  border-radius: 8px; 
                  margin: 20px 0;
                }
                .score {
                  font-size: 48px;
                  font-weight: bold;
                  color: ${(deal.ai_score || 0) >= 70 ? '#22c55e' : (deal.ai_score || 0) >= 50 ? '#eab308' : '#ef4444'};
                  text-align: center;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #e5e7eb;
                  text-align: center;
                  color: #6b7280;
                  font-size: 12px;
                }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <h1>Deal Analysis Report</h1>
              <h2>${deal.title}</h2>
              ${deal.property_address ? `<p><strong>Address:</strong> ${deal.property_address}</p>` : ''}
              <p><strong>Property Type:</strong> ${deal.property_type || 'Not specified'}</p>
              <p><strong>Status:</strong> ${deal.status.replace('_', ' ').toUpperCase()}</p>
              
              ${deal.ai_score ? `
                <div class="highlight">
                  <h2 style="margin-top: 0;">AI Score</h2>
                  <div class="score">${deal.ai_score}/100</div>
                </div>
              ` : ''}
              
              <h2>Financial Summary</h2>
              <div class="metric">
                <span class="metric-label">Asking Price</span>
                <span class="metric-value">${formatCurrency(deal.asking_price)}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Estimated ARV</span>
                <span class="metric-value">${formatCurrency(deal.estimated_arv)}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Repair Costs</span>
                <span class="metric-value">${formatCurrency(deal.estimated_repair_cost)}</span>
              </div>
              <div class="metric">
                <span class="metric-label">MAO (Max Allowable Offer)</span>
                <span class="metric-value">${formatCurrency(deal.mao)}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Spread (MAO - Asking)</span>
                <span class="metric-value">${formatCurrency(calculateSpread())}</span>
              </div>
              
              <h2>Investment Metrics</h2>
              <div class="metric">
                <span class="metric-label">Estimated ROI</span>
                <span class="metric-value">${formatPercent(calculateROI())}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Cap Rate</span>
                <span class="metric-value">${formatPercent(deal.cap_rate)}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Cash on Cash Return</span>
                <span class="metric-value">${formatPercent(deal.cash_on_cash)}</span>
              </div>
              <div class="metric">
                <span class="metric-label">NOI</span>
                <span class="metric-value">${formatCurrency(deal.noi)}</span>
              </div>
              
              ${deal.notes ? `
                <h2>Notes</h2>
                <p>${deal.notes}</p>
              ` : ''}
              
              <div class="footer">
                <p>Generated by LotMerit on ${new Date().toLocaleDateString()}</p>
                <p>Report Date: ${new Date().toLocaleString()}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadHTML = () => {
    setGenerating(true);
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>Deal Report - ${deal.title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
      h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
      h2 { color: #374151; margin-top: 30px; }
      .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
      .highlight { background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center; }
      .score { font-size: 64px; font-weight: bold; color: ${(deal.ai_score || 0) >= 70 ? '#22c55e' : '#eab308'}; }
    </style>
  </head>
  <body>
    <h1>Deal Analysis Report: ${deal.title}</h1>
    <p><strong>Address:</strong> ${deal.property_address || 'N/A'}</p>
    <p><strong>Property Type:</strong> ${deal.property_type || 'N/A'}</p>
    <p><strong>Status:</strong> ${deal.status.replace('_', ' ')}</p>
    ${deal.ai_score ? `<div class="highlight"><div class="score">${deal.ai_score}/100</div><p>AI Score</p></div>` : ''}
    <h2>Financials</h2>
    <div class="metric"><span>Asking Price</span><span>${formatCurrency(deal.asking_price)}</span></div>
    <div class="metric"><span>ARV</span><span>${formatCurrency(deal.estimated_arv)}</span></div>
    <div class="metric"><span>Repairs</span><span>${formatCurrency(deal.estimated_repair_cost)}</span></div>
    <div class="metric"><span>MAO</span><span>${formatCurrency(deal.mao)}</span></div>
    <div class="metric"><span>ROI</span><span>${formatPercent(calculateROI())}</span></div>
    <p style="color: #888; margin-top: 40px; text-align: center;">Generated by LotMerit - ${new Date().toLocaleString()}</p>
  </body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deal-report-${deal.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const roi = calculateROI();
  const spread = calculateSpread();

  return (
    <Card className="w-full max-w-3xl mx-auto" ref={reportRef}>
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{deal.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {deal.property_address || "No address specified"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadHTML}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Status and Type */}
        <div className="flex items-center gap-3">
          <Badge className="capitalize">{deal.status.replace("_", " ")}</Badge>
          {deal.property_type && (
            <Badge variant="outline" className="capitalize">
              {deal.property_type.replace("_", " ")}
            </Badge>
          )}
        </div>

        {/* AI Score */}
        {deal.ai_score && (
          <div className="bg-linear-to-r from-primary/10 to-primary/5 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">AI Deal Score</p>
            <div className={`text-5xl font-bold ${
              deal.ai_score >= 70 ? "text-green-500" : 
              deal.ai_score >= 50 ? "text-yellow-500" : "text-red-500"
            }`}>
              {deal.ai_score}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
          </div>
        )}

        <Separator />

        {/* Financial Summary */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Financial Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asking Price</span>
                <span className="font-medium">{formatCurrency(deal.asking_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated ARV</span>
                <span className="font-medium">{formatCurrency(deal.estimated_arv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repair Costs</span>
                <span className="font-medium">{formatCurrency(deal.estimated_repair_cost)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">MAO</span>
                <span className="font-medium">{formatCurrency(deal.mao)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spread</span>
                <span className={`font-medium ${(spread || 0) > 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(spread)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. ROI</span>
                <span className={`font-medium ${(roi || 0) >= 20 ? "text-green-500" : "text-yellow-500"}`}>
                  {formatPercent(roi)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Investment Metrics */}
        <div>
          <h3 className="font-semibold mb-4">Investment Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{formatPercent(deal.cap_rate)}</p>
              <p className="text-sm text-muted-foreground">Cap Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{formatPercent(deal.cash_on_cash)}</p>
              <p className="text-sm text-muted-foreground">Cash on Cash</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{formatCurrency(deal.noi)}</p>
              <p className="text-sm text-muted-foreground">NOI</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {deal.notes && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{deal.notes}</p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-4 border-t text-center text-sm text-muted-foreground">
          Generated by LotMerit • {new Date().toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
