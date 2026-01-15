"use client";

import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <KeyboardShortcuts />
    </>
  );
}
