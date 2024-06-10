-- Up migration
-- Create ENUM types
-- Function to check if a type exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tool_status_enum') THEN
        CREATE TYPE tool_status_enum AS ENUM (
            'official',
            'verified',
            'unverified'
        );
    END IF;
END$$;

-- Function to check if a type exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tool_type_enum') THEN
        CREATE TYPE tool_type_enum AS ENUM (
            'bot',
            'content'
        );
    END IF;
END$$;

-- Create the tools table
CREATE TABLE IF NOT EXISTS tools (
  id BIGSERIAL PRIMARY KEY,
  details JSONB NOT NULL,
  system_prompt TEXT NOT NULL,
  title TEXT NOT NULL,
  tool_status tool_status_enum DEFAULT 'unverified' NOT NULL,
  tool_type tool_type_enum DEFAULT 'content' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  cloned_from_id BIGINT,
  user_id uuid not null references auth.users
);

-- Create indexes
CREATE INDEX IF NOT EXISTS index_tools_on_cloned_from_id ON tools (cloned_from_id);
CREATE INDEX IF NOT EXISTS index_tools_on_user_id ON tools (user_id);

-- Create foreign keys
ALTER TABLE tools ADD FOREIGN KEY (cloned_from_id) REFERENCES tools (id);
