-- the recent_tools view exposes at most 3 tools that the user has interacted with recently
-- you can query it as if it was the tools table
CREATE VIEW recent_tools AS
WITH recent_tools_ids AS (
    SELECT 
        t.id AS tool_id,
        MAX(m.created_at) AS last_thread_date
    FROM 
        tools t
    JOIN 
        threads th ON t.id = th.tool_id
    JOIN 
        messages m ON th.id = m.thread_id
    WHERE
        th.created_by = auth.uid()
    GROUP BY 
        t.id
    ORDER BY 
        last_thread_date DESC
    LIMIT 3
)
SELECT 
    t.*
FROM 
    tools t
JOIN 
    recent_tools_ids rti ON t.id = rti.tool_id
ORDER BY 
    rti.last_thread_date DESC;
