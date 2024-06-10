-- Drop the existing policy
DROP POLICY "Authenticated users can upload files" ON storage.objects;

-- Create a new policy allowing any user to upload files to the 'files' bucket
CREATE POLICY "Any user can upload files"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'files'
);
