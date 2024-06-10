import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";
const heliconeApiKey = Deno.env.get("HELICONE_API_KEY");

const sendFeedbackToHelicone = async (request: Request) => {
	switch (request.method) {
		case "OPTIONS": {
			return new Response(null, {
				headers: corsHeaders,
				status: 200,
			});
		}
		case "POST":
			try {
				const authHeader = request.headers.get("Authorization")!;
				const supabaseClient = createClient(
					Deno.env.get("SUPABASE_URL") ?? "",
					Deno.env.get("SUPABASE_ANON_KEY") ?? "",
					{ global: { headers: { Authorization: authHeader } } },
				);
				const body = await request.json();
				const { requestId, rating, additionalFeedback } = body;

				const { data: messageData } = await supabaseClient
					.from("messages")
					.select("id")
					.eq("helicone_request_id", requestId)
					.single()
				if (!messageData) {
					return new Response("Message not found", {
						headers: corsHeaders,
						status: 404,
					});
				}
				const messageId = messageData.id;

				//save rating and feedback in db
				const { data } = await supabaseClient
					.from("message_feedback")
					.insert({
						message_id: messageId,
						rating: rating,
						additional_feedback: additionalFeedback,
					})
					.select()
					.single()
					.throwOnError();
				const messageFeedbackId = data.id;
				//send rating to helicone
				const { data: ratingData } = await supabaseClient
					.from("messages")
					.select("helicone_request_id")
					.eq("id", messageId)
					.single()
					.throwOnError();
				let heliconeId;
				if (ratingData) {
					heliconeId = ratingData.helicone_request_id;
				}
				const url = "https://api.hconeai.com/v1/feedback";
				const headers = {
					"Helicone-Auth": `Bearer ${heliconeApiKey}`,
					"Content-Type": "application/json",
				};
				const feedbackDate = {
					"helicone-id": heliconeId,
					rating: rating, // True for positive, False for negative
				};

				const heliconeResponse = await fetch(url, {
					method: "POST",
					headers: headers,
					body: JSON.stringify(feedbackDate),
				});

				const response = {
					messageFeedbackId: messageFeedbackId,
					heliconeResponse: heliconeResponse,
				};

				return new Response(JSON.stringify(response), {
					headers: corsHeaders,
					status: 200,
				});
			} catch (err) {
				console.error(err);
				return new Response("Internal Server Error", {
					headers: corsHeaders,
					status: 500,
				});
			}
		default:
			return new Response("Method Not Allowed", {
				headers: corsHeaders,
				status: 405,
			});
	}
};

Deno.serve(sendFeedbackToHelicone);
