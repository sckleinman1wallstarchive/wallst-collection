import { useState } from 'react';
import { Contact } from '@/hooks/useContacts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Instagram, MessageCircle, Search, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactListProps {
  contacts: Contact[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export function ContactList({
  contacts,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: ContactListProps) {
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = search.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.instagram_handle?.toLowerCase().includes(searchLower) ||
      contact.phone_number?.includes(search) ||
      contact.email?.toLowerCase().includes(searchLower)
    );
  });

  const toggleContact = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredContacts.map((c) => c.id));
    }
  };

  const openInstagram = (handle: string) => {
    window.open(`https://instagram.com/${handle}`, '_blank');
  };

  const openIMessage = (phone: string) => {
    window.open(`sms:${phone}`, '_self');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
            onCheckedChange={toggleAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : `${filteredContacts.length} contacts`}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors',
                selectedIds.includes(contact.id) && 'bg-accent'
              )}
            >
              <Checkbox
                checked={selectedIds.includes(contact.id)}
                onCheckedChange={() => toggleContact(contact.id)}
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{contact.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {contact.instagram_handle && (
                    <span>@{contact.instagram_handle}</span>
                  )}
                  {contact.phone_number && (
                    <span>{contact.phone_number}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {contact.instagram_handle && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openInstagram(contact.instagram_handle!)}
                    title="Open Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </Button>
                )}
                {contact.phone_number && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openIMessage(contact.phone_number!)}
                    title="Open iMessage"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(contact)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(contact.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {search ? 'No contacts match your search' : 'No contacts yet'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
