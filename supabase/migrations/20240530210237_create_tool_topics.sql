-- a topic is a named collection, like "General", "Illustrative Math", "IEP Writing", etc.
create table topics (
    id int primary key generated always as identity,
    name text not null
);
alter table topics enable row level security;

-- anyone can view all topics
create policy topics_read on topics for select using (true);

-- multiple tools can belong to multiple topics
create table tools_topics (
    tool_id int references tools(id),
    topic_id bigint references topics(id),
    primary key (tool_id, topic_id)
);
alter table tools_topics enable row level security;

-- anyone can view the topics for a tool
create policy tools_topics_read on tools_topics for select using (true);

