 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
 import { ChevronDown, ChevronUp, Sparkles, Loader2, Check, X } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { Task, TaskOwner, TaskPriority } from '@/hooks/useTasks';
 
 interface ParsedTask {
   title: string;
   description: string | null;
   owner: TaskOwner;
   dueDate: string;
   priority: TaskPriority;
 }
 
 interface QuickNotesParserProps {
   onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => Promise<Task>;
 }
 
 export function QuickNotesParser({ onAddTask }: QuickNotesParserProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [notes, setNotes] = useState('');
   const [isParsing, setIsParsing] = useState(false);
   const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
   const [isCreating, setIsCreating] = useState(false);
 
   const handleParse = async () => {
     if (!notes.trim()) {
       toast.error('Please enter some notes to parse');
       return;
     }
 
     setIsParsing(true);
     try {
       const { data, error } = await supabase.functions.invoke('parse-tasks', {
         body: { notes }
       });
 
       if (error) throw error;
 
       if (data?.tasks && data.tasks.length > 0) {
         setParsedTasks(data.tasks);
         toast.success(`Found ${data.tasks.length} task(s)`);
       } else {
         toast.info('No tasks could be extracted from the notes');
       }
     } catch (err) {
       console.error('Parse error:', err);
       toast.error('Failed to parse notes');
     } finally {
       setIsParsing(false);
     }
   };
 
   const handleCreateAll = async () => {
     if (parsedTasks.length === 0) return;
 
     setIsCreating(true);
     try {
       for (const task of parsedTasks) {
         await onAddTask({
           title: task.title,
           description: task.description,
           owner: task.owner,
           status: 'todo',
           dueDate: task.dueDate,
           priority: task.priority,
           category: null,
         });
       }
       toast.success(`Created ${parsedTasks.length} task(s)`);
       setNotes('');
       setParsedTasks([]);
     } catch (err) {
       console.error('Create error:', err);
       toast.error('Failed to create some tasks');
     } finally {
       setIsCreating(false);
     }
   };
 
   const removeTask = (index: number) => {
     setParsedTasks(prev => prev.filter((_, i) => i !== index));
   };
 
   return (
     <Collapsible open={isOpen} onOpenChange={setIsOpen}>
       <CollapsibleTrigger asChild>
         <Button variant="outline" className="w-full gap-2">
           <Sparkles className="h-4 w-4" />
           Quick Notes
           {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
         </Button>
       </CollapsibleTrigger>
       <CollapsibleContent className="pt-4">
         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-base font-medium">Paste Notes to Create Tasks</CardTitle>
             <p className="text-xs text-muted-foreground">
               AI will extract tasks with owners, due dates, and priorities
             </p>
           </CardHeader>
           <CardContent className="space-y-4">
             <Textarea
               placeholder="Example:
 - Parker needs to list the Balenciaga jacket by Friday
 - Spencer should source more jewelry before next week
 - URGENT: Both need to prep for the convention"
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               rows={4}
               className="resize-none"
             />
             <div className="flex justify-end gap-2">
               {parsedTasks.length > 0 && (
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setParsedTasks([])}
                 >
                   Clear Results
                 </Button>
               )}
               <Button 
                 size="sm" 
                 onClick={handleParse}
                 disabled={isParsing || !notes.trim()}
               >
                 {isParsing ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Parsing...
                   </>
                 ) : (
                   <>
                     <Sparkles className="h-4 w-4 mr-2" />
                     Parse Notes
                   </>
                 )}
               </Button>
             </div>
 
             {/* Parsed Tasks Preview */}
             {parsedTasks.length > 0 && (
               <div className="space-y-3 pt-4 border-t">
                 <p className="text-sm font-medium">Extracted Tasks:</p>
                 {parsedTasks.map((task, index) => (
                   <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm">{task.title}</p>
                       {task.description && (
                         <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                       )}
                       <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                         <span className={`w-2 h-2 rounded-full ${
                           task.owner === 'spencer' ? 'bg-blue-500' : 
                           task.owner === 'parker' ? 'bg-green-500' : 'bg-purple-500'
                         }`} />
                         <span className="capitalize">{task.owner}</span>
                         <span>•</span>
                         <span>{task.dueDate}</span>
                         <span>•</span>
                         <span className="capitalize">{task.priority}</span>
                       </div>
                     </div>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-6 w-6"
                       onClick={() => removeTask(index)}
                     >
                       <X className="h-3 w-3" />
                     </Button>
                   </div>
                 ))}
                 <Button 
                   className="w-full gap-2" 
                   onClick={handleCreateAll}
                   disabled={isCreating}
                 >
                   {isCreating ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                   ) : (
                     <Check className="h-4 w-4" />
                   )}
                   Create {parsedTasks.length} Task{parsedTasks.length !== 1 ? 's' : ''}
                 </Button>
               </div>
             )}
           </CardContent>
         </Card>
       </CollapsibleContent>
     </Collapsible>
   );
 }