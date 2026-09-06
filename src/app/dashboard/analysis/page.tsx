"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "@/components/ui/icons";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import {
  formatWorksheetCurrency,
  worksheetAction,
  worksheetCard,
  worksheetFigure,
  worksheetGrid,
  worksheetInput,
  worksheetResult,
  WorksheetMoneyInput,
  WorksheetResultRow,
} from "@/app/calculators/_components/worksheet";

const analysisGroups = [
  {
    title: "Value the property",
    links: [
      { title: "ARV calculator", description: "Estimate after-repair value using sales, square footage, or income.", href: "/dashboard/analysis/arv" },
      { title: "Property lookup", description: "Find property details and available estimates.", href: "/dashboard/analysis/property" },
    ],
  },
  {
    title: "Set a budget and offer",
    links: [
      { title: "Repair estimator", description: "Build an itemized repair budget.", href: "/dashboard/analysis/repairs" },
      { title: "MAO calculator", description: "Find a maximum offer using costs and target profit.", href: "/dashboard/analysis/mao" },
    ],
  },
  {
    title: "Review returns",
    links: [
      { title: "ROI calculator", description: "Compare fix-and-flip, rental, and BRRRR returns.", href: "/dashboard/analysis/roi" },
      { title: "Formula builder", description: "Build a calculation for your own deal criteria.", href: "/dashboard/analysis/formula" },
    ],
  },
];

export default function AnalysisHubPage() {
  // Quick calculator state
  const [quickArv, setQuickArv] = useState<number>(250000);
  const [quickRepairs, setQuickRepairs] = useState<number>(35000);
  const [quickProfitMargin, setQuickProfitMargin] = useState<number>(20);

  // Quick calculations
  const mao70 = quickArv * 0.7 - quickRepairs;
  const maoCustom = quickArv * (1 - quickProfitMargin / 100) - quickRepairs - (quickArv * 0.08);
  const potentialProfit = quickArv - maoCustom - quickRepairs;

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading
        title="Deal analysis"
        description="Estimate the numbers behind your next offer."
        actions={<Button asChild variant="outline" className={worksheetAction}><Link href="/dashboard/submit">Submit a deal</Link></Button>}
      />

      <section aria-labelledby="quick-offer" className={worksheetGrid}>
        <Card className={worksheetCard}>
          <CardHeader>
            <h2 id="quick-offer" className="text-xl font-semibold tracking-tight">Quick offer estimate</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 items-end gap-3">
            <WorksheetMoneyInput id="quick-arv" label="After-repair value (ARV)" value={quickArv} setValue={setQuickArv} />
            <WorksheetMoneyInput id="quick-repairs" label="Estimated repairs" value={quickRepairs} setValue={setQuickRepairs} />
            <div className="min-w-0 space-y-2">
              <Label htmlFor="quick-profit">Target profit (%)</Label>
              <Input id="quick-profit" type="number" inputMode="decimal" value={quickProfitMargin} onChange={(e) => setQuickProfitMargin(Number(e.target.value))} className={worksheetInput} placeholder="20" />
            </div>
          </CardContent>
        </Card>
        <Card className={worksheetResult}>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Maximum offer</h2>
          </CardHeader>
          <CardContent>
            <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(maoCustom)}</p>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              <WorksheetResultRow label="70% rule offer" value={formatWorksheetCurrency(mao70)} />
              <WorksheetResultRow label="Potential profit" value={formatWorksheetCurrency(potentialProfit)} />
            </dl>
            <Button asChild className={worksheetAction + " mt-4"}>
              <Link href="/dashboard/analysis/mao">Open the MAO calculator <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="analysis-tools">
        <h2 id="analysis-tools" className="text-xl font-semibold tracking-tight">Analysis tools</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {analysisGroups.map(({ title, links }) => (
            <div key={title} className="min-w-0">
              <h3 className="mb-2 font-semibold">{title}</h3>
              <ul className="divide-y divide-border border-y border-border">
                {links.map((tool) => (
                  <li key={tool.href}>
                    <Link href={tool.href} className="group flex min-h-11 items-center justify-between gap-3 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                      <div className="min-w-0">
                        <span className="font-medium">{tool.title}</span>
                        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                      <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
