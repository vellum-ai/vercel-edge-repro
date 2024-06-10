create policy "Users can update messages on threads they created"
on "public"."messages"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM threads
  WHERE ((threads.id = messages.thread_id) AND (threads.created_by = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM threads
  WHERE ((threads.id = messages.thread_id) AND (threads.created_by = auth.uid())))));
