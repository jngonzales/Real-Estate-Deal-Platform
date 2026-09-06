"use client";

import { useState } from "react";
import { 
  Plus, 
  Calculator,
  Sparkles,
  ArrowRight,
  Home,
  MapPin,
  BarChart3
} from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "New Deal",
    description: "Submit a new deal for analysis",
    icon: <Plus className="h-5 w-5" />,
    href: "/dashboard/deals/new",
    color: "text-emerald-500",
    bgColor: "bg-primary/10 hover:bg-primary/15"
  },
  {
    title: "ARV Calculator",
    description: "Calculate after repair value",
    icon: <Home className="h-5 w-5" />,
    href: "/dashboard/analysis/arv",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10 hover:bg-muted/20"
  },
  {
    title: "Property Lookup",
    description: "Find property data & comps",
    icon: <MapPin className="h-5 w-5" />,
    href: "/dashboard/analysis/property",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10 hover:bg-muted/20"
  },
  {
    title: "Formula Builder",
    description: "Create custom calculations",
    icon: <Calculator className="h-5 w-5" />,
    href: "/dashboard/analysis/formula",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10 hover:bg-muted/20"
  },
  {
    title: "My Formulas",
    description: "View saved formulas",
    icon: <Sparkles className="h-5 w-5" />,
    href: "/dashboard/formulas",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10 hover:bg-muted/20"
  },
  {
    title: "Analytics",
    description: "View deal performance",
    icon: <BarChart3 className="h-5 w-5" />,
    href: "/dashboard/analytics",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10 hover:bg-muted/20"
  }
];

interface QuickActionsProps {
  className?: string;
  compact?: boolean;
}

export function QuickActions({ className, compact = false }: QuickActionsProps) {
  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.slice(0, 4).map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn("h-auto flex-col items-start p-3 gap-1", action.bgColor)}
              asChild
            >
              <Link href={action.href}>
                <div className={cn("flex items-center gap-2", action.color)}>
                  {action.icon}
                  <span className="font-medium">{action.title}</span>
                </div>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className={cn(
              "p-4 rounded-lg border transition-all cursor-pointer group",
              action.bgColor,
              "hover:shadow-md hover:scale-[1.02]"
            )}>
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg", action.bgColor, action.color)}>
                  {action.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-medium mt-3">{action.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Floating Action Button for mobile
export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Expanded Actions */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-48 bg-background border rounded-lg shadow-lg p-2 space-y-1">
          {QUICK_ACTIONS.slice(0, 4).map((action, index) => (
            <Link key={index} href={action.href}>
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-md",
                action.bgColor
              )}>
                <span className={action.color}>{action.icon}</span>
                <span className="text-sm font-medium">{action.title}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* FAB Button */}
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className={cn(
          "h-6 w-6 transition-transform",
          isOpen && "rotate-45"
        )} />
      </Button>
    </div>
  );
}
