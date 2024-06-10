ALTER TABLE threads
DROP CONSTRAINT IF EXISTS threads_tool_id_fkey;

ALTER TABLE threads
ADD CONSTRAINT threads_tool_id_fkey
FOREIGN KEY (tool_id)
REFERENCES tools(id)
ON DELETE CASCADE;

