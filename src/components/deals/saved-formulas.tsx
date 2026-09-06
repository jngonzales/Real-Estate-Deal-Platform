"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  Calculator, 
  Plus, 
  Search, 
  Globe, 
  Lock, 
  Copy, 
  Trash2, 
  Edit, 
  Loader2,
  Star,
  Filter
} from "@/components/ui/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { toast } from "sonner";
import Link from "next/link";

interface Formula {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  formula: string;
  variables: Array<{ name: string; value: number }>;
  is_public: boolean;
  category: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "mao", label: "MAO Calculations" },
  { value: "roi", label: "ROI & Returns" },
  { value: "cash_flow", label: "Cash Flow" },
  { value: "arv", label: "ARV Estimates" },
  { value: "flip", label: "Flip Analysis" },
  { value: "rental", label: "Rental Analysis" },
  { value: "custom", label: "Custom" }
];

export function SavedFormulas() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showPublic, setShowPublic] = useState(true);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchFormulas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (showPublic) params.set("public", "true");
      if (category !== "all") params.set("category", category);

      const response = await fetch(`/api/formulas?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      setFormulas(data.formulas || []);
    } catch (error) {
      console.error("Error fetching formulas:", error);
      toast.error("Failed to load formulas");
    } finally {
      setLoading(false);
    }
  }, [showPublic, category]);

  useEffect(() => {
    fetchFormulas();
  }, [fetchFormulas]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this formula?")) return;

    try {
      const response = await fetch(`/api/formulas?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      
      setFormulas(formulas.filter(f => f.id !== id));
      toast.success("Formula deleted");
    } catch (error) {
      console.error("Error deleting formula:", error);
      toast.error("Failed to delete formula");
    }
  };

  const handleCopyFormula = async (formula: Formula) => {
    try {
      await navigator.clipboard.writeText(formula.formula);
      toast.success("Formula copied to clipboard");
    } catch {
      toast.error("Failed to copy formula");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingFormula) return;

    try {
      const response = await fetch("/api/formulas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingFormula.id,
          name: editingFormula.name,
          description: editingFormula.description,
          formula: editingFormula.formula,
          variables: editingFormula.variables,
          isPublic: editingFormula.is_public,
          category: editingFormula.category
        })
      });

      if (!response.ok) throw new Error("Failed to update");
      
      const data = await response.json();
      setFormulas(formulas.map(f => f.id === data.formula.id ? data.formula : f));
      setIsDialogOpen(false);
      setEditingFormula(null);
      
      toast.success("Formula updated");
    } catch (error) {
      console.error("Error updating formula:", error);
      toast.error("Failed to update formula");
    }
  };

  const filteredFormulas = formulas.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description?.toLowerCase().includes(search.toLowerCase()) ||
    f.formula.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search formulas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ToggleSwitch
              enabled={showPublic}
              onChange={setShowPublic}
            />
            <Label htmlFor="show-public" className="text-sm">
              Include Public Formulas
            </Label>
          </div>
          <Button asChild>
            <Link href="/dashboard/analysis/formula">
              <Plus className="h-4 w-4 mr-2" />
              New Formula
            </Link>
          </Button>
        </div>
      </div>

      {/* Formulas Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFormulas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No formulas found</h3>
            <p className="text-muted-foreground mt-1">
              {search ? "Try a different search term" : "Create your first custom formula to get started"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/analysis/formula">
                <Plus className="h-4 w-4 mr-2" />
                Create Formula
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFormulas.map((formula) => (
            <Card key={formula.id} className="relative group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {formula.name}
                      {formula.is_public ? (
                        <Globe className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {formula.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORIES.find(c => c.value === formula.category)?.label || formula.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-md p-3 font-mono text-sm overflow-x-auto">
                  <code className="text-xs break-all">{formula.formula}</code>
                </div>

                {formula.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {formula.variables.map((v, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {v.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    {formula.usage_count} uses
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyFormula(formula)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingFormula(formula)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Formula</DialogTitle>
                          <DialogDescription>
                            Modify your custom formula
                          </DialogDescription>
                        </DialogHeader>
                        {editingFormula && (
                          <div className="space-y-4">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={editingFormula.name}
                                onChange={(e) => setEditingFormula({
                                  ...editingFormula,
                                  name: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={editingFormula.description || ""}
                                onChange={(e) => setEditingFormula({
                                  ...editingFormula,
                                  description: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label>Formula</Label>
                              <Textarea
                                value={editingFormula.formula}
                                onChange={(e) => setEditingFormula({
                                  ...editingFormula,
                                  formula: e.target.value
                                })}
                                className="font-mono"
                              />
                            </div>
                            <div>
                              <Label>Category</Label>
                              <Select 
                                value={editingFormula.category}
                                onValueChange={(v) => setEditingFormula({
                                  ...editingFormula,
                                  category: v
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.filter(c => c.value !== "all").map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <ToggleSwitch
                                enabled={editingFormula.is_public}
                                onChange={(v: boolean) => setEditingFormula({
                                  ...editingFormula,
                                  is_public: v
                                })}
                              />
                              <Label htmlFor="is-public">
                                Make this formula public
                              </Label>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveEdit}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(formula.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
