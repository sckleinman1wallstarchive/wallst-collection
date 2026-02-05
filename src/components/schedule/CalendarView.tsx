 import { useState, useMemo } from 'react';
 import {
   format,
   startOfMonth,
   endOfMonth,
   startOfWeek,
   endOfWeek,
   addDays,
   addMonths,
   subMonths,
   isSameMonth,
   isSameDay,
   isToday,
   isPast,
 } from 'date-fns';
 import { Button } from '@/components/ui/button';
 import { ChevronLeft, ChevronRight } from 'lucide-react';
 import { Task, TaskOwner } from '@/hooks/useTasks';
 import { TaskPopover } from './TaskPopover';
 import { cn } from '@/lib/utils';
 
 interface CalendarViewProps {
   tasks: Task[];
   onToggleStatus: (id: string, status: Task['status']) => void;
   onDeleteTask: (id: string) => void;
   filter: 'all' | TaskOwner;
 }
 
 const ownerColors: Record<TaskOwner, string> = {
   spencer: 'bg-blue-500',
   parker: 'bg-green-500',
  both: 'bg-purple-500',
 };
 
 export function CalendarView({
   tasks,
   onToggleStatus,
   onDeleteTask,
   filter,
 }: CalendarViewProps) {
   const [currentMonth, setCurrentMonth] = useState(new Date());
 
   const filteredTasks = useMemo(() => {
     if (filter === 'all') return tasks;
     return tasks.filter((t) => t.owner === filter);
   }, [tasks, filter]);
 
   const calendarDays = useMemo(() => {
     const monthStart = startOfMonth(currentMonth);
     const monthEnd = endOfMonth(monthStart);
     const calStart = startOfWeek(monthStart);
     const calEnd = endOfWeek(monthEnd);
 
     const days: Date[] = [];
     let day = calStart;
     while (day <= calEnd) {
       days.push(day);
       day = addDays(day, 1);
     }
     return days;
   }, [currentMonth]);
 
   const getTasksForDate = (date: Date) => {
     const dateStr = format(date, 'yyyy-MM-dd');
     return filteredTasks.filter((t) => t.dueDate === dateStr);
   };
 
   const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
   const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
 
   return (
     <div className="space-y-4">
       {/* Header */}
       <div className="flex items-center justify-between">
         <Button variant="ghost" size="icon" onClick={prevMonth}>
           <ChevronLeft className="h-5 w-5" />
         </Button>
         <h2 className="text-xl font-semibold">
           {format(currentMonth, 'MMMM yyyy')}
         </h2>
         <Button variant="ghost" size="icon" onClick={nextMonth}>
           <ChevronRight className="h-5 w-5" />
         </Button>
       </div>
 
       {/* Calendar Grid */}
       <div className="border rounded-lg overflow-hidden">
         {/* Day Headers */}
         <div className="grid grid-cols-7 bg-muted/50">
           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
             <div
               key={day}
               className="p-2 text-center text-sm font-medium text-muted-foreground border-b"
             >
               {day}
             </div>
           ))}
         </div>
 
         {/* Calendar Days */}
         <div className="grid grid-cols-7">
           {calendarDays.map((day, idx) => {
             const dayTasks = getTasksForDate(day);
             const isCurrentMonth = isSameMonth(day, currentMonth);
             const isOverdue =
               isPast(day) && !isToday(day) && dayTasks.some((t) => t.status !== 'done');
 
             return (
               <div
                 key={idx}
                 className={cn(
                   "min-h-[80px] p-1 border-b border-r transition-colors",
                   !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                   isToday(day) && "bg-primary/5",
                   isOverdue && "bg-destructive/5"
                 )}
               >
                 <div
                   className={cn(
                     "text-sm font-medium mb-1",
                     isToday(day) &&
                       "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                   )}
                 >
                   {format(day, 'd')}
                 </div>
                 {dayTasks.length > 0 && (
                   <TaskPopover
                     tasks={dayTasks}
                     date={day}
                     onToggleStatus={onToggleStatus}
                     onDelete={onDeleteTask}
                   >
                     <button className="flex flex-wrap gap-1 w-full cursor-pointer hover:opacity-80">
                       {dayTasks.slice(0, 3).map((task) => (
                         <div
                           key={task.id}
                           className={cn(
                             "w-2.5 h-2.5 rounded-full",
                             ownerColors[task.owner],
                             task.status === 'done' && "opacity-40",
                             task.priority === 'high' && "ring-2 ring-red-400"
                           )}
                           title={task.title}
                         />
                       ))}
                       {dayTasks.length > 3 && (
                         <span className="text-xs text-muted-foreground">
                           +{dayTasks.length - 3}
                         </span>
                       )}
                     </button>
                   </TaskPopover>
                 )}
               </div>
             );
           })}
         </div>
       </div>
 
       {/* Legend */}
       <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-blue-500" />
           <span>Spencer</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-green-500" />
           <span>Parker</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-muted ring-2 ring-red-400" />
           <span>High Priority</span>
         </div>
       </div>
     </div>
   );
 }