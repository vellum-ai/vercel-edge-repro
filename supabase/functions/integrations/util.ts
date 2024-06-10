import { HTTPException } from "https://deno.land/x/hono@v4.0.2/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Database } from "../database.types.ts";

/**
 * Fetches integration details from Supabase and its corresponding OpenAPI schema.
 * @param {string} integrationID - The unique identifier for the integration.
 * @param {SupabaseClient<Database>} client - The Supabase client instance used to fetch integration details.
 * @returns {Promise<{url: string, schema: OpenAPISchema}>} An object containing the schema URL and the parsed OpenAPI schema.
 * @throws {HTTPException} Throws an HTTPException if the integration details or schema cannot be fetched.
 */
export async function getIntegration(
	integrationID: string,
	client: SupabaseClient<Database>,
) {
	const integration = await fetchIntegration(client, integrationID);
	return {
		url: integration.schema_url,
		schema: await fetchAndParseSchema(integration.schema_url),
	};
}

/**
 * Determines the target route from an OpenAPI schema by selecting the first defined route.
 * @param {OpenAPISchema} schema - The parsed OpenAPI schema from which to extract the route.
 * @returns {{endpoint: string, details: any}} An object containing the endpoint path and its details from the schema.
 * @throws {HTTPException} Throws an HTTPException if no routes are defined in the OpenAPI schema.
 * @todo We currently assume that the first route is the target route, but this will not always be the case.
 */
export function getTargetRoute(schema: OpenAPISchema) {
	const routes = Object.keys(schema.paths);
	if (routes.length === 0) {
		throw new HTTPException(400, {
			message: "No routes defined in OpenAPI schema",
		});
	}
	return {
		endpoint: routes[0],
		details: schema.paths[routes[0]],
	};
}

/**
 * Fetches and processes fields data from a specified endpoint, applying query parameters and processing the response.
 * @param {string} baseURL - The base URL of the API from which to fetch the fields data.
 * @param {string} endpoint - The specific endpoint path to fetch the fields data from.
 * @param {Record<string, string[]>} queries - A record of query parameters to append to the URL.
 * @returns {Promise<Record<string, string>>} A record of the fields data with string values, excluding any null values and casting numbers to strings.
 * @throws {HTTPException} Throws an HTTPException if fetching or processing the fields data fails.
 */
export async function getFields(
	baseURL: string,
	endpoint: string,
	queries: Record<string, string[]>,
): Promise<Record<string, string>> {
	const route = new URL(baseURL);
	route.pathname = endpoint;
	for (const [key, value] of Object.entries(queries)) {
		for (const v of value) {
			route.searchParams.set(key, v);
		}
	}

	// Define a Zod schema that accepts string, number, or null, but will process to only return string
	const FieldSchema = z.record(z.union([z.string(), z.number(), z.null()]));
	const rawData = await fetchJSON(route.toString(), FieldSchema);

	// Process the data to cast numbers to strings and remove null values
	const processedData: Record<string, string> = {};
	for (const [key, value] of Object.entries(rawData)) {
		if (value !== null) {
			// Exclude null values
			processedData[key] = value.toString(); // Cast numbers to strings
		}
	}

	return processedData;
}

/**
 * Fetches JSON data from a URL and validates it against a given Zod schema.
 * @param {string} url - The URL to fetch the JSON data from.
 * @param {z.ZodType<T>} schema - The Zod schema to validate the fetched data against.
 * @returns {Promise<any>} The validated JSON data as an object matching the schema.
 * @throws {HTTPException} Throws an HTTPException if fetching, parsing, or schema validation fails.
 */
async function fetchJSON<T>(url: string, schema: z.ZodType<T>): Promise<T> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new HTTPException(500, {
				message: `Failed to fetch data from ${url}: ${response.statusText}`,
			});
		}
		const data = await response.json();
		const result = schema.safeParse(data);
		if (!result.success) {
			throw new HTTPException(500, {
				message: `Failed to validate data from ${url}: ${result.error.message}`,
			});
		}
		return result.data;
	} catch (e) {
		throw new HTTPException(500, {
			message: `Failed to fetch or validate data from ${url}: ${e.message}`,
		});
	}
}

/**
 * The OpenAPI schema type definition for validation
 * Note that this is a simplified version of the OpenAPI schema and does not cover all possible fields.
 */
const OpenAPISchema = z.object({
	paths: z.record(
		z.object({
			get: z.object({
				parameters: z.array(
					z.object({
						name: z.string(),
						in: z.string(),
						required: z.boolean(),
						schema: z.object({
							type: z.enum(["string", "number", "integer", "boolean"]),
						}),
					}),
				),
				responses: z.object({
					200: z.object({
						description: z.string(),
						content: z.object({
							"application/json": z.object({
								schema: z.object({
									type: z.enum(["object"]),
									properties: z.record(
										z.object({
											type: z.enum(["string", "number", "integer", "boolean"]),
										}),
									),
								}),
							}),
						}),
					}),
				}),
			}),
		}),
	),
});

type OpenAPISchema = z.infer<typeof OpenAPISchema>;
export function getResponseShape(schema: OpenAPISchema, endpoint: string) {
	const route = schema.paths[endpoint];
	const parameters = route.get.parameters;
	const shape = parameters.reduce(
		(acc, param) => {
			acc[param.name] = param.schema.type;
			return acc;
		},
		{} as Record<string, string>,
	);
	return shape;
}

/**
 * Fetches the integration data from Supabase by integration ID and returns the schema URL.
 * @param {SupabaseClient<Database>} client - The Supabase client instance.
 * @param {string} integrationID - The ID of the integration to fetch.
 * @returns {Promise<{schema_url: string}>} The fetched integration data containing the schema URL.
 * @throws {HTTPException} Throws an HTTPException if the request fails or the integration is not found.
 */
async function fetchIntegration(
	client: SupabaseClient<Database>,
	integrationID: string,
) {
	const { data, error } = await client
		.from("integrations")
		.select("schema_url")
		.eq("id", integrationID)
		.single();

	if (error) throw new HTTPException(500, { message: error.message });
	if (!data) throw new HTTPException(404, { message: "Integration not found" });
	return data;
}

/**
 * Fetches and parses an OpenAPI schema from a given URL.
 * @param {string} schemaURL - The URL of the OpenAPI schema to fetch and parse.
 * @returns {Promise<OpenAPISchema>} The parsed OpenAPI schema.
 * @throws {HTTPException} Throws an HTTPException if fetching or parsing the schema fails.
 */
async function fetchAndParseSchema(schemaURL: string): Promise<OpenAPISchema> {
	const schemaData = await fetchJSON(schemaURL, OpenAPISchema);
	const result = OpenAPISchema.safeParse(schemaData);
	if (!result.success)
		throw new HTTPException(500, { message: "Failed to parse schema" });
	return result.data;
}
