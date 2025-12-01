"use client"

import { CommandPalette, useKeyboardShortcuts } from "@/components/ui/command-palette"

export function TopbarClient() {
  // Enable keyboard shortcuts
  useKeyboardShortcuts()
  
  return <CommandPalette />
}
