ALTER TABLE public.tools 
    ALTER COLUMN system_prompt TYPE text, -- change data type to text
    ALTER COLUMN system_prompt SET NOT NULL,
    ALTER COLUMN title TYPE text, -- change data type to text
    ALTER COLUMN title SET NOT NULL,
    ALTER COLUMN tool_status TYPE tool_status_enum, -- change data type for enum
    ALTER COLUMN tool_status SET DEFAULT 'unverified', -- set default for enum type
    ALTER COLUMN tool_status SET NOT NULL,
    ALTER COLUMN tool_type SET NOT NULL,
    ALTER COLUMN user_id SET NOT NULL;

