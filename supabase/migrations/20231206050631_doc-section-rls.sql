DROP POLICY "Users can insert document sections" ON document_sections;

CREATE POLICY "Any users can insert document sections" ON document_sections
FOR INSERT TO PUBLIC
WITH CHECK (true);
