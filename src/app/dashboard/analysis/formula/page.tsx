import { FormulaBuilder } from "@/components/deals/formula-builder";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export const metadata = {
  title: "Formula Builder | LotMerit",
  description: "Create custom deal evaluation formulas",
};

export default function FormulaBuilderPage() {
  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading title="Formula builder" description="Build and test a calculation for your deals." />
      <FormulaBuilder />
    </div>
  );
}
