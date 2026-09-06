import { Metadata } from "next";
import { SavedFormulas } from "@/components/deals/saved-formulas";

export const metadata: Metadata = {
  title: "My Formulas | LotMerit",
  description: "View and manage your saved deal analysis formulas"
};

export default function MyFormulasPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Formulas</h1>
        <p className="text-muted-foreground mt-2">
          Create, save, and share custom deal analysis formulas
        </p>
      </div>
      
      <SavedFormulas />
    </div>
  );
}
