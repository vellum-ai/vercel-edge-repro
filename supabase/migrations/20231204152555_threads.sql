
create table threads (
  id bigint primary key generated always as identity,
  tool_id bigint not null references tools (id),
  created_by uuid not null references auth.users (id) default auth.uid(),
  created_at timestamp with time zone not null default now()
);

create table messages (
  id bigint primary key generated always as identity,
  thread_id bigint not null references threads (id),
  content text not null,
  role text not null,
  metadata JSONB
);

alter table threads enable row level security;
alter table messages enable row level security;

create policy "Users can insert threads"
on threads for insert to authenticated with check (
  auth.uid() = created_by
);

create policy "Public can query threads"
on threads for select using (true);

create policy "Users can insert messages"
on messages for insert to authenticated with check (
  thread_id in (
    select id
    from threads
    where created_by = auth.uid()
  )
);

create policy "Public can query messages"
on messages for select using (true);
