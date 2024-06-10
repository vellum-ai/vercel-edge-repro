import { supabase } from "~/lib/supabase.client";

// Combines information from teams and users_teams to determine the team of the current user
export async function getTeams() {
  const { data } = await supabase.from("teams").select().throwOnError();
  return data || [];
}

export async function getIntegrationMany(teamIDs: string[]) {
  console.log(`teamIDs: ${teamIDs}`);
  const { data: integrations, error: integrations_error } = await supabase
    .from("integrations")
    .select("*")
    .in("team_id", teamIDs)
    .throwOnError();

  if (integrations_error) {
    throw integrations_error;
  }
  return integrations;
}

type IntegrationParameter = {
  name: string;
};
export async function getIntegrationParameters(integrationID: string) {
  console.log(`integrationID: ${integrationID}`);
  const { data, error } = await supabase.functions.invoke(
    `integrations/${integrationID}/parameters`,
    {
      method: "GET",
    },
  );
  if (error) {
    throw error;
  }
  if (data?.parameters && Array.isArray(data.parameters)) {
    return data.parameters as IntegrationParameter[];
  }
  throw new Error("Invalid response");
}

export async function getIntegrationSchema(integrationID: string) {
  console.log(`integrationID: ${integrationID}`);
  const { data, error } = await supabase.functions.invoke(
    `integrations/${integrationID}/schema`,
    {
      method: "GET",
    },
  );
  if (error) {
    throw error;
  }
  if (data?.fields?.properties && typeof data.fields.properties === "object") {
    return Object.keys(data.fields.properties);
  }
  throw new Error("Invalid response");
}

export async function getIntegrationValues(
  integrationID: string,
  queries: Record<string, string>,
) {
  const query = new URLSearchParams(queries);
  const { data, error } = await supabase.functions.invoke(
    `integrations/${integrationID}/values?${query}`,
    { method: "GET" },
  );
  if (error) {
    throw error;
  }
  if (data?.values) {
    return data.values as Record<string, string>;
  }
  throw new Error("Invalid response");
}
