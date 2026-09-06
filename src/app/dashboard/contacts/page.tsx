"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  User,
  DollarSign,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  StarOff,
  Loader2,
} from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  type: "seller" | "buyer" | "agent" | "investor" | "lender" | "contractor";
  phone: string;
  email: string;
  company?: string;
  address?: string;
  notes?: string;
  starred: boolean;
  organization_id?: string;
}

const contactTypeColors: Record<string, string> = {
  seller: "bg-muted text-muted-foreground border-border/30",
  buyer: "bg-muted text-muted-foreground border-border/30",
  agent: "bg-muted text-muted-foreground border-border/30",
  investor: "bg-muted text-muted-foreground border-border/30",
  lender: "bg-muted text-muted-foreground border-border/30",
  contractor: "bg-muted text-muted-foreground border-border/30",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    type: "seller",
    starred: false,
  });

  const supabase = createClient();

  // Fetch contacts from Supabase
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      
      // First get the user's organization_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profile?.organization_id) {
        setOrganizationId(profile.organization_id);
        
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .order("starred", { ascending: false })
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching contacts:", error);
          // Table might not exist yet - show empty state
          if (error.code === "42P01") {
            setContacts([]);
          } else {
            toast.error("Failed to load contacts");
          }
        } else {
          setContacts(data || []);
        }
      } else {
        // No organization - show empty state
        setContacts([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || contact.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone are required");
      return;
    }
    
    if (!organizationId) {
      toast.error("You must be part of an organization to add contacts");
      return;
    }
    
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contacts")
        .insert({
          organization_id: organizationId,
          created_by: user.id,
          name: newContact.name,
          type: newContact.type || "seller",
          phone: newContact.phone,
          email: newContact.email || "",
          company: newContact.company,
          address: newContact.address,
          notes: newContact.notes,
          starred: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding contact:", error);
        toast.error("Failed to add contact");
      } else {
        setContacts([data, ...contacts]);
        setNewContact({ type: "seller", starred: false });
        setShowAddForm(false);
        toast.success("Contact added successfully");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      type: contact.type,
      phone: contact.phone,
      email: contact.email,
      company: contact.company,
      address: contact.address,
      notes: contact.notes,
      starred: contact.starred,
    });
    setShowAddForm(true);
  };

  const handleUpdateContact = async () => {
    if (!editingContact || !newContact.name || !newContact.phone) {
      toast.error("Name and phone are required");
      return;
    }
    
    try {
      setSaving(true);

      const { error } = await supabase
        .from("contacts")
        .update({
          name: newContact.name,
          type: newContact.type,
          phone: newContact.phone,
          email: newContact.email || "",
          company: newContact.company,
          address: newContact.address,
          notes: newContact.notes,
        })
        .eq("id", editingContact.id);

      if (error) {
        console.error("Error updating contact:", error);
        toast.error("Failed to update contact");
      } else {
        setContacts(contacts.map(c => 
          c.id === editingContact.id 
            ? {
                ...c,
                name: newContact.name!,
                type: newContact.type as Contact["type"],
                phone: newContact.phone!,
                email: newContact.email || "",
                company: newContact.company,
                address: newContact.address,
                notes: newContact.notes,
              }
            : c
        ));
        setEditingContact(null);
        setNewContact({ type: "seller", starred: false });
        setShowAddForm(false);
        toast.success("Contact updated successfully");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update contact");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelForm = () => {
    setEditingContact(null);
    setNewContact({ type: "seller", starred: false });
    setShowAddForm(false);
  };

  const toggleStar = async (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    const { error } = await supabase
      .from("contacts")
      .update({ starred: !contact.starred })
      .eq("id", id);

    if (error) {
      console.error("Error toggling star:", error);
      toast.error("Failed to update contact");
    } else {
      setContacts(contacts.map(c => 
        c.id === id ? { ...c, starred: !c.starred } : c
      ));
    }
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    } else {
      setContacts(contacts.filter(c => c.id !== id));
      toast.success("Contact deleted");
    }
  };

  const stats = {
    total: contacts.length,
    sellers: contacts.filter(c => c.type === "seller").length,
    buyers: contacts.filter(c => c.type === "buyer").length,
    investors: contacts.filter(c => c.type === "investor").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your real estate network</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sellers}</p>
                  <p className="text-xs text-muted-foreground">Sellers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.buyers}</p>
                  <p className="text-xs text-muted-foreground">Buyers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.investors}</p>
                  <p className="text-xs text-muted-foreground">Investors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add/Edit Contact Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={newContact.name || ""}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newContact.type}
                    onValueChange={(v) => setNewContact({ ...newContact, type: v as Contact["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="lender">Lender</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={newContact.phone || ""}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newContact.email || ""}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={newContact.company || ""}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={newContact.address || ""}
                    onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newContact.notes || ""}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    placeholder="Add notes about this contact..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {editingContact ? (
                  <Button onClick={handleUpdateContact} disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Contact
                  </Button>
                ) : (
                  <Button onClick={handleAddContact} disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Contact
                  </Button>
                )}
                <Button variant="outline" onClick={handleCancelForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="seller">Sellers</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
            <SelectItem value="investor">Investors</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
            <SelectItem value="lender">Lenders</SelectItem>
            <SelectItem value="contractor">Contractors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contacts List */}
      <div className="grid gap-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your network by adding your first contact.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                        {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          {contact.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          <Badge variant="outline" className={contactTypeColors[contact.type]}>
                            {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {contact.company && (
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {contact.company}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </span>
                          )}
                          {contact.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {contact.address}
                            </span>
                          )}
                        </div>
                        {contact.notes && (
                          <p className="text-sm text-muted-foreground italic">&quot;{contact.notes}&quot;</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStar(contact.id)}
                      >
                        {contact.starred ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteContact(contact.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
