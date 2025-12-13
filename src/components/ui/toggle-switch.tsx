import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
  size = "md",
  className,
}: ToggleSwitchProps) {
  const sizes = {
    sm: {
      track: "h-5 w-9",
      thumb: "h-3 w-3",
      translate: enabled ? "translate-x-4" : "translate-x-0.5",
    },
    md: {
      track: "h-6 w-11",
      thumb: "h-4 w-4",
      translate: enabled ? "translate-x-5" : "translate-x-1",
    },
    lg: {
      track: "h-7 w-14",
      thumb: "h-5 w-5",
      translate: enabled ? "translate-x-7" : "translate-x-1",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        sizeConfig.track,
        enabled 
          ? "bg-primary hover:bg-primary/90" 
          : "bg-muted hover:bg-muted/80",
        className
      )}
      role="switch"
      aria-checked={enabled}
    >
      <div
        className={cn(
          "rounded-full bg-background shadow-sm transition-transform",
          sizeConfig.thumb,
          sizeConfig.translate
        )}
      />
    </button>
  );
}
