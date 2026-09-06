"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "@/components/ui/icons";

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
  category: string;
}

interface KeyboardShortcutsProps {
  enabled?: boolean;
}

export function KeyboardShortcuts({ enabled = true }: KeyboardShortcutsProps) {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);

  const shortcuts = useMemo<Shortcut[]>(() => [
    // Navigation
    { 
      keys: ["g", "d"], 
      description: "Go to Dashboard", 
      action: () => router.push("/dashboard"),
      category: "Navigation"
    },
    { 
      keys: ["g", "a"], 
      description: "Go to Analysis Hub", 
      action: () => router.push("/dashboard/analysis"),
      category: "Navigation"
    },
    { 
      keys: ["g", "n"], 
      description: "New Deal", 
      action: () => router.push("/dashboard/deals/new"),
      category: "Navigation"
    },
    { 
      keys: ["g", "f"], 
      description: "Go to Formulas", 
      action: () => router.push("/dashboard/formulas"),
      category: "Navigation"
    },
    { 
      keys: ["g", "p"], 
      description: "Go to Property Lookup", 
      action: () => router.push("/dashboard/analysis/property"),
      category: "Navigation"
    },
    { 
      keys: ["g", "s"], 
      description: "Go to Settings", 
      action: () => router.push("/dashboard/settings"),
      category: "Navigation"
    },
    // Calculators
    { 
      keys: ["c", "a"], 
      description: "ARV Calculator", 
      action: () => router.push("/dashboard/analysis/arv"),
      category: "Calculators"
    },
    { 
      keys: ["c", "m"], 
      description: "MAO Calculator", 
      action: () => router.push("/dashboard/analysis/mao"),
      category: "Calculators"
    },
    { 
      keys: ["c", "r"], 
      description: "ROI Calculator", 
      action: () => router.push("/dashboard/analysis/roi"),
      category: "Calculators"
    },
    { 
      keys: ["c", "f"], 
      description: "Formula Builder", 
      action: () => router.push("/dashboard/analysis/formula"),
      category: "Calculators"
    },
    // Global
    { 
      keys: ["?"], 
      description: "Show keyboard shortcuts", 
      action: () => setShowHelp(true),
      category: "Global"
    },
    { 
      keys: ["Escape"], 
      description: "Close dialogs", 
      action: () => setShowHelp(false),
      category: "Global"
    },
  ], [router]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" || 
      target.tagName === "TEXTAREA" || 
      target.isContentEditable
    ) {
      return;
    }

    // Handle single key shortcuts
    if (event.key === "?") {
      event.preventDefault();
      setShowHelp(true);
      return;
    }

    if (event.key === "Escape") {
      setShowHelp(false);
      return;
    }
  }, [enabled]);

  const handleSequence = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" || 
      target.tagName === "TEXTAREA" || 
      target.isContentEditable
    ) {
      return;
    }

    const now = Date.now();
    const key = event.key.toLowerCase();

    // If within 500ms of last key, check for sequence
    if (lastKey && now - lastKeyTime < 500) {
      const matchingShortcut = shortcuts.find(
        s => s.keys.length === 2 && 
        s.keys[0].toLowerCase() === lastKey && 
        s.keys[1].toLowerCase() === key
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
        setLastKey(null);
        return;
      }
    }

    // Store this key for potential sequence
    setLastKey(key);
    setLastKeyTime(now);
  }, [enabled, lastKey, lastKeyTime, shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleSequence);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleSequence);
    };
  }, [handleKeyDown, handleSequence]);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <Badge variant="outline" className="font-mono text-xs px-2">
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">then</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Press <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> 
            anytime to show this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to use keyboard shortcuts in components
export function useKeyboardShortcut(
  keys: string[], 
  callback: () => void, 
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    let lastKey: string | null = null;
    let lastKeyTime = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable
      ) {
        return;
      }

      const now = Date.now();
      const key = event.key.toLowerCase();

      if (keys.length === 1) {
        if (keys[0].toLowerCase() === key) {
          event.preventDefault();
          callback();
        }
      } else if (keys.length === 2) {
        if (lastKey && now - lastKeyTime < 500) {
          if (keys[0].toLowerCase() === lastKey && keys[1].toLowerCase() === key) {
            event.preventDefault();
            callback();
            lastKey = null;
            return;
          }
        }
        lastKey = key;
        lastKeyTime = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback, enabled]);
}
