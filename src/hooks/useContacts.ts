import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  name: string;
  instagram_handle: string | null;
  phone_number: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
export type ContactUpdate = Partial<ContactInsert>;

export function useContacts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Contact[];
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (contact: ContactInsert) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Contact added successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add contact',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ContactUpdate }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Contact updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update contact',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Contact deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete contact',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    contacts,
    isLoading,
    error,
    addContact: addContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
  };
}
