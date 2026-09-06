'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  Edit,
  Trash2,
  Star,
  StarOff,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role: 'seller' | 'buyer' | 'agent' | 'contractor' | 'lender' | 'attorney' | 'other';
  notes?: string;
  isFavorite: boolean;
  createdAt: string;
  dealIds?: string[];
}

interface ContactManagerProps {
  contacts: Contact[];
  onAddContact?: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  onUpdateContact?: (id: string, updates: Partial<Contact>) => void;
  onDeleteContact?: (id: string) => void;
  className?: string;
}

const ROLE_OPTIONS = [
  { value: 'seller', label: 'Seller', color: 'bg-gray-500' },
  { value: 'buyer', label: 'Buyer', color: 'bg-gray-500' },
  { value: 'agent', label: 'Agent', color: 'bg-gray-500' },
  { value: 'contractor', label: 'Contractor', color: 'bg-gray-500' },
  { value: 'lender', label: 'Lender', color: 'bg-gray-500' },
  { value: 'attorney', label: 'Attorney', color: 'bg-gray-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

export function ContactManager({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  className,
}: ContactManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'other',
    notes: '',
    isFavorite: false,
  });

  const filteredContacts = useMemo(() => {
    return contacts
      .filter(contact => {
        const matchesSearch = 
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = !filterRole || contact.role === filterRole;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        // Favorites first, then alphabetically
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [contacts, searchQuery, filterRole]);

  const handleAddContact = () => {
    if (!newContact.name.trim()) {
      toast.error('Please enter a contact name');
      return;
    }

    onAddContact?.(newContact);
    toast.success('Contact added');
    setIsOpen(false);
    setNewContact({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: 'other',
      notes: '',
      isFavorite: false,
    });
  };

  const toggleFavorite = (id: string, currentValue: boolean) => {
    onUpdateContact?.(id, { isFavorite: !currentValue });
    toast.success(currentValue ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDelete = (id: string) => {
    onDeleteContact?.(id);
    toast.success('Contact deleted');
  };

  const getRoleConfig = (role: string) => {
    return ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[6];
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Contacts
            <Badge variant="secondary">{contacts.length}</Badge>
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your network.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={e => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newContact.phone}
                      onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newContact.company}
                      onChange={e => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="ABC Realty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={newContact.role}
                      onValueChange={value => setNewContact(prev => ({ ...prev, role: value as Contact['role'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAddContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={filterRole || 'all'}
            onValueChange={value => setFilterRole(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLE_OPTIONS.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contact List */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {contacts.length === 0 ? 'No contacts yet' : 'No matching contacts'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredContacts.map(contact => {
              const roleConfig = getRoleConfig(contact.role);
              
              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted group"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                    roleConfig.color
                  )}>
                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{contact.name}</p>
                      {contact.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {roleConfig.label}
                      </Badge>
                      {contact.company && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {contact.company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {contact.phone && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`tel:${contact.phone}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {contact.email && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${contact.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(contact.id, contact.isFavorite)}
                    >
                      {contact.isFavorite ? (
                        <StarOff className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateContact?.(contact.id, {})}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact contact selector for forms
export function ContactSelector({
  contacts,
  selectedIds,
  onSelect,
}: {
  contacts: Contact[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter(i => i !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <div className="max-h-40 overflow-y-auto space-y-1">
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted',
              selectedIds.includes(contact.id) && 'bg-primary/10'
            )}
            onClick={() => toggleContact(contact.id)}
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
              {contact.name[0]}
            </div>
            <span className="text-sm">{contact.name}</span>
            {selectedIds.includes(contact.id) && (
              <Badge variant="default" className="ml-auto">Selected</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
