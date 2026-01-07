import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { mockTasks } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const Tasks = () => {
  const [meetingNotes, setMeetingNotes] = useState(
    `Weekly Sync - January 12, 2025

Agenda:
1. Review weekly sales (10 min)
2. Inventory status & stagnant items (10 min)
3. Sourcing opportunities (10 min)
4. Content strategy check-in (5 min)
5. Open discussion (10 min)

Decisions:
- [Add decisions here]

Carryover:
- [Add items to carry to next week]`
  );

  const todoTasks = mockTasks.filter(t => t.status === 'todo');
  const inProgressTasks = mockTasks.filter(t => t.status === 'in-progress');
  const doneTasks = mockTasks.filter(t => t.status === 'done');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {todoTasks.length + inProgressTasks.length} active · {doneTasks.length} completed
            </p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <Tabs defaultValue="status" className="space-y-4">
          <TabsList>
            <TabsTrigger value="status">By Status</TabsTrigger>
            <TabsTrigger value="meeting">Meeting</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>To Do</span>
                    <span className="text-muted-foreground">{todoTasks.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={todoTasks} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>In Progress</span>
                    <span className="text-muted-foreground">{inProgressTasks.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={inProgressTasks} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Done</span>
                    <span className="text-muted-foreground">{doneTasks.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doneTasks.length > 0 ? (
                    <TaskList tasks={doneTasks} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No completed tasks yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meeting">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Meeting Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Meeting notes..."
                />
                <div className="flex justify-end mt-4">
                  <Button variant="secondary" size="sm">
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;