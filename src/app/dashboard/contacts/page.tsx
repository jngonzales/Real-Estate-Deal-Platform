"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { MoreHorizontal, Plus, Star, StarOff } from "@/components/ui/icons";
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const formTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuTriggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const editingFromMenu = useRef(false);
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
  const fetchContacts = useCallback(() => {
    return supabase.auth.getUser().then(async ({ data: { user } }) => {
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
            setLoadError("Contacts could not be loaded.");
          }
        } else {
          setContacts(data || []);
        }
      } else {
        // No organization - show empty state
        setContacts([]);
      }
    }).catch((error) => {
      console.error("Error:", error);
      setLoadError("Contacts could not be loaded.");
    }).finally(() => {
      setLoading(false);
    });
  }, [supabase]);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  const retryContacts = () => {
    setLoading(true);
    setLoadError(null);
    void fetchContacts();
  };

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
      <div className="space-y-4">
        <WorkspaceHeading title="Contacts" />
        <p role="status" className="text-muted-foreground">Loading contacts…</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading
        title="Contacts"
        actions={
          <Button
            ref={addButtonRef}
            className="min-h-11 rounded-lg"
            onClick={(event) => {
              formTriggerRef.current = event.currentTarget;
              setShowAddForm(true);
            }}
          >
            <Plus aria-hidden="true" />
            Add contact
          </Button>
        }
      />

      {!loadError && (
        <dl aria-label="Contact counts" className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-4">
          {[
            { label: "All contacts", count: stats.total },
            { label: "Sellers", count: stats.sellers },
            { label: "Buyers", count: stats.buyers },
            { label: "Investors", count: stats.investors },
          ].map(({ label, count }) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-xl font-semibold tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="contact-search">Search contacts</Label>
          <Input
            id="contact-search"
            type="search"
            placeholder="Name, email, or company"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="min-h-11 md:text-base"
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="contact-type-filter">Contact type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger id="contact-type-filter" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="seller">Sellers</SelectItem>
              <SelectItem value="buyer">Buyers</SelectItem>
              <SelectItem value="investor">Investors</SelectItem>
              <SelectItem value="agent">Agents</SelectItem>
              <SelectItem value="lender">Lenders</SelectItem>
              <SelectItem value="contractor">Contractors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 p-4">
          <p role="alert">{loadError}</p>
          <Button variant="outline" className="min-h-11" onClick={retryContacts}>Try again</Button>
        </div>
      )}

      {filteredContacts.length === 0 ? (!loadError && (
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="font-semibold">{searchTerm || filterType !== "all" ? "No matching contacts" : "No contacts yet"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || filterType !== "all" ? "Try a different search or contact type." : "Add a contact to start your list."}
          </p>
        </section>
      )) : (
        <ul aria-label="Contacts" className="divide-y divide-border rounded-lg border border-border bg-card">
          {filteredContacts.map((contact) => (
            <li key={contact.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 p-4">
              <div className="min-w-0 flex-1 basis-32 [overflow-wrap:anywhere]">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 className="font-semibold">{contact.name}</h2>
                  <Badge variant="outline" className="capitalize text-muted-foreground">{contact.type}</Badge>
                </div>
                <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {contact.company && <span>{contact.company}</span>}
                  {contact.phone && <span>{contact.phone}</span>}
                  {contact.email && <span>{contact.email}</span>}
                  {contact.address && <span>{contact.address}</span>}
                </div>
                {contact.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{contact.notes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label={"Star " + contact.name}
                  aria-pressed={contact.starred}
                  onClick={() => toggleStar(contact.id)}
                >
                  {contact.starred ? <Star aria-hidden="true" className="fill-current text-primary" /> : <StarOff aria-hidden="true" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      ref={(node) => { menuTriggers.current[contact.id] = node; }}
                      variant="ghost"
                      size="icon"
                      className="size-11"
                      aria-label={"Actions for " + contact.name}
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onCloseAutoFocus={(event) => {
                      if (editingFromMenu.current) {
                        event.preventDefault();
                        editingFromMenu.current = false;
                      }
                    }}
                  >
                    <DropdownMenuItem
                      onSelect={() => {
                        formTriggerRef.current = menuTriggers.current[contact.id] ?? addButtonRef.current;
                        editingFromMenu.current = true;
                        handleEditContact(contact);
                      }}
                    >
                      Edit contact
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => deleteContact(contact.id)}>
                      Delete contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={showAddForm} onOpenChange={(open) => { if (!open) handleCancelForm(); }}>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto motion-reduce:animate-none sm:max-w-xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const trigger = formTriggerRef.current;
            (trigger?.isConnected ? trigger : addButtonRef.current)?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit contact" : "Add contact"}</DialogTitle>
            <DialogDescription>Name and phone number are required.</DialogDescription>
          </DialogHeader>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!saving) void (editingContact ? handleUpdateContact() : handleAddContact());
            }}
            className="space-y-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" name="name" autoComplete="name" required value={newContact.name || ""} onChange={(event) => setNewContact({ ...newContact, name: event.target.value })} className="min-h-11 md:text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-type">Type</Label>
                <Select value={newContact.type} onValueChange={(value) => setNewContact({ ...newContact, type: value as Contact["type"] })}>
                  <SelectTrigger id="contact-type" className="min-h-11 w-full"><SelectValue /></SelectTrigger>
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
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" required value={newContact.phone || ""} onChange={(event) => setNewContact({ ...newContact, phone: event.target.value })} className="min-h-11 md:text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" name="email" type="email" autoComplete="email" value={newContact.email || ""} onChange={(event) => setNewContact({ ...newContact, email: event.target.value })} className="min-h-11 md:text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-company">Company</Label>
                <Input id="contact-company" name="company" autoComplete="organization" value={newContact.company || ""} onChange={(event) => setNewContact({ ...newContact, company: event.target.value })} className="min-h-11 md:text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-address">Address</Label>
                <Input id="contact-address" name="address" autoComplete="street-address" value={newContact.address || ""} onChange={(event) => setNewContact({ ...newContact, address: event.target.value })} className="min-h-11 md:text-base" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="contact-notes">Notes</Label>
                <Textarea id="contact-notes" name="notes" value={newContact.notes || ""} onChange={(event) => setNewContact({ ...newContact, notes: event.target.value })} rows={2} className="md:text-base" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="min-h-11" onClick={handleCancelForm}>Cancel</Button>
              <Button type="submit" disabled={saving} className="min-h-11">
                {saving ? "Saving contact…" : editingContact ? "Save contact" : "Add contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
