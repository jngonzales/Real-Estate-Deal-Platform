"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  linkedDeals?: number;
}

const contactTypeColors: Record<string, string> = {
  seller: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  buyer: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  agent: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  investor: "bg-green-500/10 text-green-600 border-green-500/30",
  lender: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  contractor: "bg-pink-500/10 text-pink-600 border-pink-500/30",
};

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Smith",
    type: "seller",
    phone: "(555) 123-4567",
    email: "john@email.com",
    address: "123 Main St, Austin, TX",
    notes: "Motivated seller, inherited property",
    starred: true,
    linkedDeals: 2,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    type: "buyer",
    phone: "(555) 234-5678",
    email: "sarah@email.com",
    company: "SJ Investments",
    notes: "Cash buyer, looking for fix & flip",
    starred: true,
    linkedDeals: 5,
  },
  {
    id: "3",
    name: "Mike Williams",
    type: "investor",
    phone: "(555) 345-6789",
    email: "mike@investor.com",
    company: "Williams Capital",
    notes: "BRRRR strategy, portfolio buyer",
    starred: false,
    linkedDeals: 3,
  },
  {
    id: "4",
    name: "Lisa Chen",
    type: "agent",
    phone: "(555) 456-7890",
    email: "lisa@realty.com",
    company: "Premier Realty",
    notes: "Great for off-market deals",
    starred: false,
    linkedDeals: 1,
  },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    type: "seller",
    starred: false,
  });

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || contact.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    
    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      type: newContact.type as Contact["type"],
      phone: newContact.phone,
      email: newContact.email || "",
      company: newContact.company,
      address: newContact.address,
      notes: newContact.notes,
      starred: false,
      linkedDeals: 0,
    };
    
    setContacts([contact, ...contacts]);
    setNewContact({ type: "seller", starred: false });
    setShowAddForm(false);
  };

  const toggleStar = (id: string) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, starred: !c.starred } : c
    ));
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const stats = {
    total: contacts.length,
    sellers: contacts.filter(c => c.type === "seller").length,
    buyers: contacts.filter(c => c.type === "buyer").length,
    investors: contacts.filter(c => c.type === "investor").length,
  };

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
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <User className="w-5 h-5 text-orange-600" />
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
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="w-5 h-5 text-blue-600" />
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

      {/* Add Contact Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Add New Contact</CardTitle>
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
                <Button onClick={handleAddContact}>Add Contact</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
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

      {/* Contact List */}
      <div className="grid gap-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contacts found</p>
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
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
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                        {contact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          {contact.starred && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          )}
                          <Badge variant="outline" className={contactTypeColors[contact.type]}>
                            {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                          </Badge>
                        </div>
                        {contact.company && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {contact.company}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </span>
                          {contact.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {contact.address}
                            </span>
                          )}
                        </div>
                        {contact.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            &ldquo;{contact.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.linkedDeals !== undefined && contact.linkedDeals > 0 && (
                        <Badge variant="secondary">
                          {contact.linkedDeals} deal{contact.linkedDeals > 1 ? "s" : ""}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStar(contact.id)}
                      >
                        {contact.starred ? (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
                          <DropdownMenuItem>
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
