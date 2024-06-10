create policy "Enable delete for users based on user_id" on "threads"
as permissive
for delete
to public
using ((auth.uid() = created_by))

