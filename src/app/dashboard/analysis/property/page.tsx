import { Metadata } from "next";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { PropertyLookup } from "@/components/deals/property-lookup";

export const metadata: Metadata = {
  title: "Property Lookup | LotMerit",
  description: "Look up property data, market values, and rental estimates using free public data sources"
};

export default function PropertyLookupPage() {
  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading title="Property lookup" description="Look up property details, estimates, and comparable sales." />
      <PropertyLookup />
    </div>
  );
}
