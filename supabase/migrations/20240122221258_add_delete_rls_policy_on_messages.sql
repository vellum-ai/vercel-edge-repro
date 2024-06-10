CREATE POLICY "Enable delete for users based on user_id" ON "public"."messages"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
    -- Checks that there exists a row in the threads table where
    -- the id matches the thread_id of the message and the created_by
    -- matches the user id of the requesting user
    EXISTS (
        SELECT 1
        FROM "public"."threads"
        WHERE "public"."threads".id = "public"."messages".thread_id
        AND "public"."threads".created_by = auth.uid()
    )
);

