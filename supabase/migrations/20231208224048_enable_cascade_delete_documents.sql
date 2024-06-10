ALTER TABLE documents_tools
DROP CONSTRAINT IF EXISTS documents_tools_tool_id_fkey;

ALTER TABLE documents_tools
ADD CONSTRAINT documents_tools_tool_id_fkey
FOREIGN KEY (tool_id)
REFERENCES tools(id)
ON DELETE CASCADE;

ALTER TABLE documents_tools
DROP CONSTRAINT IF EXISTS documents_tools_document_id_fkey;

ALTER TABLE documents_tools
ADD CONSTRAINT documents_tools_document_id_fkey
FOREIGN KEY (document_id)
REFERENCES documents(id)
ON DELETE CASCADE;


ALTER TABLE document_sections
DROP CONSTRAINT IF EXISTS document_sections_document_id_fkey;

ALTER TABLE document_sections
ADD CONSTRAINT documents_sections_document_id_fkey
FOREIGN KEY (document_id)
REFERENCES documents(id)
ON DELETE CASCADE;
