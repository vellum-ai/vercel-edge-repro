ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_thread_id_fkey;

ALTER TABLE messages
ADD CONSTRAINT messages_thread_id_fkey
FOREIGN KEY (thread_id)
REFERENCES threads(id)
ON DELETE CASCADE;