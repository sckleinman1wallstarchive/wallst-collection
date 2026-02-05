 import { format, isPast, isToday } from 'date-fns';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Task, TaskOwner, TaskPriority } from '@/hooks/useTasks';
 import { Trash2, Pencil } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface TaskPopoverProps {
   tasks: Task[];
   date: Date;
   onToggleStatus: (id: string, status: Task['status']) => void;
   onDelete: (id: string) => void;
   onEdit?: (task: Task) => void;
   children: React.ReactNode;
 }
 
 const ownerColors: Record<TaskOwner, string> = {
   spencer: 'bg-blue-500',
   parker: 'bg-green-500',
  both: 'bg-purple-500',
 };
 
 const priorityStyles: Record<TaskPriority, string> = {
   low: 'bg-muted text-muted-foreground',
   medium: 'bg-amber-100 text-amber-700',
   high: 'bg-red-100 text-red-700',
 };
 
 export function TaskPopover({
   tasks,
   date,
   onToggleStatus,
   onDelete,
   onEdit,
   children,
 }: TaskPopoverProps) {
   const isOverdue = isPast(date) && !isToday(date);
 
   return (
     <Popover>
       <PopoverTrigger asChild>{children}</PopoverTrigger>
       <PopoverContent className="w-80 p-0" align="start">
         <div className="p-3 border-b">
           <p className={cn("font-medium", isOverdue && "text-destructive")}>
             {format(date, 'EEEE, MMMM d')}
           </p>
           <p className="text-xs text-muted-foreground">
             {tasks.length} task{tasks.length !== 1 ? 's' : ''}
           </p>
         </div>
         <div className="max-h-64 overflow-y-auto divide-y">
           {tasks.map((task) => (
             <div
               key={task.id}
               className={cn(
                 "p-3 space-y-2",
                 task.status === 'done' && "opacity-60"
               )}
             >
               <div className="flex items-start gap-2">
                 <Checkbox
                   checked={task.status === 'done'}
                   onCheckedChange={() => onToggleStatus(task.id, task.status)}
                   className="mt-0.5"
                 />
                 <div className="flex-1 min-w-0">
                   <p
                     className={cn(
                       "font-medium text-sm",
                       task.status === 'done' && "line-through"
                     )}
                   >
                     {task.title}
                   </p>
                   {task.description && (
                     <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                       {task.description}
                     </p>
                   )}
                 </div>
               </div>
               <div className="flex items-center gap-2 pl-6">
                 <div
                   className={cn(
                     "w-2 h-2 rounded-full",
                     ownerColors[task.owner]
                   )}
                 />
                 <span className="text-xs capitalize">{task.owner}</span>
                 <Badge variant="secondary" className={cn("text-xs", priorityStyles[task.priority])}>
                   {task.priority}
                 </Badge>
                 {task.category && (
                   <Badge variant="outline" className="text-xs">
                     {task.category}
                   </Badge>
                 )}
                 <div className="flex-1" />
                 {onEdit && (
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-6 w-6"
                     onClick={() => onEdit(task)}
                   >
                     <Pencil className="h-3 w-3" />
                   </Button>
                 )}
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-6 w-6 text-destructive hover:text-destructive"
                   onClick={() => onDelete(task.id)}
                 >
                   <Trash2 className="h-3 w-3" />
                 </Button>
               </div>
             </div>
           ))}
         </div>
       </PopoverContent>
     </Popover>
   );
 }