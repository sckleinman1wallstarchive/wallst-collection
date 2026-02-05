-- Create task management tables
CREATE TYPE task_owner AS ENUM ('spencer', 'parker');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  owner task_owner NOT NULL,
  status task_status NOT NULL DEFAULT 'todo',
  due_date date NOT NULL,
  priority task_priority DEFAULT 'medium',
  category text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for allowed users
CREATE POLICY "Allowed users can read tasks"
  ON tasks FOR SELECT
  USING (is_allowed_user());

CREATE POLICY "Allowed users can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update tasks"
  ON tasks FOR UPDATE
  USING (is_allowed_user());

CREATE POLICY "Allowed users can delete tasks"
  ON tasks FOR DELETE
  USING (is_allowed_user());

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();