import { FormulaBuilder } from "@/components/deals/formula-builder";

export const metadata = {
  title: "Formula Builder | LotMerit",
  description: "Create custom deal evaluation formulas",
};

export default function FormulaBuilderPage() {
  return (
    <div className="container mx-auto py-6">
      <FormulaBuilder />
    </div>
  );
}
