-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

-- Create a new insert policy
CREATE POLICY "Users can insert messages"
ON messages FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM threads
    WHERE threads.id = messages.thread_id
      AND threads.created_by = auth.uid()
  )
);
