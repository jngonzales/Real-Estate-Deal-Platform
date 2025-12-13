import { cn } from "@/lib/utils";

interface PremiumSkeletonProps {
  className?: string;
}

export function PremiumSkeleton({ className }: PremiumSkeletonProps) {
  return (
    <div
      className={cn(
        "shimmer rounded-lg bg-muted",
        className
      )}
    />
  );
}

// Pre-built loading states
export function DashboardLoadingPremium() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <PremiumSkeleton key={i} className="h-32" />
        ))}
      </div>
      <PremiumSkeleton className="h-96" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumSkeleton className="h-80" />
        <PremiumSkeleton className="h-80" />
      </div>
    </div>
  );
}

export function CardLoadingPremium() {
  return (
    <div className="space-y-4 p-6">
      <PremiumSkeleton className="h-8 w-1/3" />
      <PremiumSkeleton className="h-4 w-2/3" />
      <PremiumSkeleton className="h-64" />
    </div>
  );
}

export function TableLoadingPremium({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <PremiumSkeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <PremiumSkeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
