alter table "public"."favorite_tools" enable row level security;

create policy "Enable delete for users based on user_id"
on "public"."favorite_tools"
as permissive
for delete
to public
using ((auth.uid() = favorited_by));

create policy "Enable insert for authenticated users only"
on "public"."favorite_tools"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for users based on user_id"
on "public"."favorite_tools"
as permissive
for select
to public
using ((auth.uid() = favorited_by));