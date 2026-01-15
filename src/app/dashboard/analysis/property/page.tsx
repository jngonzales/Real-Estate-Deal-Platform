import { Metadata } from "next";
import { PropertyLookup } from "@/components/deals/property-lookup";

export const metadata: Metadata = {
  title: "Property Lookup | DealFlow",
  description: "Look up property data, market values, and rental estimates using free public data sources"
};

export default function PropertyLookupPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Property Lookup</h1>
        <p className="text-muted-foreground mt-2">
          Get property data, market values, rental estimates, and deal analysis - powered by free public APIs
        </p>
      </div>
      
      <PropertyLookup />
    </div>
  );
}
