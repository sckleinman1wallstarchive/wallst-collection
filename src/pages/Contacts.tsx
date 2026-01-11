import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ContactList } from '@/components/contacts/ContactList';
import { AddContactDialog } from '@/components/contacts/AddContactDialog';
import { useContacts, Contact, ContactInsert } from '@/hooks/useContacts';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Contacts() {
  const { contacts, isLoading, addContact, updateContact, deleteContact } = useContacts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingContact(null);
    }
  };

  const handleAddContact = (data: ContactInsert) => {
    addContact(data);
  };

  const handleUpdateContact = (id: string, data: Partial<ContactInsert>) => {
    updateContact({ id, updates: data });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteContact(deleteConfirmId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-semibold">Contacts</h1>
            <p className="text-sm text-muted-foreground">
              Manage buyer contacts
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-hidden">
          <ContactList
            contacts={contacts}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onEdit={handleEdit}
            onDelete={setDeleteConfirmId}
          />
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AddContactDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleAddContact}
        editingContact={editingContact}
        onUpdate={handleUpdateContact}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
