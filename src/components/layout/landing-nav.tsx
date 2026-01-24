"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export function LandingNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">DealFlow</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/calculators" 
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            Calculators
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            Pricing
          </Link>
          
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-800" />
          ) : user ? (
            <Link 
              href="/dashboard" 
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
