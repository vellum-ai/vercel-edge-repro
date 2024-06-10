-- Determines which Vellum deployment a tool is associated with.
-- When set, that deployment will be used in place of the existing generation flow.
alter table tools add column vellum_deployment_key text;
