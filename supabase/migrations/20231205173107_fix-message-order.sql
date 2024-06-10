ALTER TABLE messages
ADD COLUMN created_at timestamp with time zone not null default now();
