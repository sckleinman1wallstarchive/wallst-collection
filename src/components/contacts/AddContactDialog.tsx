import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Contact, ContactInsert } from '@/hooks/useContacts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  instagram_handle: z
    .string()
    .regex(/^[a-zA-Z0-9._]{0,30}$/, 'Invalid Instagram handle (letters, numbers, periods, underscores only, max 30 chars)')
    .optional()
    .or(z.literal('')),
  phone_number: z.string().max(20, 'Phone number too long').optional(),
  email: z.string().email('Invalid email address').max(255, 'Email too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ContactInsert) => void;
  editingContact?: Contact | null;
  onUpdate?: (id: string, data: Partial<ContactInsert>) => void;
}

export function AddContactDialog({
  open,
  onOpenChange,
  onSubmit,
  editingContact,
  onUpdate,
}: AddContactDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      instagram_handle: '',
      phone_number: '',
      email: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editingContact) {
      form.reset({
        name: editingContact.name,
        instagram_handle: editingContact.instagram_handle || '',
        phone_number: editingContact.phone_number || '',
        email: editingContact.email || '',
        notes: editingContact.notes || '',
      });
    } else {
      form.reset({
        name: '',
        instagram_handle: '',
        phone_number: '',
        email: '',
        notes: '',
      });
    }
  }, [editingContact, form]);

  const handleSubmit = (data: FormData) => {
    const contactData: ContactInsert = {
      name: data.name,
      instagram_handle: data.instagram_handle || null,
      phone_number: data.phone_number || null,
      email: data.email || null,
      notes: data.notes || null,
    };

    if (editingContact && onUpdate) {
      onUpdate(editingContact.id, contactData);
    } else {
      onSubmit(contactData);
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingContact ? 'Edit Contact' : 'Add Contact'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe (without @)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes about this buyer..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingContact ? 'Update' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
