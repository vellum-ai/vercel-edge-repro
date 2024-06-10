create table favorite_tools(
    id bigint primary key generated always as identity,
    tool_id int not null,
    foreign key (tool_id) references tools(id) on delete cascade,
    favorited_by uuid not null references auth.users (id) default auth.uid()
)