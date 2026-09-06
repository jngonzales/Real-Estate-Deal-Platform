import type { ComponentProps, ReactNode } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const worksheetCard =
  "flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card py-4 text-foreground shadow-none sm:py-6 [&>[data-slot=card-header]]:px-4 [&>[data-slot=card-content]]:px-4 sm:[&>[data-slot=card-header]]:px-6 sm:[&>[data-slot=card-content]]:px-6";

export const worksheetGrid =
  "grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6";

export const worksheetInput =
  "h-11 border-input bg-background text-base text-foreground tabular-nums shadow-none dark:bg-background md:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-0";

export const worksheetResult = worksheetCard.replace("bg-card", "bg-muted");

export const worksheetFigure =
  "text-4xl font-semibold leading-none tracking-tight text-primary tabular-nums [overflow-wrap:anywhere] sm:text-5xl";

export const worksheetTabs =
  "grid h-auto w-full rounded-none border-b border-border bg-transparent p-0";

export const worksheetTab =
  "relative min-h-11 min-w-0 h-full rounded-none border-0 border-b-2 border-transparent px-1 text-sm leading-tight whitespace-normal shadow-none transition-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent sm:px-3";

export const worksheetPanelFocus =
  "min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export const worksheetAction =
  "min-h-11 max-w-full rounded-lg whitespace-normal transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-0";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatWorksheetCurrency(value: number) {
  return Number.isFinite(value) ? currency.format(value) : "Unavailable";
}

export function formatWorksheetPercent(value: number, fractionDigits = 1) {
  return Number.isFinite(value) ? value.toFixed(fractionDigits) + "%" : "Unavailable";
}

export function WorksheetResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 text-sm">
      <dt className="min-w-0 text-muted-foreground [overflow-wrap:anywhere]">{label}</dt>
      <dd className="max-w-[55%] min-w-0 shrink-0 text-end font-medium tabular-nums [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

export function CalculatorFrame({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <main id={id} tabIndex={id ? -1 : undefined} className="mx-auto w-full max-w-7xl px-4 py-7 text-foreground sm:px-6 sm:py-10 lg:px-8">
      {children}
    </main>
  );
}

export function CalculatorHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-5 sm:mb-7">
      <h1 className="lm-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </header>
  );
}

export function WorksheetMoneyInput({ id, label, value, setValue }: {
  id: string;
  label: string;
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label} <span className="sr-only"> in dollars</span></Label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-muted-foreground">$</span>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className={worksheetInput + " ps-7"}
        />
      </div>
    </div>
  );
}

type WorksheetSliderProps = Pick<ComponentProps<typeof SliderPrimitive.Root>, "min" | "max" | "step" | "onValueChange"> & {
  labelId: string;
  value: [number];
  valueText?: string;
};

export function WorksheetSlider({ labelId, valueText, ...props }: WorksheetSliderProps) {
  return (
    <SliderPrimitive.Root className="relative flex min-h-11 w-full touch-none select-none items-center" {...props}>
      <SliderPrimitive.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-labelledby={labelId}
        aria-valuetext={valueText}
        className="relative block size-4 rounded-full border border-primary bg-background outline-none after:absolute after:-inset-3.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </SliderPrimitive.Root>
  );
}
