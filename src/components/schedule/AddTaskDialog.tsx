 import { useState } from 'react';
 import { format } from 'date-fns';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { Calendar } from '@/components/ui/calendar';
 import { Plus, CalendarIcon } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { TaskOwner, TaskPriority, Task } from '@/hooks/useTasks';
 
 interface AddTaskDialogProps {
   onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => Promise<Task>;
   defaultDate?: string;
   trigger?: React.ReactNode;
 }
 
 export function AddTaskDialog({ onAdd, defaultDate, trigger }: AddTaskDialogProps) {
   const [open, setOpen] = useState(false);
   const [formData, setFormData] = useState({
     title: '',
     description: '',
     owner: 'spencer' as TaskOwner,
     priority: 'medium' as TaskPriority,
     dueDate: defaultDate || new Date().toISOString().split('T')[0],
     category: '',
   });
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!formData.title.trim()) return;
 
     await onAdd({
       title: formData.title,
       description: formData.description || null,
       owner: formData.owner,
       status: 'todo',
       priority: formData.priority,
       dueDate: formData.dueDate,
       category: formData.category || null,
     });
 
     setFormData({
       title: '',
       description: '',
       owner: 'spencer',
       priority: 'medium',
       dueDate: defaultDate || new Date().toISOString().split('T')[0],
       category: '',
     });
     setOpen(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
         {trigger || (
           <Button size="sm">
             <Plus className="h-4 w-4 mr-2" />
             Add Task
           </Button>
         )}
       </DialogTrigger>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Add New Task</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4 pt-4">
           <div>
             <Label htmlFor="title">Title *</Label>
             <Input
               id="title"
               value={formData.title}
               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
               placeholder="What needs to be done?"
               required
             />
           </div>
 
           <div>
             <Label htmlFor="description">Description</Label>
             <Textarea
               id="description"
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               placeholder="Add details..."
               rows={2}
             />
           </div>
 
           <div className="grid grid-cols-2 gap-3">
             <div>
               <Label>Assigned To</Label>
               <Select
                 value={formData.owner}
                 onValueChange={(value: TaskOwner) => setFormData({ ...formData, owner: value })}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="spencer">Spencer</SelectItem>
                   <SelectItem value="parker">Parker</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div>
               <Label>Priority</Label>
               <Select
                 value={formData.priority}
                 onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="low">Low</SelectItem>
                   <SelectItem value="medium">Medium</SelectItem>
                   <SelectItem value="high">High</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           <div>
             <Label>Due Date</Label>
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className={cn("w-full justify-start text-left font-normal")}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {formData.dueDate ? format(new Date(formData.dueDate), 'PPP') : 'Select date'}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <Calendar
                   mode="single"
                   selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                   onSelect={(date) => setFormData({ ...formData, dueDate: date?.toISOString().split('T')[0] || '' })}
                   initialFocus
                   className="p-3 pointer-events-auto"
                 />
               </PopoverContent>
             </Popover>
           </div>
 
           <div>
             <Label htmlFor="category">Category</Label>
             <Input
               id="category"
               value={formData.category}
               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
               placeholder="e.g., Inventory, Posting, Sourcing"
             />
           </div>
 
           <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="outline" onClick={() => setOpen(false)}>
               Cancel
             </Button>
             <Button type="submit">Add Task</Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }