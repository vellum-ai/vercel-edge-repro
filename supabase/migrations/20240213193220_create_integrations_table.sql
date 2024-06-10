-- Create `teams` table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Create `integrations` table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    schema_url TEXT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Create `users_teams` table
CREATE TABLE users_teams (
    user_id UUID NOT NULL,
    team_id UUID NOT NULL,
    PRIMARY KEY (user_id, team_id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    UNIQUE (user_id, team_id) -- Ensures a user can only be added to a team once
);

-- Add `integration_id` column to `tools` table
ALTER TABLE tools
ADD COLUMN integration_id UUID,
ADD CONSTRAINT fk_integration
FOREIGN KEY (integration_id) REFERENCES integrations(id);


-- Security Policies for teams
-- Any user can create a team
CREATE POLICY insert_any_user_on_teams ON teams
FOR INSERT
WITH CHECK (true); -- No specific conditions needed for creation by any user

-- Users can view teams only when they are a member
CREATE POLICY view_own_teams ON teams
USING (
    EXISTS (
        SELECT 1
        FROM users_teams
        WHERE users_teams.team_id = teams.id
        AND users_teams.user_id = auth.uid()
    )
);

-- Users can update teams only when they are a member
CREATE POLICY update_own_teams ON teams
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM users_teams
        WHERE users_teams.team_id = teams.id
        AND users_teams.user_id = auth.uid()
    )
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- Note: No user is currently permitted to delete teams


-- Security Policies for integrations
-- Any users can view an integration which belong to one of their teams
CREATE POLICY view_own_team_integrations ON integrations
FOR SELECT
USING (
    team_id IN (
        SELECT team_id
        FROM users_teams
        WHERE user_id = auth.uid()
    )
);
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
-- Note: No user is currently permitted to update or delete integrations


-- Security Policies for users_teams
-- Any users can view which teams they are a member of
CREATE POLICY view_own_team_membership ON users_teams
FOR SELECT
USING (user_id = auth.uid()); -- Replace `auth.uid()` as necessary
ALTER TABLE users_teams ENABLE ROW LEVEL SECURITY;
-- Note: No user is currently permitted to update or delete their team status
