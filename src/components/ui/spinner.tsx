import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
