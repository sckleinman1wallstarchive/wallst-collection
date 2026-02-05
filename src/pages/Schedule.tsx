 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { CalendarView } from '@/components/schedule/CalendarView';
 import { AddTaskDialog } from '@/components/schedule/AddTaskDialog';
import { QuickNotesParser } from '@/components/schedule/QuickNotesParser';
 import { useTasks, TaskOwner } from '@/hooks/useTasks';
 import { Button } from '@/components/ui/button';
 import { Skeleton } from '@/components/ui/skeleton';
 import { toast } from 'sonner';
 
 const Schedule = () => {
   const { tasks, isLoading, addTask, toggleTaskStatus, deleteTask } = useTasks();
   const [filter, setFilter] = useState<'all' | TaskOwner>('all');
 
   const handleAddTask = async (task: Parameters<typeof addTask>[0]) => {
     const result = await addTask(task);
     toast.success('Task added');
     return result;
   };
 
   const handleToggleStatus = async (id: string, currentStatus: string) => {
     await toggleTaskStatus(id, currentStatus as any);
   };
 
   const handleDeleteTask = async (id: string) => {
     if (!window.confirm('Delete this task?')) return;
     await deleteTask(id);
     toast.success('Task deleted');
   };
 
   const pendingCount = tasks.filter((t) => t.status !== 'done').length;
   const spencerCount = tasks.filter((t) => t.owner === 'spencer' && t.status !== 'done').length;
   const parkerCount = tasks.filter((t) => t.owner === 'parker' && t.status !== 'done').length;
  const bothCount = tasks.filter((t) => t.owner === 'both' && t.status !== 'done').length;
 
   if (isLoading) {
     return (
       <DashboardLayout>
         <div className="max-w-5xl mx-auto space-y-6">
           <Skeleton className="h-8 w-40" />
           <Skeleton className="h-[500px] w-full" />
         </div>
       </DashboardLayout>
     );
   }
 
   return (
     <DashboardLayout>
       <div className="max-w-5xl mx-auto space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
             <p className="text-muted-foreground text-sm mt-1">
               {pendingCount} pending · Spencer ({spencerCount}) · Parker ({parkerCount})
             </p>
           </div>
           <AddTaskDialog onAdd={handleAddTask} />
         </div>
 
         {/* Filter Buttons */}
         <div className="flex items-center gap-2">
           <Button
             variant={filter === 'all' ? 'default' : 'outline'}
             size="sm"
             onClick={() => setFilter('all')}
           >
             All
           </Button>
           <Button
             variant={filter === 'spencer' ? 'default' : 'outline'}
             size="sm"
             onClick={() => setFilter('spencer')}
             className="gap-2"
           >
             <div className="w-2 h-2 rounded-full bg-blue-500" />
             Spencer
           </Button>
           <Button
             variant={filter === 'parker' ? 'default' : 'outline'}
             size="sm"
             onClick={() => setFilter('parker')}
             className="gap-2"
           >
             <div className="w-2 h-2 rounded-full bg-green-500" />
             Parker
           </Button>
            <Button
              variant={filter === 'both' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('both')}
              className="gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Both
            </Button>
         </div>
 
          {/* Quick Notes Parser */}
          <QuickNotesParser onAddTask={handleAddTask} />

         {/* Calendar */}
         <CalendarView
           tasks={tasks}
           filter={filter}
           onToggleStatus={handleToggleStatus}
           onDeleteTask={handleDeleteTask}
         />
       </div>
     </DashboardLayout>
   );
 };
 
 export default Schedule;