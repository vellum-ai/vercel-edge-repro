
-- we pass in document_ids because we only want to grab sections from specified
-- documents and not the entire database of document_sections
create or replace function match_document_sections(
    embedding vector(1536),
    match_threshold float,
    document_ids bigint[]
)
returns setof document_sections
language plpgsql
as $$
#variable_conflict use_variable
begin
    return query
    select *
    from document_sections
    where document_sections.embedding <#> embedding < -match_threshold
    and document_sections.document_id = any(document_ids)
    order by document_sections.embedding <#> embedding;
end;
$$;
