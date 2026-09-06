"use client"

import { CommandPalette, useKeyboardShortcuts } from "@/components/ui/command-palette"

export function TopbarClient() {
  // Enable keyboard shortcuts
  useKeyboardShortcuts()
  
  return (
    <div className="[&>button]:min-h-11 [&>button]:min-w-11 [&>button]:focus-visible:outline-2 [&>button]:focus-visible:outline-offset-2 [&>button]:focus-visible:outline-ring md:[&>button]:w-44 lg:[&>button]:w-64 max-md:[&>button>span]:sr-only max-md:[&>button>span]:inline">
      <CommandPalette />
    </div>
  )
}
