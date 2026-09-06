"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Home,
  MapPin,
  Calendar,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Filter,
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
    fetchComps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComps(data || []);

      // Calculate stats
      if (data && data.length > 0) {
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
    } catch (error) {
      console.error("Error fetching comps:", error);
      toast.error("Failed to load comparables");
    } finally {
      setLoading(false);
    }
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
      fetchComps();
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
      fetchComps();
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Home className="h-8 w-8 text-primary" />
            My Comparables
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your comparable sales database for ARV calculations
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Comparable
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <div className="grid grid-cols-3 gap-2">
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comps</p>
                <p className="text-2xl font-bold">{stats.totalComps}</p>
              </div>
              <Home className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg $/Sqft</p>
                <p className="text-2xl font-bold">${stats.avgPricePerSqft.toFixed(0)}</p>
              </div>
              <Ruler className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Sale Price</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgSalePrice)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{stats.verifiedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address, city, or ZIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
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
      <Card>
        <CardHeader>
          <CardTitle>Comparable Sales ({filteredComps.length})</CardTitle>
          <CardDescription>
            Your submitted comparable sales for ARV analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredComps.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No comparables yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first comparable sale to start building your database.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Comp
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Beds/Baths</TableHead>
                    <TableHead>Sqft</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>$/Sqft</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComps.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium">{comp.address}</p>
                            <p className="text-sm text-muted-foreground">
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
                            {comp.bedrooms || "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            {comp.bathrooms || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {comp.sqft ? `${comp.sqft.toLocaleString()} sqft` : "-"}
                      </TableCell>
                      <TableCell className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(comp.sale_price)}
                      </TableCell>
                      <TableCell>
                        {comp.price_per_sqft ? `$${comp.price_per_sqft.toFixed(0)}` : "-"}
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
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteComp(comp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
