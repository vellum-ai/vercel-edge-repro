-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a user for Writing Pathway integration

INSERT INTO auth.users (id, email) VALUES ('edcf2b77-c07f-40f5-b9d0-0cc31ada99de', 'thewritingpathway@teachinglab.org');
-- Seed data for users table and capture their IDs
WITH user1 AS (
  INSERT INTO auth.users (id, email) VALUES (uuid_generate_v4(), 'user1@example.com') RETURNING id
), 
user2 AS (
  INSERT INTO auth.users (id, email) VALUES (uuid_generate_v4(), 'user2@example.com') RETURNING id
)

-- Seed data for tools table
INSERT INTO tools (details, system_prompt, title, tool_status, tool_type, user_id, description)
SELECT '[]'::jsonb, 'Prompt 1', 'Tool 1', 'verified'::tool_status_enum, 'content'::tool_type_enum, id, 'My First Tool' FROM user1
UNION ALL
SELECT '[]'::jsonb, 'Prompt 2', 'Tool 2', 'verified'::tool_status_enum, 'bot'::tool_type_enum, id, 'My Second Tool' FROM user2;

insert into tool_fields (tool_id, field_type, label, order_index) values (1, 'short_text'::field, 'Short Text Field', 1);

insert into tool_fields (tool_id, field_type, label, order_index) values (1, 'long_text'::field, 'Long Text Field', 2);
insert into tool_fields (tool_id, field_type, label, order_index) values (2, 'short_text'::field, 'Short Text Field', 1);

insert into tool_fields (tool_id, field_type, label, order_index) values (2, 'long_text'::field, 'Long Text Field', 2);

select vault.create_secret(
  'http://api.supabase.internal:8000',
  'supabase_url'
);


-- Create an example team and integration
INSERT INTO teams (id, name) VALUES (
  '00000000-0000-4000-a000-000000000001',
  'Writing Pathways Team');

INSERT INTO integrations (id, team_id, name, schema_url) VALUES (
  '00000000-0000-4000-a000-000000000002',
  '00000000-0000-4000-a000-000000000001',
  'Writing Pathways Lesson Integration',
  'https://wptool.teachinglab.org/api/schema');

-- create topics
insert into topics (name) values ('General Tools'), ('IM® K–12 Math™ Tools');

-- add the two default tools to the 'General Tools' topic
insert into tools_topics (tool_id, topic_id) values (1, 1), (2, 1);
