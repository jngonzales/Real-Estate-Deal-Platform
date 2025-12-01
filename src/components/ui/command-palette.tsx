"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  FileText,
  PlusCircle,
  Settings,
  Users,
  BarChart3,
  Bell,
  Search,
  Calculator,
  DollarSign,
  Moon,
  Sun,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTheme } from "@/components/providers/theme-provider"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      {/* Search button trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/deals"))}>
              <FileText className="mr-2 h-4 w-4" />
              All Deals
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/submit"))}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit New Deal
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/analytics"))}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/notifications"))}>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Admin">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/admin/users"))}>
              <Users className="mr-2 h-4 w-4" />
              User Management
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/admin/funding"))}>
              <DollarSign className="mr-2 h-4 w-4" />
              Funding Management
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/submit"))}>
              <Calculator className="mr-2 h-4 w-4" />
              New Underwriting
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

// Keyboard shortcut hooks for additional shortcuts
export function useKeyboardShortcuts() {
  const router = useRouter()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "d":
            e.preventDefault()
            router.push("/dashboard")
            break
          case "l":
            e.preventDefault()
            router.push("/dashboard/deals")
            break
          case "n":
            e.preventDefault()
            router.push("/dashboard/submit")
            break
          case ",":
            e.preventDefault()
            router.push("/dashboard/settings")
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])
}
