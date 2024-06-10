import { MiddlewareHandler } from "https://deno.land/x/hono@v4.0.2/mod.ts";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";

/**
 * Creates a preflight middleware for handling CORS requests.
 * @param {Object} options - Configuration options for the middleware.
 * @param {HTTPMethod[]} options.methods - An array of HTTP methods allowed for cross-origin requests.
 * @returns {MiddlewareHandler} A middleware handler function that sets CORS headers and handles OPTIONS requests
 */
export const cors = ({
	methods,
}: {
	methods: HTTPMethod[];
}): MiddlewareHandler => {
	return async function pflight(ctx, next) {
		ctx.res.headers.set("Access-Control-Allow-Origin", "*");
		if (ctx.req.method === "OPTIONS") {
			ctx.res.headers.set(
				"Access-Control-Allow-Methods",
				`OPTIONS, ${methods.join(", ")}`,
			);
			ctx.res.headers.set(
				"Access-Control-Allow-Headers",
				"Content-Type, x-client-info, Authorization, apikey",
			);
			return new Response(null, {
				headers: ctx.res.headers,
				status: 204,
				statusText: ctx.res.statusText,
			});
		}
		await next();
	};
};
