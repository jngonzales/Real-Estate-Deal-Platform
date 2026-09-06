'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface ShortcutCategory {
  name: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['g', 'd'], description: 'Go to Dashboard' },
      { keys: ['g', 'l'], description: 'Go to Deals List' },
      { keys: ['g', 'c'], description: 'Go to Calculators' },
      { keys: ['g', 's'], description: 'Go to Settings' },
    ],
  },
  {
    name: 'Deals',
    shortcuts: [
      { keys: ['n'], description: 'New Deal' },
      { keys: ['s'], description: 'Search Deals' },
      { keys: ['f'], description: 'Toggle Filters' },
      { keys: ['e'], description: 'Export Deals' },
    ],
  },
  {
    name: 'Global',
    shortcuts: [
      { keys: ['?'], description: 'Show Keyboard Shortcuts' },
      { keys: ['Esc'], description: 'Close Dialog/Modal' },
      { keys: ['Ctrl', 'k'], description: 'Command Palette' },
      { keys: ['Ctrl', 's'], description: 'Save Current Item' },
    ],
  },
  {
    name: 'Calculator',
    shortcuts: [
      { keys: ['c', 'r'], description: 'Rental Calculator' },
      { keys: ['c', 'w'], description: 'Wholesale Calculator' },
      { keys: ['c', 'f'], description: 'Flip Calculator' },
      { keys: ['c', 'b'], description: 'BRRRR Calculator' },
    ],
  },
];

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-1 min-w-7 text-xs font-medium border border-border rounded bg-muted/50">
      {children}
    </kbd>
  );
}

interface KeyboardShortcutsDialogProps {
  className?: string;
}

export function KeyboardShortcutsDialog({ className }: KeyboardShortcutsDialogProps) {
  const [open, setOpen] = useState(false);

  // Listen for ? key to open shortcuts dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only open if no input/textarea is focused and ? is pressed
      if (
        e.key === '?' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName
        )
      ) {
        e.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Keyboard className="h-5 w-5" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 mt-4">
          {SHORTCUTS.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, idx) => (
                        <span key={key} className="flex items-center">
                          <KeyBadge>{key}</KeyBadge>
                          {idx < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground text-xs">+</span>
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

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Press <KeyBadge>?</KeyBadge> anywhere to open this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
