import { Metadata } from "next";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { SavedFormulas } from "@/components/deals/saved-formulas";

export const metadata: Metadata = {
  title: "My Formulas | LotMerit",
  description: "View and manage your saved deal analysis formulas"
};

export default function MyFormulasPage() {
  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading title="My formulas" description="Find, edit, and share your saved calculations." />
      <SavedFormulas />
    </div>
  );
}
