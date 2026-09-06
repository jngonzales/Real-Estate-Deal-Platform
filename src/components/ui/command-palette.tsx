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
} from "@/components/ui/icons"
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
        className="flex w-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:w-64 md:justify-start"
      >
        <Search className="h-4 w-4 shrink-0" />
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
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              keywords={["home", "main", "overview", "start", "index"]}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/deals"))}
              keywords={["properties", "listings", "pipeline", "submissions", "all deals", "my deals"]}
            >
              <FileText className="mr-2 h-4 w-4" />
              All Deals
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/submit"))}
              keywords={["create", "add", "new deal", "submit deal", "new property", "add deal"]}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit New Deal
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/analytics"))}
              keywords={["reports", "stats", "metrics", "charts", "graphs", "performance", "data"]}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/notifications"))}
              keywords={["alerts", "messages", "updates", "inbox"]}
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/contacts"))}
              keywords={["sellers", "buyers", "leads", "people", "clients", "contacts list"]}
            >
              <Users className="mr-2 h-4 w-4" />
              Contacts
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/team"))}
              keywords={["members", "invite", "organization", "teammates", "staff", "employees"]}
            >
              <Users className="mr-2 h-4 w-4" />
              Team Management
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Calculators">
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/analysis/arv"))}
              keywords={["after repair value", "property value", "estimated value", "comp analysis"]}
            >
              <Calculator className="mr-2 h-4 w-4" />
              ARV Calculator
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/analysis/mao"))}
              keywords={["maximum allowable offer", "offer price", "70 rule", "wholesale"]}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              MAO Calculator
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/analysis/repairs"))}
              keywords={["rehab", "renovation", "fix up", "repair costs", "construction"]}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Repair Estimator
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/analysis/roi"))}
              keywords={["return on investment", "profit", "cash on cash", "yield", "returns"]}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              ROI Calculator
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Admin">
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/admin/users"))}
              keywords={["manage users", "add user", "permissions", "roles", "access"]}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/admin/funding"))}
              keywords={["money", "capital", "investors", "finance", "loans"]}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Funding Requests
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
              keywords={["preferences", "account", "profile", "configuration", "options"]}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem 
              onSelect={() => runCommand(() => setTheme("light"))}
              keywords={["bright", "day", "white", "appearance"]}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </CommandItem>
            <CommandItem 
              onSelect={() => runCommand(() => setTheme("dark"))}
              keywords={["night", "black", "appearance"]}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
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
