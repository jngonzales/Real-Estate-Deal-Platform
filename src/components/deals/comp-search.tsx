"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Home,
  MapPin,
  Calendar,
  Ruler,
  Bed,
  Bath,
  CheckCircle,
  X,
  Database,
} from "@/components/ui/icons";
import { toast } from "sonner";

interface Comp {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  sale_price: number;
  sale_date: string;
  price_per_sqft: number | null;
  condition: string | null;
  verified: boolean;
}

interface CompSearchProps {
  onSelectComp: (comp: Comp) => void;
  selectedCompIds?: string[];
  maxComps?: number;
  triggerLabel?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CompSearch({
  onSelectComp,
  selectedCompIds = [],
  maxComps = 10,
  triggerLabel = "Search My Comps",
}: CompSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comps, setComps] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    async function searchComps() {
      try {
        let query = supabase
          .from("comps")
          .select(
            "id, address, city, state, zip, property_type, bedrooms, bathrooms, sqft, sale_price, sale_date, price_per_sqft, condition, verified"
          )
          .order("sale_date", { ascending: false })
          .limit(50);

        if (searchQuery) {
          query = query.or(
            `address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,zip.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;
        if (!active) return;
        if (error) throw error;

        setComps(data || []);
      } catch (error) {
        if (active) {
          console.error("Error searching comps:", error);
          toast.error("Failed to search comparables");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const debounce = searchQuery ? setTimeout(searchComps, 300) : undefined;
    if (!searchQuery) void searchComps();

    return () => {
      active = false;
      clearTimeout(debounce);
    };
  }, [isOpen, searchQuery, supabase]);

  const handleOpenChange = (open: boolean) => {
    if (open) setLoading(true);
    setIsOpen(open);
  };

  const handleSearchChange = (query: string) => {
    if (query === searchQuery) return;
    setLoading(true);
    setSearchQuery(query);
  };

  const handleSelect = (comp: Comp) => {
    if (selectedCompIds.length >= maxComps) {
      toast.error(`Maximum ${maxComps} comps allowed`);
      return;
    }
    onSelectComp(comp);
    toast.success("Comp added to analysis");
  };

  const filteredComps = comps.filter(
    (comp) => !selectedCompIds.includes(comp.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Database className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Search My Comparables
          </DialogTitle>
          <DialogDescription>
            Select from your saved comparable sales to use in your ARV analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address, city, or ZIP..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredComps.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No comps found" : "No comps in your database"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Add comps from the My Comps page first"}
              </p>
            </div>
          ) : (
            filteredComps.map((comp) => (
              <Card
                key={comp.id}
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                onClick={() => handleSelect(comp)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium truncate">{comp.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {comp.city}, {comp.state} {comp.zip}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {comp.bedrooms || "-"} bed
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          {comp.bathrooms || "-"} bath
                        </span>
                        {comp.sqft && (
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            {comp.sqft.toLocaleString()} sqft
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(comp.sale_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(comp.sale_price)}
                      </p>
                      {comp.price_per_sqft && (
                        <p className="text-sm text-muted-foreground">
                          ${comp.price_per_sqft.toFixed(0)}/sqft
                        </p>
                      )}
                      {comp.verified && (
                        <Badge variant="default" className="mt-1 bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component for displaying selected comps with remove functionality
interface SelectedCompsListProps {
  comps: Comp[];
  onRemove: (id: string) => void;
}

export function SelectedCompsList({ comps, onRemove }: SelectedCompsListProps) {
  if (comps.length === 0) return null;

  return (
    <div className="space-y-2">
      {comps.map((comp) => (
        <div
          key={comp.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
        >
          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium text-sm">{comp.address}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatCurrency(comp.sale_price)}</span>
                {comp.sqft && <span>• {comp.sqft.toLocaleString()} sqft</span>}
                {comp.price_per_sqft && (
                  <span>• ${comp.price_per_sqft.toFixed(0)}/sqft</span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(comp.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
