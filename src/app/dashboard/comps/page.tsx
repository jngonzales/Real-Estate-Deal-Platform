"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { formatWorksheetCurrency, worksheetAction, worksheetCard, worksheetInput } from "@/app/calculators/_components/worksheet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MapPin, Calendar, Bed, Bath, Trash2, CheckCircle, AlertCircle, Filter } from "@/components/ui/icons";
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
  lot_size: number | null;
  year_built: number | null;
  sale_price: number;
  sale_date: string;
  price_per_sqft: number | null;
  condition: string | null;
  was_renovated: boolean;
  source: string;
  verified: boolean;
  is_public: boolean;
  notes: string | null;
  created_at: string;
  submitted_by: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return "Unavailable";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const propertyTypes = [
  { value: "single_family", label: "Single Family" },
  { value: "townhouse", label: "Townhouse" },
  { value: "condo", label: "Condo" },
  { value: "multi_family", label: "Multi Family" },
  { value: "land", label: "Land" },
];

const conditions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "distressed", label: "Distressed" },
];

export default function CompsPage() {
  const [comps, setComps] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [stats, setStats] = useState({
    totalComps: 0,
    avgPricePerSqft: 0,
    avgSalePrice: 0,
    verifiedCount: 0,
  });

  // Form state for adding new comp
  const [newComp, setNewComp] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    property_type: "single_family",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    lot_size: "",
    year_built: "",
    sale_price: "",
    sale_date: "",
    condition: "good",
    was_renovated: false,
    notes: "",
    is_public: false,
  });

  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function fetchComps() {
      const { data, error } = await supabase
        .from("comps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }

    void fetchComps().then(
      (data) => {
        if (!active) return;
        setComps(data);
        if (data.length > 0) {
          const verified = data.filter((c) => c.verified).length;
          const avgPpsf = data.reduce((acc, c) => acc + (c.price_per_sqft || 0), 0) / data.length;
          const avgPrice = data.reduce((acc, c) => acc + c.sale_price, 0) / data.length;
          setStats({
            totalComps: data.length,
            avgPricePerSqft: avgPpsf,
            avgSalePrice: avgPrice,
            verifiedCount: verified,
          });
        }
        setLoading(false);
      },
      (error) => {
        if (!active) return;
        console.error("Error fetching comps:", error);
        setLoadError(true);
        setLoading(false);
        toast.error("Failed to load comparables");
      }
    );

    return () => { active = false; };
  }, [supabase, refreshCount]);

  const refreshComps = () => {
    setLoading(true);
    setLoadError(false);
    setRefreshCount(current => current + 1);
  };

  const handleSubmitComp = async () => {
    try {
      // Get user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add comps");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      const compData = {
        organization_id: profile?.organization_id,
        submitted_by: user.id,
        address: newComp.address,
        city: newComp.city,
        state: newComp.state,
        zip: newComp.zip,
        property_type: newComp.property_type,
        bedrooms: newComp.bedrooms ? parseInt(newComp.bedrooms) : null,
        bathrooms: newComp.bathrooms ? parseFloat(newComp.bathrooms) : null,
        sqft: newComp.sqft ? parseInt(newComp.sqft) : null,
        lot_size: newComp.lot_size ? parseInt(newComp.lot_size) : null,
        year_built: newComp.year_built ? parseInt(newComp.year_built) : null,
        sale_price: parseInt(newComp.sale_price),
        sale_date: newComp.sale_date,
        condition: newComp.condition,
        was_renovated: newComp.was_renovated,
        notes: newComp.notes || null,
        is_public: newComp.is_public,
        source: "user_submitted",
      };

      const { error } = await supabase.from("comps").insert(compData);

      if (error) throw error;

      toast.success("Comparable added successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      refreshComps();
    } catch (error) {
      console.error("Error adding comp:", error);
      toast.error("Failed to add comparable");
    }
  };

  const handleDeleteComp = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comparable?")) return;

    try {
      const { error } = await supabase.from("comps").delete().eq("id", id);
      if (error) throw error;
      toast.success("Comparable deleted");
      refreshComps();
    } catch (error) {
      console.error("Error deleting comp:", error);
      toast.error("Failed to delete comparable");
    }
  };

  const resetForm = () => {
    setNewComp({
      address: "",
      city: "",
      state: "",
      zip: "",
      property_type: "single_family",
      bedrooms: "",
      bathrooms: "",
      sqft: "",
      lot_size: "",
      year_built: "",
      sale_price: "",
      sale_date: "",
      condition: "good",
      was_renovated: false,
      notes: "",
      is_public: false,
    });
  };

  // Filter comps
  const filteredComps = comps.filter((comp) => {
    const matchesSearch =
      searchQuery === "" ||
      comp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.zip.includes(searchQuery);

    const matchesType =
      filterType === "all" || comp.property_type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading
        title="My comparables"
        description="Review and manage the sales you use to estimate property value."
        actions={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className={worksheetAction}>
                <Plus aria-hidden="true" />
                Add Comparable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Comparable</DialogTitle>
                <DialogDescription>
                  Enter details about the comparable sale to add to your database.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Location */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Location</h4>
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={newComp.address}
                        onChange={(e) => setNewComp({ ...newComp, address: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid min-w-0 grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={newComp.city}
                          onChange={(e) => setNewComp({ ...newComp, city: e.target.value })}
                          placeholder="Houston"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={newComp.state}
                          onChange={(e) => setNewComp({ ...newComp, state: e.target.value })}
                          placeholder="TX"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP *</Label>
                        <Input
                          id="zip"
                          value={newComp.zip}
                          onChange={(e) => setNewComp({ ...newComp, zip: e.target.value })}
                          placeholder="77001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Property Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="property_type">Property Type</Label>
                      <Select
                        value={newComp.property_type}
                        onValueChange={(v) => setNewComp({ ...newComp, property_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={newComp.condition}
                        onValueChange={(v) => setNewComp({ ...newComp, condition: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((cond) => (
                            <SelectItem key={cond.value} value={cond.value}>
                              {cond.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label htmlFor="bedrooms">Beds</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={newComp.bedrooms}
                        onChange={(e) => setNewComp({ ...newComp, bedrooms: e.target.value })}
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Baths</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        step="0.5"
                        value={newComp.bathrooms}
                        onChange={(e) => setNewComp({ ...newComp, bathrooms: e.target.value })}
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sqft">Sqft</Label>
                      <Input
                        id="sqft"
                        type="number"
                        value={newComp.sqft}
                        onChange={(e) => setNewComp({ ...newComp, sqft: e.target.value })}
                        placeholder="1800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year_built">Year Built</Label>
                      <Input
                        id="year_built"
                        type="number"
                        value={newComp.year_built}
                        onChange={(e) => setNewComp({ ...newComp, year_built: e.target.value })}
                        placeholder="1985"
                      />
                    </div>
                  </div>
                </div>

                {/* Sale Information */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Sale Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sale_price">Sale Price *</Label>
                      <Input
                        id="sale_price"
                        type="number"
                        value={newComp.sale_price}
                        onChange={(e) => setNewComp({ ...newComp, sale_price: e.target.value })}
                        placeholder="285000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sale_date">Sale Date *</Label>
                      <Input
                        id="sale_date"
                        type="date"
                        value={newComp.sale_date}
                        onChange={(e) => setNewComp({ ...newComp, sale_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newComp.notes}
                    onChange={(e) => setNewComp({ ...newComp, notes: e.target.value })}
                    placeholder="Any additional details about this comp..."
                    rows={2}
                  />
                </div>

                {/* Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newComp.was_renovated}
                      onChange={(e) => setNewComp({ ...newComp, was_renovated: e.target.checked })}
                      className="rounded"
                    />
                    Was Renovated
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newComp.is_public}
                      onChange={(e) => setNewComp({ ...newComp, is_public: e.target.checked })}
                      className="rounded"
                    />
                    Share with Community
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitComp}
                  disabled={!newComp.address || !newComp.city || !newComp.sale_price || !newComp.sale_date}
                >
                  Add Comparable
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {!loading && !loadError && comps.length > 0 && (
        <dl aria-label="Comparable sales summary" className="grid grid-cols-2 gap-y-4 border-y border-border py-4 lg:grid-cols-4">
          {[
            { label: "Comparable sales", value: stats.totalComps.toLocaleString() },
            { label: "Average per sq ft", value: formatWorksheetCurrency(stats.avgPricePerSqft) },
            { label: "Average sale price", value: formatWorksheetCurrency(stats.avgSalePrice) },
            { label: "Verified", value: stats.verifiedCount.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0 px-2 first:ps-0 lg:px-4">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Filters & Search */}
      <Card className={worksheetCard}>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative min-w-0 flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search by address, city, or ZIP"
                placeholder="Search by address, city, or ZIP"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={worksheetInput + " ps-9"}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger aria-label="Filter by property type" className={worksheetInput + " w-full data-[size=default]:h-11 sm:w-48"}>
                <Filter aria-hidden="true" className="size-4" />
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comps Table */}
      <Card className={worksheetCard}>
        <CardHeader>
          <h2 id="comps-table-heading" className="text-xl font-semibold tracking-tight">
            Comparable sales{!loading && !loadError ? " (" + filteredComps.length + ")" : ""}
          </h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p role="status" className="py-6 text-sm text-muted-foreground">Loading comparable sales…</p>
          ) : loadError ? (
            <p role="alert" className="py-6 text-sm text-destructive">Could not load comparable sales.</p>
          ) : filteredComps.length === 0 ? (
            <div className="space-y-3 py-4">
              <h3 className="font-semibold">{comps.length === 0 ? "No comparables yet" : "No matching comparables"}</h3>
              <p className="text-sm text-muted-foreground">
                {comps.length === 0 ? "Add a comparable sale to start a price comparison." : "Try another address or property type."}
              </p>
              {comps.length === 0 && (
                <Button className={worksheetAction} onClick={() => setIsAddDialogOpen(true)}>
                  <Plus aria-hidden="true" /> Add a comparable
                </Button>
              )}
            </div>
          ) : (
            <div role="region" aria-labelledby="comps-table-heading" tabIndex={0} className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <table className="w-full min-w-[48rem] text-sm tabular-nums">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Address</TableHead>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col">Beds/Baths</TableHead>
                    <TableHead scope="col">Sqft</TableHead>
                    <TableHead scope="col">Sale Price</TableHead>
                    <TableHead scope="col">$/Sqft</TableHead>
                    <TableHead scope="col">Sale Date</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComps.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="max-w-64 whitespace-normal font-medium [overflow-wrap:anywhere]">{comp.address}</p>
                            <p className="max-w-64 whitespace-normal text-sm text-muted-foreground [overflow-wrap:anywhere]">
                              {comp.city}, {comp.state} {comp.zip}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {comp.property_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            {comp.bedrooms ?? "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            {comp.bathrooms ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {comp.sqft == null ? "—" : comp.sqft.toLocaleString() + " sq ft"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground [overflow-wrap:anywhere]">
                        {formatWorksheetCurrency(comp.sale_price)}
                      </TableCell>
                      <TableCell>
                        {comp.price_per_sqft == null ? "—" : formatWorksheetCurrency(comp.price_per_sqft)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(comp.sale_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {comp.verified ? (
                            <Badge variant="secondary" className="text-primary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                          {comp.is_public && (
                            <Badge variant="outline" className="ml-1">
                              Public
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={"Delete comparable at " + comp.address}
                            className={worksheetAction + " size-11 text-destructive hover:text-destructive"}
                            onClick={() => handleDeleteComp(comp.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
